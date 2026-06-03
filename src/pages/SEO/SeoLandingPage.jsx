import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  BookOpen, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  Award,
  MessageSquare
} from 'lucide-react'
import BrandLogo from '../../components/BrandLogo'
import Footer from '../../components/Footer'
import { seoDataMap } from './seoData'

function SeoLandingPage() {
  const { slug } = useParams()
  const data = seoDataMap[slug]

  // Accordion state for FAQs
  const [openFaqIdx, setOpenFaqIdx] = useState(null)

  // Dynamically set page metadata (SEO Helmet requirement)
  useEffect(() => {
    if (data) {
      document.title = data.title

      // Description meta tag
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.content = data.description

      // Canonical link tag
      let linkCanonical = document.querySelector('link[rel="canonical"]')
      if (!linkCanonical) {
        linkCanonical = document.createElement('link')
        linkCanonical.rel = 'canonical'
        document.head.appendChild(linkCanonical)
      }
      linkCanonical.href = data.canonical
    }
  }, [data])

  if (!data) {
    return <Navigate to="/" replace />
  }

  const toggleFaq = (idx) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Dynamic SEO schema script tag for Structured Content */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Raj Tuition Classes Durg",
          "url": data.canonical,
          "logo": "https://xliawmwwielzegkfuhuw.supabase.co/storage/v1/object/public/student-photos/students/8869bed8-d144-43b6-9528-e8b461646542-1779721299128.png",
          "description": data.description,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Ward No. 1, Sabji Market, Panchsheel Nagar",
            "addressLocality": "Durg",
            "addressRegion": "Chhattisgarh",
            "postalCode": "491001",
            "addressCountry": "IN"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-88393-66658",
            "contactType": "admissions desk"
          }
        })}
      </script>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform">
              <BrandLogo className="h-full w-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Raj Tuition Classes
            </span>
          </Link>
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold hover:text-blue-400 transition-colors bg-white/10 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 sm:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.4),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.2),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold tracking-wide mb-6">
            <Sparkles className="h-4 w-4 text-brand" />
            Premium Coaching Program 2026-27
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-none">
            {data.h1}
          </h1>
          <p className="text-lg sm:text-xl text-slate-350 max-w-3xl mx-auto mb-8 font-medium">
            {data.subH1}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Enquire Now
              <Clock className="h-5 w-5" />
            </a>
            <Link 
              to="/login/student" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Student Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Main Rich Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        
        {/* Intro */}
        <section className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-6">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest block">Introduction</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              About Our Coaching Program
            </h2>
            {data.introParagraphs.map((para, idx) => (
              <p key={idx} className="text-slate-600 leading-relaxed text-base">
                {para}
              </p>
            ))}
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Quick Highlights
            </h3>
            <ul className="space-y-4 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>Expert Subject Mentoring</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>CBSE, CGBSE & State Board Prep</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>Dedicated Durg & Bhilai Batches</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>Printed Materials & Test Series</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>Small Batch Size (Individual Focus)</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="space-y-6">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest block">Our Core Pillars</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Raj Tuition Classes?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {data.whyChooseUs.map((para, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 font-bold">
                  {idx + 1}
                </div>
                <p className="text-slate-650 leading-relaxed text-sm">
                  {para}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Course Benefits */}
        <section className="space-y-8 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="max-w-2xl">
              <span className="text-sm font-bold text-blue-400 uppercase tracking-widest block">Program Benefits</span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">
                What Our Students Gain
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 pt-4">
              {data.courseBenefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Approach */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest block">Pedagogy</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Advanced Learning Approach
            </h2>
            {data.learningApproach.map((para, idx) => (
              <p key={idx} className="text-slate-650 leading-relaxed text-sm">
                {para}
              </p>
            ))}
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white p-2 shadow-sm">
            <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-bold text-slate-900">Concept Lectures</h4>
                  <p className="text-xs text-slate-500 mt-1">Deep explanation of principles, formulas, and derivations.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-bold text-slate-900">Structured Homework</h4>
                  <p className="text-xs text-slate-500 mt-1">Graded sheets covering NCERT, Board level, and past years papers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-bold text-slate-900">Weekly Evaluation</h4>
                  <p className="text-xs text-slate-500 mt-1">Detailed chapter-wise mock testing to track analytical progress.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Exam Prep Strategy */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest block">Strategy</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Targeted Exam Preparation Strategy
          </h2>
          <div className="grid md:grid-cols-3 gap-8 pt-4">
            {data.examPrepStrategy.map((para, idx) => (
              <div key={idx} className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <p className="text-slate-650 leading-relaxed text-sm">
                  {para}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest block text-center">Questions & Answers</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 pt-6">
            {data.faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50 text-slate-600 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Map & Location / Contact Section */}
        <section id="contact" className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest block">Contact Us</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch with Raj Tuition Classes
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Have a question about our courses, fees structure, or schedules? Speak directly with our enrollment counselor at Panchsheel Nagar, Durg.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <a 
                href="tel:+918839366658" 
                className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Phone Call</h3>
                <p className="text-base font-extrabold text-blue-600 mt-1">+91 88393 66658</p>
                <p className="text-xs text-slate-500 mt-1">Enrollment Helpline</p>
              </a>
              <a 
                href="https://wa.me/919669277630" 
                className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp</h3>
                <p className="text-base font-extrabold text-blue-600 mt-1">+91 96692 77630</p>
                <p className="text-xs text-slate-500 mt-1">Instant Chat Support</p>
              </a>
            </div>
            <div className="flex gap-4 items-start p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-sm">
              <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Institute Address</h4>
                <p className="text-slate-600 mt-1">Ward No. 1, Sabji Market, Panchsheel Nagar, Durg, Chhattisgarh 491001</p>
              </div>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white p-3 shadow-md h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1366.8392153363873!2d81.26086172693046!3d21.19366036466824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a293d849c55e091%3A0x6c5beb2f8eac33b1!2sRAJ%20TUITION%20CLASSES%2CDURG!5e0!3m2!1sen!2sin!4v1780480021702!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Raj Tuition Classes Location"
              className="rounded-2xl"
            />
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
      
    </div>
  )
}

export default SeoLandingPage
