import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaBan, FaCog, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AdminAdvertisements.css';

const API = 'http://localhost:3000';
const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

const StatusBadge = ({ status }) => {
    const map = {
        pending:   { label: 'Pending Review', cls: 'badge-pending' },
        approved:  { label: 'Approved',       cls: 'badge-approved' },
        rejected:  { label: 'Rejected',       cls: 'badge-rejected' },
        cancelled: { label: 'Cancelled',      cls: 'badge-cancelled' },
    };
    const s = map[status] || { label: status, cls: '' };
    return <span className={`ad-status-badge ${s.cls}`}>{s.label}</span>;
};

export default function AdminAdvertisements() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [limit, setLimit] = useState(5);
    const [limitInput, setLimitInput] = useState(5);
    const [limitSaving, setLimitSaving] = useState(false);
    const [rejectModal, setRejectModal] = useState(null); // { ad_id, title }
    const [rejectNote, setRejectNote]   = useState('');
    const [expandedId, setExpandedId]   = useState(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const token = () => localStorage.getItem('token');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [adsRes, settingsRes] = await Promise.all([
                fetch(`${API}/api/admin/advertisements`, { headers: { Authorization: `Bearer ${token()}` } }),
                fetch(`${API}/api/admin/ad-settings`,    { headers: { Authorization: `Bearer ${token()}` } }),
            ]);
            if (adsRes.ok)      setAds(await adsRes.json());
            if (settingsRes.ok) {
                const s = await settingsRes.json();
                setLimit(s.max_display_limit);
                setLimitInput(s.max_display_limit);
            }
        } catch (err) {
            console.error('Failed to load ad data:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveLimit = async () => {
        setLimitSaving(true);
        try {
            const res = await fetch(`${API}/api/admin/ad-settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ max_display_limit: parseInt(limitInput) }),
            });
            if (res.ok) { setLimit(parseInt(limitInput)); alert('Display limit saved.'); }
        } catch { alert('Failed to save limit.'); }
        finally { setLimitSaving(false); }
    };

    const handleApprove = async (id) => {
        const res = await fetch(`${API}/api/admin/advertisements/${id}/approve`, {
            method: 'PATCH', headers: { Authorization: `Bearer ${token()}` },
        });
        if (res.ok) fetchAll();
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        const res = await fetch(`${API}/api/admin/advertisements/${rejectModal.id}/reject`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({ note: rejectNote }),
        });
        if (res.ok) { setRejectModal(null); setRejectNote(''); fetchAll(); }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Remove this ad from the carousel?')) return;
        const res = await fetch(`${API}/api/admin/advertisements/${id}/cancel`, {
            method: 'PATCH', headers: { Authorization: `Bearer ${token()}` },
        });
        if (res.ok) fetchAll();
    };

    const filtered = filter === 'all' ? ads : ads.filter(a => a.status === filter);
    const pendingCount = ads.filter(a => a.status === 'pending').length;
    const approvedCount = ads.filter(a => a.status === 'approved' && a.is_active).length;

    if (loading) return <LoadingSpinner message="Loading Advertisements..." />;

    return (
        <div className="admin-ads-page">

            {/* Settings Header */}
            <div className="admin-ads-settings-bar">
                <div className="ads-settings-left">
                    <div className="ads-settings-icon"><FaCog /></div>
                    <div>
                        <div className="ads-settings-title">Carousel Slot Limit</div>
                        <div className="ads-settings-desc">
                            Max approved ads shown on homepage. Currently showing <strong>{approvedCount}</strong> of <strong>{limit}</strong> slots.
                        </div>
                    </div>
                </div>
                <div className="ads-settings-right">
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={limitInput}
                        onChange={e => setLimitInput(e.target.value)}
                        className="ads-limit-input"
                    />
                    <button className="ads-limit-save-btn" onClick={saveLimit} disabled={limitSaving}>
                        {limitSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Summary chips */}
            <div className="ads-summary-chips">
                <div className="ads-chip ads-chip--total">{ads.length} Total Requests</div>
                <div className="ads-chip ads-chip--pending">{pendingCount} Pending Review</div>
                <div className="ads-chip ads-chip--approved">{approvedCount} Live on Carousel</div>
            </div>

            {/* Filter tabs */}
            <div className="ads-filter-tabs">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f}
                        className={`ads-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'pending' && pendingCount > 0 && (
                            <span className="filter-count">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Ads Table */}
            {filtered.length === 0 ? (
                <div className="ads-empty">No advertisements in this category.</div>
            ) : (
                <div className="ads-table-wrap">
                    <table className="ads-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Ad Title</th>
                                <th>Seller</th>
                                <th>Budget</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(ad => (
                                <React.Fragment key={ad.ad_id}>
                                    <tr
                                        className={`ads-row ${expandedId === ad.ad_id ? 'expanded' : ''}`}
                                        onClick={() => setExpandedId(expandedId === ad.ad_id ? null : ad.ad_id)}
                                    >
                                        <td>
                                            <div className="ads-product-cell">
                                                <div className="ads-gradient-swatch" style={{ background: ad.gradient }} />
                                                <img src={ad.product_image} alt={ad.product_name} className="ads-product-img" />
                                                <span className="ads-product-name">{ad.product_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ads-title-cell">
                                                <strong>{ad.title}</strong>
                                                {ad.tagline && <span className="ads-tagline-text">{ad.tagline}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ads-seller-cell">
                                                <div>{ad.company_name}</div>
                                                <div className="ads-seller-email">{ad.seller_email}</div>
                                            </div>
                                        </td>
                                        <td className="ads-budget">৳ {ad.budget}</td>
                                        <td>{ad.duration_days}d</td>
                                        <td>
                                            <StatusBadge status={ad.status} />
                                            {ad.admin_note && (
                                                <div className="ads-admin-note">Note: {ad.admin_note}</div>
                                            )}
                                        </td>
                                        <td className="ads-date">
                                            {new Date(ad.created_at).toLocaleDateString('en-BD')}
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <div className="ads-actions">
                                                {ad.status === 'pending' && (
                                                    <>
                                                        <button className="ads-btn ads-btn--approve" onClick={() => handleApprove(ad.ad_id)} title="Approve">
                                                            <FaCheck /> Approve
                                                        </button>
                                                        <button className="ads-btn ads-btn--reject" onClick={() => { setRejectModal({ id: ad.ad_id, title: ad.title }); setRejectNote(''); }} title="Reject">
                                                            <FaTimes /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {ad.status === 'approved' && ad.is_active && (
                                                    <button className="ads-btn ads-btn--cancel" onClick={() => handleCancel(ad.ad_id)} title="Remove from carousel">
                                                        <FaBan /> Remove
                                                    </button>
                                                )}
                                                <button
                                                    className="ads-btn ads-btn--preview"
                                                    onClick={() => window.open(`/ad/${ad.ad_id}`, '_blank')}
                                                    title="Preview ad"
                                                >
                                                    Preview
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === ad.ad_id && (
                                        <tr className="ads-expanded-row">
                                            <td colSpan={8}>
                                                <div className="ads-expanded-content">
                                                    <div className="ads-expanded-left">
                                                        <div className="ads-preview-banner" style={{ background: ad.gradient }}>
                                                            <img src={ad.product_image} alt={ad.product_name} />
                                                            <div className="ads-preview-overlay">
                                                                <strong>{ad.title}</strong>
                                                                {ad.tagline && <span>{ad.tagline}</span>}
                                                                <em>৳ {ad.price}</em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ads-expanded-right">
                                                        <div className="ads-info-grid">
                                                            <div><span>Product</span><strong>{ad.product_name}</strong></div>
                                                            <div><span>Price</span><strong>৳ {ad.price}</strong></div>
                                                            <div><span>Seller</span><strong>{ad.seller_name}</strong></div>
                                                            <div><span>Company</span><strong>{ad.company_name}</strong></div>
                                                            <div><span>Budget</span><strong>৳ {ad.budget}</strong></div>
                                                            <div><span>Duration</span><strong>{ad.duration_days} days</strong></div>
                                                            <div><span>Expires</span><strong>{ad.expires_at ? new Date(ad.expires_at).toLocaleDateString('en-BD') : 'No expiry'}</strong></div>
                                                            <div><span>Status</span><StatusBadge status={ad.status} /></div>
                                                        </div>
                                                        {ad.admin_note && (
                                                            <div className="ads-expanded-note">
                                                                <strong>Admin Note:</strong> {ad.admin_note}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="ads-modal-backdrop">
                    <div className="ads-modal">
                        <h3>Reject Advertisement</h3>
                        <p className="ads-modal-subtitle">"{rejectModal.title}"</p>
                        <div className="form-group">
                            <label>Reason for rejection (optional)</label>
                            <textarea
                                rows={3}
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="e.g. Product description is misleading..."
                            />
                        </div>
                        <div className="ads-modal-actions">
                            <button className="ads-btn ads-btn--reject" onClick={handleReject}>Confirm Rejection</button>
                            <button className="ads-btn ads-btn--preview" onClick={() => setRejectModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
