import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ClientsArt } from "../../components/Illustrations";
import { usePageMeta } from "../../lib/usePageMeta";
import { INDUSTRIES } from "./content";
import { FinalCta, PageIntro } from "./parts";

function Solutions() {
    usePageMeta(
        "Solutions",
        "Velora fits beauty salons, barbershops, spas, beauty clinics and independent professionals across Kenya."
    );

    return (
        <>
            <PageIntro
                eyebrow="MADE FOR YOUR INDUSTRY"
                title="Your business is unique."
                accent="Your software should be too."
                text="Whether you run a busy salon, manage a spa or are building your own beauty practice, Velora gives you the tools to run your day with confidence."
                art={ClientsArt}
            />

            <section className="solutions-section solutions-page">
                <div className="solutions-content">
                    <h2>
                        One calendar.
                        <br />
                        <span>Shaped around how you work.</span>
                    </h2>
                    <p>
                        Services, prices, team and opening hours are yours to set. Velora takes it from there:
                        it shows only the times that are really free, and keeps everyone in the loop.
                    </p>
                    <Link to="/register" className="primary-button">
                        Find your space with Velora <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                </div>

                <ul className="solutions-list">
                    {INDUSTRIES.map((industry, index) => (
                        <li className="solution-item" key={industry.name}>
                            <span>0{index + 1}</span>
                            <div>
                                <strong>{industry.name}</strong>
                                <p>{industry.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <FinalCta />
        </>
    );
}

export default Solutions;
