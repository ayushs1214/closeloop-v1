import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  ArrowRight,
  Quote,
  Building,
  Users,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";

const CustomersPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      quote: "CloseLoop cut our post-call admin time by 80%. More importantly, nothing goes out without my team's approval — that's trust I can rely on.",
      name: "Sarah Chen",
      role: "Head of Sales",
      company: "TechFlow",
      metric: "80% time saved"
    },
    {
      quote: "We used to lose deals in the follow-up. Now every call becomes completed work within minutes. The ROI was immediate.",
      name: "Marcus Johnson",
      role: "VP of Revenue",
      company: "ScaleUp Inc",
      metric: "3x faster follow-ups"
    },
    {
      quote: "The Data Vault feature alone was worth it. No more worrying about reps attaching the wrong documents. Everything is governed.",
      name: "Emily Rodriguez",
      role: "RevOps Manager",
      company: "GrowthCo",
      metric: "Zero document errors"
    },
    {
      quote: "Our CRM data quality improved dramatically. CloseLoop's suggestions are always on point, and the audit trail keeps compliance happy.",
      name: "David Park",
      role: "Sales Director",
      company: "Innovate Labs",
      metric: "95% CRM accuracy"
    }
  ];

  const stats = [
    { value: '50+', label: 'Sales teams' },
    { value: '10,000+', label: 'Calls processed' },
    { value: '<60s', label: 'Avg. approval time' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900 tracking-tight">CloseLoop</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/product" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Product</Link>
              <Link to="/methodology" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Methodology</Link>
              <Link to="/customers" className="text-sm text-slate-900 font-medium">Customers</Link>
              <Link to="/pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-600">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-sm px-4">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">Customers</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight tracking-tight mb-6">
            Trusted by teams<br />
            <span className="text-slate-400">who close deals</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            From startups to scale-ups, sales teams use CloseLoop to turn post-call chaos into completed work.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div 
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-3xl font-semibold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-slate-400 mb-10">Companies using CloseLoop</p>
          <div className="flex justify-center items-center flex-wrap gap-12 opacity-50">
            {['TechFlow', 'ScaleUp', 'GrowthCo', 'Innovate Labs', 'Acme Corp', 'StartupX'].map((name, i) => (
              <div 
                key={name} 
                className="text-slate-900 font-semibold text-xl tracking-tight animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">What they're saying</h2>
            <p className="text-slate-500">Real feedback from real sales leaders</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <div 
                key={testimonial.name}
                className="p-8 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-5 h-5 text-slate-300" />
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
                    {testimonial.metric}
                  </span>
                </div>
                <blockquote className="text-slate-600 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-slate-500">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-semibold mb-4">Built for B2B sales teams</h2>
            <p className="text-slate-400">Teams of 10-75 who care about execution</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Building,
                title: 'SaaS Companies',
                desc: 'Discovery to demo to close. Keep every deal moving with perfect follow-through.'
              },
              {
                icon: Users,
                title: 'Sales Teams',
                desc: 'SDRs and AEs spend less time on admin, more time selling.'
              },
              {
                icon: TrendingUp,
                title: 'RevOps',
                desc: 'Clean CRM data, governed documents, complete audit trails.'
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title}
                  className="p-8 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            Join these teams
          </h2>
          <p className="text-slate-500 mb-10">
            See why leading sales teams choose CloseLoop.
          </p>
          <Link to="/demo">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 gap-2 px-6 h-12">
              Book a demo <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-slate-900">CloseLoop</span>
            </div>
            <p className="text-sm text-slate-400">© 2026 CloseLoop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomersPage;
