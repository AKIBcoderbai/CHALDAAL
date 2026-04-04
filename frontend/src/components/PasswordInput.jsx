import React, { useState } from 'react';
import './PasswordInput.css';

function getStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'Too Weak',  color: '#ef4444' };
  if (score === 2) return { level: 2, label: 'Weak',     color: '#f97316' };
  if (score === 3) return { level: 3, label: 'Fair',     color: '#eab308' };
  if (score === 4) return { level: 4, label: 'Strong',   color: '#22c55e' };
  return             { level: 5, label: 'Very Strong', color: '#10b981' };
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  confirm = false,
  confirmValue = '',
  onConfirmChange,
  label = 'Password',
  confirmLabel = 'Confirm Password',
  required = false,
  minLength = 8,
  inputStyle = {},
  optional = false,
}) {
  const [showPw, setShowPw]  = useState(false);
  const [showCf, setShowCf]  = useState(false);

  const strength = getStrength(value);
  const tooShort = value && value.length < minLength;
  const mismatch = confirm && confirmValue && value !== confirmValue;
  const match    = confirm && confirmValue && value === confirmValue;

  return (
    <div className="pi-root">
      {/* Password field */}
      <label className="pi-label">{label}{optional && <span className="pi-optional"> (optional)</span>}</label>
      <div className="pi-wrap">
        <input
          className="pi-input"
          type={showPw ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={optional ? undefined : minLength}
          style={inputStyle}
        />
        <button type="button" className="pi-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
          {showPw ? '🙈' : '👁️'}
        </button>
      </div>

      {/* Strength bar — only shown when user is typing */}
      {value.length > 0 && (
        <div className="pi-strength">
          <div className="pi-bars">
            {[1,2,3,4,5].map(i => (
              <div
                key={i}
                className="pi-bar"
                style={{ background: i <= strength.level ? strength.color : '#e2e8f0' }}
              />
            ))}
          </div>
          <span className="pi-strength-label" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      )}

      {/* Min-length hint */}
      {tooShort && (
        <p className="pi-hint pi-error">⚠ At least {minLength} characters required</p>
      )}

      {/* Confirm field */}
      {confirm && (
        <>
          <label className="pi-label" style={{ marginTop: '12px' }}>{confirmLabel}</label>
          <div className="pi-wrap">
            <input
              className={`pi-input ${mismatch ? 'pi-mismatch' : match ? 'pi-match' : ''}`}
              type={showCf ? 'text' : 'password'}
              value={confirmValue}
              onChange={onConfirmChange}
              placeholder="Re-enter password"
              required={required}
              style={inputStyle}
            />
            <button type="button" className="pi-eye" onClick={() => setShowCf(p => !p)} tabIndex={-1}>
              {showCf ? '🙈' : '👁️'}
            </button>
          </div>
          {mismatch && <p className="pi-hint pi-error">✗ Passwords do not match</p>}
          {match    && <p className="pi-hint pi-ok">✓ Passwords match</p>}
        </>
      )}
    </div>
  );
}
