import { Link } from 'react-router-dom'
import { Phone, MapPin, Award, Sparkles } from 'lucide-react'
import BrandLogo from './BrandLogo'

function Footer() {
  const currentYear = new Date().getFullYear()

  const seoLinks = [
    { name: 'Class 6 Tuition', path: '/class-6-tuition-durg' },
    { name: 'Class 7 Tuition', path: '/class-7-tuition-durg' },
    { name: 'Class 8 Tuition', path: '/class-8-tuition-durg' },
    { name: 'Class 9 Tuition', path: '/class-9-tuition-durg' },
    { name: 'Class 10 Tuition', path: '/class-10-tuition-durg' },
    { name: 'Class 11 Tuition', path: '/class-11-tuition-durg' },
    { name: 'Class 12 Tuition', path: '/class-12-tuition-durg' },
    { name: 'UG Tuition', path: '/ug-tuition-durg' },
    { name: 'PG Tuition', path: '/pg-tuition-durg' },
    { name: 'Maths Tuition', path: '/maths-tuition-durg' },
    { name: 'Physics Tuition', path: '/physics-tuition-durg' },
    { name: 'Chemistry Tuition', path: '/chemistry-tuition-durg' },
    { name: 'Biology Tuition', path: '/biology-tuition-durg' },
    { name: 'English Tuition', path: '/english-tuition-durg' },
    { name: 'Commerce Tuition', path: '/commerce-tuition-durg' },
    { name: 'Accountancy Tuition', path: '/accountancy-tuition-durg' }
  ]

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & Intro */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md">
                <BrandLogo className="h-full w-full object-contain filter brightness-0 invert" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Raj Tuition Classes
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Empowering students of grades 6-12, UG, and PG in Durg and Bhilai with deep concept clarity, expert mentoring, and target-oriented preparation.
            </p>
            <div className="flex gap-4 text-xs font-semibold text-blue-500">
              <span className="flex items-center gap-1">
                <Award className="h-4 w-4" /> ISO Certified
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" /> 10+ Yrs Exp
              </span>
            </div>
          </div>

          {/* Column 2: Office Hours & Contact */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
              Contact & Hours
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-slate-400">
                  Ward No. 1, Sabji Market,<br />
                  Panchsheel Nagar,<br />
                  Durg, Chhattisgarh 491001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-slate-300 font-medium">
                  +91 88393 66658, +91 96692 77630
                </span>
              </li>
              <li className="border-t border-slate-900 pt-4 text-xs text-slate-500">
                <p>Monday – Saturday:</p>
                <p className="text-white font-semibold mt-1">9:00 AM – 8:00 PM</p>
                <p className="mt-2">Sundays: <span className="text-amber-500 font-semibold">Closed</span></p>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/timetable" className="hover:text-blue-400 transition-colors">Class Timetable</Link>
              </li>
              <li>
                <Link to="/login/student" className="hover:text-blue-400 transition-colors">Student Login</Link>
              </li>
              <li>
                <Link to="/login/teacher" className="hover:text-blue-400 transition-colors">Teacher Portal</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Popular Tuition Courses (SEO Landing Page Links) */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
              Popular Tuition Courses
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {seoLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="hover:text-blue-400 transition-colors text-slate-500 font-medium truncate"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

        </div>

        <hr className="border-slate-900 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-650">
          <p>
            © {currentYear} Raj Tuition Classes Durg. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Designed with ❤️ for absolute academic success in Durg & Bhilai.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
