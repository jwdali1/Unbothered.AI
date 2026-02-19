import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import './AccountSettings.css';
import DropdownDOBPicker from './DropdownDOBPicker';
import CountryPicker from './CountryPicker';
import GenderPicker from './GenderPicker';
import './DropdownDOBPicker.css';
import './CountryPicker.css';

function AccountSettings({ user }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState('');
  const [customGender, setCustomGender] = useState('');

  useEffect(() => {
    if (!user || !user.id) {
      setError('No user ID found. Please sign in again.');
      setLoading(false);
      return;
    }
    async function fetchDetails() {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const res = await fetch(`http://localhost:3001/api/user/${user.id}`);
        const data = await res.json();
if (res.ok) {
  const normalizedDOB = data.user.dob ? data.user.dob.slice(0, 10) : '';

  const userWithNormalizedDOB = {
    ...data.user,
    dob: normalizedDOB,
  };

  setDetails(userWithNormalizedDOB);
  setForm(userWithNormalizedDOB);

  if (
    data.user.gender &&
    !['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'].includes(data.user.gender)
  ) {
    setCustomGender(data.user.gender);
    setForm((f) => ({ ...f, gender: 'Other' }));
  }
        } else setError(data.error || 'Could not fetch account details.');
      } catch {
        setError('Could not fetch account details.');
      }
      setLoading(false);
    }
    fetchDetails();
  }, [user]);

  const handleEdit = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
  };
  const handleCancel = () => {
    setEditMode(false);
    setForm(details);
    setCustomGender('');
    setSuccess('');
    setError('');
  };

  const handleChange = (e) => {
    try {
      console.debug('AccountSettings.handleChange', e?.target?.name, e?.target?.value);
    } catch (err) {
      console.debug('AccountSettings.handleChange error', err);
    }
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'gender' && e.target.value !== 'Other') setCustomGender('');
  };
  const handleCustomGenderChange = (e) => {
    // Keep `form.gender` as 'Other' while the user types their custom gender.
    setCustomGender(e.target.value);
    setForm({ ...form, gender: 'Other' });
  };
  const handleCountryChange = (option) => {
    // CountryPicker is a native <select> so it provides an event
    const value = option && option.target ? option.target.value : (option ? option.label : '');
    setForm({ ...form, country: value });
  };

  const handleDobChange = useCallback((dateString) => {
    setForm((f) => ({ ...f, dob: dateString }));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formatDob = (d) => {
        if (!d) return '';
        if (typeof d === 'string') return d.slice(0, 10);
        const dt = new Date(d);
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const dobToSend = formatDob(form.dob);

      const res = await fetch(`http://localhost:3001/api/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          gender: form.gender === 'Other' ? customGender : form.gender,
          country: form.country,
          dob: dobToSend,
          email: form.email
        })
      });
      const data = await res.json();
      if (res.ok) {
        const savedGender = form.gender === 'Other' ? customGender : form.gender;
        const newDetails = { ...form, gender: savedGender, dob: dobToSend };
        // Keep form.gender as 'Other' so the select remains visible when editing again,
        // and keep the customGender state set to the saved custom value.
        const newForm = { ...form, gender: form.gender === 'Other' ? 'Other' : form.gender, dob: dobToSend };
        setDetails(newDetails);
        setForm(newForm);
        if (form.gender === 'Other') setCustomGender(savedGender);
        setEditMode(false);
        setSuccess('Details changed successfully!');
      } else {
        setError(data.error || 'Could not update details.');
      }
    } catch {
      setError('Could not update details.');
    }
    setLoading(false);
  };

  if (loading) return <div className="account-loading">Loading account details...</div>;
  if (error) return <div className="account-error-msg">{error}</div>;
  if (!details) return null;

  return (
    <div className="account-container">
      <h2>Account Details</h2>
      {success && <div className="account-success-msg">{success}</div>}
      <form className="account-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* First Name */}
        {editMode ? (
          <input name="first_name" placeholder="First Name" value={form.first_name || ''} onChange={handleChange} className="account-input" />
        ) : (
          <div className="account-view-field">{details.first_name}</div>
        )}

        {/* Last Name */}
        {editMode ? (
          <input name="last_name" placeholder="Last Name" value={form.last_name || ''} onChange={handleChange} className="account-input" />
        ) : (
          <div className="account-view-field">{details.last_name}</div>
        )}

        {/* Email */}
        {editMode ? (
          <input name="email" type="email" placeholder="Email" value={form.email || ''} onChange={handleChange} className="account-input" />
        ) : (
          <div className="account-view-field">{details.email}</div>
        )}

        {/* Gender */}
        {editMode ? (
          <GenderPicker value={form.gender || ''} onChange={handleChange} className="gender-picker" />
        ) : (
          <div className="account-view-field">
            {['Male', 'Female', 'Non-binary', 'Prefer not to say'].includes(details.gender)
              ? details.gender
              : details.gender
              ? `Other — ${details.gender}`
              : ''}
          </div>
        )}

        {/* Custom Gender */}
        {editMode && form.gender === 'Other' && (
          <input
            name="custom_gender"
            value={customGender}
            onChange={handleCustomGenderChange}
            className="account-input"
            placeholder="Please specify your gender"
          />
        )}

        {/* Country */}
        {editMode ? (
<CountryPicker
  value={form.country}
  onChange={handleCountryChange}
/>
        ) : (
          <div className="account-view-field">{details.country}</div>
        )}

{/* Date of Birth */}
{editMode ? (
<DropdownDOBPicker
  value={form.dob || ''}
  onChange={handleDobChange}
/>
) : (
<DropdownDOBPicker
  value={details.dob || ''}
  readOnly={true}
/>
)}
        {/* Action Buttons */}
        {!editMode ? (
          <button type="button" className="btn" onClick={handleEdit}>Edit</button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn">Save</button>
          </>
        )}
      </form>
    </div>
  );
}

export default AccountSettings;
