import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Home,
  Phone,
  Settings,
  Database,
  Users,
  LogOut,
  TrendingUp,
  Mail,
  FileText,
  Activity,
  Calendar,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { callsApi, userApi, vaultApi } from "@/lib/api";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, logout, isAdmin, isSuperuser } = useAuth();
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState({ pending_count: 0, sent_today: 0, total_calls: 0 });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [callsRes, statsRes] = await Promise.all([
        callsApi.getAll(),
        userApi.getStats()
      ]);
      setCalls(callsRes.data);
      setStats(statsRes.data);
      
      // Fetch documents for vault stats if admin
      if (user?.role === 'superadmin' || user?.role === 'admin') {
        try {
          const docsRes = await vaultApi.getAll();
          setDocuments(docsRes.data);
        } catch (e) {
          // Ignore if not admin
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const pendingCalls = calls.filter(c => c.status === "pending");
  const sentCalls = calls.filter(c => c.status === "sent");
  const recentActivity = [...calls].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "status-badge-pending", icon: Clock, text: "Pending" },
      sent: { class: "status-badge-approved", icon: CheckCircle2, text: "Sent" },
      processing: { class: "status-badge-processing", icon: AlertCircle, text: "Processing" },
      error: { class: "status-badge-error", icon: AlertCircle, text: "Error" }
    };
    return badges[status] || badges.pending;
  };

  // Calculate performance metrics
  const approvalRate = calls.length > 0 ? Math.round((sentCalls.length / calls.length) * 100) : 0;
  const avgTimeToApprove = "< 60s"; // Placeholder - would calculate from actual data

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
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium"
            data-testid="nav-dashboard"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
          <Link 
            to="/calls" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            data-testid="nav-calls"
          >
            <Phone className="w-5 h-5" />
            Calls
            {pendingCalls.length > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                {pendingCalls.length}
              </span>
            )}
          </Link>
          <Link 
            to="/settings" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Admin</span>
              </div>
              <Link 
                to="/admin/vault" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                data-testid="nav-vault"
              >
                <Database className="w-5 h-5" />
                Data Vault
                {documents.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    {documents.length}
                  </span>
                )}
              </Link>
              <Link 
                to="/admin/team" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                data-testid="nav-team"
              >
                <Users className="w-5 h-5" />
                Team
              </Link>
            </>
          )}
          {isSuperuser && (
            <>
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Platform</span>
              </div>
              <Link 
                to="/platform" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                data-testid="nav-platform"
              >
                <BarChart3 className="w-5 h-5" />
                Platform Admin
              </Link>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" data-testid="dashboard-title">
                {getGreeting()}, {user?.name?.split(" ")[0]}
              </h1>
              <p className="text-slate-500 mt-1">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link to="/calls">
              <Button className="bg-slate-900 hover:bg-slate-800 gap-2" data-testid="new-call-btn">
                <Plus className="w-4 h-4" />
                New Call
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Quick Stats - Premium Feature */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Pending Approval</span>
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{pendingCalls.length}</span>
                    <span className="text-sm text-slate-400 mb-1">calls</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Completed Today</span>
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{stats.sent_today || sentCalls.length}</span>
                    <span className="text-sm text-slate-400 mb-1">sent</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Approval Rate</span>
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{approvalRate}%</span>
                    <span className="text-sm text-emerald-500 mb-1 flex items-center">
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Avg. Time to Approve</span>
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{avgTimeToApprove}</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Action Required - Main Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Action Required */}
                  {pendingCalls.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900" data-testid="pending-section">
                          <Zap className="w-5 h-5 text-amber-500" />
                          Action Required
                        </h2>
                        <Link to="/calls?status=pending" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          View all <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {pendingCalls.slice(0, 3).map((call, index) => (
                          <Link 
                            key={call.id}
                            to={`/calls/${call.id}`}
                            className="block bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            data-testid={`pending-call-${call.id}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-slate-900">{call.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                  {call.contact_name && `${call.contact_name}`}
                                  {call.contact_company && ` · ${call.contact_company}`}
                                  {call.duration_seconds && ` · ${Math.round(call.duration_seconds / 60)} min`}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(call.status).class}`}>
                                  {getStatusBadge(call.status).text}
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 font-medium">
                              Review & Approve
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Quick Actions - Premium Feature */}
                  <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <Link 
                        to="/calls" 
                        className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center"
                      >
                        <Phone className="w-6 h-6 mx-auto mb-2 text-white/80" />
                        <span className="text-sm">Upload Call</span>
                      </Link>
                      <Link 
                        to="/admin/vault" 
                        className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center"
                      >
                        <Database className="w-6 h-6 mx-auto mb-2 text-white/80" />
                        <span className="text-sm">Data Vault</span>
                      </Link>
                      <Link 
                        to="/settings" 
                        className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center"
                      >
                        <Settings className="w-6 h-6 mx-auto mb-2 text-white/80" />
                        <span className="text-sm">Settings</span>
                      </Link>
                    </div>
                  </section>

                  {/* Empty State */}
                  {calls.length === 0 && (
                    <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900" data-testid="empty-state-title">
                        No calls yet
                      </h3>
                      <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        Upload your first call recording or paste a transcript to get started.
                      </p>
                      <Link to="/calls">
                        <Button className="mt-6 bg-slate-900 hover:bg-slate-800 gap-2">
                          <Plus className="w-4 h-4" />
                          Add Your First Call
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Right Sidebar - Activity & Insights */}
                <div className="space-y-6">
                  {/* Activity Feed - Premium Feature */}
                  <section className="bg-white p-5 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-slate-400" />
                      Recent Activity
                    </h3>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((call, i) => (
                          <div key={call.id} className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              call.status === 'sent' ? 'bg-emerald-500' : 
                              call.status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-900 truncate">{call.title}</p>
                              <p className="text-xs text-slate-400">
                                {call.status === 'sent' ? 'Approved & sent' : 'Awaiting approval'}
                                {' · '}
                                {new Date(call.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
                    )}
                  </section>

                  {/* Weekly Progress - Premium Feature */}
                  <section className="bg-white p-5 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-slate-400" />
                      This Week
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Calls Processed</span>
                          <span className="font-medium text-slate-900">{calls.length}</span>
                        </div>
                        <Progress value={Math.min(calls.length * 10, 100)} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Approval Rate</span>
                          <span className="font-medium text-slate-900">{approvalRate}%</span>
                        </div>
                        <Progress value={approvalRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Documents Used</span>
                          <span className="font-medium text-slate-900">{documents.length}</span>
                        </div>
                        <Progress value={Math.min(documents.length * 20, 100)} className="h-2" />
                      </div>
                    </div>
                  </section>

                  {/* Upgrade CTA for non-enterprise */}
                  <section className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-xl text-white">
                    <h3 className="font-semibold mb-2">Unlock More</h3>
                    <p className="text-sm text-blue-100 mb-4">
                      Get unlimited calls, full audit logs, and priority support.
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full bg-white text-blue-600 hover:bg-blue-50"
                    >
                      Upgrade Plan
                    </Button>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
