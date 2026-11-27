import { Check } from "lucide-react";
import { BookingArt } from "../../components/Illustrations";
import { usePageMeta } from "../../lib/usePageMeta";
import { PHOTOS } from "../../lib/photos";
import { FEATURES, slugify } from "./content";
import { FinalCta, PageIntro } from "./parts";

function Features() {
    usePageMeta(
        "Features",
        "Online booking, client records, team schedules, reminders and reports. Everything a salon, spa or barbershop needs, in one place."
    );

    return (
        <>
            <PageIntro
                eyebrow="FEATURES"
                title="Everything your business needs."
                accent="All in one place."
                text="Less time chasing bookings and confirming on the phone. More time doing the work your clients come back for."
                art={BookingArt}
            />

            <section className="feature-rows">
                {FEATURES.map(({ icon: Icon, art: Art, title, summary, points }, index) => {
                    const photo = PHOTOS.features[slugify(title)];
                    return (
                    <article className={`feature-row ${index % 2 ? "is-flipped" : ""}`} key={title} id={slugify(title)}>
                        <div className={`feature-row-art ${photo ? "has-photo" : ""}`}>
                            {photo ? <img className="v-photo" src={photo} alt="" loading="lazy" width={1200} height={900} /> : <Art />}
                        </div>
                        <div className="feature-row-text">
                            <div className="feature-icon" aria-hidden="true">
                                <Icon />
                            </div>
                            <span className="feature-number">0{index + 1}</span>
                            <h2>{title}</h2>
                            <p>{summary}</p>
                            <ul>
                                {points.map((point) => (
                                    <li key={point}>
                                        <Check size={16} aria-hidden="true" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </article>
                    );
                })}
            </section>

            <FinalCta />
        </>
    );
}

export default Features;
