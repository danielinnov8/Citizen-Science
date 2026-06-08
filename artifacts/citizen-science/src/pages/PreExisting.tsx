import React from "react";
import { LegalPage } from "@/components/LegalPage";

export default function PreExisting() {
  return (
    <LegalPage
      title="Pre-Existing Work Disclosure"
      lastUpdated="June 8, 2026"
      intro={
        <>
          <p>
            This page is a factual disclosure prepared for the Build with Gemini
            XPRIZE submission. The hackathon's "New Projects Only" rule requires
            that projects be newly created after the start of the Submission Period
            (May 19, 2026), while explicitly permitting the reuse of pre-existing
            templates, frameworks, boilerplate, or code &mdash; provided the entrant
            explains how that pre-existing work was utilized. This statement is that
            explanation.
          </p>
          <p>
            In short: the Citizen Science <strong>application</strong> &mdash; the
            product judges can use today &mdash; was built during the Submission
            Period. The only thing that pre-dated the period was a standalone
            marketing/landing site, created roughly two to three weeks earlier, that
            seeded the brand and positioning but contained none of the functionality.
          </p>
        </>
      }
      sections={[
        {
          heading: "What existed before May 19, 2026",
          body: (
            <>
              <p>
                Before the Submission Period began, the only pre-existing asset was a{" "}
                <strong>marketing and landing page</strong> for the project concept,
                put together roughly two to three weeks prior. It communicated the
                vision and brand direction for the idea but was not the product.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>It had no user accounts, authentication, or sessions.</li>
                <li>It had no database and stored no user data.</li>
                <li>
                  It had no AI features, no copilot, no analyzer, and no interactive
                  application functionality.
                </li>
                <li>
                  It served only to present the concept, the brand, and the
                  positioning to early visitors.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "What was built during the Submission Period",
          body: (
            <>
              <p>
                The actual application &mdash; everything that makes Citizen Science a
                working product rather than a marketing page &mdash; was designed and
                built during the Submission Period. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Real authentication</strong>, including email/password
                  accounts with securely hashed passwords, persistent sessions, and
                  Google sign-in.
                </li>
                <li>
                  <strong>The Gemini-backed science copilot</strong> &mdash; a
                  streaming conversational assistant with grounded web search and
                  citations, and verified educational-video recommendations drawn from
                  a curated, trusted source allowlist.
                </li>
                <li>
                  <strong>The field-notes analyzer</strong>, which turns a learner's
                  raw observation text into structured, categorized scientific notes.
                </li>
                <li>
                  <strong>The database-backed scientists and inventors directory</strong>{" "}
                  and the cinematic "great mind" profile pages built on top of it.
                </li>
                <li>
                  <strong>The live talking-avatar feature</strong>, letting visitors
                  hold a real-time spoken conversation with historical figures.
                </li>
                <li>
                  The surrounding application experience &mdash; onboarding, the
                  category and experiment library, the personal notebook, progress
                  tracking, and the public content pages.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "How pre-existing work was utilized",
          body: (
            <>
              <p>
                Consistent with the hackathon rules, we want to be transparent about
                the pre-existing materials that supported the build:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Standard scaffolding and open-source frameworks.</strong> The
                  application is built on widely used, publicly available tooling
                  (a monorepo scaffold, React, a Node/Express API, a PostgreSQL
                  database layer, and common UI libraries). These are general-purpose
                  templates and boilerplate, not project-specific prior work, and were
                  assembled into the product during the Submission Period.
                </li>
                <li>
                  <strong>The earlier marketing page.</strong> The prior landing site
                  seeded the brand identity and positioning (name, look, and the
                  "Humanity's Research Network" framing). That direction informed the
                  product's visual language, but the marketing page itself was
                  superseded &mdash; the application's pages, components, and features
                  were built new during the period.
                </li>
              </ul>
              <p>
                No pre-existing application code, user data, or feature implementation
                was carried into the project. The substantive functionality described
                above originated during the Submission Period.
              </p>
            </>
          ),
        },
        {
          heading: "Use of the Gemini API",
          body: (
            <p>
              The project's large-language-model functionality is powered by Google's
              Gemini API. The science copilot, the grounded web-search experience, the
              verified-video relevance scoring, the field-notes analyzer, and the
              talking-avatar persona brain all call Gemini, satisfying the hackathon's
              requirement that submissions use the Gemini API.
            </p>
          ),
        },
      ]}
    />
  );
}
