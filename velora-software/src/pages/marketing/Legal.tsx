import type { ReactNode } from "react";
import { SITE } from "../../lib/site";
import { usePageMeta } from "../../lib/usePageMeta";

/*
 * Plain-language starting points for Velora's legal pages.
 * Have them reviewed by a lawyer before launch, and update UPDATED when they change.
 */
const UPDATED = "27 November 2026";

function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
    return (
        <article className="legal-page">
            <span className="section-eyebrow">LAST UPDATED {UPDATED.toUpperCase()}</span>
            <h1>{title}</h1>
            <p className="legal-intro">{intro}</p>
            {children}
            <h2>Contact</h2>
            <p>
                Questions about this page?{" "}
                {SITE.contactEmail ? (
                    <>
                        Email us at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
                    </>
                ) : (
                    "Reply to any email from Velora and it will reach us."
                )}
            </p>
        </article>
    );
}

export function Terms() {
    usePageMeta("Terms of Service", "The terms for using Velora, the bookings and appointments platform.");
    return (
        <LegalPage
            title="Terms of Service"
            intro="These terms explain what you can expect from Velora and what we expect from you. We have kept them short and plain."
        >
            <h2>Your account</h2>
            <p>
                You need an account to manage a business on Velora. Keep your password private and tell us if you think
                someone else has used your account. You are responsible for what happens under your account.
            </p>
            <h2>Your business and your clients</h2>
            <p>
                You own your business information and your clients’ details. You give us permission to store and use them
                only to run Velora for you: showing your booking page, keeping your calendar and sending the messages you
                switch on. You are responsible for having your clients’ permission to contact them.
            </p>
            <h2>Fair use</h2>
            <p>
                Please don’t use Velora to send spam, to break the law, or to interfere with the service or other
                businesses on it. We may suspend accounts that do.
            </p>
            <h2>Payments between you and your clients</h2>
            <p>
                Deposits and fees you record in Velora are between you and your client. Velora does not hold or move money
                on your behalf.
            </p>
            <h2>Availability</h2>
            <p>
                We work hard to keep Velora running, but we can’t promise it will never be interrupted. We are not liable
                for losses caused by downtime, as far as the law allows.
            </p>
            <h2>Changes and leaving</h2>
            <p>
                We may update these terms and will tell you about important changes. You can stop using Velora at any time
                and ask us to delete your business data.
            </p>
        </LegalPage>
    );
}

export function Privacy() {
    usePageMeta("Privacy Policy", "How Velora collects, uses and protects personal information.");
    return (
        <LegalPage
            title="Privacy Policy"
            intro="Velora handles personal information for business owners and for the clients who book with them. This page explains what we collect, why, and the choices you have, in line with Kenya’s Data Protection Act, 2019."
        >
            <h2>What we collect</h2>
            <ul>
                <li>Business owners: name, email address, phone number and business details.</li>
                <li>Clients who book: name, phone number, email address, and the bookings and notes linked to them.</li>
                <li>Basic usage information, such as which booking page steps were visited, to help businesses improve.</li>
            </ul>
            <h2>How we use it</h2>
            <p>
                To run bookings, show availability, and send confirmations, reminders and receipts. We do not sell
                personal information or use it for advertising.
            </p>
            <h2>Who we share it with</h2>
            <p>
                The business you book with sees your booking and contact details. We use trusted service providers to
                host Velora and deliver email and messages, and they may only use the information to provide that
                service.
            </p>
            <h2>Your choices</h2>
            <p>
                You can opt out of reminders from the link in your booking messages. You can ask to see, correct or delete
                your information, either through the business you booked with or by contacting us.
            </p>
            <h2>Keeping it safe</h2>
            <p>
                Accounts are protected by passwords and secure sessions, and each business can only see its own data. We
                keep information only for as long as the business uses Velora, or as the law requires.
            </p>
        </LegalPage>
    );
}
