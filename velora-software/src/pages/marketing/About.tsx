import { HeartHandshake, Leaf, MessageCircle } from "lucide-react";
import { SuccessArt } from "../../components/Illustrations";
import { usePageMeta } from "../../lib/usePageMeta";
import { FinalCta, PageIntro } from "./parts";

const VALUES = [
    {
        icon: HeartHandshake,
        title: "Your clients come first",
        text: "Every screen is built around the person in your chair: easy to book, clear about policies, kindly reminded.",
    },
    {
        icon: Leaf,
        title: "Calm by design",
        text: "No clutter and no jargon. Velora should feel like a well run front desk, not another job to manage.",
    },
    {
        icon: MessageCircle,
        title: "Made for how Kenya books",
        text: "Prices in KES, Nairobi time, and booking links that are easy to share on WhatsApp and social media.",
    },
];

function About() {
    usePageMeta("About", "Velora is a bookings and appointments platform made for salons, spas, barbershops and beauty professionals in Kenya.");

    return (
        <>
            <PageIntro
                eyebrow="ABOUT VELORA"
                title="Built for the businesses"
                accent="that help people feel their best."
                text="Salons, barbershops, spas and independent professionals do skilled, personal work. Too much of their day still goes on phone calls, paper diaries and chasing no-shows. Velora takes that on, so they can get back to their clients."
                art={SuccessArt}
            />

            <section className="features-section about-values">
                <div className="section-heading">
                    <span className="section-eyebrow">WHAT WE BELIEVE</span>
                    <h2>
                        Good service starts
                        <br />
                        <span>before the appointment.</span>
                    </h2>
                </div>
                <div className="features-grid values-grid">
                    {VALUES.map(({ icon: Icon, title, text }) => (
                        <article className="feature-card" key={title}>
                            <div className="feature-icon" aria-hidden="true">
                                <Icon />
                            </div>
                            <h3>{title}</h3>
                            <p>{text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <FinalCta eyebrow="JOIN US">
                Set up your booking page today and see how much calmer the week can feel.
            </FinalCta>
        </>
    );
}

export default About;
