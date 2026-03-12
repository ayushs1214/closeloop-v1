import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Check, 
  ArrowRight,
  Target,
  Shield,
  Eye,
  Clock,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";

const MethodologyPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <Link to="/methodology" className="text-sm text-slate-900 font-medium">Methodology</Link>
              <Link to="/customers" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Customers</Link>
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
          <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">Methodology</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight tracking-tight mb-6">
            Execution-first.<br />
            <span className="text-slate-400">Approval-always.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Our approach is built on a simple belief: deals fail due to broken follow-through, not bad conversations. CloseLoop exists to fix that.
          </p>
        </div>
      </section>

      {/* Core Belief */}
      <section className="py-24 px-6 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Our core belief</h2>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-12">
              {[
                {
                  title: 'Most tools analyze.',
                  desc: 'They record calls, generate notes, surface insights. They tell you what happened.',
                  side: 'left'
                },
                {
                  title: 'CloseLoop executes.',
                  desc: 'We draft follow-ups, prepare CRM updates, attach documents. We complete the work.',
                  side: 'right',
                  highlight: true
                },
                {
                  title: 'With your approval.',
                  desc: 'Nothing sends without human review. You stay in control. Your brand stays protected.',
                  side: 'left'
                }
              ].map((item, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-8 ${item.side === 'right' ? 'md:flex-row-reverse' : ''} animate-fade-in`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className={`flex-1 ${item.side === 'right' ? 'md:text-left' : 'md:text-right'}`}>
                    <div className={`p-8 rounded-xl ${item.highlight ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200'}`}>
                      <h3 className={`text-xl font-semibold mb-3 ${item.highlight ? 'text-white' : 'text-slate-900'}`}>
                        {item.title}
                      </h3>
                      <p className={item.highlight ? 'text-slate-300' : 'text-slate-500'}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-4 h-4 bg-slate-900 rounded-full flex-shrink-0 relative z-10"></div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Our principles</h2>
            <p className="text-slate-500">The ideas that guide everything we build</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Target,
                title: 'Execution over insights',
                desc: 'Insights are interesting. Execution is valuable. We focus on completing work, not analyzing it.'
              },
              {
                icon: Shield,
                title: 'Trust through control',
                desc: 'AI should assist, not replace. Every output needs human approval. Full transparency, always.'
              },
              {
                icon: Clock,
                title: 'Speed through simplicity',
                desc: 'The best interface is no interface. We minimize clicks, maximize clarity, and respect your time.'
              },
              {
                icon: Eye,
                title: 'Governance by design',
                desc: 'Data Vault, approval flows, audit trails — built-in from day one, not bolted on.'
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title}
                  className="p-8 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Loop */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-semibold mb-6">Why "CloseLoop"?</h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              In sales, the loop is: Call → Follow-up → CRM Update → Close. Most teams break the loop after the call. We close it.
            </p>
            <div className="flex justify-center gap-4 text-sm">
              {['Call', 'Follow-up', 'CRM', 'Close'].map((step, i) => (
                <div key={step} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="px-4 py-2 bg-slate-800 rounded-lg">{step}</div>
                  {i < 3 && <ArrowRight className="w-4 h-4 text-slate-600" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            Ready to close your loop?
          </h2>
          <p className="text-slate-500 mb-10">
            See the methodology in action with a personalized demo.
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

export default MethodologyPage;
