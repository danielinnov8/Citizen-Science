import React from "react";
import { LegalPage } from "@/components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="June 4, 2026"
      intro={
        <p>
          Citizen Science ("we", "us") helps curious people learn science by running
          real experiments and keeping a personal notebook. We take your privacy
          seriously. This policy explains what we collect, why we collect it, and the
          choices you have. By using Citizen Science you agree to the practices
          described here.
        </p>
      }
      sections={[
        {
          heading: "Information we collect",
          body: (
            <>
              <p>We collect only what we need to give you a working, personal account:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Account details</strong> — your name, email address, and a
                  securely hashed password. If you sign in with Google, we receive your
                  name, email, and profile image from Google.
                </li>
                <li>
                  <strong>Your science content</strong> — the experiments you start,
                  observations and field notes you record, measurements, tags, and
                  progress you track in your notebook.
                </li>
                <li>
                  <strong>Technical data</strong> — basic, standard server logs (such as
                  request times and error information) used to keep the service running
                  and secure.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "How we use your information",
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and maintain your account and keep you signed in.</li>
              <li>To save your experiments, notebook entries, and learning progress.</li>
              <li>
                To power features you ask for, such as the science copilot and field-note
                analysis, by sending the text you submit to our AI providers to generate a
                response.
              </li>
              <li>To keep the service secure, debug problems, and prevent abuse.</li>
            </ul>
          ),
        },
        {
          heading: "AI processing",
          body: (
            <p>
              When you use the science copilot or the observation analyzer, the text you
              submit is sent to third-party AI providers (OpenAI and Google Gemini) to
              generate a response. We send only the content needed to fulfill your request.
              We do not use your content to train our own models. Please avoid entering
              sensitive personal information into these tools.
            </p>
          ),
        },
        {
          heading: "Cookies and sessions",
          body: (
            <p>
              We use a single secure, httpOnly session cookie to keep you signed in. It is
              essential to the service and is not used for advertising or cross-site
              tracking. Clearing your cookies or signing out ends the session.
            </p>
          ),
        },
        {
          heading: "How we share information",
          body: (
            <>
              <p>
                We do not sell your personal information. We share data only with service
                providers who help us run Citizen Science, including:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Cloud hosting and database providers that store your account and content.</li>
                <li>AI providers (OpenAI, Google) that process the requests you submit.</li>
                <li>Google, when you choose to sign in with your Google account.</li>
              </ul>
              <p>We may also disclose information if required by law or to protect our users.</p>
            </>
          ),
        },
        {
          heading: "Affiliate links",
          body: (
            <p>
              Some product, lab, and partner links in the app are affiliate or referral links,
              and as an Amazon Associate we earn from qualifying purchases. When you follow one of
              these links, you leave Citizen Science and the third-party site's own privacy policy
              and cookies apply. We do not share your account details with these partners; any
              information collected after you click is governed by that partner, not by us.
            </p>
          ),
        },
        {
          heading: "Data retention",
          body: (
            <p>
              We keep your account information and content for as long as your account is
              active. When you delete your account, we remove your personal data within a
              reasonable period, except where we must retain certain records to comply with
              legal obligations.
            </p>
          ),
        },
        {
          heading: "Your choices and rights",
          body: (
            <p>
              You can view and update your profile at any time, and you may request that we
              correct or delete your data. Depending on where you live, you may have
              additional rights over your personal information. To make a request, contact
              us using the details below.
            </p>
          ),
        },
        {
          heading: "Children's privacy",
          body: (
            <p>
              Citizen Science is intended for learners aged 13 and older. If you believe a
              child under 13 has provided us with personal information, please contact us and
              we will delete it.
            </p>
          ),
        },
        {
          heading: "Changes to this policy",
          body: (
            <p>
              We may update this policy from time to time. When we do, we will revise the
              "Last updated" date above and, where appropriate, notify you in the app.
            </p>
          ),
        },
        {
          heading: "Contact us",
          body: (
            <p>
              Questions about your privacy? Reach us at{" "}
              <a href="mailto:privacy@citizen-science.org" className="text-blue-600 hover:text-blue-700">
                privacy@citizen-science.org
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
