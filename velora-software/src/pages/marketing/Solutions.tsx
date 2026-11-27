import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ClientsArt, PhoneBookingArt, ServicesArt } from "../../components/Illustrations";
import { PHOTOS } from "../../lib/photos";
import { usePageMeta } from "../../lib/usePageMeta";
import { INDUSTRIES, slugify } from "./content";
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

            <section className="industry-cards" aria-label="Business types">
                {INDUSTRIES.map((industry, index) => {
                    const slug = slugify(industry.name);
                    const photo = PHOTOS.solutions[slug];
                    const Art = index % 2 ? PhoneBookingArt : ServicesArt;
                    return (
                        <article className="industry-card" id={slug} key={slug}>
                            <div className="industry-card-media">
                                {photo ? <img src={photo} alt="" loading="lazy" width={1200} height={900} /> : <Art />}
                            </div>
                            <div className="industry-card-body">
                                <h2>{industry.name}</h2>
                                <p>{industry.text}</p>
                            </div>
                        </article>
                    );
                })}
            </section>

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
            </section>

            <FinalCta />
        </>
    );
}

export default Solutions;
