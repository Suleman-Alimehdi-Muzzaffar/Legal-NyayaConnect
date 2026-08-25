import React, { useRef, useState, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  Eye,
  File,
  Image as ImageIcon,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  X,
  Loader2,
  Share2,
  PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useListDocuments, useCreateDocument, useDeleteDocument, getListDocumentsQueryKey, type Document } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import FormSelect from '@/components/forms/FormSelect';
import SignaturePad from '@/components/SignaturePad';
import { useAuth } from '@/lib/auth-context';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']);
const DOC_EXTENSIONS = new Set(['doc', 'docx', 'rtf', 'odt', 'txt']);
const PDF_EXTENSIONS = new Set(['pdf']);

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function typeFromFileName(name: string): Document['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (PDF_EXTENSIONS.has(ext)) return 'pdf';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (DOC_EXTENSIONS.has(ext)) return 'doc';
  return 'contract';
}

const Documents = () => {
  const { token } = useAuth();
  const { data: documents } = useListDocuments();
  const documentsList = documents ?? [];
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [signingDoc, setSigningDoc] = useState<Document | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<Array<{ id: string; text: string; author: string; authorRole: string; createdAt: string }>>([]);
  const [newComment, setNewComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const createDocumentMutation = useCreateDocument({
    request: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      },
    },
  } as unknown as never);

  const deleteDocumentMutation = useDeleteDocument({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        toast.success("Document deleted");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      },
    },
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const created = await createDocumentMutation.mutateAsync({
          data: {
            name: file.name,
            type: typeFromFileName(file.name),
            category: categoryFilter !== 'all' ? categoryFilter : 'General',
            size: formatBytes(file.size),
          },
        });
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`/api/documents/${created.id}/file`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form } as unknown as RequestInit);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message ?? `Upload failed (HTTP ${res.status})`);
        }
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        toast.success(`${file.name} uploaded`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      }
    }
    setUploading(false);
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.fileName) {
      toast.error('No file attached to this document.');
      return;
    }
    try {
      const res = await fetch(`/api/documents/${doc.id}/file`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`${doc.name} downloaded`);
    } catch {
      toast.error('Failed to download the document. Please try again.');
    }
  };

  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    deleteDocumentMutation.mutate({ id: docToDelete.id });
    setDocToDelete(null);
  };

  const handleShare = async (doc: Document) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresInHours: 24 }) });
      if (!res.ok) throw new Error('Share failed');
      const data = await res.json();
      const url = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied — expires in 24h');
    } catch { toast.error('Could not create share link'); }
  };

  const handleSign = async (dataUrl: string) => {
    if (!signingDoc) return;
    try {
      const res = await fetch(`/api/documents/${signingDoc.id}/sign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signature: dataUrl }) });
      if (!res.ok) throw new Error('Sign failed');
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      toast.success('Document signed');
      setSigningDoc(null);
    } catch { toast.error('Failed to save signature'); }
  };

  useEffect(() => {
    if (!viewingDoc) { setComments([]); setNewComment(''); return; }
    fetch(`/api/documents/${viewingDoc.id}/comments`).then((r) => r.json()).then((d) => setComments(Array.isArray(d) ? d : [])).catch(() => setComments([]));
  }, [viewingDoc]);

  const handlePostComment = async () => {
    if (!viewingDoc || !newComment.trim()) return;
    try {
      const res = await fetch(`/api/documents/${viewingDoc.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ text: newComment }),
      });
      if (!res.ok) throw new Error('Failed');
      const c = await res.json();
      setComments((prev) => [...prev, c]);
      setNewComment('');
      toast.success('Comment added');
    } catch { toast.error('Could not post comment'); }
  };

  const categories = ['all', ...Array.from(new Set(documentsList.map(d => d.category)))];
  
  const filteredDocs = documentsList.filter(doc => {
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    return true;
  });

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-400" />;
      case 'doc': return <File className="w-8 h-8 text-blue-400" />;
      case 'image': return <ImageIcon className="w-8 h-8 text-green-400" />;
      case 'contract': return <BookOpen className="w-8 h-8 text-purple-400" />;
      default: return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  const getFileIconBg = (type: string) => {
    switch(type) {
      case 'pdf': return 'bg-red-500/10 border-red-500/20';
      case 'doc': return 'bg-blue-500/10 border-blue-500/20';
      case 'image': return 'bg-green-500/10 border-green-500/20';
      case 'contract': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending_review':
        return <span className="flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30 uppercase tracking-wider font-bold"><Clock className="w-3 h-3" /> Pending Review</span>;
      case 'reviewed':
        return <span className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 uppercase tracking-wider font-bold"><Eye className="w-3 h-3" /> Reviewed</span>;
      case 'approved':
        return <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 uppercase tracking-wider font-bold"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 uppercase tracking-wider font-bold"><AlertCircle className="w-3 h-3" /> Needs Changes</span>;
      default:
        return null;
    }
  };

  const stats = [
    { label: "Total Documents", val: documentsList.length, icon: FileText, color: "text-white", bg: "bg-white/10" },
    { label: "Pending Review", val: documentsList.filter(d => d.status === 'pending_review').length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Approved", val: documentsList.filter(d => d.status === 'approved').length, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" }
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold">My Documents</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(212,175,55,0.3)] inline-flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-3xl font-serif font-bold text-white">{stat.val}</div>
            </div>
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search documents by name..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <FormSelect
            label=""
            name="category"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            options={categories.map(c => ({ label: c === 'all' ? 'All Categories' : c, value: c }))}
            className="w-full sm:w-48 !gap-0"
            icon={Filter}
          />
          <FormSelect
            label=""
            name="status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Pending Review", value: "pending_review" },
              { label: "Reviewed", value: "reviewed" },
              { label: "Approved", value: "approved" },
              { label: "Needs Changes", value: "rejected" }
            ]}
            className="w-full sm:w-48 !gap-0"
            icon={Filter}
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDocs.map((doc, i) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors flex flex-col gap-4 group"
            >
              <div className="flex items-start justify-between">
                <div className={cn("w-14 h-14 rounded-xl border flex items-center justify-center shrink-0", getFileIconBg(doc.type))}>
                  {getFileIcon(doc.type)}
                </div>
                <div className="shrink-0">
                  {getStatusBadge(doc.status)}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-white truncate mb-1 group-hover:text-[#D4AF37] transition-colors" title={doc.name}>
                  {doc.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="border border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                    {doc.category}
                  </span>
                  <span>{doc.size}</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {doc.lawyerName && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-gray-300 flex items-center gap-2 border border-white/5">
                  <span className="text-gray-500">Shared with:</span> 
                  <span className="font-semibold text-white">{doc.lawyerName}</span>
                </div>
              )}
              {((doc as unknown as { verifiedByName?: string }).verifiedByName) && (
                <div className="bg-[#D4AF37]/10 rounded-lg px-3 py-2 text-xs text-gray-300 border border-[#D4AF37]/20 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37] shrink-0" />
                  <span className="text-gray-400">Verified by {(doc as unknown as { verifiedByName: string }).verifiedByName}</span>
                  {(doc as unknown as { verifiedAt?: string }).verifiedAt && (
                    <span className="text-gray-500">• {new Date((doc as unknown as { verifiedAt: string }).verifiedAt).toLocaleDateString()}</span>
                  )}
                </div>
              )}
              {((doc as unknown as { reviewNote?: string }).reviewNote) && (
                <div className={`rounded-lg px-3 py-2 text-xs border flex gap-2 ${doc.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-white/5 border-white/5 text-gray-200'}`}>
                  <AlertCircle className={`w-3 h-3 mt-0.5 shrink-0 ${doc.status === 'rejected' ? 'text-red-400' : 'text-gray-400'}`} />
                  <span className="break-words">{(doc as unknown as { reviewNote: string }).reviewNote}</span>
                </div>
              )}
              {doc.status === 'rejected' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Needs changes — please address feedback and re-upload if needed.
                </div>
              )}
              {doc.status === 'approved' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-xs text-green-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Approved by your lawyer — ready for filing.
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                <button onClick={() => setViewingDoc(doc)} className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> View
                </button>
                <button onClick={() => handleShare(doc)} className="w-10 h-10 shrink-0 bg-white/5 hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg flex items-center justify-center transition-colors" title="Share — 24h expiring link">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSigningDoc(doc)} className="w-10 h-10 shrink-0 bg-white/5 hover:bg-green-500/10 text-gray-300 hover:text-green-400 border border-white/10 hover:border-green-500/30 rounded-lg flex items-center justify-center transition-colors" title="E-sign">
                  <PenTool className="w-4 h-4" />
                </button>
                <button onClick={() => handleDownload(doc)} className="w-10 h-10 shrink-0 bg-white/5 hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg flex items-center justify-center transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => setDocToDelete(doc)} className="w-10 h-10 shrink-0 bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg flex items-center justify-center transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          
          {filteredDocs.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">No documents found</h3>
              <p className="text-gray-400">Try adjusting your search or filters.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`mt-4 glass-card border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer bg-[#D4AF37]/5 ${
          dragOver
            ? 'border-[#D4AF37] bg-[#D4AF37]/15 scale-[1.01]'
            : 'border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
        </div>
        <h3 className="font-serif text-xl font-bold text-white mb-2">Drag & drop files here</h3>
        <p className="text-gray-400 text-sm mb-6 max-w-md">or click to browse from your computer. We support secure, encrypted uploads for all your legal documents.</p>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 25MB)</p>
      </div>

      {/* View Document Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingDoc(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <FocusTrap active={!!viewingDoc}>
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Preview ${viewingDoc.name}`}
              className="glass-card bg-[#102542] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-[0_0_60px_rgba(212,175,55,0.15)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-xl border flex items-center justify-center shrink-0", getFileIconBg(viewingDoc.type))}>
                    {getFileIcon(viewingDoc.type)}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">{viewingDoc.name}</h3>
                    <div className="text-xs text-gray-400 mt-0.5">Document Preview</div>
                  </div>
                </div>
                <button onClick={() => setViewingDoc(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {viewingDoc.fileName && viewingDoc.type === 'image' && (
                <img
                  src={`/api/documents/${viewingDoc.id}/file`}
                  alt={viewingDoc.name}
                  className="w-full max-h-72 object-contain rounded-xl border border-white/10 bg-black/30"
                />
              )}
              {viewingDoc.fileName && viewingDoc.type === 'pdf' && (
                <iframe
                  src={`/api/documents/${viewingDoc.id}/file`}
                  title={viewingDoc.name}
                  className="w-full h-80 rounded-xl border border-white/10 bg-black/30"
                />
              )}

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Category</span>
                  <span className="font-semibold text-[#D4AF37]">{viewingDoc.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">File Type</span>
                  <span className="font-semibold text-white uppercase">{viewingDoc.type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Size</span>
                  <span className="font-semibold text-white">{viewingDoc.size}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Uploaded On</span>
                  <span className="font-semibold text-white">{new Date(viewingDoc.uploadedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Status</span>
                  <span>{getStatusBadge(viewingDoc.status)}</span>
                </div>
                {viewingDoc.lawyerName && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Shared With</span>
                    <span className="font-semibold text-white">{viewingDoc.lawyerName}</span>
                  </div>
                )}
                {((viewingDoc as unknown as { verifiedByName?: string }).verifiedByName) && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Verified By</span>
                    <span className="font-semibold text-white text-xs">{(viewingDoc as unknown as { verifiedByName: string }).verifiedByName}{(viewingDoc as unknown as { verifiedAt?: string }).verifiedAt ? ` • ${new Date((viewingDoc as unknown as { verifiedAt: string }).verifiedAt).toLocaleString()}` : ""}</span>
                  </div>
                )}
                {((viewingDoc as unknown as { reviewNote?: string }).reviewNote) && (
                  <div className="py-2 border-b border-white/5">
                    <span className="text-gray-400 text-xs">Review Note</span>
                    <p className={`text-sm mt-1 p-2 rounded-lg border break-words ${viewingDoc.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-white/5 border-white/10 text-gray-200'}`}>{(viewingDoc as unknown as { reviewNote: string }).reviewNote}</p>
                  </div>
                )}
                {(viewingDoc as unknown as { versions?: Array<{ fileName: string; replacedAt: string }> })?.versions?.length ? (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Versions</span>
                    <span className="font-semibold text-white">{(viewingDoc as unknown as { versions: Array<unknown> }).versions.length} previous</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <h4 className="text-sm font-semibold text-white mb-2">Comments</h4>
                <div className="max-h-32 overflow-y-auto flex flex-col gap-2 mb-2 pr-1 custom-scrollbar">
                  {comments.length === 0 ? <p className="text-xs text-gray-500">No comments yet. Be the first to comment.</p> : comments.map((c) => (
                    <div key={c.id} className="bg-white/5 rounded-lg p-2 text-xs border border-white/5">
                      <span className="font-semibold text-[#D4AF37]">{c.author}</span> <span className="text-gray-500">• {new Date(c.createdAt).toLocaleString()}</span>
                      <p className="text-gray-200 mt-1 break-words">{c.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePostComment()} placeholder="Add a comment..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4AF37]/50" />
                  <button onClick={handlePostComment} disabled={!newComment.trim()} className="bg-[#D4AF37] text-[#102542] font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-40">Post</button>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDownload(viewingDoc)}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
            </FocusTrap>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {docToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDocToDelete(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-[#102542] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-[0_0_60px_rgba(239,68,68,0.12)]"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white text-center mb-2">Delete Document?</h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                <span className="font-semibold text-white">{docToDelete.name}</span> will be permanently removed from your documents. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteDocumentMutation.isPending}
                  className="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {deleteDocumentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
                <button
                  onClick={() => setDocToDelete(null)}
                  className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share link modal */}
      <AnimatePresence>
        {shareUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShareUrl(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="glass-card bg-[#102542] border border-white/10 rounded-2xl w-full max-w-md p-6">
              <h3 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2"><Share2 className="w-5 h-5 text-[#D4AF37]" /> Share Link (expires 24h)</h3>
              <p className="text-xs text-gray-400 mb-3 break-all bg-white/5 border border-white/10 rounded-xl p-3">{shareUrl}</p>
              <div className="flex gap-3">
                <button onClick={async () => { await navigator.clipboard.writeText(shareUrl); toast.success('Copied'); }} className="flex-1 bg-[#D4AF37] text-[#102542] font-bold py-2.5 rounded-xl">Copy Again</button>
                <button onClick={() => setShareUrl(null)} className="flex-1 border border-white/20 text-white py-2.5 rounded-xl">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* E-sign modal */}
      <AnimatePresence>
        {signingDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSigningDoc(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="glass-card bg-[#102542] border border-white/10 rounded-2xl w-full max-w-lg p-6">
              <h3 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2"><PenTool className="w-5 h-5 text-green-400" /> Sign — {signingDoc.name}</h3>
              <p className="text-xs text-gray-400 mb-3">Draw your signature below. It will be stored securely with the document.</p>
              <SignaturePad onSave={handleSign} onCancel={() => setSigningDoc(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Documents;