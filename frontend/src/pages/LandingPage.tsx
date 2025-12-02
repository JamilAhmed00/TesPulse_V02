import { 
  Zap, Clock, TrendingUp, CheckCircle, ArrowRight, LogIn, Bot, Globe, Sparkles, 
  Brain, Timer, Users, Shield, AlertCircle, X, GraduationCap, Target, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Circular Scraping',
      description: 'Automatically monitors 70+ university websites for admission circulars 24/7',
      gradient: 'from-violet-500 to-fuchsia-500',
    },
    {
      icon: CheckCircle,
      title: 'Automated Eligibility Check',
      description: 'Instantly verifies your eligibility with Education Board APIs',
      gradient: 'from-emerald-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Smart Auto-Apply',
      description: 'AI agent auto-fills and submits applications based on your preferences',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Globe,
      title: 'bKash/Nagad Integration',
      description: 'One-click payment integration with mobile banking APIs',
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      icon: Clock,
      title: '24/7 AI Monitoring',
      description: 'Never miss deadlines with automated tracking and notifications',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: TrendingUp,
      title: 'Smart Recommendations',
      description: 'Get personalized university matches based on your profile',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  const impactMetrics = [
    { icon: Timer, number: '15-20', unit: 'Hours', label: 'Saved Per Student', color: 'from-violet-400 to-fuchsia-400' },
    { icon: Bot, number: '100%', unit: '', label: 'Automated Applications', color: 'from-emerald-400 to-cyan-400' },
    { icon: Shield, number: '70+', unit: '', label: 'Universities Monitored', color: 'from-amber-400 to-orange-400' },
    { icon: Users, number: '24/7', unit: '', label: 'AI Agent Support', color: 'from-rose-400 to-pink-400' },
  ];

  const steps = [
    {
      number: 1,
      title: 'One-Time Registration',
      description: 'Complete your SSC, HSC details once. Our AI verifies eligibility automatically',
      icon: GraduationCap,
    },
    {
      number: 2,
      title: 'Select & Enable Auto-Apply',
      description: 'Choose universities and toggle auto-apply. Get smart recommendations',
      icon: Target,
    },
    {
      number: 3,
      title: 'Recharge & Auto-Pay',
      description: 'Add balance via bKash/Nagad. AI agent auto-pays application fees',
      icon: Zap,
    },
    {
      number: 4,
      title: 'AI Agent Takes Over',
      description: '24/7 monitoring, circular scraping, auto-application—all automated',
      icon: Bot,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Animated Background - contained within section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -right-40 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-20 -left-40 w-[600px] h-[600px] bg-fuchsia-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>

        {/* Hero Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-20">
          <div className="space-y-8">
            {/* AI Badge */}
            <div 
              className={`inline-flex items-center gap-2 bg-violet-500/20 backdrop-blur-md border border-violet-500/30 rounded-full px-6 py-3 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } hover:bg-violet-500/30 hover:border-violet-400/50`}
            >
              <div className="relative">
                <Sparkles className="text-violet-400 animate-pulse" size={20} />
              </div>
              <span className="text-violet-300 font-semibold">AI Agent Active</span>
              <span className="text-slate-500">•</span>
              <span className="text-fuchsia-300 font-medium">24/7 Monitoring</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}>
                <span 
                  className={`block mb-2 text-white ${mounted ? 'animate-fade-in-up' : ''}`}
                  style={{ animationDelay: '0.2s' }}
                >
                  From Hours to Minutes
                </span>
                <span 
                  className={`block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent ${
                    mounted ? 'animate-fade-in-up' : ''
                  }`}
                  style={{ animationDelay: '0.4s' }}
                >
                  Filling Forms
                </span>
              </h1>
              
              <h2 
                className={`text-xl sm:text-2xl md:text-3xl font-semibold text-slate-300 max-w-3xl mx-auto leading-relaxed ${
                  mounted ? 'animate-fade-in-up opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: '0.6s' }}
              >
                Let <span className="text-violet-400">TestPulse</span> Handle Your University Admission Applications
              </h2>
            </div>
            
            {/* Description */}
            <p 
              className={`text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto ${
                mounted ? 'animate-fade-in-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.8s' }}
            >
              TestPulse automates your entire admission journey—from circular tracking to application submission.{' '}
              <span className="text-violet-400 font-medium">One-time registration</span>,{' '}
              <span className="text-fuchsia-400 font-medium">smart recommendations</span>, and{' '}
              <span className="text-cyan-400 font-medium">24/7 AI agent</span>{' '}
              handle everything.
            </p>
            
            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center ${
                mounted ? 'animate-fade-in-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: '1s' }}
            >
              <button
                onClick={() => navigate('/register')}
                className="group relative bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 text-lg w-full sm:w-auto"
              >
                <span>Get Started Free</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="group border-2 border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-white hover:bg-violet-500/10 font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <LogIn size={20} />
                Sign In
              </button>
            </div>

            {/* Trust Indicators */}
            <div 
              className={`flex flex-wrap items-center justify-center gap-6 pt-8 ${
                mounted ? 'animate-fade-in-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: '1.2s' }}
            >
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm">1000+ Students</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
                <span className="text-slate-400 text-sm ml-1">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-violet-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 rounded-full px-4 py-2 mb-6">
              <AlertCircle className="text-rose-400" size={20} />
              <span className="text-rose-300 font-semibold text-sm">The Problem We're Solving</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="text-rose-400">726,000 Students.</span>{' '}
              <span className="text-white">15-20 Hours Each.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              That's <span className="text-rose-400 font-bold">10.9 million hours</span> wasted every year filling the same forms across 70+ universities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-rose-500/20 hover:border-rose-500/40 transition-all">
              <div className="text-center mb-4">
                <div className="inline-flex p-4 bg-rose-500/20 rounded-2xl mb-4">
                  <Clock className="text-rose-400" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-rose-400 mb-2">15-20 Hours</h3>
                <p className="text-slate-300 font-medium">Per student, per season</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <X className="text-rose-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>Filling the same information repeatedly</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-rose-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>Visiting 70+ university websites</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-rose-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>Manual eligibility calculations</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all">
              <div className="text-center mb-4">
                <div className="inline-flex p-4 bg-amber-500/20 rounded-2xl mb-4">
                  <AlertCircle className="text-amber-400" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-amber-400 mb-2">Fragmented Process</h3>
                <p className="text-slate-300 font-medium">No centralized system</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <X className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>Circulars released at different times</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>Each university has different forms</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>No way to track everything</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <div className="text-center mb-4">
                <div className="inline-flex p-4 bg-orange-500/20 rounded-2xl mb-4">
                  <X className="text-orange-400" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-orange-400 mb-2">Missed Deadlines</h3>
                <p className="text-slate-300 font-medium">50% need coaching help</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <X className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>No deadline tracking system</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>Students miss application windows</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                  <span>Pay third parties just to apply</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-rose-600/20 via-fuchsia-600/20 to-violet-600/20 backdrop-blur-sm rounded-2xl p-8 border border-rose-500/30">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">726K</div>
                <div className="text-slate-400">HSC Graduates Annually</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">10.9M</div>
                <div className="text-slate-400">Hours Wasted Per Year</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">70+</div>
                <div className="text-slate-400">Fragmented Websites</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 rounded-full px-4 py-2 mb-6">
              <Brain className="text-violet-400" size={20} />
              <span className="text-violet-300 font-semibold text-sm">AI-Powered Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              Why Choose <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">TestPulse</span>?
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              The first Bangladesh-focused AI admission agent. Real-time circular scraping, RPA-based form automation, and seamless payment integration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className={`relative mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-violet-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/5 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              The Impact <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">We Create</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Every year, hundreds of thousands of HSC graduates struggle with fragmented admission processes. TestPulse transforms this experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactMetrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:border-violet-500/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 bg-gradient-to-br ${metric.color} rounded-xl shadow-lg`}>
                      <Icon className="text-white" size={28} />
                    </div>
                  </div>
                  <div className={`text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                    {metric.number}{metric.unit && <span className="text-3xl">{metric.unit}</span>}
                  </div>
                  <p className="text-slate-400 font-medium">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              How <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">It Works</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Four simple steps to automate your entire admission journey
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-20 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-30"></div>

            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative group">
                  <div className="relative bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 hover:scale-105 pt-12">
                    {/* Step Number */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                      {step.number}
                    </div>

                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-slate-700/50 rounded-xl group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-fuchsia-600 transition-all duration-300">
                        <Icon className="text-violet-400 group-hover:text-white transition-colors" size={28} />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-center mb-3 text-white group-hover:text-violet-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-center text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-violet-600/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/20 backdrop-blur-sm border border-violet-500/30 rounded-full px-4 py-2 mb-6">
            <Bot className="animate-pulse text-violet-400" size={20} />
            <span className="font-semibold text-violet-300">TestPulse Agent Ready</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Let <span className="text-fuchsia-400">TestPulse Handle</span> Your Admission?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of HSC graduates who chose TestPulse—the first AI-powered admission automation agent for Bangladesh
          </p>
          
          <button
            onClick={() => navigate('/register')}
            className="group relative bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-5 px-12 rounded-xl text-lg transition-all duration-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              Get Started Today
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </span>
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
