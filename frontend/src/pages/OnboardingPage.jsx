import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";

const STEPS = [
  { id: "welcome", title: "Welcome to CloseLoop", subtitle: "Let's set up your workspace in 60 seconds" },
  { id: "company", title: "About your team", subtitle: "Help us tailor the experience" },
  { id: "crm", title: "Your CRM setup", subtitle: "We'll configure integrations" },
  { id: "done", title: "You're all set!", subtitle: "Start closing more deals" }
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    company_size: "",
    crm_used: "",
    calls_per_week: "",
    onboarding_completed: false
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const res = await userApi.getOnboarding();
        if (res.data.onboarding_completed) {
          navigate("/dashboard");
        }
      } catch (e) { /* ignore */ }
    };
    checkOnboarding();
  }, [navigate]);

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      try {
        await userApi.updateOnboarding({ ...data, onboarding_completed: true });
        toast.success("Setup complete!");
        navigate("/dashboard");
      } catch (e) {
        toast.error("Failed to save preferences");
      }
    }
  };

  const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
  const crms = ["HubSpot", "Salesforce", "Pipedrive", "Zoho CRM", "Other", "None"];
  const callFreqs = ["1-5", "6-15", "16-30", "30+"];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" data-testid="onboarding-page">
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-slate-900 w-10" : "bg-slate-200 w-6"}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">CloseLoop</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900" data-testid="onboarding-step-title">{STEPS[step].title}</h1>
          <p className="text-slate-500 mt-1 mb-6">{STEPS[step].subtitle}</p>

          {/* Step Content */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-slate-700">Hi {user?.name}, welcome aboard! We'll ask a few quick questions to personalize your experience.</p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500" /> AI-powered call follow-ups
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500" /> Document vault with smart matching
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500" /> Approval-first workflow
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Team size</Label>
                <div className="grid grid-cols-3 gap-2">
                  {companySizes.map(size => (
                    <button key={size}
                      onClick={() => setData({...data, company_size: size})}
                      className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        data.company_size === size
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                      data-testid={`size-${size}`}
                    >{size}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Calls per week (per rep)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {callFreqs.map(freq => (
                    <button key={freq}
                      onClick={() => setData({...data, calls_per_week: freq})}
                      className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        data.calls_per_week === freq
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                      data-testid={`freq-${freq}`}
                    >{freq}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Which CRM do you use?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {crms.map(crm => (
                    <button key={crm}
                      onClick={() => setData({...data, crm_used: crm})}
                      className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        data.crm_used === crm
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                      data-testid={`crm-${crm}`}
                    >{crm}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-emerald-800 font-medium">Your workspace is ready!</p>
                <p className="text-emerald-600 text-sm mt-1">Start by uploading documents to your Data Vault, then create your first call.</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full mt-6 bg-slate-900 hover:bg-slate-800 gap-2"
            data-testid="onboarding-next-btn"
          >
            {step === STEPS.length - 1 ? "Go to Dashboard" : "Continue"} <ChevronRight className="w-4 h-4" />
          </Button>

          {step > 0 && step < STEPS.length - 1 && (
            <button onClick={() => setStep(step - 1)} className="w-full text-center mt-3 text-sm text-slate-500 hover:text-slate-700">Back</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
