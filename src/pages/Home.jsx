import { useState, useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Menu, 
  X, 
  ArrowRight, 
  GraduationCap, 
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import InstallAppButton from '../components/pwa/InstallAppButton.jsx'
import BrandLogo from '../components/BrandLogo.jsx'
import { getSession } from '../utils/auth'

gsap.registerPlugin(ScrollTrigger)

function Home() {
  const session = getSession()

  // Navbar and Mobile Menu States
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Carousel States
  const [activeSlide, setActiveSlide] = useState(0)
  const carouselImages = [
    {
      url: '/Home/Banners/B1.jpeg',
      alt: 'Coaching Classroom'
    },
  ]

  // Refs for GSAP animations
  const heroRef = useRef(null)
  const heroContentRef = useRef(null)
  const aboutRef = useRef(null)
  const teachersRef = useRef(null)
  const feesRef = useRef(null)
  const timetableRef = useRef(null)
  const contactRef = useRef(null)

  // Track scroll position for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [carouselImages.length])

  // GSAP Entrance and Scroll Animations
  useEffect(() => {
    // 1. Hero Entrance Animations
    const heroCtx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.fromTo('.hero-anim-fade', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.2 }
      )
    }, heroContentRef)

    // 2. About Section Reveal
    const aboutCtx = gsap.context(() => {
      gsap.fromTo('.about-reveal-left',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )
      gsap.fromTo('.about-reveal-right',
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )
    }, aboutRef)

    // 3. Teachers Cards Stagger
    const teachersCtx = gsap.context(() => {
      gsap.fromTo('.teacher-card-anim',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: teachersRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )
    }, teachersRef)

    // 4. Fees Section Fade Up
    const feesCtx = gsap.context(() => {
      gsap.fromTo('.fees-anim',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: feesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )
    }, feesRef)

    // 5. Timetable Fade Up
    const timetableCtx = gsap.context(() => {
      gsap.fromTo('.timetable-anim',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: timetableRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )
    }, timetableRef)

    // Clean up animations on unmount
    return () => {
      heroCtx.revert()
      aboutCtx.revert()
      teachersCtx.revert()
      feesCtx.revert()
      timetableCtx.revert()
    }
  }, [])

  // Redirect if logged in
  if (session?.token) {
    return <Navigate to={`/${session.role}/dashboard`} replace />
  }

  // Navigation handlers
  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Teachers mock database
  const teachers = [
    {
      name: 'Yogesh Dewangan',
      qual: 'Ph.D. in Physics (DU)',
      exp: '12+ Years Experience',
      image: '/Home/Teachers/T1.png',
      subject: 'Physics & Mathematics'
    },
    {
      name: 'Prakash Dewangan',
      qual: 'M.Sc. Mathematics (IIT Bombay)',
      exp: '15+ Years Experience',
      image: '/Home/Teachers/T2.png',
      subject: 'Chemistry & Biology'
    },
  ]

  // Fees Structure mock data
  const fees = [
    { class: 'Class 9', price: '₹1,000', period: 'month', features: ['Complete Syllabus coverage', 'Weekly Chapter Tests', 'Mathematics & Science focus', 'Printed study notes'] },
    { class: 'Class 10', price: '₹1,200', period: 'month', features: ['Board Exam Preparation', 'Previous Year Papers solving', 'Weekly Tests & Feedback', 'Special doubt-clearing sessions'] },
    { class: 'Class 11', price: '₹1,500', period: 'month', features: ['Advanced Math & Science stream', 'Competitive exam foundation', 'Bi-weekly tests & parent updates', 'Detailed study materials'] },
    { class: 'Class 12', price: '₹1,800', period: 'month', features: ['Targeted Board Exam Strategy', 'Full mock exam series', 'Personalized academic counseling', 'Extended doubt assistance'] }
  ]



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* SECTION 1: STICKY NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
        {/* Top Announcement Bar */}
        <a 
          href="https://drive.google.com/file/d/1KJDTwE1v02CZQlZXjuMYtZqCDFkXetFC/view" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-extrabold tracking-wide hover:opacity-95 transition-opacity shadow-inner animate-pulse relative z-50"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-white animate-bounce" />
            🎉 ADMISSION OPEN 2026-27: Click here to download prospectus & register! 🎓
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </a>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
             <a 
              href="#home" 
              onClick={(e) => scrollToSection(e, 'home')}
              className="flex items-center gap-3 group"
            >
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform">
                <BrandLogo className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Raj Tuition Classes
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Home', id: 'home' },
                { label: 'About', id: 'about' },
                { label: 'Teachers', id: 'teachers' },
                // { label: 'Fees', id: 'fees' },
                { label: 'Time Table', id: 'timetable' },
                { label: 'Contact', id: 'contact' }
              ].map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className="text-sm font-semibold tracking-wide hover:text-blue-400 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-500 after:transition-all duration-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right side: Login Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login/student"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                Student Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-t border-slate-800 shadow-2xl py-6 px-4 flex flex-col gap-4">
            {[
              { label: 'Home', id: 'home' },
              { label: 'About', id: 'about' },
              { label: 'Teachers', id: 'teachers' },
              // { label: 'Fees', id: 'fees' },
              { label: 'Time Table', id: 'timetable' },
              { label: 'Contact', id: 'contact' }
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className="text-base font-medium py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-blue-400 transition-colors text-slate-300"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-slate-800 my-2" />
            <Link
              to="/login/student"
              className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Student Login
            </Link>
          </div>
        )}
      </header>

      {/* SECTION 2: HERO SECTION WITH CAROUSEL */}
      <section id="home" ref={heroRef} className="w-full bg-white pt-28 lg:pt-32">
        {/* Top: 100% Fully Visible Banner Slider (No overlay text, slides horizontally) */}
        <div className="relative h-[45vh] sm:h-[60vh] lg:h-[70vh] w-full overflow-hidden bg-slate-100 border-b border-slate-200">
          <div 
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {carouselImages.map((img, idx) => (
              <div
                key={idx}
                className="h-full w-full shrink-0 bg-contain bg-center bg-no-repeat bg-slate-900"
                style={{ backgroundImage: `url('${img.url}')` }}
                role="img"
                aria-label={img.alt}
              />
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 right-6 z-20 flex gap-2">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeSlide ? 'w-8 bg-blue-600' : 'w-2 bg-white/60 hover:bg-white shadow-sm'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom: Hero Content Overlays (Lighter theme, no dark overlays on banners) */}
        <div 
          ref={heroContentRef} 
          className="py-16 sm:py-24 bg-linear-to-b from-white to-slate-50 border-b border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <div className="max-w-4xl mx-auto text-center">
              <div className="hero-anim-fade inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-semibold tracking-wide mb-6">
                <Sparkles className="h-4 w-4" />
                Top Coaching Center in Town
              </div>
              
              <h1 className="hero-anim-fade text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
                Raj Tuition Classes
              </h1>
              
              <p className="hero-anim-fade text-xl sm:text-2xl md:text-3xl font-semibold text-blue-600 mt-4 tracking-tight">
                Empowering Students Through Quality Education
              </p>
              
              <p className="hero-anim-fade text-base sm:text-lg text-slate-600 mt-6 leading-relaxed max-w-2xl mx-auto">
                We specialize in offering premium mentoring, structured learning, and personalized attention 
                for secondary and higher secondary grades. Experience excellence in Physics, Chemistry, Math, and English.
              </p>
              
              <div className="hero-anim-fade mt-8 flex flex-wrap justify-center gap-4 items-center">
                <Link
                  to="/login/student"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-600/30"
                >
                  Get Started With Us
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#about"
                  onClick={(e) => scrollToSection(e, 'about')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all duration-300 hover:-translate-y-1"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ABOUT US */}
      <section id="about" ref={aboutRef} className="py-24 sm:py-32 relative overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Text Content */}
            <div className="about-reveal-left">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Who We Are</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2 mb-6">
                About Raj Tuition Classes
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                For over a decade, Raj Tuition Classes has been the cornerstone of academic success for thousands of students. 
                Our pedagogy blends traditional rigor with modern technology to deliver learning that goes beyond textbooks.
              </p>

              {/* Unique Offerings List */}
              <div className="space-y-6">
                {[
                  {
                    title: 'Student-focused learning',
                    desc: 'We adapt our teaching speed and examples to ensure every student understands complex core topics.',
                    icon: Users
                  },
                  {
                    title: 'Experienced faculty',
                    desc: 'Learn directly from subject matter experts and graduates of tier-1 colleges with years of teaching experience.',
                    icon: GraduationCap
                  },
                  {
                    title: 'Regular tests & assessment',
                    desc: 'Weekly topic evaluations and comprehensive monthly tests with detailed feedback help students track progress.',
                    icon: Award
                  },
                  {
                    title: 'Personal attention',
                    desc: 'Small batch sizes enable direct doubt resolution and custom study planning tailored to individual student needs.',
                    icon: CheckCircle
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

           

          </div>
        </div>
      </section>

      {/* SECTION 4: OUR TEACHERS */}
      <section id="teachers" ref={teachersRef} className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Our Mentors</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
              Meet Our Teachers
            </h2>
            <p className="text-lg text-slate-500 mt-4">
              Dedicated educators committed to guiding your child towards complete concept mastery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => (
              <div
                key={index}
                className="teacher-card-anim group relative rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-2"
              >
                {/* Teacher Photo */}
                <div className="relative h-72 overflow-hidden bg-slate-200">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {teacher.subject}
                  </div>
                </div>

                {/* Teacher Details */}
                <div className="p-6">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{teacher.role}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{teacher.name}</h3>
                  
                  <div className="mt-4 space-y-2 text-sm text-slate-600 border-t border-slate-200/60 pt-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-500" />
                      <span>{teacher.qual}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>{teacher.exp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FEES STRUCTURE */}
      {/* <section id="fees" ref={feesRef} className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Affordable Pricing</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
              Fees Structure
            </h2>
            <p className="text-lg text-slate-500 mt-4">
              Quality teaching shouldn't break the bank. Explore our transparent monthly pricing structures.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {fees.map((fee, idx) => (
              <div 
                key={idx}
                className="fees-anim bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-500 transition-all duration-300 hover:shadow-md"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{fee.class}</h3>
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-3xl font-extrabold text-blue-600">{fee.price}</span>
                    <span className="text-sm font-medium text-slate-500">/{fee.period}</span>
                  </div>
                  <hr className="border-slate-100 my-4" />
                  
                  <ul className="space-y-3 mb-6">
                    {fee.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/login/student"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/10 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* SECTION 6: TIME TABLE */}
      <section id="timetable" ref={timetableRef} className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Row with View More Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Structured Batches</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
                Class Time Table
              </h2>
              <p className="text-lg text-slate-500 mt-3 max-w-xl">
                Timings for Class 11th & 12th regular batches. Click View Full Timetable to check grades 6th to 10th.
              </p>
            </div>
            
            <Link
              to="/timetable"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-650 hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              View Full Timetable (6th - 12th)
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Timetable Table */}
          <div className="timetable-anim bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full min-w-[500px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-4">Subject</th>
                  <th className="py-4 px-4">Class 11 Timing</th>
                  <th className="py-4 px-4">Class 12 Timing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {[
                  { subject: 'Physics', class11: '3 PM – 4 PM', class12: '5 PM – 6 PM' },
                  { subject: 'Chemistry', class11: '4 PM – 5 PM', class12: '6 PM – 7 PM' },
                  { subject: 'Mathematics', class11: '5 PM – 6 PM', class12: '7 PM – 8 PM' },
                  { subject: 'Biology', class11: '6 PM – 7 PM', class12: '4 PM – 5 PM' }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-slate-100/40 transition-colors">
                    <td className="py-5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      {row.subject}
                    </td>
                    <td className="py-5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50/50 px-3 py-1 rounded-lg">
                        <Clock className="h-3.5 w-3.5" />
                        {row.class11}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50/50 px-3 py-1 rounded-lg">
                        <Clock className="h-3.5 w-3.5" />
                        {row.class12}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* SECTION 6.5: MAP LOCATION */}
      <section id="location" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Our Location</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Find Us on Google Maps
            </h2>
            <p className="text-base text-slate-500 mt-3">
              Visit our campus for counseling, admissions, and center tours.
            </p>
          </div>

          <div className="relative rounded-4xl overflow-hidden border border-slate-200 bg-white p-3 shadow-xl h-112.5">
            <iframe
             src="https://maps.google.com/maps?q=Raj%20Tuition%20Classes%20RTC%20Durg&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Raj Tuition Classes Location Map"
              className="rounded-2xl"
            ></iframe>
          </div>
        </div>
      </section>

      {/* SECTION 7: CONTACT US */}
      <section id="contact" ref={contactRef} className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column Info */}
            <div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Get In Touch</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2 mb-6">
                Contact Us
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Have questions about our batch timings, fees, or course curriculum? 
                Feel free to connect with our administrative desk. We are here to help!
              </p>

              {/* Direct Info Blocks */}
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  {
                    title: 'Phone Call',
                    value: '+91 98765 43210',
                    desc: 'Mon - Sat: 9 AM to 8 PM',
                    link: 'tel:+919876543210',
                    icon: Phone
                  },
                  {
                    title: 'WhatsApp Chat',
                    value: '+91 98765 43210',
                    desc: 'Quick query replies',
                    link: 'https://wa.me/919876543210',
                    icon: MessageSquare
                  },
                  {
                    title: 'Email Address',
                    value: 'info@rajtuitionclasses.com',
                    desc: 'Drop in a line anytime',
                    link: 'mailto:info@rajtuitionclasses.com',
                    icon: Mail
                  },
                  {
                    title: 'Institute Address',
                    value: 'Rajiv Nagar, Durg, Chhattisgarh 491001',
                    desc: 'Sector 15, Near City Center',
                    link: '#',
                    icon: MapPin
                  }
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target={item.link.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="group block p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-300"
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-base font-extrabold text-blue-600 mt-1 wrap-break-word">{item.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </a>
                ))}
              </div>
            </div>

           

          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section className="py-20 relative bg-slate-900 overflow-hidden text-white">
        {/* Glow Effects */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.4),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.2),transparent_40%)]" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-[2.5rem] bg-linear-to-br from-blue-600 to-indigo-700 p-8 sm:p-16 text-center shadow-2xl relative overflow-hidden">
            
            {/* Design accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-xl" />

            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              Admissions Open 2026-27
            </span>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Ready to Join Raj Tuition Classes?
            </h2>
            
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Start your learning journey today. Get high-quality tutoring, regular tests, 
              and step closer to your academic goals.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/login/student"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1"
              >
                Get Started With Us
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="w-full sm:w-auto">
                <InstallAppButton />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 9: FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Col 1 Brand */}
            <div>
              <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center p-1 shadow-sm">
                  <BrandLogo className="h-full w-full object-contain filter brightness-0 invert" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Raj Tuition Classes</span>
              </a>
              <p className="text-sm text-slate-500 leading-relaxed">
                Empowering students of grades 9-12 with deep concept clarity, regular tests, and target-oriented mentoring.
              </p>
            </div>

            {/* Col 2 Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Quick Links</h3>
              <ul className="space-y-3.5 text-sm">
                {[
                  { label: 'Home', id: 'home' },
                  { label: 'About', id: 'about' },
                  { label: 'Teachers', id: 'teachers' },
                  // { label: 'Fees', id: 'fees' },
                  { label: 'Contact', id: 'contact' }
                ].map((link) => (
                  <li key={link.id}>
                    <a 
                      href={`#${link.id}`} 
                      onClick={(e) => scrollToSection(e, link.id)}
                      className="hover:text-blue-500 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 Timings */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Office Hours</h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>Monday – Saturday:</li>
                <li className="text-white font-semibold">9:00 AM – 8:00 PM</li>
                <li className="pt-2">Sundays:</li>
                <li className="text-amber-500 font-semibold">Closed</li>
              </ul>
            </div>

            {/* Col 4 Quick Contact */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Support</h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-300 font-medium">+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-300 font-medium">info@rajtuitionclasses.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-300">Rajiv Nagar, Durg, Chhattisgarh 491001</span>
                </li>
              </ul>
            </div>
          </div>

          <hr className="border-slate-900 my-8" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} Raj Tuition Classes. All rights reserved.</p>
            <p>Designed with ❤️ for absolute academic success.</p>
          </div>

        </div>
      </footer>

    </div>
  )
}

export default Home
