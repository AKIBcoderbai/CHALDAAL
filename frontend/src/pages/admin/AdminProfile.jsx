import React, { useState, useEffect } from 'react';
import { FaUserShield, FaCamera, FaKey, FaEnvelope, FaPhone, FaSave } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import UploadOverlay from '../../components/UploadOverlay';
import PasswordInput from '../../components/PasswordInput';
import './AdminProfile.css';

const API = 'http://localhost:3000';

export default function AdminProfile({ user, onUpdateUser }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(user?.image_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        if (data.image_url) setAvatarUrl(data.image_url);
        setForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          phone: data.phone || prev.phone
        }));
      }
    } catch (err) {
      console.error('Failed to load admin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const token = localStorage.getItem('token');
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const uploadRes = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData
      });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        const newUrl = data.image_url;
        setAvatarUrl(newUrl);
        await fetch(`${API}/api/users/avatar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ image_url: newUrl })
        });
        if (onUpdateUser) onUpdateUser({ image_url: newUrl });
        alert('Profile photo updated!');
      } else {
        alert('Failed to upload image.');
      }
    } catch {
      alert('Upload failed. Server connection error.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    if (form.password && form.password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      setIsSaving(true);
      const res = await fetch(`${API}/api/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          password: form.password || undefined
        })
      });
      if (res.ok) {
        if (onUpdateUser) onUpdateUser({ name: form.name, phone: form.phone });
        setForm(prev => ({ ...prev, password: '' }));
        setConfirmPassword('');
        alert('Profile updated successfully!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update profile.');
      }
    } catch {
      alert('Server connection failed.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Admin Profile..." />;

  const displayName = profileData?.name || user?.name || 'Admin';
  const displayEmail = profileData?.email || user?.email || '';

  return (
    <div className="ap-page">
      <UploadOverlay isUploading={isUploading} />
      <div className="ap-hero">
        <div className="ap-avatar-wrap">
          <img
            src={avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
            alt="Admin Avatar"
            className="ap-avatar"
          />
          <label className="ap-avatar-edit" title="Change photo">
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </label>
        </div>
        <div className="ap-hero-info">
          <div className="ap-role-badge"><FaUserShield /> Administrator</div>
          <h2 className="ap-hero-name">{displayName}</h2>
          <p className="ap-hero-email"><FaEnvelope /> {displayEmail}</p>
        </div>
      </div>

      <div className="ap-grid">
        <div className="admin-card ap-card">
          <h3>Account Details</h3>
          <form onSubmit={handleSave} className="ap-form">
            <div className="ap-field">
              <label>Email Address</label>
              <input type="text" value={displayEmail} disabled className="ap-input ap-disabled" />
              <small>Email cannot be changed.</small>
            </div>

            <div className="ap-field">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="ap-input"
                required
              />
            </div>

            <div className="ap-field">
              <label><FaPhone style={{ marginRight: 6 }} />Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="ap-input"
                placeholder="e.g. 01700000000"
              />
            </div>

            <div className="ap-divider"><FaKey /> Change Password</div>

            <div className="ap-field">
              <PasswordInput
                label="New Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                confirm
                confirmValue={confirmPassword}
                onConfirmChange={e => setConfirmPassword(e.target.value)}
                optional
                minLength={8}
                placeholder="Leave blank to keep current"
              />
            </div>

            <button type="submit" className="ap-save-btn" disabled={isSaving}>
              <FaSave /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="admin-card ap-card ap-info-card">
          <h3>Admin Info</h3>
          <div className="ap-info-row">
            <span className="ap-info-label">Role</span>
            <span className="ap-info-value ap-role-tag">Administrator</span>
          </div>
          <div className="ap-info-row">
            <span className="ap-info-label">User ID</span>
            <span className="ap-info-value">#{profileData?.user_id || user?.user_id || '—'}</span>
          </div>
          <div className="ap-info-row">
            <span className="ap-info-label">Email</span>
            <span className="ap-info-value">{displayEmail}</span>
          </div>
          <div className="ap-info-row">
            <span className="ap-info-label">Phone</span>
            <span className="ap-info-value">{form.phone || '—'}</span>
          </div>
          <div className="ap-info-row">
            <span className="ap-info-label">Account Status</span>
            <span className="ap-info-value" style={{ color: '#27ae60', fontWeight: 700 }}>● Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
