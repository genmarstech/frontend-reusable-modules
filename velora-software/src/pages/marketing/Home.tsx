import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  Sparkles,
  ShieldCheck,
  Check
} from "lucide-react";
import { BookingArt, ClientsArt, PhoneBookingArt, SuccessArt } from "../../components/Illustrations";
import { usePageMeta } from "../../lib/usePageMeta";
import { INDUSTRIES } from "./content";
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
      <section className="hero-section">
        <div className="hero-content">

          <div className="hero-label">
            <Sparkles size={15} aria-hidden="true" />
            <span>Business management, reimagined</span>
          </div>

          <h1>
            Beautifully managed.
            <br />
            <span>Effortlessly organised.</span>
          </h1>

          <p className="hero-description">
            Velora is the booking and appointments platform for salons,
            barbershops, spas and beauty professionals. Clients book online,
            reminders go out on their own, and your whole day sits in one calm place.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Get started for free <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <Link to="/features" className="secondary-button">
              Explore the platform
            </Link>
          </div>

          <div className="hero-trust">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>One platform. Your entire business.</span>
          </div>
        </div>

        {/* PRODUCT PREVIEW */}
        <div className="hero-preview" role="img" aria-label="A preview of the Velora dashboard showing today’s bookings, client count and upcoming appointments">
          <div className="preview-window">

            <div className="preview-header">
              <div>
                <span className="preview-overline">BUSINESS OVERVIEW</span>
                <h3>Good morning, Wanjiru</h3>
                <p>Here's what's happening today.</p>
              </div>
              <div className="preview-avatar" aria-hidden="true">W</div>
            </div>

            <div className="preview-stats">
              <div className="stat-card">
                <span>Appointments</span>
                <strong>24</strong>
                <small>Today's bookings</small>
              </div>
              <div className="stat-card">
                <span>Total clients</span>
                <strong>186</strong>
                <small>Client records</small>
              </div>
            </div>

            <div className="preview-appointments">
              <div className="preview-section-heading">
                <strong>Upcoming appointments</strong>
                <span>View all</span>
              </div>

              <div className="appointment-row">
                <div className="appointment-time">09:00</div>
                <div className="appointment-details">
                  <strong>Silk press</strong>
                  <span>Amina Hassan</span>
                </div>
                <span className="appointment-status">Confirmed</span>
              </div>

              <div className="appointment-row">
                <div className="appointment-time">10:30</div>
                <div className="appointment-details">
                  <strong>Signature facial</strong>
                  <span>Njeri Mwangi</span>
                </div>
                <span className="appointment-status">Confirmed</span>
              </div>

              <div className="appointment-row">
                <div className="appointment-time">12:00</div>
                <div className="appointment-details">
                  <strong>Gel manicure</strong>
                  <span>Faith Wambui</span>
                </div>
                <span className="appointment-status">Pending</span>
              </div>
            </div>

            <div className="preview-footer">
              <Check size={15} />
              Your business is looking organised.
            </div>
          </div>

          <div className="floating-card floating-card-top">
            <span className="floating-icon"><CalendarDays size={18} /></span>
            <div>
              <strong>Appointment booked!</strong>
              <small>A new client just scheduled.</small>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span className="floating-icon"><ChartNoAxesCombined size={18} /></span>
            <div>
              <strong>Stay in control</strong>
              <small>Your business, at a glance.</small>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRY STRIP */}
      <section className="industry-strip">
        <p>BUILT FOR THE BUSINESSES THAT HELP PEOPLE FEEL THEIR BEST</p>
        <div className="industry-list">
          {INDUSTRIES.map((industry) => (
            <span key={industry.name}>{industry.name}</span>
          ))}
        </div>
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
