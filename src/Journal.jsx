// Updated Journal.jsx with fetch, edit, delete, and filter
import React, { useState, useEffect, useRef } from 'react';
import './Journal.css';

function formatEntryDateGMT3(isoString) {
  const dateObj = new Date(isoString);
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Etc/GMT-3' }).format(dateObj);
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'Etc/GMT-3' }).format(dateObj);
  const day = parseInt(new Intl.DateTimeFormat('en-US', { day: '2-digit', timeZone: 'Etc/GMT-3' }).format(dateObj), 10);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'Etc/GMT-3' }).format(dateObj);
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Etc/GMT-3' }).format(dateObj);
  return `${dayName} at ${time} on ${day} ${month} ${year}`;
}

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [feeling, setFeeling] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const [openAdvice, setOpenAdvice] = useState({ entryIdx: null, keywordIdx: null });
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  const name = user?.firstName;
  const [showConfirm, setShowConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);


  const feelingsOptions = [ '', 'Happy', 'Sad', 'Angry', 'Anxious', 'Tired', 'Grateful', 'Stressed', 'Motivated', 'Miserable' ];

useEffect(() => {
  if (!userId) {
    console.warn('⚠️ No userId found — skipping fetch.');
    return;
  }

  console.log(`📡 Fetching journal entries for user ID: ${userId}...`);

  fetch(`http://192.168.3.14:3000/api/journal/${userId}`)
    .then(res => {
      console.log(`✅ Received response with status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log('📥 Data received from backend:', data);
      setEntries(
        data.map(entry => ({
          ...entry,
          keywords: typeof entry.keywords === 'string' ? JSON.parse(entry.keywords) : entry.keywords
        }))
      );
    })
    .catch(err => {
      console.error('❌ Fetch entries error:', err);
    });
}, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://192.168.3.14:3000/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, feeling, userId, name })
      });
      const data = await res.json();
      setEntries([{ text, feeling, summary: data.summary, keywords: data.keywords || [], date_created: new Date().toISOString(), name }, ...entries]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setText('');
    setFeeling('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

const confirmDelete = (id) => {
    setEntryToDelete(id);
    setShowConfirm(true);
  };

const handleDelete = async () => {
  if (!entryToDelete) return;

  try {
    const res = await fetch(`http://192.168.3.14:3000/api/journal/delete/${entryToDelete}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete');
    }
    setEntries(entries.filter((entry) => entry.id !== entryToDelete));
  } catch (err) {
    console.error('Delete failed:', err);
  } finally {
    setShowConfirm(false);
    setEntryToDelete(null);
  }
};

const cancelDelete = () => {
  setShowConfirm(false);
  setEntryToDelete(null);
};


  return (
    <div className="journal-container">
      <div className="heading-wrapper">
        <h2>Journal</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <select className="journal-select" value={feeling} onChange={(e) => setFeeling(e.target.value)} required>
          <option value="">How do you feel?</option>
          {feelingsOptions.slice(1).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <textarea
          className="journal-textarea"
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          rows="18"
          placeholder="Write here"
        />
        <br />
<button
  type="submit"
  disabled={loading}
  className="journal-btn"
  style={{
    backgroundColor: loading ? 'var(--accent-color-dark)' : undefined,
  }}
>
  {loading ? 'Thinking...' : 'Add'}
</button>
      </form>

      {entries.map((entry, idx) => (
<div
  key={entry.id || idx}
  className="journal-entry"
  style={{
    marginBottom: 32,
    height: 'auto',
    width: '100%',
  }}
>
  <div className="entry-header">
    <p><strong>Date: {formatEntryDateGMT3(entry.date_created)}</strong></p>
    <button className="delete-btn" onClick={() => confirmDelete(entry.id)}>Delete</button>
  </div>
          <p><strong>Feeling:</strong> {entry.feeling}</p>
          <p><strong>Your Journal:</strong> {entry.text}</p>
          <p><strong>AI Advice:</strong> {entry.summary}</p>
         {entry.keywords && entry.keywords.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Tags:</strong>{' '}
              {entry.keywords.map((k, kidx) => {
                const isActive = openAdvice.entryIdx === idx && openAdvice.keywordIdx === kidx;
                return (
                  <span className="keyword-wrapper" key={k.keyword}>
                    <button
                      className={`keyword-button ${isActive ? 'active' : ''}`}
                      onClick={() =>
                        setOpenAdvice(
                          isActive
                            ? { entryIdx: null, keywordIdx: null }
                            : { entryIdx: idx, keywordIdx: kidx }
                        )
                      }
                      tabIndex={0}
                      aria-label={`Advice for ${k.keyword}`}
                    >
                      {k.keyword}
                    </button>
                    {isActive && (
                      <div className="keyword-summary">
                        {k.summary}
                      </div>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ))}
            {/* Confirmation modal */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>Are you sure you want to delete this journal entry?</p>
            <button onClick={handleDelete} className="confirm-btn confirm-yes">Yes, delete</button>
            <button onClick={cancelDelete} className="confirm-btn confirm-no">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}