import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Check, 
  Zap, 
  Shield, 
  FileText, 
  Database,
  UserCheck,
  Play
} from "lucide-react";
import { useState, useEffect } from "react";
import { useScrollAnimation, useStaggeredAnimation, AnimatedSection } from "@/hooks/useScrollAnimation";
import VideoModal, { VideoTrigger } from "@/components/VideoModal";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll animation refs
  const [statsRef, statsVisible] = useStaggeredAnimation(3, { staggerDelay: 150 });
  const [solutionRef, solutionVisible] = useStaggeredAnimation(4, { staggerDelay: 100 });
  const [featuresRef, featuresVisible] = useStaggeredAnimation(4, { staggerDelay: 120 });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Video Modal */}
      <VideoModal 
        isOpen={videoOpen} 
        onClose={() => setVideoOpen(false)}
        title="CloseLoop Product Demo"
      />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5" data-testid="nav-logo">
              <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900 tracking-tight">CloseLoop</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/product" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" data-testid="nav-product">
                Product
              </Link>
              <Link to="/methodology" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" data-testid="nav-methodology">
                Methodology
              </Link>
              <Link to="/customers" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" data-testid="nav-customers">
                Customers
              </Link>
              <Link to="/pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" data-testid="nav-pricing">
                Pricing
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" data-testid="nav-login-btn">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-sm px-4" data-testid="nav-signup-btn">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-600 mb-8">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Execution layer for sales calls
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 leading-[1.1] tracking-tight mb-6" data-testid="hero-headline">
              Turn post-call chaos<br />
              <span className="text-slate-400">into completed work</span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={200}>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
              CloseLoop drafts follow-up emails, prepares CRM updates, and attaches the correct documents — all behind an approval-first, trust-safe interface.
            </p>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link to="/demo">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 gap-2 px-6 h-12 text-base" data-testid="hero-demo-btn">
                  Book a demo <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="gap-2 px-6 h-12 text-base border-slate-200 hover:bg-slate-50" data-testid="hero-trial-btn">
                  Start free trial
                </Button>
              </Link>
            </div>
            
            {/* Watch Demo Link */}
            <div className="flex justify-center">
              <VideoTrigger onClick={() => setVideoOpen(true)} />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Product Preview */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection animation="scale" delay={400}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-transparent z-10 pointer-events-none h-full"></div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden hover:shadow-3xl transition-shadow duration-500">
                <div className="border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 bg-slate-50 rounded text-xs text-slate-400">app.closeloop.io</div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Sidebar Preview */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                          <Zap className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">CloseLoop</span>
                      </div>
                      <div className="space-y-1 pt-2">
                        <div className="px-3 py-2 bg-slate-100 rounded text-xs text-slate-700">⚡ Action Required</div>
                        <div className="px-3 py-2 text-xs text-slate-500">Calls</div>
                        <div className="px-3 py-2 text-xs text-slate-500">Data Vault</div>
                      </div>
                    </div>
                    
                    {/* Main Content Preview */}
                    <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">Discovery Call - Acme Corp</span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">Pending</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-xs text-slate-500 mb-1">Follow-up Email</div>
                            <div className="h-16 bg-slate-100 rounded animate-pulse"></div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-xs text-slate-500 mb-1">CRM Update</div>
                            <div className="h-16 bg-slate-100 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs">
                          <Check className="w-3 h-3 mr-1" /> Approve & Send All
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 border-y border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection animation="fade">
            <p className="text-center text-sm text-slate-400 mb-8">Trusted by forward-thinking sales teams</p>
          </AnimatedSection>
          <div className="flex justify-center items-center gap-12 opacity-40">
            {['Acme Corp', 'TechFlow', 'ScaleUp', 'Innovate', 'GrowthCo'].map((name, i) => (
              <AnimatedSection key={name} animation="fade-up" delay={i * 100}>
                <div className="text-slate-900 font-semibold tracking-tight text-lg">
                  {name}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight" data-testid="problem-headline">
              Deals don't fail in the conversation.<br />
              <span className="text-slate-400">They fail in the follow-through.</span>
            </h2>
          </AnimatedSection>
          
          <div ref={statsRef} className="grid md:grid-cols-3 gap-6">
            {[
              { stat: '60%', label: 'of discovery calls', desc: 'No follow-up sent within 24 hours' },
              { stat: '8-12h', label: 'per week', desc: 'Managers chasing CRM updates' },
              { stat: '25%', label: 'of pipeline', desc: 'Lost to poor follow-through' }
            ].map((item, i) => (
              <div 
                key={item.stat}
                className={`text-center p-8 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-500 transform ${
                  statsVisible[i] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <div className="text-4xl font-semibold text-slate-900 mb-2">{item.stat}</div>
                <div className="text-sm text-slate-500 mb-1">{item.label}</div>
                <div className="text-sm text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">The Solution</p>
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
              From chaos to completion<br />
              <span className="text-slate-500">in under 60 seconds</span>
            </h2>
          </AnimatedSection>
          
          <div ref={solutionRef} className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Call ends', desc: 'Recording captured or transcript pasted' },
              { step: '02', title: 'AI drafts', desc: 'Email, documents, CRM updates prepared' },
              { step: '03', title: 'You review', desc: 'Edit if needed, approve with confidence' },
              { step: '04', title: 'Done', desc: 'Everything sent, CRM updated, logged' }
            ].map((item, i) => (
              <div 
                key={item.step}
                className={`p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-all duration-500 transform ${
                  solutionVisible[i] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <div className="text-xs text-slate-500 font-mono mb-3">{item.step}</div>
                <div className="text-lg font-medium text-white mb-2">{item.title}</div>
                <div className="text-sm text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">See it in action</h2>
            <p className="text-slate-500">Watch how CloseLoop transforms your post-call workflow</p>
          </AnimatedSection>
          
          <AnimatedSection animation="scale" delay={200}>
            <div 
              className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group shadow-2xl"
              onClick={() => setVideoOpen(true)}
            >
              {/* Video Thumbnail Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h2zM36 24v-4h-2v4h2zm-6 10v-4h-4v4h4zm0-10v-4h-4v4h4zm-6 10v-4h-4v4h4zm0-10v-4h-4v4h4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
              </div>
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Pulse rings */}
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Play className="w-10 h-10 text-slate-900 ml-1" />
                  </div>
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                2:34
              </div>
              
              {/* Overlay Text */}
              <div className="absolute bottom-6 left-6">
                <p className="text-white font-medium mb-1">Product Demo</p>
                <p className="text-slate-400 text-sm">See the complete workflow</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">Why CloseLoop</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
              Built for trust,<br />
              <span className="text-slate-400">not just speed</span>
            </h2>
          </AnimatedSection>
          
          <div ref={featuresRef} className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Database,
                title: 'Data Vault',
                desc: 'Zero-hallucination document delivery. AI can only attach files from your admin-approved library.',
                color: 'blue'
              },
              {
                icon: UserCheck,
                title: 'Approval-First',
                desc: 'Nothing sends without human review. Your reps stay in control, your brand stays protected.',
                color: 'emerald'
              },
              {
                icon: FileText,
                title: 'Field-Level CRM Control',
                desc: 'Choose exactly which HubSpot fields CloseLoop can suggest. RevOps-approved governance.',
                color: 'amber'
              },
              {
                icon: Shield,
                title: 'Complete Audit Trail',
                desc: 'Who approved what, when, and with what changes. Full telemetry for compliance.',
                color: 'purple'
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                emerald: 'bg-emerald-50 text-emerald-600',
                amber: 'bg-amber-50 text-amber-600',
                purple: 'bg-purple-50 text-purple-600'
              };
              
              return (
                <div 
                  key={feature.title}
                  className={`p-8 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-500 transform ${
                    featuresVisible[i] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                >
                  <div className={`w-12 h-12 ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6 bg-white border-y border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <blockquote className="text-2xl sm:text-3xl font-medium text-slate-900 leading-relaxed mb-8">
              "CloseLoop cut our post-call admin time by 80%. More importantly, nothing goes out without my team's approval — that's trust I can rely on."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium">
                SC
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-900">Sarah Chen</div>
                <div className="text-sm text-slate-500">Head of Sales, TechFlow</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
              Ready to close the loop?
            </h2>
            <p className="text-lg text-slate-500 mb-10">
              Start with 5 free calls. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/demo">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 gap-2 px-6 h-12" data-testid="cta-demo-btn">
                  Book a demo <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="gap-2 px-6 h-12 border-slate-200" data-testid="cta-trial-btn">
                  Start free trial
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-slate-900">CloseLoop</span>
              </div>
              <p className="text-sm text-slate-500">
                The execution layer for sales calls.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/product" className="hover:text-slate-900 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link></li>
                <li><Link to="/methodology" className="hover:text-slate-900 transition-colors">Methodology</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/customers" className="hover:text-slate-900 transition-colors">Customers</Link></li>
                <li><Link to="/demo" className="hover:text-slate-900 transition-colors">Book Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><span className="cursor-pointer hover:text-slate-900 transition-colors">Privacy</span></li>
                <li><span className="cursor-pointer hover:text-slate-900 transition-colors">Terms</span></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © 2026 CloseLoop. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-slate-600 cursor-pointer transition-colors">LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
