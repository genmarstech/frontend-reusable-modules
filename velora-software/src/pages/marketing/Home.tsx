import { Link } from "react-router";
import { ArrowRight, Banknote, Cross, Play, Scissors, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { BookingArt, ClientsArt, PhoneBookingArt, SuccessArt } from "../../components/Illustrations";
import { usePageMeta } from "../../lib/usePageMeta";
import { PHOTOS } from "../../lib/photos";
import { LeafSpray } from "../../components/Decor";
import { BrushStroke, Lotus, Razor, SpaProps } from "./art";
import { FinalCta } from "./parts";

const EXPLORE = [
  { to: "/features", art: BookingArt, title: "Features", text: "Online booking, client records, team schedules and reminders." },
  { to: "/solutions", art: ClientsArt, title: "Solutions", text: "How Velora fits salons, barbershops, spas, clinics and freelancers." },
  { to: "/how-it-works", art: PhoneBookingArt, title: "How it works", text: "Three steps from sign-up to your first online booking." },
  { to: "/about", art: SuccessArt, title: "About", text: "Why we built Velora, and what we promise the businesses that use it." },
];

function Home() {
  usePageMeta();

  return (
    <>
      {/* HERO */}
      <section className="hero2">
        <div className="hero2-content">
          <div className="hero2-tag">
            <Sparkles size={16} aria-hidden="true" />
            <span>The complete salon &amp; beauty business solution</span>
          </div>

          <h1>
            Beautifully
            <br />
            managed.
            <span className="hero2-accent">
              Effortlessly organised.
              <BrushStroke />
            </span>
          </h1>

          <p className="hero2-description">
            Run your beauty business with less effort. Manage appointments, services, staff and
            clients, while giving your customers a seamless way to discover and book your
            services online.
          </p>

          <div className="hero2-actions">
            <Link to="/register" className="hero2-primary">
              Get started for free <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/how-it-works" className="hero2-secondary">
              <span className="hero2-play" aria-hidden="true">
                <Play size={15} />
              </span>
              See how it works
            </Link>
          </div>

          <ul className="hero2-trust">
            <li>
              <ShieldCheck aria-hidden="true" /> Secure sign-in
            </li>
            <li>
              <Zap aria-hidden="true" /> Set up in minutes
            </li>
            <li>
              <Banknote aria-hidden="true" /> Prices in KES
            </li>
          </ul>
        </div>

        <div className="hero2-visual">
          <div className="hero2-sun" aria-hidden="true" />
          <LeafSpray className="hero2-leaves" />
          <figure className="hero2-device">
            <img
              src={PHOTOS.product}
              alt="The Velora dashboard: today’s bookings, the day’s schedule, latest bookings, setup progress and business performance"
              width={1800}
              height={1013}
              fetchPriority="high"
            />
          </figure>
          {PHOTOS.heroProps ? (
            <img className="hero2-props" src={PHOTOS.heroProps} alt="" />
          ) : (
            <SpaProps />
          )}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="hero2-strip" aria-label="Who Velora is for">
        <p>
          Made for forward-thinking
          <br />
          beauty businesses
        </p>
        <ul>
          <li><Scissors aria-hidden="true" /> Salons</li>
          <li><Razor /> Barbershops</li>
          <li><Lotus /> Spas</li>
          <li><Cross aria-hidden="true" /> Beauty Clinics</li>
        </ul>
        <Link to="/solutions" className="hero2-learn">
          Learn more <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      {/* EXPLORE: each part of the site has its own page */}
      <section className="features-section explore-section">
        <div className="section-heading">
          <span className="section-eyebrow">THE VELORA EXPERIENCE</span>
          <h2>
            Everything your business needs.
            <br />
            <span>All in one place.</span>
          </h2>
          <p>Less time chasing bookings. More time with the people in your chair.</p>
        </div>

        <div className="features-grid">
          {EXPLORE.map(({ to, art: Art, title, text }) => (
            <Link to={to} className="feature-card explore-card" key={to}>
              <Art className="explore-art" />
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="explore-more">
                Explore {title.toLowerCase()} <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FinalCta />
    </>
  );
}

export default Home;
