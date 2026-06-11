import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentRouter from "./agent";
import authRouter from "./auth";
import profilesRouter from "./profiles";
import avatarRouter from "./avatar";
import billingRouter from "./billing";
import messagesRouter from "./messages";
import adminRouter from "./admin";
import citizenxRouter from "./citizenx";
import mentorshipRouter from "./mentorship";
import digitalMentorRouter from "./digitalMentor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(agentRouter);
router.use(profilesRouter);
router.use(avatarRouter);
router.use(billingRouter);
router.use(messagesRouter);
router.use(adminRouter);
router.use(citizenxRouter);
router.use(mentorshipRouter);
router.use(digitalMentorRouter);

export default router;
