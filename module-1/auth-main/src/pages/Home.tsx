
import { Link } from 'react-router'
import HomeImage from '../assets/home.jpg'

const features = [
  {
    number: '01',
    title: 'Reusable Components',
    description:
      'Build once and reuse across multiple projects. Maintain consistency without rewriting the same interfaces.',
  },
  {
    number: '02',
    title: 'Consistent Design',
    description:
      'A unified design language that keeps every application visually consistent and professionally structured.',
  },
  {
    number: '03',
    title: 'Scalable Architecture',
    description:
      'Organized frontend foundations designed to grow alongside the applications and products we build.',
  },
]

function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-3 border-b border-gray-100 sticky top-0 z-50 bg-white">
        <a href="/" className="text-2xl font-bold tracking-tight">
          GENMARS<span className="text-blue-600">.</span><span className='text-sm text-gray-400 font-light'>designs</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#about" className="hover:text-black transition">About</a>
          <a href="#features" className="hover:text-black transition">Features</a>
          <a href="#modules" className="hover:text-black transition">Modules</a>
        </div>

        <Link
          to={'/intro'}
          className="bg-black text-white px-5 py-3 rounded-lg text-sm hover:bg-gray-800 transition"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <section
        id="about"
        className="px-6 md:px-16 pt-20 md:pt-28 pb-20"
      >
        <div className="max-w-4xl mx-auto text-center">

          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-8">
            Genmars Technology
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-tight tracking-tight">
            Building better
            <span className="block text-gray-400">
              digital foundations.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto mt-8 text-gray-500 text-base md:text-lg leading-relaxed">
            A collection of reusable frontend modules designed to
            accelerate development, improve consistency, and establish
            a reliable foundation for every application we build.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="#modules"
              className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
            >
              Explore Modules →
            </a>

            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="px-6 md:px-16">
        <div className="max-w-6xl mx-auto relative">
          <img
            src={HomeImage}
            alt="Genmars frontend development"
            className="w-full h-[300px] md:h-[520px] object-cover rounded-2xl"
          />

          <div className="absolute bottom-5 left-5 md:bottom-10 md:left-10 bg-white/95 backdrop-blur-sm p-5 md:p-7 rounded-xl max-w-xs shadow-lg">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              Our Philosophy
            </p>
            <h3 className="text-xl font-serif">
              Build once. Build better. Build consistently.
            </h3>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-16 py-24">
        <div className="max-w-6xl mx-auto">

          <div className="mb-14">
            <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-4">
              Why this foundation?
            </p>

            <h2 className="text-3xl md:text-5xl font-serif max-w-xl">
              A smarter approach to frontend development.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="border-t border-gray-200 pt-6"
              >
                <span className="text-sm text-blue-600 font-medium">
                  {feature.number}
                </span>

                <h3 className="text-xl font-semibold mt-5 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="bg-gray-50 px-6 md:px-16 py-24">
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-4">
                The foundation
              </p>

              <h2 className="text-3xl md:text-5xl font-serif">
                Explore our modules.
              </h2>
            </div>

            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              Independent, reusable building blocks that can be
              integrated into different applications and products.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              'UI Components',
              'Authentication',
              'Dashboard Layouts',
              'Form Systems',
              'Navigation Systems',
              'Data Presentation',
            ].map((module, index) => (
              <div
                key={module}
                className="bg-white border border-gray-100 rounded-xl p-7 hover:border-gray-300 hover:shadow-md transition group"
              >
                <span className="text-xs text-gray-400">
                  MODULE / 0{index + 1}
                </span>

                <h3 className="text-xl font-serif mt-8 mb-3 group-hover:text-blue-600 transition">
                  {module}
                </h3>

                <p className="text-sm text-gray-500">
                  A reusable foundation for building consistent
                  application experiences.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 md:px-16 py-24">
        <div className="max-w-5xl mx-auto bg-black text-white rounded-2xl px-8 md:px-16 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">
            Start building
          </p>

          <h2 className="text-3xl md:text-5xl font-serif">
            Good software starts with good foundations.
          </h2>

          <p className="text-gray-400 max-w-xl mx-auto mt-6 leading-relaxed">
            Explore the building blocks that power our frontend
            development ecosystem.
          </p>

          <a
            href="#modules"
            className="inline-block mt-9 bg-white text-black px-8 py-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Start Here →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 md:px-16 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-bold tracking-tight">
            GENMARS<span className="text-blue-600">.</span>
          </p>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Genmars Technologies. All rights reserved.
          </p>

          <p className="text-xs text-gray-400">
            Built for consistency.
          </p>
        </div>
      </footer>

    </main>
  )
}

export default Home
