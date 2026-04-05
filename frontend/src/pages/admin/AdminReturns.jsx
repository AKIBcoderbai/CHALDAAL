import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaBoxOpen } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AdminReturns.css';

const API = 'http://localhost:3000';

const REASON_LABELS = {
    damaged:         'Item Arrived Damaged',
    wrong_item:      'Wrong Item Received',
    not_as_described:'Not as Described',
    changed_mind:    'Changed My Mind',
    other:           'Other',
};

const CONDITION_LABELS = {
    unopened:      'Unopened / Sealed',
    opened_unused: 'Opened but Unused',
    used_once:     'Used Once',
    defective:     'Defective / Faulty',
};

const StatusBadge = ({ status }) => {
    const map = {
        pending:  { label: 'Pending Review', cls: 'ret-badge-pending' },
        approved: { label: 'Approved',       cls: 'ret-badge-approved' },
        rejected: { label: 'Rejected',       cls: 'ret-badge-rejected' },
    };
    const s = map[status] || { label: status, cls: '' };
    return <span className={`ret-status-badge ${s.cls}`}>{s.label}</span>;
};

export default function AdminReturns() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [expanded, setExpanded] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectNote, setRejectNote] = useState('');

    useEffect(() => { fetchReturns(); }, []);

    const token = () => localStorage.getItem('token');

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/returns`, { headers: { Authorization: `Bearer ${token()}` } });
            if (res.ok) setReturns(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this return request?')) return;
        const res = await fetch(`${API}/api/admin/returns/${id}/approve`, {
            method: 'PATCH', headers: { Authorization: `Bearer ${token()}` }
        });
        if (res.ok) fetchReturns();
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        const res = await fetch(`${API}/api/admin/returns/${rejectModal}/reject`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({ note: rejectNote })
        });
        if (res.ok) { setRejectModal(null); setRejectNote(''); fetchReturns(); }
    };

    const filtered = filter === 'all' ? returns : returns.filter(r => r.status === filter);
    const pendingCount = returns.filter(r => r.status === 'pending').length;

    if (loading) return <LoadingSpinner message="Loading Return Requests..." />;

    return (
        <div className="admin-ret-page">
            {}
            <div className="ret-summary-bar">
                <div className="ret-summary-card ret-summary-total">
                    <div className="ret-sum-num">{returns.length}</div>
                    <div className="ret-sum-label">Total Requests</div>
                </div>
                <div className="ret-summary-card ret-summary-pending">
                    <div className="ret-sum-num">{pendingCount}</div>
                    <div className="ret-sum-label">Awaiting Review</div>
                </div>
                <div className="ret-summary-card ret-summary-approved">
                    <div className="ret-sum-num">{returns.filter(r => r.status === 'approved').length}</div>
                    <div className="ret-sum-label">Approved</div>
                </div>
                <div className="ret-summary-card ret-summary-rejected">
                    <div className="ret-sum-num">{returns.filter(r => r.status === 'rejected').length}</div>
                    <div className="ret-sum-label">Rejected</div>
                </div>
            </div>

            {}
            <div className="ret-filter-tabs">
                {['pending', 'approved', 'rejected', 'all'].map(f => (
                    <button
                        key={f}
                        className={`ret-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'pending' && pendingCount > 0 && (
                            <span className="ret-filter-count">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="ret-empty">
                    <FaBoxOpen size={32} color="#ddd" />
                    <p>No return requests in this category.</p>
                </div>
            ) : (
                <div className="ret-list">
                    {filtered.map(r => {
                        const isOpen = expanded === r.return_id;
                        const items = Array.isArray(r.items) ? r.items.filter(i => i && i.name) : [];
                        const images = Array.isArray(r.images) ? r.images.filter(Boolean) : [];
                        return (
                            <div key={r.return_id} className={`ret-card ${isOpen ? 'open' : ''}`}>
                                {}
                                <div className="ret-card-header" onClick={() => setExpanded(isOpen ? null : r.return_id)}>
                                    <div className="ret-card-left">
                                        <div className="ret-order-id">Order #{r.order_id}</div>
                                        <div className="ret-customer">{r.customer_name} · {r.customer_email}</div>
                                        <div className="ret-reason-tag">{REASON_LABELS[r.reason] || r.reason}</div>
                                    </div>
                                    <div className="ret-card-mid">
                                        <div className="ret-items-preview">
                                            {items.slice(0, 2).map((item, idx) => (
                                                <span key={idx} className="ret-item-chip">{item.name}</span>
                                            ))}
                                            {items.length > 2 && <span className="ret-item-chip ret-item-more">+{items.length - 2} more</span>}
                                        </div>
                                    </div>
                                    <div className="ret-card-right">
                                        <StatusBadge status={r.status} />
                                        <div className="ret-date">{new Date(r.created_at).toLocaleDateString('en-BD')}</div>
                                    </div>
                                    <div className="ret-chevron">
                                        {isOpen ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
                                    </div>
                                </div>

                                {}
                                {isOpen && (
                                    <div className="ret-card-body">
                                        <div className="ret-details-grid">
                                            <div className="ret-detail-col">
                                                <h4>Return Details</h4>
                                                <div className="ret-detail-rows">
                                                    <div className="ret-detail-row">
                                                        <span>Reason</span>
                                                        <strong>{REASON_LABELS[r.reason] || r.reason}</strong>
                                                    </div>
                                                    <div className="ret-detail-row">
                                                        <span>Condition</span>
                                                        <strong>{CONDITION_LABELS[r.condition] || r.condition || 'Not specified'}</strong>
                                                    </div>
                                                    <div className="ret-detail-row">
                                                        <span>Submitted</span>
                                                        <strong>{new Date(r.created_at).toLocaleString('en-BD')}</strong>
                                                    </div>
                                                    {r.resolved_at && (
                                                        <div className="ret-detail-row">
                                                            <span>Resolved</span>
                                                            <strong>{new Date(r.resolved_at).toLocaleString('en-BD')}</strong>
                                                        </div>
                                                    )}
                                                    {r.admin_note && (
                                                        <div className="ret-detail-row">
                                                            <span>Admin Note</span>
                                                            <strong className="ret-admin-note">{r.admin_note}</strong>
                                                        </div>
                                                    )}
                                                </div>

                                                {r.description && (
                                                    <div className="ret-description">
                                                        <strong>Customer Note:</strong>
                                                        <p>{r.description}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ret-detail-col">
                                                <h4>Items to Return</h4>
                                                <div className="ret-items-list">
                                                    {items.map((item, idx) => (
                                                        <div key={idx} className="ret-item-row">
                                                            {item.image && <img src={item.image} alt={item.name} className="ret-item-img" />}
                                                            <div>
                                                                <div className="ret-item-name">{item.name}</div>
                                                                <div className="ret-item-qty">Qty: {item.quantity}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {images.length > 0 && (
                                                    <div className="ret-images-section">
                                                        <h4>Evidence Photos</h4>
                                                        <div className="ret-images-grid">
                                                            {images.map((url, idx) => (
                                                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                                                    <img src={url} alt={`Evidence ${idx + 1}`} className="ret-evidence-img" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {r.status === 'pending' && (
                                            <div className="ret-actions">
                                                <button className="ret-btn ret-btn--approve" onClick={() => handleApprove(r.return_id)}>
                                                    <FaCheck /> Approve Return
                                                </button>
                                                <button className="ret-btn ret-btn--reject" onClick={() => { setRejectModal(r.return_id); setRejectNote(''); }}>
                                                    <FaTimes /> Reject Return
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {}
            {rejectModal && (
                <div className="ret-modal-backdrop">
                    <div className="ret-modal">
                        <h3>Reject Return Request</h3>
                        <p className="ret-modal-sub">Provide a reason to inform the customer (optional).</p>
                        <div className="form-group">
                            <label>Rejection Reason</label>
                            <textarea
                                rows={3}
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="e.g. Item appears to have been used extensively..."
                            />
                        </div>
                        <div className="ret-modal-actions">
                            <button className="ret-btn ret-btn--reject" onClick={handleReject}>Confirm Rejection</button>
                            <button className="ret-btn ret-btn--cancel" onClick={() => setRejectModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
