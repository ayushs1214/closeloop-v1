import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  Plus, 
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Home,
  Phone,
  Settings,
  Database,
  Users,
  LogOut,
  ChevronRight,
  Filter
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { callsApi } from "@/lib/api";
import { toast } from "sonner";

const CallsPage = () => {
  const { user, logout } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewCallDialog, setShowNewCallDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCall, setNewCall] = useState({
    title: "",
    contact_name: "",
    contact_email: "",
    contact_company: "",
    contact_role: "",
    transcript_text: ""
  });

  useEffect(() => {
    fetchCalls();
  }, [filterStatus]);

  const fetchCalls = async () => {
    try {
      const params = filterStatus !== "all" ? filterStatus : undefined;
      const response = await callsApi.getAll(params);
      setCalls(response.data);
    } catch (error) {
      console.error("Error fetching calls:", error);
      toast.error("Failed to load calls");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCall = async (e) => {
    e.preventDefault();
    
    if (!newCall.title || !newCall.transcript_text) {
      toast.error("Please provide a title and transcript");
      return;
    }
    
    setCreating(true);
    
    try {
      await callsApi.create(newCall);
      toast.success("Call created and processing!");
      setShowNewCallDialog(false);
      setNewCall({
        title: "",
        contact_name: "",
        contact_email: "",
        contact_company: "",
        contact_role: "",
        transcript_text: ""
      });
      fetchCalls();
    } catch (error) {
      console.error("Error creating call:", error);
      toast.error("Failed to create call");
    } finally {
      setCreating(false);
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = 
      call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.contact_company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "status-badge-pending", icon: Clock, text: "Pending" },
      sent: { class: "status-badge-approved", icon: CheckCircle2, text: "Sent" },
      processing: { class: "status-badge-processing", icon: Loader2, text: "Processing" },
      error: { class: "status-badge-error", icon: AlertCircle, text: "Error" }
    };
    return badges[status] || badges.pending;
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
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
          <Link 
            to="/calls" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium"
          >
            <Phone className="w-5 h-5" />
            Calls
          </Link>
          <Link 
            to="/settings" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          
          {user?.role === "admin" && (
            <>
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Admin</span>
              </div>
              <Link 
                to="/admin/vault" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Database className="w-5 h-5" />
                Data Vault
              </Link>
              <Link 
                to="/admin/team" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Users className="w-5 h-5" />
                Team
              </Link>
            </>
          )}
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
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900" data-testid="calls-title">
              Calls
            </h1>
            
            <Dialog open={showNewCallDialog} onOpenChange={setShowNewCallDialog}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 gap-2" data-testid="add-call-btn">
                  <Plus className="w-4 h-4" />
                  Upload Call
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Call</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCall} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Call Title *</Label>
                      <Input
                        id="title"
                        value={newCall.title}
                        onChange={(e) => setNewCall({ ...newCall, title: e.target.value })}
                        placeholder="Discovery Call - Acme Inc"
                        required
                        data-testid="new-call-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Contact Name</Label>
                      <Input
                        id="contact_name"
                        value={newCall.contact_name}
                        onChange={(e) => setNewCall({ ...newCall, contact_name: e.target.value })}
                        placeholder="Sarah Chen"
                        data-testid="new-call-contact-name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_company">Company</Label>
                      <Input
                        id="contact_company"
                        value={newCall.contact_company}
                        onChange={(e) => setNewCall({ ...newCall, contact_company: e.target.value })}
                        placeholder="Acme Inc"
                        data-testid="new-call-company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_role">Role</Label>
                      <Input
                        id="contact_role"
                        value={newCall.contact_role}
                        onChange={(e) => setNewCall({ ...newCall, contact_role: e.target.value })}
                        placeholder="CTO"
                        data-testid="new-call-role"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transcript">Transcript *</Label>
                    <Textarea
                      id="transcript"
                      value={newCall.transcript_text}
                      onChange={(e) => setNewCall({ ...newCall, transcript_text: e.target.value })}
                      placeholder={`Paste your transcript here...\n\nFormat:\n[00:00] Rep: Hello, thanks for joining...\n[00:15] Sarah: Thanks for having me...`}
                      rows={10}
                      required
                      data-testid="new-call-transcript"
                    />
                    <p className="text-xs text-slate-500">
                      Include speaker names and timestamps for best results
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewCallDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={creating}
                      data-testid="submit-call-btn"
                    >
                      {creating ? "Processing..." : "Create & Process"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-calls-input"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40" data-testid="filter-status-select">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Calls</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calls List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No calls found</h3>
              <p className="text-slate-500 mt-2">
                {searchQuery ? "Try a different search term" : "Upload your first call to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCalls.map((call, index) => {
                const badge = getStatusBadge(call.status);
                const StatusIcon = badge.icon;
                
                return (
                  <Link 
                    key={call.id}
                    to={`/calls/${call.id}`}
                    className="block bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all animate-fade-in card-hover"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    data-testid={`call-item-${call.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{call.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(call.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {call.contact_name && ` · ${call.contact_name}`}
                          {call.duration_seconds && ` · ${Math.round(call.duration_seconds / 60)} min`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                          <StatusIcon className={`w-3 h-3 ${call.status === 'processing' ? 'animate-spin' : ''}`} />
                          {badge.text}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CallsPage;
