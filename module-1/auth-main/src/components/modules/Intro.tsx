
import { Link } from 'react-router'
import {
  ArrowUpRight,
  Layers,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Database,
  Menu,
  Component,
} from 'lucide-react'

const modules = [
  {
    id: '01',
    title: 'Authentication',
    description: 'Registration, login, password recovery and user identity management.',
    path: '/module-1',
    icon: ShieldCheck,
    category: 'Security',
    status: 'Available',
  },
  {
    id: '02',
    title: 'UI Components',
    description: 'Reusable buttons, cards, badges, modals and interface elements.',
    path: '/authentication',
    icon: Component,
    category: 'Design System',
    status: 'Coming soon',
  },
  {
    id: '03',
    title: 'Dashboard Layouts',
    description: 'Reusable dashboard structures, sidebars and application navigation.',
    path: '/dashboard',
    icon: LayoutDashboard,
    category: 'Layouts',
    status: 'Coming Soon',
  },
  {
    id: '04',
    title: 'Form Systems',
    description: 'Form inputs, validation, submission states and reusable form layouts.',
    path: '/forms',
    icon: FileText,
    category: 'Components',
    status: 'Coming Soon',
  },
  {
    id: '05',
    title: 'Navigation Systems',
    description: 'Navigation bars, breadcrumbs, menus and responsive navigation.',
    path: '/navigation',
    icon: Menu,
    category: 'Components',
    status: 'Coming Soon',
  },
  {
    id: '06',
    title: 'Data Presentation',
    description: 'Data tables, pagination, filters and structured data displays.',
    path: '/data-presentation',
    icon: Database,
    category: 'Data',
    status: 'Coming Soon',
  },
]

function Intro() {
  return (
    <main className="min-h-screen bg-[#f8f9fb] text-gray-900">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 md:px-16 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            GENMARS<span className="text-blue-600">.</span>
            <span className="text-sm text-gray-400 font-light ml-1">designs</span>
          </Link>

          <span className="text-xs text-gray-400 tracking-wider uppercase">
            Frontend Foundation
          </span>
        </div>
      </header>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-16">

        {/* Introduction */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Internal Development Library
            </p>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-tight">
            Everything we build,
            <span className="block text-gray-400">
              starts somewhere.
            </span>
          </h1>

          <p className="mt-6 text-gray-500 leading-relaxed max-w-2xl">
            A centralized collection of reusable frontend modules
            developed by Genmars. Explore, test and integrate
            standardized components into our applications.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { label: 'Total Modules', value: modules.length },
            { label: 'Available', value: modules.filter(m => m.status === 'Available').length },
            { label: 'In Development', value: modules.filter(m => m.status === 'In Development').length },
            { label: 'Coming Soon', value: modules.filter(m => m.status === 'Coming Soon').length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-2xl md:text-3xl font-semibold">{stat.value.toString().padStart(2, '0')}</p>
              <p className="text-xs text-gray-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Module heading */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-xs text-blue-600 uppercase tracking-widest font-semibold mb-2">
              Explore the library
            </p>
            <h2 className="text-2xl md:text-3xl font-serif">
              Available modules
            </h2>
          </div>

          <span className="text-xs text-gray-400">
            {modules.length} modules listed
          </span>
        </div>

        {/* Modules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((module) => {
            const Icon = module.icon
            const available = module.status === 'Available'

            return (
              <article
                key={module.id}
                className="group bg-white border border-gray-100 rounded-2xl p-7 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition">
                    <Icon size={22} className="text-gray-700 group-hover:text-blue-600 transition" />
                  </div>

                  <span className="text-xs text-gray-300 font-medium">
                    MODULE / {module.id}
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-xs text-gray-400 mb-2">
                    {module.category}
                  </p>

                  <h3 className="text-xl font-semibold tracking-tight">
                    {module.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed mt-3 min-h-[60px]">
                    {module.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                    available
                      ? 'bg-green-50 text-green-700'
                      : module.status === 'In Development'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {module.status}
                  </span>

                  {available ? (
                    <Link
                      to={module.path}
                      className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition"
                    >
                      Explore <ArrowUpRight size={16} />
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-300">
                      Not available
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="mt-16 border-t border-gray-200 pt-7 flex flex-col md:flex-row justify-between gap-3">
          <p className="text-xs text-gray-400">
            Genmars Technologies · Frontend Development Foundation
          </p>
          <p className="text-xs text-gray-400">
            Building consistently. Building intelligently.
          </p>
        </div>

      </section>
    </main>
  )
}

export default Intro
