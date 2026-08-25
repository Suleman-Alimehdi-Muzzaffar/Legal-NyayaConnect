import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Filter,
  LayoutGrid,
  List,
  MessageSquare,
  CalendarPlus,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  X,
  Clock,
  IndianRupee
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useListLawyerClients,
  useCreateLawyerClient,
  useCreateLawyerAppointment,
  getListLawyerClientsQueryKey,
  getListLawyerAppointmentsQueryKey,
  type Client,
  type ClientStatus,
  type LawyerAppointmentStatus,
} from '@workspace/api-client-react';
import FormSelect from '@/components/forms/FormSelect';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';

const EMPTY_ADD_FORM = {
  name: '',
  email: '',
  phone: '',
  city: '',
  caseType: '',
  status: 'pending' as ClientStatus,
  notes: '',
};

const EMPTY_BOOK_FORM = {
  date: new Date().toISOString().slice(0, 10),
  time: '10:00',
  duration: '45',
  mode: 'online',
  fee: '1500',
  isPaid: false,
  notes: '',
};

const to12Hour = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

const Clients = () => {
  const { data: clients } = useListLawyerClients();
  const lawyerClients = clients ?? [];
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [detailsClient, setDetailsClient] = useState<Client | null>(null);
  const [bookClient, setBookClient] = useState<Client | null>(null);
  const [bookForm, setBookForm] = useState(EMPTY_BOOK_FORM);

  const createClientMutation = useCreateLawyerClient({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLawyerClientsQueryKey() });
        toast.success('Client added successfully');
        setAddForm(EMPTY_ADD_FORM);
        setIsAddOpen(false);
      },
      onError: () => toast.error('Failed to add client'),
    },
  });

  const createAppointmentMutation = useCreateLawyerAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLawyerAppointmentsQueryKey() });
        toast.success('Appointment booked successfully');
        setBookForm(EMPTY_BOOK_FORM);
        setBookClient(null);
      },
      onError: () => toast.error('Failed to book appointment'),
    },
  });

  const caseTypes = ['all', ...Array.from(new Set(lawyerClients.map(c => c.caseType)))];

  const filteredClients = lawyerClients.filter(c => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (caseTypeFilter !== 'all' && c.caseType !== caseTypeFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold border border-green-500/30 uppercase tracking-wider">Active</span>;
      case 'closed': return <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-xs font-bold border border-gray-500/30 uppercase tracking-wider">Closed</span>;
      case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500/30 uppercase tracking-wider">Pending</span>;
      default: return null;
    }
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate({
      data: {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        city: addForm.city.trim(),
        caseType: addForm.caseType.trim(),
        status: addForm.status,
        notes: addForm.notes.trim(),
        lastContact: new Date().toISOString().slice(0, 10),
      },
    });
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookClient) return;
    createAppointmentMutation.mutate({
      data: {
        clientName: bookClient.name,
        clientInitials: bookClient.initials,
        clientGradient: bookClient.gradient,
        caseType: bookClient.caseType,
        date: bookForm.date,
        time: to12Hour(bookForm.time),
        duration: Number(bookForm.duration),
        mode: bookForm.mode as 'online' | 'offline',
        status: 'upcoming' as LawyerAppointmentStatus,
        fee: Number(bookForm.fee),
        isPaid: bookForm.isPaid,
        notes: bookForm.notes.trim(),
      },
    });
  };

  const openBook = (client: Client) => {
    setBookClient(client);
    setBookForm(EMPTY_BOOK_FORM);
  };

  const openMessage = (client: Client) => {
    navigate(`/lawyer-dashboard/messages?client=${encodeURIComponent(client.email)}`);
  };

  const closeModals = () => {
    setIsAddOpen(false);
    setDetailsClient(null);
    setBookClient(null);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold">My Clients</h2>
        <button onClick={() => setIsAddOpen(true)} className="bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] font-bold px-6 py-2.5 rounded-xl transition-all inline-flex items-center justify-center gap-2 w-full md:w-auto">
          <UserPlus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-white/10 text-center">
          <div className="text-2xl font-serif font-bold text-white">{lawyerClients.length}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Clients</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
          <div className="text-2xl font-serif font-bold text-green-400">{lawyerClients.filter(c => c.status === 'active').length}</div>
          <div className="text-xs text-green-400/80 uppercase tracking-wider mt-1">Active Cases</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/10 text-center">
          <div className="text-2xl font-serif font-bold text-gray-400">{lawyerClients.filter(c => c.status === 'closed').length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Closed</div>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search clients by name..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-[#D4AF37]/50 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <FormSelect
            label="" name="status" icon={Filter}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Active", value: "active" },
              { label: "Pending", value: "pending" },
              { label: "Closed", value: "closed" }
            ]}
            className="w-full sm:w-40 !gap-0"
          />
          <FormSelect
            label="" name="casetype" icon={Filter}
            value={caseTypeFilter} onChange={e => setCaseTypeFilter(e.target.value)}
            options={caseTypes.map(c => ({ label: c === 'all' ? 'All Types' : c, value: c }))}
            className="w-full sm:w-48 !gap-0"
          />
          <div className="flex items-center gap-1 bg-white/5 rounded-xl border border-white/10 p-1 shrink-0">
            <button 
              onClick={() => setViewMode('card')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'card' ? "bg-[#D4AF37] text-[#102542]" : "text-gray-400 hover:text-white")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'table' ? "bg-[#D4AF37] text-[#102542]" : "text-gray-400 hover:text-white")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Clients List */}
      {viewMode === 'card' ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredClients.map(client => (
              <motion.div key={client.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.9 }} className="glass-card rounded-2xl p-5 border border-white/10 hover:border-[#D4AF37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all group flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold text-white shadow-inner bg-gradient-to-br", client.gradient)}>
                      {client.initials}
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">{client.name}</h4>
                      <div className="text-xs font-medium text-[#D4AF37] border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-2 py-0.5 rounded inline-block mt-1">
                        {client.caseType}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(client.status)}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400"><MapPin className="w-3.5 h-3.5" /> {client.city}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400"><Phone className="w-3.5 h-3.5" /> {client.phone}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 truncate"><Mail className="w-3.5 h-3.5" /> {client.email}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2 py-3 border-y border-white/5">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Last Contact</div>
                    <div className="text-sm font-medium text-gray-300 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" /> {new Date(client.lastContact).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Amount Paid</div>
                    <div className="text-sm font-bold text-[#D4AF37]">₹{client.amountPaid}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setDetailsClient(client)} className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <Eye className="w-4 h-4" /> Details
                  </button>
                  <button onClick={() => openMessage(client)} className="flex-1 bg-transparent border border-white/20 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                  <button onClick={() => openBook(client)} className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <CalendarPlus className="w-4 h-4" /> Book
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Case Type</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sessions</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount Paid</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Contact</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, i) => (
                <tr key={client.id} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors", i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]")}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold text-white shadow-inner bg-gradient-to-br", client.gradient)}>
                        {client.initials}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-white text-sm">{client.name}</div>
                        <div className="text-xs text-gray-400">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{client.caseType}</td>
                  <td className="p-4">{getStatusBadge(client.status)}</td>
                  <td className="p-4 text-sm text-gray-300">{client.totalSessions}</td>
                  <td className="p-4 text-sm font-bold text-[#D4AF37]">₹{client.amountPaid}</td>
                  <td className="p-4 text-sm text-gray-300">{new Date(client.lastContact).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openMessage(client)} className="p-2 bg-white/5 hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] rounded-lg transition-colors" title="Message"><MessageSquare className="w-4 h-4" /></button>
                      <button onClick={() => openBook(client)} className="p-2 bg-white/5 hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] rounded-lg transition-colors" title="Book"><CalendarPlus className="w-4 h-4" /></button>
                      <button onClick={() => setDetailsClient(client)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors" title="Details"><Eye className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-gray-400">No clients match your filters.</div>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-[#102542] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-[0_0_60px_rgba(212,175,55,0.15)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Add New Client</h3>
                  <div className="text-xs text-gray-400 mt-0.5">Add a client to your case list</div>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddClient} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Full Name" name="name" required value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="e.g. Client Name" className="sm:col-span-2" />
                  <FormInput label="Email" name="email" type="email" required value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} placeholder="client@email.com" />
                  <FormInput label="Phone" name="phone" required value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} placeholder="+91 98765 00000" />
                  <FormInput label="City" name="city" required value={addForm.city} onChange={e => setAddForm({ ...addForm, city: e.target.value })} placeholder="e.g. Delhi" />
                  <FormInput label="Case Type" name="caseType" required value={addForm.caseType} onChange={e => setAddForm({ ...addForm, caseType: e.target.value })} placeholder="e.g. Divorce" />
                  <FormSelect
                    label="Status" name="status" required
                    value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value as ClientStatus })}
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Pending", value: "pending" },
                      { label: "Closed", value: "closed" },
                    ]}
                  />
                  <FormTextarea
                    label="Notes" name="notes" rows={3}
                    value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                    placeholder="Case notes, next steps..."
                    className="sm:col-span-2"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={createClientMutation.isPending}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <UserPlus className="w-4 h-4" /> {createClientMutation.isPending ? 'Adding...' : 'Add Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Details Modal */}
      <AnimatePresence>
        {detailsClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailsClient(null)}
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
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-serif text-lg font-bold text-white shadow-inner bg-gradient-to-br", detailsClient.gradient)}>
                    {detailsClient.initials}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">{detailsClient.name}</h3>
                    <div className="text-xs text-[#D4AF37] mt-0.5 font-medium">{detailsClient.caseType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(detailsClient.status)}
                  <button onClick={() => setDetailsClient(null)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">City</span>
                  <span className="font-semibold text-white flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {detailsClient.city}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Phone</span>
                  <span className="font-semibold text-white">{detailsClient.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Email</span>
                  <span className="font-semibold text-white">{detailsClient.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Total Sessions</span>
                  <span className="font-semibold text-white">{detailsClient.totalSessions}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Amount Paid</span>
                  <span className="font-semibold text-[#D4AF37]">₹{detailsClient.amountPaid}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Last Contact</span>
                  <span className="font-semibold text-white">{new Date(detailsClient.lastContact).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {detailsClient.nextAppointment && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Next Appointment</span>
                    <span className="font-semibold text-[#D4AF37]">{detailsClient.nextAppointment}</span>
                  </div>
                )}
                <div className="py-2">
                  <div className="text-gray-400 mb-1.5">Notes</div>
                  <p className="text-white/90 bg-white/5 border border-white/10 rounded-xl p-3">{detailsClient.notes || 'No notes yet.'}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { const c = detailsClient; setDetailsClient(null); openBook(c); }}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" /> Book Appointment
                </button>
                <button
                  onClick={() => setDetailsClient(null)}
                  className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {bookClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookClient(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
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
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-serif text-lg font-bold text-white shadow-inner bg-gradient-to-br", bookClient.gradient)}>
                    {bookClient.initials}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">Book Appointment</h3>
                    <div className="text-xs text-gray-400 mt-0.5">{bookClient.name} · {bookClient.caseType}</div>
                  </div>
                </div>
                <button onClick={() => setBookClient(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Date" name="date" type="date" required value={bookForm.date} onChange={e => setBookForm({ ...bookForm, date: e.target.value })} />
                  <FormInput label="Time" name="time" type="time" required value={bookForm.time} onChange={e => setBookForm({ ...bookForm, time: e.target.value })} />
                  <FormSelect
                    label="Duration" name="duration" required
                    value={bookForm.duration} onChange={e => setBookForm({ ...bookForm, duration: e.target.value })}
                    options={[
                      { label: "30 minutes", value: "30" },
                      { label: "45 minutes", value: "45" },
                      { label: "60 minutes", value: "60" },
                    ]}
                  />
                  <FormSelect
                    label="Mode" name="mode" required
                    value={bookForm.mode} onChange={e => setBookForm({ ...bookForm, mode: e.target.value })}
                    options={[
                      { label: "Online", value: "online" },
                      { label: "Offline", value: "offline" },
                    ]}
                  />
                  <FormInput label="Consultation Fee (₹)" name="fee" type="number" required value={bookForm.fee} onChange={e => setBookForm({ ...bookForm, fee: e.target.value })} />
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={bookForm.isPaid}
                        onChange={e => setBookForm({ ...bookForm, isPaid: e.target.checked })}
                        className="w-4 h-4 accent-[#D4AF37]"
                      />
                      <span className="text-sm text-gray-300 font-sans">Payment received</span>
                    </label>
                  </div>
                  <FormTextarea
                    label="Notes" name="notes" rows={2}
                    value={bookForm.notes} onChange={e => setBookForm({ ...bookForm, notes: e.target.value })}
                    placeholder="Optional notes for this session..."
                    className="sm:col-span-2"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={createAppointmentMutation.isPending}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <CalendarPlus className="w-4 h-4" /> {createAppointmentMutation.isPending ? 'Booking...' : 'Book Appointment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookClient(null)}
                    className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clients;
