
import {
  ArrowRight,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  Clock3,
  Scissors,
  Sparkles,
  ShieldCheck,
  Menu,
  Check
} from "lucide-react";

import "./Home.css";
import { Link } from "react-router";

function Home() {
  const features = [
    {
      icon: <CalendarDays />,
      title: "Smart Appointment Booking",
      description:
        "Manage bookings, availability and appointments from one organized platform."
    },
    {
      icon: <Users />,
      title: "Client Management",
      description:
        "Understand your clients, keep their information organized and build lasting relationships."
    },
    {
      icon: <Clock3 />,
      title: "Staff & Scheduling",
      description:
        "Coordinate your team, manage working hours and simplify daily operations."
    },
    {
      icon: <ChartNoAxesCombined />,
      title: "Business Insights",
      description:
        "Get a clearer picture of your appointments, clients and business performance."
    }
  ];

  const industries = [
    "Beauty Salons",
    "Barbershops",
    "Spas & Wellness",
    "Beauty Clinics",
    "Independent Professionals"
  ];

  return (
    <main className="velora-home">

      {/* NAVIGATION */}
      <nav className="velora-nav">
        <a href="/" className="velora-logo">
          velora<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="login-link">Log in</Link>
          <a href="/register" className="nav-cta">
            Get started <ArrowRight size={16} />
          </a>
        </div>

        <button className="mobile-menu" aria-label="Open navigation">
          <Menu />
        </button>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">

          <div className="hero-label">
            <Sparkles size={15} />
            <span>Business management, reimagined</span>
          </div>

          <h1>
            Beautifully managed.
            <br />
            <span>Effortlessly organized.</span>
          </h1>

          <p className="hero-description">
            Meet Velora — the all-in-one platform designed to help
            salons, spas, barbershops and beauty professionals
            manage appointments, clients and everyday business operations.
          </p>

          <div className="hero-actions">
            <a href="/register" className="primary-button">
              Get started for free <ArrowRight size={18} />
            </a>

            <a href="#features" className="secondary-button">
              Explore the platform
            </a>
          </div>

          <div className="hero-trust">
            <ShieldCheck size={18} />
            <span>One platform. Your entire business.</span>
          </div>
        </div>

        {/* PRODUCT PREVIEW */}
        <div className="hero-preview">
          <div className="preview-window">

            <div className="preview-header">
              <div>
                <span className="preview-overline">BUSINESS OVERVIEW</span>
                <h3>Good morning, Sarah</h3>
                <p>Here's what's happening today.</p>
              </div>
              <div className="preview-avatar">S</div>
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
                  <strong>Hair Styling</strong>
                  <span>Emily Johnson</span>
                </div>
                <span className="appointment-status">Confirmed</span>
              </div>

              <div className="appointment-row">
                <div className="appointment-time">10:30</div>
                <div className="appointment-details">
                  <strong>Facial Treatment</strong>
                  <span>Olivia Martin</span>
                </div>
                <span className="appointment-status">Confirmed</span>
              </div>

              <div className="appointment-row">
                <div className="appointment-time">12:00</div>
                <div className="appointment-details">
                  <strong>Manicure</strong>
                  <span>Sophia Williams</span>
                </div>
                <span className="appointment-status">Pending</span>
              </div>
            </div>

            <div className="preview-footer">
              <Check size={15} />
              Your business is looking organized.
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
          {industries.map((industry) => (
            <span key={industry}>{industry}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-eyebrow">THE VELO​RA EXPERIENCE</span>
          <h2>
            Everything your business needs.
            <br />
            <span>All in one place.</span>
          </h2>
          <p>
            Less time managing operations. More time delivering
            exceptional experiences to your clients.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <span className="feature-number">0{index + 1}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <a href="/register">
                Explore feature <ArrowRight size={16} />
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="solutions-section" id="solutions">
        <div className="solutions-content">
          <span className="section-eyebrow">MADE FOR YOUR INDUSTRY</span>
          <h2>
            Your business is unique.
            <br />
            <span>Your software should be too.</span>
          </h2>
          <p>
            Whether you're running a busy salon, managing a spa or
            building your independent beauty practice, Velora gives
            you the tools to operate with confidence.
          </p>
          <a href="/register" className="primary-button">
            Find your space with Velora <ArrowRight size={18} />
          </a>
        </div>

        <div className="solutions-list">
          {industries.map((industry, index) => (
            <div className="solution-item" key={industry}>
              <span>0{index + 1}</span>
              <strong>{industry}</strong>
              <ArrowRight size={19} />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <span className="section-eyebrow">GETTING STARTED</span>
          <h2>Simple from the very beginning.</h2>
          <p>Three steps towards a more organized business.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span>01</span>
            <h3>Create your account</h3>
            <p>Sign up and establish your business identity on Velora.</p>
          </div>
          <div className="step-card">
            <span>02</span>
            <h3>Set up your business</h3>
            <p>Add your services, working hours, team and business details.</p>
          </div>
          <div className="step-card">
            <span>03</span>
            <h3>Manage with confidence</h3>
            <p>Start organizing appointments, clients and your operations.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta" id="about">
        <div className="cta-decoration"><Sparkles /></div>
        <span>YOUR NEXT CHAPTER STARTS HERE</span>
        <h2>
          Make room for what
          <br />
          <em>you do best.</em>
        </h2>
        <p>
          Let Velora take care of the organization while you focus
          on creating exceptional client experiences.
        </p>
        <a href="/register" className="cta-button">
          Get started with Velora <ArrowRight size={18} />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="velora-footer">
        <a href="/" className="velora-logo">velora<span>.</span></a>
        <p>Thoughtfully designed for businesses that care.</p>
        <div>
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="/login">Login</a>
          <a href="/register">Get started</a>
        </div>
        <small>© {new Date().getFullYear()} Velora. All rights reserved.</small>
      </footer>

    </main>
  );
}

export default Home;
