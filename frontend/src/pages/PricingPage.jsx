import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Zap, ArrowLeft, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";

const PricingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tiers = [
    {
      name: "Starter",
      price: annual ? "$19" : "$24",
      period: "/month",
      description: "For small teams getting started",
      features: [
        "20 calls/month",
        "Email drafts",
        "Basic CRM suggestions",
        "HubSpot notes field",
        "Email support"
      ],
      cta: "Start free trial",
      popular: false
    },
    {
      name: "Professional",
      price: annual ? "$39" : "$49",
      period: "/month",
      description: "For growing sales teams",
      features: [
        "Unlimited calls",
        "Full Data Vault",
        "Approval workflows",
        "Field-level CRM control",
        "Audit log",
        "Priority support"
      ],
      cta: "Start free trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "White-glove setup",
        "SOC 2 compliance",
        "SSO / SAML",
        "Dedicated support",
        "Custom integrations"
      ],
      cta: "Contact sales",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "Can I change plans later?",
      a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle."
    },
    {
      q: "What happens if I exceed my call limit?",
      a: "You'll receive a notification when approaching your limit. Upgrade anytime or wait for the next month to reset."
    },
    {
      q: "Do you offer annual discounts?",
      a: "Yes! Annual plans save you 20% — that's over 2 months free."
    },
    {
      q: "Is there a free trial?",
      a: "Yes, all plans include a 14-day free trial. Plus, you get 5 free calls/month forever, even without a paid plan."
    },
    {
      q: "What integrations are included?",
      a: "All plans include HubSpot CRM integration. Zoom and Google Meet integrations are available on Professional and above."
    }
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
              <Link to="/customers" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Customers</Link>
              <Link to="/pricing" className="text-sm text-slate-900 font-medium">Pricing</Link>
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
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight tracking-tight mb-6">
            Simple, transparent<br />
            <span className="text-slate-400">pricing</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
            Start free. Scale as you grow. No surprises.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-slate-100 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Annual <span className="text-emerald-600 text-xs ml-1">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <div 
                key={tier.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 animate-fade-in ${
                  tier.popular 
                    ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]' 
                    : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`pricing-tier-${tier.name.toLowerCase()}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${tier.popular ? 'text-white' : 'text-slate-900'}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-sm mt-1 ${tier.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tier.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <span className={`text-4xl font-semibold ${tier.popular ? 'text-white' : 'text-slate-900'}`}>
                    {tier.price}
                  </span>
                  <span className={tier.popular ? 'text-slate-400' : 'text-slate-500'}>
                    {tier.period}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${
                        tier.popular ? 'text-emerald-400' : 'text-emerald-500'
                      }`} />
                      <span className={`text-sm ${tier.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link to={tier.name === "Enterprise" ? "/demo" : "/signup"}>
                  <Button 
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-white text-slate-900 hover:bg-slate-100' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <h3 className="font-medium text-slate-900 mb-2 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-slate-500 text-sm pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
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

export default PricingPage;
