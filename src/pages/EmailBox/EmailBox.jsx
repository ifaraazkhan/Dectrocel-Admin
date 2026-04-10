import React, { useState } from 'react';
import { Mail, Send, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import emailAPI from '../../api/email';

const EmailBox = () => {
  const [recipients, setRecipients] = useState([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const addRecipient = () => {
    const email = recipientInput.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (recipients.includes(email)) {
      toast.error('Email already added');
      return;
    }
    setRecipients(prev => [...prev, email]);
    setRecipientInput('');
  };

  const handleRecipientKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient();
    }
  };

  const removeRecipient = (email) => {
    setRecipients(prev => prev.filter(r => r !== email));
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }
    if (!subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!body.trim()) {
      toast.error('Email body is required');
      return;
    }

    try {
      setSending(true);
      await emailAPI.sendEmail({
        recipients: recipients.join(', '),
        subject: subject.trim(),
        body: body.trim(),
      });
      toast.success('Email sent successfully');
      setRecipients([]);
      setSubject('');
      setBody('');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to send email';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleDiscard = () => {
    setRecipients([]);
    setRecipientInput('');
    setSubject('');
    setBody('');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Mail size={28} className="text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Box</h1>
          <p className="text-gray-500 text-sm">Send emails via AWS SES · From: support@the-decxpert.com</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow max-w-3xl">
        {/* From */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-400 w-16 flex-shrink-0">From</span>
          <span className="text-sm text-gray-700">support@dectrocel.com</span>
        </div>

        {/* To */}
        <div className="flex items-start gap-3 px-5 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-400 w-16 flex-shrink-0 pt-1.5">To</span>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {recipients.map(email => (
                <span
                  key={email}
                  className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
                >
                  {email}
                  <button onClick={() => removeRecipient(email)} className="hover:text-primary-900">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={recipientInput}
                onChange={e => setRecipientInput(e.target.value)}
                onKeyDown={handleRecipientKeyDown}
                placeholder="Enter email and press Enter"
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={addRecipient}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-medium"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-400 w-16 flex-shrink-0">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Email subject"
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your email message here..."
            rows={12}
            className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none resize-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-400">
            {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={15} />
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailBox;
