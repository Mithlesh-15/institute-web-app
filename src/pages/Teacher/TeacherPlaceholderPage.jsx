import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import { moduleDetails } from '../../components/teacher-dashboard/dashboardConfig'

function TeacherPlaceholderPage({ moduleKey }) {
  const content = moduleDetails[moduleKey]

  if (!content) {
    return null
  }

  const Icon = content.icon

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.06),rgba(219,234,254,0.4))] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-[#2563eb]" />
                {content.eyebrow}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {content.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                {content.description}
              </p>
            </div>

            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${content.accent} text-white shadow-[0_18px_40px_rgba(37,99,235,0.2)]`}>
              <Icon className="h-7 w-7" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Workspace preview" subtitle="Coming soon">
          <div className="grid gap-3 sm:grid-cols-2">
            {content.bullets.map((bullet) => (
              <div key={bullet} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                {bullet}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quick links" subtitle="Navigate">
          <div className="space-y-3">
            {content.links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-[#2563eb]/25 hover:text-[#2563eb]"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

export default TeacherPlaceholderPage
