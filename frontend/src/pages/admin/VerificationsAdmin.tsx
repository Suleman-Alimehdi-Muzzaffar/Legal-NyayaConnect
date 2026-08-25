import React, { useState } from 'react';
import { Scale, ShieldCheck, ShieldX, CheckCircle2, XCircle, Loader2, KeyRound, FileText, Image as ImageIcon, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useListVerifications, useReviewVerification, ApiError } from '@workspace/api-client-react';
import type { VerificationStatus, VerificationFile } from '@workspace/api-client-react';

const ADMIN_KEY_STORAGE = 'nyayaconnect.adminKey';

const fileUrl = (file: VerificationFile) => `/api/verification/files/${encodeURIComponent(file.fileName)}`;

const StatusBadge = ({ status }: { status: string }) => {
  const styles =
    status === 'approved'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : status === 'rejected'
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  const label = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
  return (
    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${styles}`}>
      {label}
    </span>
  );
};

const VerificationsAdmin = () => {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) ?? '');
  const [keyInput, setKeyInput] = useState(adminKey);
  const [keyError, setKeyError] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const headers = adminKey ? { 'x-admin-key': adminKey } : undefined;

  const {
    data: verifications,
    isLoading,
    error,
    refetch,
  } = useListVerifications({
    request: { headers },
    query: { queryKey: ['admin-verifications', adminKey || '(no key)'] },
  });

  const reviewMutation = useReviewVerification({ request: { headers } });

  const review = async (id: string, status: 'approved' | 'rejected') => {
    setReviewingId(id);
    try {
      await reviewMutation.mutateAsync({ id, data: { status, note: notes[id] ?? '' } });
      await refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem(ADMIN_KEY_STORAGE);
        setAdminKey('');
        setKeyError('The admin key is invalid. Please re-enter it.');
      }
    } finally {
      setReviewingId(null);
    }
  };

  const saveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setKeyError('Please enter the admin key.');
      return;
    }
    localStorage.setItem(ADMIN_KEY_STORAGE, trimmed);
    setAdminKey(trimmed);
    setKeyError('');
  };

  const isNotConfigured = error instanceof ApiError && error.status === 503;
  const isUnauthorized = error instanceof ApiError && error.status === 401;

  React.useEffect(() => {
    if (isUnauthorized && adminKey) {
      localStorage.removeItem(ADMIN_KEY_STORAGE);
      setAdminKey('');
      setKeyInput('');
      setKeyError('The admin key is invalid. Please enter the correct key.');
    }
  }, [isUnauthorized, adminKey]);

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#102542] text-white font-sans flex flex-col">
        <header className="h-16 bg-[#0a1929] border-b border-white/10 flex items-center px-6 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="w-7 h-7 text-[#D4AF37]" />
            <span className="font-serif text-xl font-bold">Nyaya<span className="text-[#D4AF37]">Connect</span></span>
          </Link>
          <span className="ml-4 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">Admin Review</span>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#0a1929] border border-[#D4AF37]/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-6">
              <KeyRound className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-2">Admin Access</h1>
            <p className="text-sm text-gray-400 mb-6">
              Enter the admin key to review lawyer verification submissions. Set <code className="text-[#D4AF37]">ADMIN_KEY</code> in backend/.env on the server.
            </p>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveKey()}
              placeholder="Admin key"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 mb-4"
            />
            {keyError && (
              <p className="text-xs text-red-400 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {keyError}
              </p>
            )}
            <button
              onClick={saveKey}
              className="w-full bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-3 rounded-xl transition-all"
            >
              Unlock Review Panel
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#102542] text-white font-sans flex flex-col">
      <header className="h-16 bg-[#0a1929] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="w-7 h-7 text-[#D4AF37]" />
            <span className="font-serif text-xl font-bold">Nyaya<span className="text-[#D4AF37]">Connect</span></span>
          </Link>
          <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider hidden sm:inline">Admin Review</span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/admin/verifications" className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] font-semibold transition-colors">
              Verifications
            </Link>
            <Link to="/admin/data-exports" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              Data Exports
            </Link>
            <Link to="/admin/lawyer-archives" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              Lawyer ZIP Archive
            </Link>
          </nav>
          <button
            onClick={() => {
              localStorage.removeItem(ADMIN_KEY_STORAGE);
              setAdminKey('');
              setKeyInput('');
            }}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Lock & Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold mb-1">Lawyer Verification Requests</h1>
            <p className="text-gray-400 text-sm">
              Compare the selfie against the certificates, then approve or reject.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#D4AF37] border border-white/15 hover:border-[#D4AF37]/50 rounded-xl px-4 py-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {isNotConfigured && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Admin review is not configured on the server. Set <code>ADMIN_KEY</code> in backend/.env and restart the API server.</p>
          </div>
        )}
        {isUnauthorized && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>The admin key is invalid. Click "Lock & Sign Out" and re-enter the correct key.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading submissions…
          </div>
        )}

        {!isLoading && !error && (verifications ?? []).length === 0 && (
          <div className="text-center py-24 text-gray-400 border border-dashed border-white/15 rounded-2xl">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-[#D4AF37]/50" />
            No verification submissions yet.
          </div>
        )}

        {!isLoading && !error && (verifications ?? []).map((v: VerificationStatus) => (
          <div key={v.id} className="bg-[#0a1929] border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-xl font-bold">{v.name}</h2>
                  <StatusBadge status={v.status} />
                </div>
                <p className="text-sm text-gray-400 mt-1">{v.email} · BCI: {v.bciNumber}</p>
                <p className="text-xs text-gray-500 mt-0.5">Submitted {new Date(v.submittedAt).toLocaleString()}</p>
              </div>
              {v.status === 'approved' && <span className="text-green-400 text-sm flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Approved {v.reviewedAt ? `· ${new Date(v.reviewedAt).toLocaleString()}` : ''}</span>}
              {v.status === 'rejected' && <span className="text-red-400 text-sm flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Rejected {v.reviewedAt ? `· ${new Date(v.reviewedAt).toLocaleString()}` : ''}</span>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> Selfie Holding Certificate
                </h3>
                {v.selfie && (
                  <a href={fileUrl(v.selfie)} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={fileUrl(v.selfie)}
                      alt="Selfie holding certificate"
                      className="w-full max-h-72 object-contain rounded-xl border border-white/10 bg-[#102542] hover:border-[#D4AF37]/50 transition-colors"
                    />
                  </a>
                )}
                {!v.selfie && <p className="text-gray-500 text-sm">No selfie uploaded.</p>}
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" /> Submitted Documents
                </h3>
                <div className="flex flex-col gap-2">
                  {v.documents.map((file, idx) => (
                    <a
                      key={`${file.fileName}-${idx}`}
                      href={fileUrl(file)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 transition-colors"
                    >
                      <span className="text-sm text-gray-300 truncate">{file.name}</span>
                      <ExternalLink className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {v.status === 'pending' && (
              <div className="border-t border-white/10 pt-4">
                <textarea
                  value={notes[v.id] ?? ''}
                  onChange={(e) => setNotes(prev => ({ ...prev, [v.id]: e.target.value }))}
                  placeholder="Note for the lawyer (required for rejection, optional for approval)"
                  rows={2}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 mb-3 text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => review(v.id, 'approved')}
                    disabled={reviewingId === v.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {reviewingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => review(v.id, 'rejected')}
                    disabled={reviewingId === v.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {reviewingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default VerificationsAdmin;