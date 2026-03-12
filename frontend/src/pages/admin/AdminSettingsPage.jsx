import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap,
  Home,
  Phone,
  Settings as SettingsIcon,
  Database,
  Users,
  LogOut,
  Building,
  CreditCard,
  Link2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

const AdminSettingsPage = () => {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [workspace, setWorkspace] = useState({
    name: "",
    logo_url: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      setWorkspace({
        name: response.data.name || "",
        logo_url: response.data.logo_url || ""
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await adminApi.updateSettings({
        company_name: workspace.name,
        logo_url: workspace.logo_url
      });
      toast.success("Settings saved");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">CloseLoop</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Home className="w-5 h-5" />
            Home
          </Link>
          <Link to="/calls" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Phone className="w-5 h-5" />
            Calls
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <SettingsIcon className="w-5 h-5" />
            Settings
          </Link>
          
          <div className="pt-4 pb-2">
            <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Admin</span>
          </div>
          <Link to="/admin/vault" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Database className="w-5 h-5" />
            Data Vault
          </Link>
          <Link to="/admin/team" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Users className="w-5 h-5" />
            Team
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium">
            <SettingsIcon className="w-5 h-5" />
            Admin Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-6" data-testid="admin-settings-title">
            Admin Settings
          </h1>

          <Tabs defaultValue="workspace" className="space-y-6">
            <TabsList>
              <TabsTrigger value="workspace" className="gap-2">
                <Building className="w-4 h-4" />
                Workspace
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2">
                <Link2 className="w-4 h-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workspace" className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Workspace Details</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={workspace.name}
                      onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                      placeholder="Acme Inc"
                      data-testid="workspace-name-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL (optional)</Label>
                    <Input
                      id="logo_url"
                      value={workspace.logo_url}
                      onChange={(e) => setWorkspace({ ...workspace, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      data-testid="workspace-logo-input"
                    />
                  </div>
                  
                  <Button type="submit" disabled={saving} data-testid="save-workspace-btn">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">CRM Integration</h2>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">HS</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">HubSpot</p>
                      <p className="text-sm text-slate-500">Sync deals, contacts, and activities</p>
                    </div>
                  </div>
                  <Button variant="outline" data-testid="connect-hubspot-admin-btn">
                    Connect
                  </Button>
                </div>
                
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-700">
                    <strong>Note:</strong> HubSpot integration is mocked for V1. CRM updates are simulated.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Meeting Integrations</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">ZM</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Zoom</p>
                        <p className="text-sm text-slate-500">Auto-record and transcribe meetings</p>
                      </div>
                    </div>
                    <Button variant="outline" data-testid="connect-zoom-admin-btn">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">GM</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Google Meet</p>
                        <p className="text-sm text-slate-500">Auto-record and transcribe meetings</p>
                      </div>
                    </div>
                    <Button variant="outline" data-testid="connect-meet-admin-btn">
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Plan</h2>
                <div className="p-4 bg-slate-900 text-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-300">Your Plan</p>
                      <p className="text-xl font-bold">Free Trial</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-300">Calls remaining</p>
                      <p className="text-xl font-bold">5 / 5</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button className="w-full" data-testid="upgrade-btn">
                    Upgrade to Professional - $49/mo
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    Unlock unlimited calls, Data Vault, and audit logs
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
                <p className="text-slate-500 mb-4">No payment method on file</p>
                <Button variant="outline" data-testid="add-payment-btn">
                  Add Payment Method
                </Button>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Billing is simulated for V1. No real charges will be made.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
