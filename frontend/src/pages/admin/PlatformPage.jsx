import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Zap, Home, Building2, Users, Plus, BarChart3, Shield,
  ChevronRight, LogOut, UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { platformApi } from "@/lib/api";

const PlatformPage = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("workspaces");
  const [workspaces, setWorkspaces] = useState([]);
  const [superusers, setSuperusers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateSuperuser, setShowCreateSuperuser] = useState(false);
  const [wsForm, setWsForm] = useState({ company_name: "", admin_email: "", admin_name: "", admin_password: "" });
  const [suForm, setSuForm] = useState({ email: "", password: "", name: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wsRes, suRes, statsRes] = await Promise.all([
        platformApi.getWorkspaces(),
        platformApi.getSuperusers(),
        platformApi.getStats()
      ]);
      setWorkspaces(wsRes.data);
      setSuperusers(suRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Failed to load platform data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      await platformApi.createWorkspace(wsForm);
      toast.success(`Workspace "${wsForm.company_name}" created!`);
      setShowCreateWorkspace(false);
      setWsForm({ company_name: "", admin_email: "", admin_name: "", admin_password: "" });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create workspace");
    }
  };

  const handleCreateSuperuser = async (e) => {
    e.preventDefault();
    try {
      await platformApi.createSuperuser(suForm);
      toast.success(`Superuser "${suForm.name}" created!`);
      setShowCreateSuperuser(false);
      setSuForm({ email: "", password: "", name: "" });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create superuser");
    }
  };

  const tabs = [
    { id: "workspaces", label: "Client Workspaces", icon: Building2 },
    { id: "superusers", label: "Superusers", icon: Shield },
    { id: "stats", label: "Platform Stats", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50" data-testid="platform-page">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-lg font-semibold">CloseLoop</span>
        </div>
        <Separator className="bg-slate-700" />
        <nav className="flex-1 p-3 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Separator className="bg-slate-700 my-3" />
          <p className="px-3 text-xs text-slate-500 uppercase tracking-wider mb-2">Platform Admin</p>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                tab === t.id ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <div className="px-3 py-2 text-sm text-slate-400">{user?.name}</div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Workspaces Tab */}
        {tab === "workspaces" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="workspaces-title">Client Workspaces</h1>
                <p className="text-slate-500 mt-1">Manage client organizations and their admins</p>
              </div>
              <Button onClick={() => setShowCreateWorkspace(true)} className="bg-slate-900 hover:bg-slate-800" data-testid="create-workspace-btn">
                <Plus className="w-4 h-4 mr-2" /> Add Client
              </Button>
            </div>

            {showCreateWorkspace && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm" data-testid="create-workspace-form">
                <h3 className="font-semibold text-slate-900 mb-4">Create New Client Workspace</h3>
                <form onSubmit={handleCreateWorkspace} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={wsForm.company_name} onChange={e => setWsForm({...wsForm, company_name: e.target.value})} required placeholder="Acme Corp" data-testid="ws-company-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Name</Label>
                    <Input value={wsForm.admin_name} onChange={e => setWsForm({...wsForm, admin_name: e.target.value})} required placeholder="Jane Smith" data-testid="ws-admin-name-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Email</Label>
                    <Input type="email" value={wsForm.admin_email} onChange={e => setWsForm({...wsForm, admin_email: e.target.value})} required placeholder="jane@acme.com" data-testid="ws-admin-email-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Password</Label>
                    <Input type="password" value={wsForm.admin_password} onChange={e => setWsForm({...wsForm, admin_password: e.target.value})} required placeholder="Min 8 characters" data-testid="ws-admin-password-input" />
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateWorkspace(false)}>Cancel</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" data-testid="ws-submit-btn">Create Workspace</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : workspaces.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No workspaces yet. Add your first client.</p>
                </div>
              ) : workspaces.map(ws => (
                <div key={ws.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:border-slate-300 transition-colors" data-testid={`workspace-${ws.id}`}>
                  <div>
                    <h3 className="font-semibold text-slate-900">{ws.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {ws.member_count} members &middot; {ws.call_count} calls &middot; Created {new Date(ws.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Superusers Tab */}
        {tab === "superusers" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="superusers-title">Platform Superusers</h1>
                <p className="text-slate-500 mt-1">Manage platform-level administrators</p>
              </div>
              <Button onClick={() => setShowCreateSuperuser(true)} className="bg-slate-900 hover:bg-slate-800" data-testid="create-superuser-btn">
                <UserPlus className="w-4 h-4 mr-2" /> Add Superuser
              </Button>
            </div>

            {showCreateSuperuser && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm" data-testid="create-superuser-form">
                <h3 className="font-semibold text-slate-900 mb-4">Create New Superuser</h3>
                <form onSubmit={handleCreateSuperuser} className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={suForm.name} onChange={e => setSuForm({...suForm, name: e.target.value})} required placeholder="John Doe" data-testid="su-name-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={suForm.email} onChange={e => setSuForm({...suForm, email: e.target.value})} required placeholder="john@closeloop.io" data-testid="su-email-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={suForm.password} onChange={e => setSuForm({...suForm, password: e.target.value})} required placeholder="Min 8 characters" data-testid="su-password-input" />
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateSuperuser(false)}>Cancel</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" data-testid="su-submit-btn">Create Superuser</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {superusers.map(su => (
                <div key={su.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between" data-testid={`superuser-${su.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{su.name}</h3>
                      <p className="text-sm text-slate-500">{su.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">Superuser</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {tab === "stats" && stats && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6" data-testid="stats-title">Platform Overview</h1>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Workspaces", value: stats.total_workspaces, color: "bg-blue-50 text-blue-600" },
                { label: "Total Users", value: stats.total_users, color: "bg-emerald-50 text-emerald-600" },
                { label: "Total Calls", value: stats.total_calls, color: "bg-amber-50 text-amber-600" },
                { label: "Sent / Approved", value: stats.total_sent, color: "bg-green-50 text-green-600" },
                { label: "Pending Review", value: stats.total_pending, color: "bg-orange-50 text-orange-600" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5" data-testid={`stat-${stat.label.toLowerCase().replace(/ /g, '-')}`}>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlatformPage;
