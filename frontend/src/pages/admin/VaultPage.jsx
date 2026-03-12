import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Zap,
  Home,
  Phone,
  Settings,
  Database,
  Users,
  LogOut,
  Plus,
  Search,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tag
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { vaultApi } from "@/lib/api";
import { toast } from "sonner";

const VaultPage = () => {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [newDoc, setNewDoc] = useState({
    filename: "",
    tags: "",
    intent_triggers: "",
    content_preview: ""
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await vaultApi.getAll();
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    
    if (!newDoc.filename) {
      toast.error("Please provide a filename");
      return;
    }
    
    setSaving(true);
    
    try {
      const docData = {
        filename: newDoc.filename,
        tags: newDoc.tags.split(",").map(t => t.trim()).filter(Boolean),
        intent_triggers: newDoc.intent_triggers.split(",").map(t => t.trim()).filter(Boolean),
        content_preview: newDoc.content_preview
      };
      
      if (editingDoc) {
        await vaultApi.update(editingDoc.id, docData);
        toast.success("Document updated");
      } else {
        await vaultApi.create(docData);
        toast.success("Document added to vault");
      }
      
      setShowAddDialog(false);
      setEditingDoc(null);
      setNewDoc({ filename: "", tags: "", intent_triggers: "", content_preview: "" });
      fetchDocuments();
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (doc) => {
    try {
      await vaultApi.toggle(doc.id);
      toast.success(doc.enabled ? "Document disabled" : "Document enabled");
      fetchDocuments();
    } catch (error) {
      console.error("Error toggling document:", error);
      toast.error("Failed to toggle document");
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.filename}"? This cannot be undone.`)) return;
    
    try {
      await vaultApi.delete(doc.id);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const openEditDialog = (doc) => {
    setEditingDoc(doc);
    setNewDoc({
      filename: doc.filename,
      tags: doc.tags.join(", "),
      intent_triggers: doc.intent_triggers.join(", "),
      content_preview: doc.content_preview || ""
    });
    setShowAddDialog(true);
  };

  const filteredDocs = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <Link to="/admin/vault" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium">
            <Database className="w-5 h-5" />
            Data Vault
          </Link>
          <Link to="/admin/team" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" data-testid="vault-title">
                Data Vault
              </h1>
              <p className="text-slate-500 mt-1">
                Manage approved documents that AI can attach to follow-ups
              </p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={(open) => {
              setShowAddDialog(open);
              if (!open) {
                setEditingDoc(null);
                setNewDoc({ filename: "", tags: "", intent_triggers: "", content_preview: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 gap-2" data-testid="add-doc-btn">
                  <Plus className="w-4 h-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingDoc ? "Edit Document" : "Add Document"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveDocument} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="filename">Filename *</Label>
                    <Input
                      id="filename"
                      value={newDoc.filename}
                      onChange={(e) => setNewDoc({ ...newDoc, filename: e.target.value })}
                      placeholder="SOC2_Compliance_2025.pdf"
                      required
                      data-testid="doc-filename-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newDoc.tags}
                      onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                      placeholder="compliance, security, soc2"
                      data-testid="doc-tags-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="intent_triggers">Intent Triggers (comma separated)</Label>
                    <Input
                      id="intent_triggers"
                      value={newDoc.intent_triggers}
                      onChange={(e) => setNewDoc({ ...newDoc, intent_triggers: e.target.value })}
                      placeholder="compliance, security doc, SOC2"
                      data-testid="doc-triggers-input"
                    />
                    <p className="text-xs text-slate-500">
                      Keywords that will match this document in call transcripts
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content_preview">Content Preview (optional)</Label>
                    <Textarea
                      id="content_preview"
                      value={newDoc.content_preview}
                      onChange={(e) => setNewDoc({ ...newDoc, content_preview: e.target.value })}
                      placeholder="Brief description of document contents..."
                      rows={3}
                      data-testid="doc-preview-input"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={saving}
                      data-testid="save-doc-btn"
                    >
                      {saving ? "Saving..." : editingDoc ? "Update" : "Add to Vault"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-docs-input"
            />
          </div>

          {/* Documents List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No documents in vault</h3>
              <p className="text-slate-500 mt-2">
                Add documents that AI can attach to follow-up emails
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc, index) => (
                <div 
                  key={doc.id}
                  className={`bg-white p-5 rounded-xl border shadow-sm transition-all animate-fade-in ${
                    doc.enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  data-testid={`vault-doc-${doc.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{doc.filename}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Uploaded {new Date(doc.uploaded_at).toLocaleDateString()} by {doc.uploaded_by}
                        </p>
                        
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {doc.tags.map(tag => (
                              <span 
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {doc.intent_triggers.length > 0 && (
                          <p className="text-xs text-slate-400 mt-2">
                            Intent triggers: {doc.intent_triggers.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doc.enabled 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {doc.enabled ? 'Active' : 'Disabled'}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(doc)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(doc)}>
                            {doc.enabled ? (
                              <>
                                <ToggleLeft className="w-4 h-4 mr-2" />
                                Disable
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4 mr-2" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(doc)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VaultPage;
