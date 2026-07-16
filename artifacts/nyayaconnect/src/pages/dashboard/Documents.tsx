import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockDocuments } from '@/data/dashboardData';
import FormSelect from '@/components/forms/FormSelect';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(mockDocuments.map(d => d.category)))];
  
  const filteredDocs = mockDocuments.filter(doc => {
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
    { label: "Total Documents", val: mockDocuments.length, icon: FileText, color: "text-white", bg: "bg-white/10" },
    { label: "Pending Review", val: mockDocuments.filter(d => d.status === 'pending_review').length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Approved", val: mockDocuments.filter(d => d.status === 'approved').length, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" }
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold">My Documents</h2>
        <button className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(212,175,55,0.3)] inline-flex items-center justify-center gap-2 w-full md:w-auto">
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
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

              <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                <button className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> View
                </button>
                <button className="w-10 h-10 shrink-0 bg-white/5 hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg flex items-center justify-center transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 shrink-0 bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg flex items-center justify-center transition-colors" title="Delete">
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
      <div className="mt-4 glass-card border-2 border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-xl font-bold text-white mb-2">Drag & drop files here</h3>
        <p className="text-gray-400 text-sm mb-6 max-w-md">or click to browse from your computer. We support secure, encrypted uploads for all your legal documents.</p>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 25MB)</p>
      </div>
    </div>
  );
};

export default Documents;