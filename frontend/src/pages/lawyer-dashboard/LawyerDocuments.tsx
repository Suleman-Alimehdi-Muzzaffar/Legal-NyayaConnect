import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Eye,
  File,
  Image as ImageIcon,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FormSelect from '@/components/forms/FormSelect';
import { useListDocuments, useCreateDocument, getListDocumentsQueryKey, type Document, type DocumentStatus } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

const LawyerDocuments = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading } = useListDocuments();
  const docs = documents ?? [];
  const queryClient = useQueryClient();
  const createDocumentMutation = useCreateDocument({
    request: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      },
    },
  } as unknown as never);

  const categories = ['all', ...Array.from(new Set(docs.map(d => d.category)))];
  
  const filteredDocs = docs.filter(doc => {
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    return true;
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

  const handleVerify = async (doc: Document, status: DocumentStatus, note?: string) => {
    setVerifyingId(doc.id);
    const doFetchJson = async (url: string, init: RequestInit) => {
      const res = await fetch(url, init);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let j: unknown = null;
        try { j = text ? JSON.parse(text) : null; } catch { j = null; }
        const msg = (j as { message?: string; error?: string } | null)?.message ?? (j as { error?: string } | null)?.error ?? (text && text.length < 500 ? text : '') ?? `HTTP ${res.status}`;
        const err = new Error(msg || `Request failed (HTTP ${res.status})`) as Error & { status?: number; body?: string };
        (err as unknown as { status?: number }).status = res.status;
        (err as unknown as { body?: string }).body = text;
        throw err;
      }
      return res.json().catch(() => ({}));
    };

    try {
      try {
        await doFetchJson(`/api/documents/${doc.id}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status, note: note ?? '', reviewNote: note ?? '' }),
        });
      } catch (e) {
        const err = e as Error & { status?: number; body?: string };
        const isRouteNotFound = err.status === 404 && (err.body?.includes('<!DOCTYPE') || err.body?.includes('Cannot POST') || err.body?.includes('Cannot GET') || err.body?.includes('<html'));
        // Fallback for backends without /verify (old build still running) — use PATCH /documents/:id
        if (isRouteNotFound) {
          await doFetchJson(`/api/documents/${doc.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ status, reviewNote: note ?? '', verifiedBy: undefined } as unknown as Record<string, unknown>),
          });
        } else {
          throw e;
        }
      }
      await queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      const msg = status === 'approved' ? 'Document approved — client notified' : status === 'rejected' ? 'Changes requested — client notified' : status === 'reviewed' ? 'Document marked as reviewed' : 'Status updated';
      toast.success(msg);
      setRejectTarget(null);
      setRejectNote('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      // Surface more help if route missing (backend not rebuilt)
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        toast.error(`${msg} — if this persists, restart the API server (npm run dev:server) so the new /verify endpoint is loaded.`);
      } else {
        toast.error(msg);
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const getFileIcon = (type: Document['type']) => {
    switch(type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-400" />;
      case 'doc': return <File className="w-8 h-8 text-blue-400" />;
      case 'image': return <ImageIcon className="w-8 h-8 text-green-400" />;
      case 'contract': return <BookOpen className="w-8 h-8 text-purple-400" />;
      default: return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  const getFileIconBg = (type: Document['type']) => {
    switch(type) {
      case 'pdf': return 'bg-red-500/10 border-red-500/20';
      case 'doc': return 'bg-blue-500/10 border-blue-500/20';
      case 'image': return 'bg-green-500/10 border-green-500/20';
      case 'contract': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch(status) {
      case 'pending_review':
        return <span className="flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30 uppercase tracking-wider font-bold"><Clock className="w-3 h-3" /> To Review</span>;
      case 'reviewed':
        return <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 uppercase tracking-wider font-bold"><CheckCircle2 className="w-3 h-3" /> Reviewed</span>;
      case 'approved':
        return <span className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 uppercase tracking-wider font-bold"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 uppercase tracking-wider font-bold"><AlertCircle className="w-3 h-3" /> Needs Fix</span>;
      default:
        return null;
    }
  };

  const stats = [
    { label: "Total Documents", val: docs.length, icon: FileText, color: "text-white", bg: "bg-white/10" },
    { label: "Pending Review", val: docs.filter(d => d.status === 'pending_review').length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Ready for Filing", val: docs.filter(d => d.status === 'reviewed' || d.status === 'approved').length, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" }
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold">Case Documents</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-60 text-[#102542] font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(212,175,55,0.3)] inline-flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          Upload Document
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
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
            placeholder="Search by file name..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <FormSelect
            label="" name="category" icon={Filter}
            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            options={categories.map(c => ({ label: c === 'all' ? 'All Categories' : c, value: c }))}
            className="w-full sm:w-48 !gap-0"
          />
          <FormSelect
            label="" name="status" icon={Filter}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "To Review", value: "pending_review" },
              { label: "Reviewed", value: "reviewed" },
              { label: "Approved", value: "approved" },
              { label: "Needs Fix", value: "rejected" }
            ]}
            className="w-full sm:w-48 !gap-0"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#D4AF37]" />
              <p>Loading documents...</p>
            </div>
          )}

          {!isLoading && filteredDocs.map((doc, i) => (
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
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-gray-300 border border-white/5 flex items-center gap-2">
                  <span className="text-gray-500">Handled by:</span>
                  <span className="font-semibold text-white truncate">{doc.lawyerName}</span>
                </div>
              )}
              {((doc as unknown as { uploadedByName?: string }).uploadedByName) && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-gray-300 border border-white/5 flex items-center gap-2">
                  <span className="text-gray-500">Client:</span>
                  <span className="font-semibold text-white truncate">{(doc as unknown as { uploadedByName: string }).uploadedByName}</span>
                </div>
              )}
              {((doc as unknown as { verifiedByName?: string }).verifiedByName) && (
                <div className="bg-[#D4AF37]/10 rounded-lg px-3 py-2 text-xs text-gray-300 border border-[#D4AF37]/20 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-[#D4AF37] shrink-0" />
                  <span className="text-gray-400">Verified by {(doc as unknown as { verifiedByName: string }).verifiedByName}</span>
                  {(doc as unknown as { verifiedAt?: string }).verifiedAt && (
                    <span className="text-gray-500">• {new Date((doc as unknown as { verifiedAt: string }).verifiedAt).toLocaleDateString()}</span>
                  )}
                </div>
              )}
              {((doc as unknown as { reviewNote?: string }).reviewNote) && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-gray-200 border border-white/5 flex gap-2">
                  <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                  <span className="break-words">{(doc as unknown as { reviewNote: string }).reviewNote}</span>
                </div>
              )}

              {/* Lawyer verification actions — backend enforces lawyer role via POST /documents/:id/verify */}
              {(doc.status === 'pending_review' || doc.status === 'reviewed') && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleVerify(doc, 'approved')}
                    disabled={verifyingId === doc.id}
                    className="flex-1 min-w-[90px] bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {verifyingId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                  {doc.status === 'pending_review' && (
                    <button
                      onClick={() => handleVerify(doc, 'reviewed')}
                      disabled={verifyingId === doc.id}
                      className="flex-1 min-w-[90px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Eye className="w-3.5 h-3.5" /> Reviewed
                    </button>
                  )}
                  <button
                    onClick={() => setRejectTarget(doc)}
                    disabled={verifyingId === doc.id}
                    className="flex-1 min-w-[90px] bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Needs Fix
                  </button>
                </div>
              )}
              {doc.status === 'rejected' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(doc, 'approved')}
                    disabled={verifyingId === doc.id}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Anyway
                  </button>
                  <button
                    onClick={() => handleVerify(doc, 'pending_review')}
                    disabled={verifyingId === doc.id}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-medium py-2 rounded-lg text-xs transition-colors"
                  >
                    Re-open
                  </button>
                </div>
              )}
              {doc.status === 'approved' && (
                <div className="flex gap-2">
                  <span className="flex-1 flex items-center justify-center gap-1.5 text-xs text-green-400 font-semibold bg-green-500/10 border border-green-500/20 rounded-lg py-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified & Approved
                  </span>
                  <button
                    onClick={() => setRejectTarget(doc)}
                    className="px-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-lg text-xs transition-colors"
                    title="Request changes"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                <button onClick={() => setViewingDoc(doc)} className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> View
                </button>
                <button onClick={() => handleDownload(doc)} className="w-10 h-10 shrink-0 bg-white/5 hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg flex items-center justify-center transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          
          {!isLoading && filteredDocs.length === 0 && (
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
        className="mt-4 glass-card border-2 border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10"
      >
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8" />
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
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
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
                    <span className="text-gray-400">Handled By</span>
                    <span className="font-semibold text-white">{viewingDoc.lawyerName}</span>
                  </div>
                )}
                {((viewingDoc as unknown as { uploadedByName?: string }).uploadedByName) && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Client</span>
                    <span className="font-semibold text-white">{(viewingDoc as unknown as { uploadedByName: string }).uploadedByName}</span>
                  </div>
                )}
                {((viewingDoc as unknown as { verifiedByName?: string }).verifiedByName) && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Verified By</span>
                    <span className="font-semibold text-white text-xs">
                      {(viewingDoc as unknown as { verifiedByName: string }).verifiedByName}
                      {(viewingDoc as unknown as { verifiedAt?: string }).verifiedAt ? ` • ${new Date((viewingDoc as unknown as { verifiedAt: string }).verifiedAt).toLocaleString()}` : ""}
                    </span>
                  </div>
                )}
                {((viewingDoc as unknown as { reviewNote?: string }).reviewNote) && (
                  <div className="py-2 border-b border-white/5">
                    <span className="text-gray-400 text-xs">Review Note</span>
                    <p className="text-sm text-gray-200 mt-1 bg-white/5 border border-white/10 rounded-lg p-2 break-words">{(viewingDoc as unknown as { reviewNote: string }).reviewNote}</p>
                  </div>
                )}
              </div>

              {/* Quick verify actions inside preview — mirrors card actions */}
              {(viewingDoc.status === 'pending_review' || viewingDoc.status === 'reviewed') && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handleVerify(viewingDoc, 'approved');
                      setViewingDoc({ ...(viewingDoc as Document), status: 'approved' as DocumentStatus } as Document);
                    }}
                    disabled={verifyingId === viewingDoc.id}
                    className="flex-1 min-w-[100px] bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  {viewingDoc.status === 'pending_review' && (
                    <button
                      onClick={() => {
                        handleVerify(viewingDoc, 'reviewed');
                        setViewingDoc({ ...(viewingDoc as Document), status: 'reviewed' as DocumentStatus } as Document);
                      }}
                      disabled={verifyingId === viewingDoc.id}
                      className="flex-1 min-w-[100px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-semibold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4" /> Mark Reviewed
                    </button>
                  )}
                  <button
                    onClick={() => { setRejectTarget(viewingDoc); }}
                    disabled={verifyingId === viewingDoc.id}
                    className="flex-1 min-w-[100px] bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <AlertCircle className="w-4 h-4" /> Needs Fix
                  </button>
                </div>
              )}

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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject / Needs Fix modal — lawyer provides review note, stored as reviewNote and shown to client */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setRejectTarget(null); setRejectNote(''); }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-[#102542] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-[0_0_60px_rgba(239,68,68,0.15)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" /> Request Changes
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Tell the client what needs to be fixed for <span className="text-white font-semibold">{rejectTarget.name}</span></p>
                </div>
                <button onClick={() => { setRejectTarget(null); setRejectNote(''); }} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Please upload a clearer scan of page 2, signature missing…"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:border-red-400/50 focus:ring-1 focus:ring-red-400/30 outline-none resize-none"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">Client will see this note in their Documents and be notified.</p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleVerify(rejectTarget, 'rejected', rejectNote || 'Please address the review comments and re-upload.')}
                  disabled={verifyingId === rejectTarget.id}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                >
                  {verifyingId === rejectTarget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                  Send Feedback
                </button>
                <button
                  onClick={() => { setRejectTarget(null); setRejectNote(''); }}
                  className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LawyerDocuments;
