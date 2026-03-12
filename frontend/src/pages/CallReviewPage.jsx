import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Zap,
  ArrowLeft,
  Search,
  Mail,
  FileText,
  Database as DatabaseIcon,
  Check,
  Pencil,
  X,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Home,
  Phone,
  Settings,
  Database,
  Users,
  LogOut,
  ListTodo,
  Square,
  CheckSquare,
  ArrowUpRight,
  Tag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { callsApi } from "@/lib/api";
import { toast } from "sonner";

const CallReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit states
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingCrm, setEditingCrm] = useState(false);
  const [editedEmail, setEditedEmail] = useState({ subject: "", body: "" });
  const [editedCrm, setEditedCrm] = useState({ deal_stage: "", next_step: "", notes: "" });
  
  // Collapse states
  const [emailExpanded, setEmailExpanded] = useState(true);
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [crmExpanded, setCrmExpanded] = useState(true);
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [crmNotesExpanded, setCrmNotesExpanded] = useState(false);

  useEffect(() => {
    fetchCall();
  }, [id]);

  const fetchCall = async () => {
    try {
      const response = await callsApi.getOne(id);
      setCall(response.data);
      
      // Initialize edit states
      if (response.data.ai_outputs?.email_draft) {
        setEditedEmail({
          subject: response.data.ai_outputs.email_draft.subject || "",
          body: response.data.ai_outputs.email_draft.body || ""
        });
      }
      if (response.data.ai_outputs?.crm_updates) {
        setEditedCrm({
          deal_stage: response.data.ai_outputs.crm_updates.deal_stage || "",
          next_step: response.data.ai_outputs.crm_updates.next_step || "",
          notes: response.data.ai_outputs.crm_updates.notes || ""
        });
      }
    } catch (error) {
      console.error("Error fetching call:", error);
      toast.error("Failed to load call");
      navigate("/calls");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemType) => {
    setApproving(true);
    try {
      let editedContent = null;
      if (itemType === "email" && editingEmail) {
        editedContent = editedEmail;
        setEditingEmail(false);
      } else if (itemType === "crm" && editingCrm) {
        editedContent = editedCrm;
        setEditingCrm(false);
      }
      
      await callsApi.approve(id, { 
        item_type: itemType, 
        approved: true,
        edited_content: editedContent
      });
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} approved!`);
      fetchCall();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Failed to approve");
    } finally {
      setApproving(false);
    }
  };

  const handleApproveAll = async () => {
    setApproving(true);
    try {
      await callsApi.approveAll(id);
      toast.success("All items approved and sent!");
      fetchCall();
    } catch (error) {
      console.error("Error approving all:", error);
      toast.error("Failed to approve all");
    } finally {
      setApproving(false);
    }
  };

  const getConfidenceBadge = (confidence) => {
    const styles = {
      high: "bg-emerald-50 text-emerald-700 border-emerald-200",
      medium: "bg-amber-50 text-amber-700 border-amber-200",
      low: "bg-red-50 text-red-700 border-red-200"
    };
    return styles[confidence] || styles.medium;
  };

  const filteredTranscript = call?.transcript?.filter(segment =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse-subtle">
          <div className="w-8 h-8 rounded-full bg-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Call not found</p>
      </div>
    );
  }

  const ai = call.ai_outputs || {};
  const approvals = call.approvals || {};
  const allApproved = call.status === "sent";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
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
          <Link to="/calls" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium">
            <Phone className="w-5 h-5" />
            Calls
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          
          {user?.role === "admin" && (
            <>
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
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/calls" className="text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900" data-testid="call-title">
                  {call.title}
                </h1>
                <p className="text-sm text-slate-500">
                  {new Date(call.created_at).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {call.contact_name && ` · ${call.contact_name}`}
                  {call.contact_company && ` at ${call.contact_company}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {allApproved ? (
                <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Sent
                </span>
              ) : (
                <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Pending Approval
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Split Panel Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Transcript */}
          <div className="w-2/5 border-r border-slate-200 bg-white flex flex-col">
            {/* Summary */}
            {ai.summary && (
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Summary</h3>
                <p className="text-sm text-slate-700">{ai.summary}</p>
              </div>
            )}

            {/* Key Moments */}
            {ai.key_moments?.length > 0 && (
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Key Moments</h3>
                <div className="space-y-2">
                  {ai.key_moments.map((moment, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      data-testid={`key-moment-${idx}`}
                    >
                      <span className={`key-moment-dot mt-1.5 flex-shrink-0 ${moment.type}`}></span>
                      <div>
                        <span className="text-slate-400 font-mono text-xs">[{moment.timestamp}]</span>
                        <p className="text-slate-700">{moment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript Search */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search transcript..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="transcript-search"
                />
              </div>
            </div>

            {/* Transcript */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Transcript</h3>
                {filteredTranscript.length > 0 ? (
                  filteredTranscript.map((segment, idx) => (
                    <div 
                      key={idx}
                      className="text-sm"
                      data-testid={`transcript-segment-${idx}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-400 font-mono text-xs">[{segment.timestamp}]</span>
                        <span className="font-medium text-slate-900">{segment.speaker}</span>
                      </div>
                      <p className="text-slate-600 pl-4 border-l-2 border-slate-100">
                        {segment.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">
                    {searchQuery ? "No matching segments found" : "No transcript available"}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Execution Items */}
          <div className="flex-1 bg-slate-50 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Email Draft */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-testid="email-section">
                  <button
                    onClick={() => setEmailExpanded(!emailExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-slate-900">Follow-up Email</span>
                      {approvals.email?.approved && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    {emailExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {emailExpanded && ai.email_draft && (
                    <div className="px-4 pb-4 space-y-4">
                      <Separator />
                      
                      {editingEmail ? (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-slate-500">Subject</Label>
                            <Input
                              value={editedEmail.subject}
                              onChange={(e) => setEditedEmail({ ...editedEmail, subject: e.target.value })}
                              className="mt-1"
                              data-testid="edit-email-subject"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Body</Label>
                            <Textarea
                              value={editedEmail.body}
                              onChange={(e) => setEditedEmail({ ...editedEmail, body: e.target.value })}
                              rows={8}
                              className="mt-1 font-mono text-sm"
                              data-testid="edit-email-body"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-slate-900 mb-2">
                            Subject: {ai.email_draft.subject}
                          </p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">
                            {ai.email_draft.body}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceBadge(ai.email_draft.confidence)}`}>
                          {ai.email_draft.confidence} confidence
                        </span>
                        
                        <div className="flex gap-2">
                          {editingEmail ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingEmail(false);
                                  setEditedEmail({ subject: ai.email_draft.subject, body: ai.email_draft.body });
                                }}
                              >
                                <X className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove("email")}
                                disabled={approving}
                                data-testid="save-approve-email-btn"
                              >
                                <Check className="w-4 h-4 mr-1" /> Save & Approve
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingEmail(true)}
                                disabled={approvals.email?.approved}
                                data-testid="edit-email-btn"
                              >
                                <Pencil className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove("email")}
                                disabled={approving || approvals.email?.approved}
                                data-testid="approve-email-btn"
                              >
                                <Check className="w-4 h-4 mr-1" /> Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {approvals.email?.approved && (
                        <p className="text-xs text-slate-400">
                          Approved by {approvals.email.approved_by} · {new Date(approvals.email.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-testid="documents-section">
                  <button
                    onClick={() => setDocsExpanded(!docsExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-slate-900">Documents</span>
                      {approvals.documents?.approved && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    {docsExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {docsExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      <Separator />
                      
                      {ai.documents?.length > 0 ? (
                        <div className="space-y-2">
                          {ai.documents.map((doc, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                              data-testid={`document-${idx}`}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-slate-400" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{doc.filename}</p>
                                  <p className="text-xs text-slate-500">
                                    From Data Vault · {doc.tags?.join(", ")}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceBadge(doc.confidence)}`}>
                                {doc.confidence}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 py-4 text-center">
                          No documents suggested for this call
                        </p>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove("documents")}
                          disabled={approving || approvals.documents?.approved || !ai.documents?.length}
                          data-testid="approve-docs-btn"
                        >
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </div>
                      
                      {approvals.documents?.approved && (
                        <p className="text-xs text-slate-400">
                          Approved by {approvals.documents.approved_by} · {new Date(approvals.documents.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* CRM Update */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-testid="crm-section">
                  <button
                    onClick={() => setCrmExpanded(!crmExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <DatabaseIcon className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="font-medium text-slate-900">CRM Update (HubSpot)</span>
                      {approvals.crm?.approved && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    {crmExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {crmExpanded && ai.crm_updates && (
                    <div className="px-4 pb-4 space-y-4">
                      <Separator />
                      
                      {editingCrm ? (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-slate-500">Deal Stage</Label>
                            <Input
                              value={editedCrm.deal_stage}
                              onChange={(e) => setEditedCrm({ ...editedCrm, deal_stage: e.target.value })}
                              className="mt-1"
                              data-testid="edit-crm-stage"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Next Step</Label>
                            <Input
                              value={editedCrm.next_step}
                              onChange={(e) => setEditedCrm({ ...editedCrm, next_step: e.target.value })}
                              className="mt-1"
                              data-testid="edit-crm-nextstep"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Notes</Label>
                            <Textarea
                              value={editedCrm.notes}
                              onChange={(e) => setEditedCrm({ ...editedCrm, notes: e.target.value })}
                              rows={3}
                              className="mt-1"
                              data-testid="edit-crm-notes"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-500">Deal Stage</span>
                            <span className="text-sm font-medium text-slate-900">{ai.crm_updates.deal_stage}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-500">Next Step</span>
                            <span className="text-sm font-medium text-slate-900">{ai.crm_updates.next_step}</span>
                          </div>
                          <div className="py-2">
                            <span className="text-sm text-slate-500">Notes</span>
                            <p className="text-sm text-slate-700 mt-1">{ai.crm_updates.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* CRM Notes - Categorized bullet points */}
                      {ai.crm_notes?.length > 0 && (
                        <div>
                          <button
                            onClick={() => setCrmNotesExpanded(!crmNotesExpanded)}
                            className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                          >
                            <Tag className="w-3 h-3" />
                            Call Insights ({ai.crm_notes.length})
                            {crmNotesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          {crmNotesExpanded && (
                            <div className="mt-2 space-y-1.5">
                              {ai.crm_notes.map((note, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm" data-testid={`crm-note-${idx}`}>
                                  <span className={`mt-0.5 inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                                    note.category === "pain_point" ? "bg-red-400" :
                                    note.category === "requirement" ? "bg-blue-400" :
                                    note.category === "decision_maker" ? "bg-purple-400" :
                                    note.category === "timeline" ? "bg-amber-400" :
                                    note.category === "budget" ? "bg-green-400" :
                                    "bg-slate-400"
                                  }`} />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-slate-700">{note.point}</span>
                                    <span className="ml-2 text-xs text-slate-400 capitalize">{note.category?.replace("_", " ")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceBadge(ai.crm_updates.confidence)}`}>
                          {ai.crm_updates.confidence} confidence
                        </span>
                        
                        <div className="flex gap-2">
                          {editingCrm ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingCrm(false);
                                  setEditedCrm({
                                    deal_stage: ai.crm_updates.deal_stage,
                                    next_step: ai.crm_updates.next_step,
                                    notes: ai.crm_updates.notes
                                  });
                                }}
                              >
                                <X className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove("crm")}
                                disabled={approving}
                                data-testid="save-approve-crm-btn"
                              >
                                <Check className="w-4 h-4 mr-1" /> Save & Approve
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingCrm(true)}
                                disabled={approvals.crm?.approved}
                                data-testid="edit-crm-btn"
                              >
                                <Pencil className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove("crm")}
                                disabled={approving || approvals.crm?.approved}
                                data-testid="approve-crm-btn"
                              >
                                <Check className="w-4 h-4 mr-1" /> Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {approvals.crm?.approved && (
                        <p className="text-xs text-slate-400">
                          Approved by {approvals.crm.approved_by} · {new Date(approvals.crm.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Task List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-testid="tasks-section">
                  <button
                    onClick={() => setTasksExpanded(!tasksExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <ListTodo className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-slate-900">Post-Call Tasks</span>
                      {ai.tasks?.length > 0 && (
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                          {ai.tasks.length}
                        </span>
                      )}
                      {approvals.tasks?.approved && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    {tasksExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {tasksExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      <Separator />
                      
                      {ai.tasks?.length > 0 ? (
                        <div className="space-y-2">
                          {ai.tasks.map((task, idx) => (
                            <div 
                              key={task.id || idx}
                              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg group"
                              data-testid={`task-item-${idx}`}
                            >
                              <button 
                                className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                                disabled={approvals.tasks?.approved}
                              >
                                {task.completed ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${task.completed ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                  {task.text}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    task.priority === "high" ? "bg-red-50 text-red-600" :
                                    task.priority === "medium" ? "bg-amber-50 text-amber-600" :
                                    "bg-slate-100 text-slate-500"
                                  }`}>
                                    {task.priority}
                                  </span>
                                  {task.assignee && (
                                    <span className="text-xs text-slate-400">{task.assignee}</span>
                                  )}
                                  {task.due_date && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {task.due_date}
                                    </span>
                                  )}
                                  {task.source_timestamp && (
                                    <span className="text-xs text-slate-300 font-mono">[{task.source_timestamp}]</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 py-4 text-center">
                          No tasks detected from this call
                        </p>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove("tasks")}
                          disabled={approving || approvals.tasks?.approved || !ai.tasks?.length}
                          data-testid="approve-tasks-btn"
                        >
                          <Check className="w-4 h-4 mr-1" /> Approve Tasks
                        </Button>
                      </div>
                      
                      {approvals.tasks?.approved && (
                        <p className="text-xs text-slate-400">
                          Approved by {approvals.tasks.approved_by} · {new Date(approvals.tasks.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Bottom Action Bar */}
            <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {allApproved 
                    ? "All items have been approved and sent" 
                    : "Review and approve each item, or approve all at once"}
                </p>
                
                <Button 
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                  onClick={handleApproveAll}
                  disabled={approving || allApproved}
                  data-testid="approve-all-btn"
                >
                  {allApproved ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Approve & Send All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallReviewPage;
