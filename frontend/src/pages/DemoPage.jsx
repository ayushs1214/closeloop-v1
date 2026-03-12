import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, ArrowLeft, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import { publicApi } from "@/lib/api";

const DemoPage = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    work_email: "",
    company_name: "",
    company_size: "",
    role: "",
    crm_used: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await publicApi.submitDemo(formData);
      setSubmitted(true);
      toast.success("Demo request submitted!");
    } catch (error) {
      console.error("Demo request error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600 animate-checkmark" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="demo-success-title">
            Thank you!
          </h1>
          <p className="mt-4 text-slate-600">
            We'll reach out within 24 hours to schedule your demo.
          </p>
          <div className="mt-8 space-y-4">
            <Link to="/">
              <Button className="w-full" data-testid="demo-success-home-btn">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">CloseLoop</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" data-testid="nav-login-btn">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-slate-900 hover:bg-slate-800" data-testid="nav-signup-btn">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="demo-title">
                  Book a Demo
                </h1>
                <p className="text-slate-500 text-sm">See CloseLoop in action</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="demo-form">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="John Smith"
                    data-testid="demo-fullname-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="work_email">Work Email *</Label>
                  <Input
                    id="work_email"
                    type="email"
                    value={formData.work_email}
                    onChange={(e) => setFormData({ ...formData, work_email: e.target.value })}
                    required
                    placeholder="john@company.com"
                    data-testid="demo-email-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                    placeholder="Acme Inc"
                    data-testid="demo-company-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size *</Label>
                  <Select
                    value={formData.company_size}
                    onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                    required
                  >
                    <SelectTrigger data-testid="demo-size-select">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="10-50">10-50 employees</SelectItem>
                      <SelectItem value="50-200">50-200 employees</SelectItem>
                      <SelectItem value="200+">200+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Your Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    required
                  >
                    <SelectTrigger data-testid="demo-role-select">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="founder">Founder / CEO</SelectItem>
                      <SelectItem value="head_of_sales">Head of Sales</SelectItem>
                      <SelectItem value="revops">RevOps Manager</SelectItem>
                      <SelectItem value="vp_sales">VP of Sales</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="crm_used">CRM Used *</Label>
                  <Select
                    value={formData.crm_used}
                    onValueChange={(value) => setFormData({ ...formData, crm_used: value })}
                    required
                  >
                    <SelectTrigger data-testid="demo-crm-select">
                      <SelectValue placeholder="Select CRM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hubspot">HubSpot</SelectItem>
                      <SelectItem value="salesforce">Salesforce</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your sales process..."
                  rows={3}
                  data-testid="demo-message-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                disabled={loading}
                data-testid="demo-submit-btn"
              >
                {loading ? "Submitting..." : "Book Demo"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
