import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Home, Phone, Settings as SettingsIcon, Database, Users,
  LogOut, User, Bell, Link2, BarChart3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, logout, isAdmin, isSuperuser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [notifications, setNotifications] = useState({
    email_on_new_call: true, email_on_approval: true,
    email_on_task_due: false, email_weekly_digest: true
  });

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await userApi.getNotifications();
        setNotifications(res.data);
      } catch (e) { /* use defaults */ }
    };
    loadNotifications();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile(profile.name);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await userApi.updateNotifications(updated);
      toast.success("Notification settings saved");
    } catch (err) {
      setNotifications(notifications);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link to="/calls" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Phone className="w-5 h-5" /> Calls
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium">
            <SettingsIcon className="w-5 h-5" /> Settings
          </Link>
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Admin</span>
              </div>
              <Link to="/admin/vault" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <Database className="w-5 h-5" /> Data Vault
              </Link>
              <Link to="/admin/team" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <Users className="w-5 h-5" /> Team
              </Link>
            </>
          )}
          {isSuperuser && (
            <>
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Platform</span>
              </div>
              <Link to="/platform" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <BarChart3 className="w-5 h-5" /> Platform Admin
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Log out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-6" data-testid="settings-title">Settings</h1>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList>
              <TabsTrigger value="account" className="gap-2"><User className="w-4 h-4" /> Account</TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2"><Link2 className="w-4 h-4" /> Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} data-testid="settings-name-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} disabled className="bg-slate-50" data-testid="settings-email-input" />
                    <p className="text-xs text-slate-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <p className="text-sm text-slate-600 capitalize bg-slate-50 rounded-lg px-3 py-2">{user?.role}</p>
                  </div>
                  <Button type="submit" disabled={saving} data-testid="save-profile-btn">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Email Notifications</h2>
                <div className="space-y-4">
                  {[
                    { key: "email_on_new_call", title: "New calls ready for review", desc: "Get notified when a call is processed and ready for approval" },
                    { key: "email_on_approval", title: "Approval confirmations", desc: "Receive confirmation when items are approved and sent" },
                    { key: "email_on_task_due", title: "Task reminders", desc: "Get reminded about upcoming and overdue tasks" },
                    { key: "email_weekly_digest", title: "Weekly summary", desc: "Receive a weekly digest of your team's activity" }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between" data-testid={`notif-${item.key}`}>
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification(item.key)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.key] ? "bg-emerald-500" : "bg-slate-200"}`}
                        data-testid={`toggle-${item.key}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? "translate-x-5" : ""}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Connected Services</h2>
                <div className="space-y-4">
                  {[
                    { name: "HubSpot", desc: "CRM integration", abbr: "HS", color: "bg-orange-100 text-orange-600" },
                    { name: "Zoom", desc: "Meeting recordings", abbr: "ZM", color: "bg-blue-100 text-blue-600" },
                    { name: "Google Meet", desc: "Meeting recordings", abbr: "GM", color: "bg-green-100 text-green-600" },
                    { name: "Resend", desc: "Email delivery (Active)", abbr: "RS", color: "bg-purple-100 text-purple-600", connected: true },
                  ].map(svc => (
                    <div key={svc.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${svc.color.split(' ')[0]} rounded-lg flex items-center justify-center`}>
                          <span className={`${svc.color.split(' ')[1]} font-bold text-sm`}>{svc.abbr}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{svc.name}</p>
                          <p className="text-sm text-slate-500">{svc.desc}</p>
                        </div>
                      </div>
                      {svc.connected ? (
                        <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">Connected</span>
                      ) : (
                        <Button variant="outline" size="sm">Connect</Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
