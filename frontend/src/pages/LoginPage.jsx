import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("password"); // password or magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      toast.info("Magic link is not yet available. Please use password login.");
      setMagicSent(false);
    } finally {
      setLoading(false);
    }
  };

  if (magicSent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="magic-sent-title">
            Check your email
          </h1>
          <p className="mt-4 text-slate-600">
            We've sent a magic link to <strong>{email}</strong>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            The link expires in 1 hour.
          </p>
          <Button 
            variant="outline" 
            className="mt-8"
            onClick={() => setMagicSent(false)}
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-slate-900" />
          </div>
          <span className="text-2xl font-semibold text-white">CloseLoop</span>
        </Link>
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            We don't only analyze calls.
            <br />
            We execute them.
          </h2>
          <p className="text-slate-400 max-w-md">
            Drafts follow-ups, attaches the right documents, updates your CRM — nothing goes out without approval.
          </p>
        </div>
        
        <p className="text-slate-500 text-sm">
          © 2026 CloseLoop. All rights reserved.
        </p>
      </div>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full animate-fade-in">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">CloseLoop</span>
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900" data-testid="login-title">
            Welcome back
          </h1>
          <p className="mt-2 text-slate-600">
            Sign in to your account to continue
          </p>
          
          {/* Mode Toggle */}
          <div className="mt-6 flex gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "password" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
              data-testid="login-mode-password"
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "magic" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
              data-testid="login-mode-magic"
            >
              Magic Link
            </button>
          </div>
          
          {mode === "password" ? (
            <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  data-testid="login-email-input"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button 
                    type="button"
                    onClick={() => setMode("magic")}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  data-testid="login-password-input"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800" 
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="mt-6 space-y-4" data-testid="magic-link-form">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  data-testid="magic-email-input"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 gap-2" 
                disabled={loading}
                data-testid="magic-submit-btn"
              >
                {loading ? "Sending..." : <>Send Magic Link <Mail className="w-4 h-4" /></>}
              </Button>
            </form>
          )}
          
          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium" data-testid="login-signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
