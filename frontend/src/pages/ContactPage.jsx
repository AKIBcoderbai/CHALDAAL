import React, { useState } from 'react';
import StaticPage from './StaticPage';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app this would POST to an endpoint; for demo we just show success
    setSent(true);
  };

  return (
    <StaticPage title="Contact Us" breadcrumb="Contact">
      <p>
        Have a question, feedback, or issue? Reach out to our support team and we'll get back to you within 24 hours.
      </p>

      <h2>Support Hours</h2>
      <ul>
        <li>📞 Phone: <strong>09611-CHALDAL</strong> (Sun–Thu, 8 AM – 8 PM)</li>
        <li>📧 Email: <strong>support@chaldalclone.com</strong></li>
        <li>💬 Live Chat: Available in-app (10 AM – 6 PM)</li>
      </ul>

      <h2>Send Us a Message</h2>
      {sent ? (
        <div className="highlight-box">
          ✅ <strong>Message sent!</strong> We'll get back to you shortly at {form.email}.
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <textarea
            rows={5}
            placeholder="Your message..."
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            required
          />
          <button type="submit">Send Message</button>
        </form>
      )}
    </StaticPage>
  );
}
