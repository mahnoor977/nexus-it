import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function ReportBlockMenu({ targetUserId, contentType, contentId, currentUserId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUserId || currentUserId === targetUserId) return null;

  async function handleBlock() {
    const confirmed = window.confirm('Block this person? They won\'t be able to message you.');
    if (!confirmed) return;

    await supabase.from('blocks').insert({ blocker_id: currentUserId, blocked_id: targetUserId });
    setOpen(false);
    alert('User blocked.');
  }

  async function handleSubmitReport() {
    if (!reason.trim()) return;
    setSubmitting(true);

    await supabase.from('reports').insert({
      reporter_id: currentUserId,
      reported_user_id: targetUserId,
      content_type: contentType,
      content_id: contentId || null,
      reason: reason.trim(),
    });

    setSubmitting(false);
    setDone(true);
    setTimeout(() => {
      setShowReportModal(false);
      setDone(false);
      setReason('');
    }, 1500);
  }

  return (
    <>
      <div className="report-block-menu" ref={wrapRef}>
        <button className="report-block-trigger" onClick={() => setOpen(!open)}>
          <i className="ti ti-dots"></i>
        </button>
        {open && (
          <div className="report-block-dropdown">
            <button
              className="report-block-item"
              onClick={() => { setOpen(false); setShowReportModal(true); }}
            >
              Report
            </button>
            <button className="report-block-item danger" onClick={handleBlock}>
              Block user
            </button>
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            {done ? (
              <p>Report submitted. Thank you.</p>
            ) : (
              <>
                <h3 style={{ fontSize: '17px', marginBottom: '10px' }}>Report content</h3>
                <textarea
                  className="form-textarea"
                  placeholder="What's wrong with this?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ marginBottom: '14px' }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="btn" onClick={() => setShowReportModal(false)}>Cancel</button>
                  <button className="btn btn-solid" onClick={handleSubmitReport} disabled={submitting || !reason.trim()}>
                    {submitting ? 'Submitting…' : 'Submit report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}