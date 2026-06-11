import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  messagesTable,
  usersTable,
  featuredProfilesTable,
} from "@workspace/db";
import {
  ListMessagesResponse,
  SendMessageBody,
  MarkMessageReadParams,
  MarkMessageReadResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { isLivingEra } from "../lib/profiles/living";

const router: IRouter = Router();

// All messaging is members-only.
router.use("/messages", requireAuth);

// The current member's inbox: received messages newest-first plus the unread
// count that drives the sidebar badge.
router.get(
  "/messages",
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const rows = await db
      .select({
        id: messagesTable.id,
        senderId: messagesTable.senderId,
        senderName: usersTable.name,
        senderEmail: usersTable.email,
        subject: messagesTable.subject,
        body: messagesTable.body,
        readAt: messagesTable.readAt,
        createdAt: messagesTable.createdAt,
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
      .where(eq(messagesTable.recipientId, userId))
      .orderBy(desc(messagesTable.createdAt));

    const messages = rows.map((r) => ({
      id: r.id,
      senderId: r.senderId,
      senderName: r.senderName,
      senderEmail: r.senderEmail,
      subject: r.subject,
      body: r.body,
      read: r.readAt != null,
      createdAt: r.createdAt,
    }));

    const unreadCount = messages.reduce((n, m) => n + (m.read ? 0 : 1), 0);

    res.json(ListMessagesResponse.parse({ messages, unreadCount }));
  },
);

// Send a message to another member, either directly (recipientId) or by routing
// to the verified owner of a featured profile (profileSlug). Exactly one target
// must be provided, and a member cannot message themselves.
router.post(
  "/messages",
  async (req: Request, res: Response): Promise<void> => {
    const senderId = req.user!.id;
    const body = SendMessageBody.parse(req.body ?? {});

    const text = body.body.trim();
    if (!text) {
      res.status(400).json({ error: "Message body is required." });
      return;
    }

    const hasRecipient = !!body.recipientId;
    const hasSlug = !!body.profileSlug;
    if (hasRecipient === hasSlug) {
      res
        .status(400)
        .json({ error: "Provide exactly one of recipientId or profileSlug." });
      return;
    }

    const subject = body.subject?.trim() ? body.subject.trim() : null;
    const profileSlug = hasSlug ? body.profileSlug! : null;

    let recipientId: string;

    if (hasRecipient) {
      const [recipient] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, body.recipientId!));
      if (!recipient) {
        res.status(404).json({ error: "Recipient not found." });
        return;
      }
      recipientId = recipient.id;
    } else {
      const [profile] = await db
        .select({
          ownerId: featuredProfilesTable.ownerUserId,
          era: featuredProfilesTable.era,
        })
        .from(featuredProfilesTable)
        .where(eq(featuredProfilesTable.slug, profileSlug!));
      if (!profile) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }

      // No verified owner yet. A LIVING member can still be messaged — the note
      // is held (recipientId null) and delivered when they claim their profile.
      // Historical figures can never claim, so messaging them is rejected.
      if (!profile.ownerId) {
        if (!isLivingEra(profile.era)) {
          res.status(404).json({
            error: "This profile has no verified owner to message yet.",
          });
          return;
        }

        await db.insert(messagesTable).values({
          senderId,
          recipientId: null,
          profileSlug,
          subject,
          body: text,
        });

        req.log?.info(
          { senderId, profileSlug },
          "message held for unclaimed profile",
        );

        res.status(201).json({ success: true, held: true });
        return;
      }

      recipientId = profile.ownerId;
    }

    if (recipientId === senderId) {
      res.status(400).json({ error: "You cannot message yourself." });
      return;
    }

    await db.insert(messagesTable).values({
      senderId,
      recipientId,
      profileSlug,
      subject,
      body: text,
    });

    req.log?.info({ senderId, recipientId }, "message sent");

    res.status(201).json({ success: true });
  },
);

// Mark a single received message as read (recipient only). Idempotent.
router.post(
  "/messages/:id/read",
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = MarkMessageReadParams.parse(req.params);

    const result = await db
      .update(messagesTable)
      .set({ readAt: sql`now()` })
      .where(
        and(
          eq(messagesTable.id, id),
          eq(messagesTable.recipientId, userId),
          sql`${messagesTable.readAt} is null`,
        ),
      )
      .returning({ id: messagesTable.id });

    // Already-read or someone else's message: confirm it exists & is ours so the
    // client can treat a repeat call as success rather than a hard 404.
    if (result.length === 0) {
      const [existing] = await db
        .select({ id: messagesTable.id })
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.id, id),
            eq(messagesTable.recipientId, userId),
          ),
        );
      if (!existing) {
        res.status(404).json({ error: "Message not found." });
        return;
      }
    }

    res.json(MarkMessageReadResponse.parse({ success: true }));
  },
);

export default router;
