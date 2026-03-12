import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap,
  Home,
  Phone,
  Settings,
  Database,
  Users,
  LogOut,
  Plus,
  MoreVertical,
  Mail,
  UserCheck,
  UserX,
  Shield,
  Clock
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

const TeamPage = () => {
  const { user, logout } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "rep"
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await adminApi.getTeam();
      setTeam(response.data);
    } catch (error) {
      console.error("Error fetching team:", error);
      toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    
    if (!inviteData.email) {
      toast.error("Please provide an email");
      return;
    }
    
    setInviting(true);
    
    try {
      await adminApi.inviteMember(inviteData);
      toast.success(`Invite sent to ${inviteData.email}`);
      setShowInviteDialog(false);
      setInviteData({ email: "", role: "rep" });
      fetchTeam();
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(error.response?.data?.detail || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (member) => {
    if (!confirm(`Remove ${member.name || member.email} from the team?`)) return;
    
    try {
      await adminApi.removeMember(member.id);
      toast.success("Member removed");
      fetchTeam();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.response?.data?.detail || "Failed to remove member");
    }
  };

  const handleRoleChange = async (member, newRole) => {
    try {
      await adminApi.updateRole(member.id, newRole);
      toast.success(`${member.name}'s role updated to ${newRole}`);
      fetchTeam();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data?.detail || "Failed to update role");
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
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          
          <div className="pt-4 pb-2">
            <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Admin</span>
          </div>
          <Link to="/admin/vault" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Database className="w-5 h-5" />
            Data Vault
          </Link>
          <Link to="/admin/team" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium">
            <Users className="w-5 h-5" />
            Team
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" data-testid="team-title">
                Team
              </h1>
              <p className="text-slate-500 mt-1">
                Manage your workspace members and roles
              </p>
            </div>
            
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 gap-2" data-testid="invite-btn">
                  <Plus className="w-4 h-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                      placeholder="colleague@company.com"
                      required
                      data-testid="invite-email-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteData.role}
                      onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                    >
                      <SelectTrigger data-testid="invite-role-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rep">Rep</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Admins can manage Data Vault, team, and workspace settings
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowInviteDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={inviting}
                      data-testid="send-invite-btn"
                    >
                      {inviting ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Team List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : team.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No team members yet</h3>
              <p className="text-slate-500 mt-2">
                Invite your team to start collaborating
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {team.map((member, index) => (
                <div 
                  key={member.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  data-testid={`team-member-${member.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {member.status === "pending" ? member.email : member.name}
                          </h3>
                          {member.status === "pending" && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        member.role === 'admin' 
                          ? 'bg-purple-50 text-purple-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {member.role === 'admin' && <Shield className="w-3 h-3" />}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      
                      {member.id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.status !== "pending" && (
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(member, member.role === 'admin' ? 'rep' : 'admin')}
                              >
                                {member.role === 'admin' ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Change to Rep
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Make Admin
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleRemove(member)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Email invites are simulated in this V1. Check server logs for invite links.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamPage;
