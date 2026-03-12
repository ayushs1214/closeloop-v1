import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Check, 
  ArrowRight,
  Play,
  FileText,
  Mail,
  Database,
  Shield,
  Clock,
  Search,
  Pencil,
  UserCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatedSection, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import VideoModal from "@/components/VideoModal";

const ProductPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [workflowRef, workflowVisible] = useStaggeredAnimation(4, { staggerDelay: 120 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Video Modal */}
      <VideoModal 
        isOpen={videoOpen} 
        onClose={() => setVideoOpen(false)}
        title="Product Demo"
      />
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
              <Link to="/product" className="text-sm text-slate-900 font-medium">Product</Link>
              <Link to="/methodology" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Methodology</Link>
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
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">Product</p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight tracking-tight mb-6">
              The execution layer<br />
              <span className="text-slate-400">your sales team needs</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              CloseLoop transforms post-call chaos into completed work. Every call becomes a follow-up sent, a CRM updated, and documents attached — all with your approval.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Core Workflow */}
      <section className="py-24 px-6 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-500">From call to completion in four steps</p>
          </AnimatedSection>
          
          <div ref={workflowRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Play, 
                title: 'Capture', 
                desc: 'Upload recording or paste transcript. We handle the rest.',
                step: '01'
              },
              { 
                icon: Zap, 
                title: 'Process', 
                desc: 'AI extracts key moments, drafts emails, prepares CRM updates.',
                step: '02'
              },
              { 
                icon: Pencil, 
                title: 'Review', 
                desc: 'Edit anything. Approve each item or all at once.',
                step: '03'
              },
              { 
                icon: Check, 
                title: 'Execute', 
                desc: 'Emails sent. CRM updated. Documents attached. Done.',
                step: '04'
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step}
                  className={`relative p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-500 transform ${
                    workflowVisible[i] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                >
                  <div className="text-xs text-slate-400 font-mono mb-4">{item.step}</div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call Review Feature */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade-right">
              <p className="text-sm text-blue-600 font-medium mb-4">Call Review</p>
              <h2 className="text-3xl font-semibold text-slate-900 mb-6">
                Everything you need,<br />one screen
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                The Call Review page is the heart of CloseLoop. Split-screen design puts context on the left, execution on the right. Review transcripts, key moments, and AI outputs in under 60 seconds.
              </p>
              <ul className="space-y-4">
                {[
                  'Full transcript with searchable text',
                  'Key moments highlighted (document requests, next steps)',
                  'AI-drafted email with confidence score',
                  'One-click approval or inline editing'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-left" delay={200}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                </div>
                <div className="p-6 bg-slate-50">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2 space-y-3">
                      <div className="text-xs text-slate-500">Transcript</div>
                      <div className="space-y-2">
                        <div className="p-2 bg-white rounded text-xs text-slate-600">
                          <span className="text-slate-400">[00:03]</span> Can you send the compliance doc?
                        </div>
                        <div className="p-2 bg-blue-50 border-l-2 border-blue-500 rounded text-xs text-slate-600">
                          <span className="text-slate-400">[00:15]</span> Let's schedule a demo Tuesday
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 space-y-3">
                      <div className="text-xs text-slate-500">Follow-up Email</div>
                      <div className="p-3 bg-white rounded border border-slate-200 text-xs text-slate-600">
                        <div className="font-medium mb-1">Subject: Next steps from today</div>
                        <div className="text-slate-400">Hi Sarah, Thanks for the call...</div>
                      </div>
                      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs">
                        <Check className="w-3 h-3 mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Data Vault Feature */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 animate-fade-in">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Data Vault</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'SOC2_Compliance_2025.pdf', tags: ['compliance', 'security'] },
                    { name: 'Pricing_Sheet_Q1.pdf', tags: ['pricing'] },
                    { name: 'Case_Study_TechFlow.pdf', tags: ['case study'] }
                  ].map((doc, i) => (
                    <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {doc.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2 animate-fade-in">
              <p className="text-sm text-blue-400 font-medium mb-4">Data Vault</p>
              <h2 className="text-3xl font-semibold mb-6">
                Zero hallucinations.<br />
                <span className="text-slate-400">Complete control.</span>
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                The Data Vault ensures AI can only suggest documents you've approved. Upload files, add intent triggers, and maintain complete governance over what gets attached.
              </p>
              <ul className="space-y-4">
                {[
                  'Admin-only document management',
                  'Tag-based intent matching',
                  'Enable/disable documents instantly',
                  'Full audit trail of attachments'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            See it in action
          </h2>
          <p className="text-slate-500 mb-10">
            Book a 15-minute demo and see how CloseLoop transforms your post-call workflow.
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

export default ProductPage;
