import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, FileText, User, ShieldAlert } from 'lucide-react';
import { getEkycSessionDetail, approveEkycSession, rejectEkycSession, retryEkycSession, addEkycNote } from '../../features/ekyc/ekyc.api';
import type { EkycSessionDetail } from '../../features/ekyc/ekyc.types';
import { useAuthStore } from '../../store/authStore';
import { trackInternalEvent } from '../../lib/analytics';

export const EkycDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupport = user?.roles?.includes('SUPPORT_STAFF');

  const [detail, setDetail] = useState<EkycSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [actionReason, setActionReason] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      if (id) {
        const data = await getEkycSessionDetail(id);
        setDetail(data);
        trackInternalEvent({
          eventName: 'ekyc_detail_loaded',
          page: `/ekyc-review/${id}`,
          feature: 'ekyc_review',
          payload: { sessionId: id, status: data.session.status },
        });
      }
    } catch (error) {
      console.error('Failed to fetch detail', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!id || !confirm('Are you sure you want to approve this eKYC session?')) return;
    try {
      setActionLoading(true);
      await approveEkycSession(id, noteInput);
      trackInternalEvent({
        eventName: 'ekyc_approved',
        page: `/ekyc-review/${id}`,
        feature: 'ekyc_review',
        payload: { sessionId: id },
      });
      await fetchDetail();
      setNoteInput('');
    } catch (error) {
      alert('Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !actionReason) return alert('Reason is required for rejection');
    try {
      setActionLoading(true);
      await rejectEkycSession(id, actionReason, noteInput);
      trackInternalEvent({
        eventName: 'ekyc_rejected',
        page: `/ekyc-review/${id}`,
        feature: 'ekyc_review',
        payload: { sessionId: id, reason: actionReason },
      });
      await fetchDetail();
      setNoteInput('');
      setActionReason('');
    } catch (error) {
      alert('Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!id || !actionReason) return alert('Reason is required for retry');
    try {
      setActionLoading(true);
      await retryEkycSession(id, actionReason, noteInput);
      trackInternalEvent({
        eventName: 'ekyc_retry_requested',
        page: `/ekyc-review/${id}`,
        feature: 'ekyc_review',
        payload: { sessionId: id, reason: actionReason },
      });
      await fetchDetail();
      setNoteInput('');
      setActionReason('');
    } catch (error) {
      alert('Failed to request retry');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!id || !noteInput) return;
    try {
      setActionLoading(true);
      await addEkycNote(id, noteInput);
      trackInternalEvent({
        eventName: 'ekyc_note_added',
        page: `/ekyc-review/${id}`,
        feature: 'ekyc_review',
        payload: { sessionId: id, noteLength: noteInput.length },
      });
      await fetchDetail();
      setNoteInput('');
    } catch (error) {
      alert('Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !detail) {
    return (
      <div className="p-6 flex justify-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { session, user: sessionUser, ocr, warnings, tamperingFindings, livenessCard, faceLiveness, faceCompare, mask } = detail;
  const isTerminal = session.status === 'VERIFIED' || session.status === 'REJECTED' || session.status === 'RETRY_REQUIRED';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/ekyc-review')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review eKYC Session</h1>
          <p className="text-slate-500 text-sm mt-1">Session ID: {session.id}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            session.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
            session.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {session.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data points */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Info */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-500" /> Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Full Name</p>
                <p className="font-medium">{sessionUser.profile?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <p className="font-medium">{sessionUser.email}</p>
              </div>
            </div>
          </div>

          {/* OCR Extracted Data */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-500" /> OCR Data
            </h2>
            {ocr ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {ocr.fields.map(f => (
                  <div key={f.fieldName} className="border-b border-slate-100 pb-2">
                    <p className="text-slate-500 mb-1 capitalize">{f.fieldName.replace(/_/g, ' ')}</p>
                    <p className={`font-medium ${f.fieldValue === '*** Masked ***' ? 'text-orange-500 italic' : ''}`}>
                      {f.fieldValue}
                    </p>
                    <p className="text-xs text-slate-400">Confidence: {(f.probability * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No OCR data available.</p>
            )}
          </div>

          {/* AI Warnings & Findings */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-blue-500" /> AI Findings
            </h2>
            <div className="space-y-4">
              {/* Warnings */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Quality Warnings ({warnings.length})</h3>
                {warnings.length === 0 ? <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> No warnings</p> : (
                  <ul className="space-y-2">
                    {warnings.map((w, i) => (
                      <li key={i} className="text-sm text-orange-700 bg-orange-50 p-2 rounded flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{w.msg} <span className="opacity-50">({w.code})</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Tampering */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Tampering Detection ({tamperingFindings.length})</h3>
                {tamperingFindings.length === 0 ? <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> No tampering detected</p> : (
                  <ul className="space-y-2">
                    {tamperingFindings.map((t, i) => (
                      <li key={i} className="text-sm text-red-700 bg-red-50 p-2 rounded flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{t.msg} <span className="opacity-50">({t.code})</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Compare & Liveness */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Face Match</p>
                  <p className="font-medium">{faceCompare ? `${faceCompare.msg} (${(faceCompare.prob * 100).toFixed(1)}%)` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Face Liveness</p>
                  <p className="font-medium">{faceLiveness ? faceLiveness.livenessMsg : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Card Liveness</p>
                  <p className="font-medium">{livenessCard ? livenessCard.livenessMsg : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Mask Detected</p>
                  <p className="font-medium">{mask ? mask.masked : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Logs */}
        <div className="space-y-6">
          {/* Action Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Manual Action</h2>
            {isSupport ? (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                Support Staff can only request Retry or add notes. Full approval/rejection requires Admin role.
              </div>
            ) : null}

            {!isTerminal && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Action Reason (Required for Retry/Reject)</label>
                  <select 
                    className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                  >
                    <option value="">Select a reason...</option>
                    <option value="Image too blurry">Image too blurry</option>
                    <option value="Document expired">Document expired</option>
                    <option value="Suspected tampering">Suspected tampering</option>
                    <option value="Face mismatch">Face mismatch</option>
                    <option value="Information mismatch">Information mismatch</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Internal Note (Optional)</label>
                  <textarea 
                    className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                    rows={2}
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Add a note..."
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {!isSupport && (
                    <button 
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      Approve Session
                    </button>
                  )}
                  <button 
                    onClick={handleRetry}
                    disabled={actionLoading || !actionReason}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    Request Retry
                  </button>
                  {!isSupport && (
                    <button 
                      onClick={handleReject}
                      disabled={actionLoading || !actionReason}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      Reject Session
                    </button>
                  )}
                  {isSupport && (
                     <button 
                     onClick={handleAddNote}
                     disabled={actionLoading || !noteInput}
                     className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                   >
                     Add Note Only
                   </button>
                  )}
                </div>
              </div>
            )}
            {isTerminal && (
              <div className="mt-4">
                <p className="text-sm text-slate-500 italic">This session has been {session.status.toLowerCase()}. No further actions can be taken.</p>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Internal Notes</h2>
            {detail.internalNotes.length === 0 ? (
              <p className="text-sm text-slate-500">No notes added.</p>
            ) : (
              <div className="space-y-4">
                {detail.internalNotes.map(n => (
                  <div key={n.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">{n.author} • {new Date(n.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-slate-700">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Decision Logs */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Decision History</h2>
            <div className="space-y-4">
              {detail.decisionLogs.map(log => (
                <div key={log.id} className="text-sm border-l-2 border-slate-200 pl-3">
                  <p className="font-medium text-slate-700">{log.decision}</p>
                  <p className="text-slate-500 text-xs mt-1">{log.reason}</p>
                  <p className="text-slate-400 text-xs mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
