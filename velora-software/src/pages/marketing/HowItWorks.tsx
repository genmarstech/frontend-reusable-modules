import { PhoneBookingArt } from "../../components/Illustrations";
import { SITE } from "../../lib/site";
import { usePageMeta } from "../../lib/usePageMeta";
import { STEPS } from "./content";
import { FinalCta, PageIntro } from "./parts";

function HowItWorks() {
    usePageMeta("How it works", "Create your account, set up your services and team, and share your booking link. That is all it takes.");

    return (
        <>
            <PageIntro
                eyebrow="GETTING STARTED"
                title="Simple from the very beginning."
                text="Three steps to a more organised business."
                art={PhoneBookingArt}
            />

            <section className="how-section">
                <ol className="steps-grid">
                    {STEPS.map(({ art: Art, title, text }, index) => (
                        <li className="step-card" key={title}>
                            <Art className="step-art" />
                            <span>0{index + 1}</span>
                            <h2>{title}</h2>
                            <p>{text}</p>
                        </li>
                    ))}
                </ol>

                <div className="booking-link-demo">
                    <p>Your clients book at a link of your own, like</p>
                    <code>
                        {SITE.url.replace(/^https?:\/\//, "")}/book/<strong>your-business</strong>
                    </code>
                </div>
            </section>

            <FinalCta />
        </>
    );
}

export default HowItWorks;
