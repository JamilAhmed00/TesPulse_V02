import { Bot, Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Applications', path: '/applications' },
    { label: 'Circulars', path: '/circulars' },
    { label: 'Results', path: '/results' },
  ];

  const supportLinks = [
    { label: 'Help Center', path: '#' },
    { label: 'FAQs', path: '#' },
    { label: 'Contact Us', path: '#' },
    { label: 'Privacy Policy', path: '#' },
  ];

  return (
    <footer className="relative bg-[#0a0a0f] border-t border-slate-800/50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-violet-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-fuchsia-600/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700 p-2.5 rounded-xl shadow-lg">
                  <Bot className="text-white" size={24} />
                </div>
              </div>
              <div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  TestPulse
                </span>
                <p className="text-xs text-slate-500 font-medium">Smart Admission Ally</p>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
              Bangladesh's first AI-powered admission automation platform. We help students save 15-20 hours 
              by automating the entire university admission process—from circular tracking to application submission.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <a href="mailto:contact@testpulse.ai" className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors text-sm">
                <Mail size={16} />
                <span>contact@testpulse.ai</span>
              </a>
              <a href="tel:+8801700000000" className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors text-sm">
                <Phone size={16} />
                <span>+880 1700-000000</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin size={16} />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-slate-400 hover:text-violet-400 transition-colors text-sm flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.path}
                    className="text-slate-400 hover:text-violet-400 transition-colors text-sm flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a 
                  href="#" 
                  className="w-9 h-9 bg-slate-800/50 hover:bg-violet-500/20 border border-slate-700/50 hover:border-violet-500/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 transition-all"
                >
                  <Twitter size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 bg-slate-800/50 hover:bg-violet-500/20 border border-slate-700/50 hover:border-violet-500/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 transition-all"
                >
                  <Linkedin size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 bg-slate-800/50 hover:bg-violet-500/20 border border-slate-700/50 hover:border-violet-500/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 transition-all"
                >
                  <Github size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center sm:text-left">
              &copy; {currentYear} TestPulse. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> in Bangladesh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
