import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import Select from 'react-select';
import CountryPicker from './CountryPicker';
import GenderPicker from './GenderPicker';
import DropdownDOBPicker from './DropdownDOBPicker';
import './DropdownDOBPicker.css';
import './CountryPicker.css';



const genders = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

function validateEmail(email) {
  // Simple RFC 5322 compliant regex
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}
function validatePassword(password) {
  // At least 8 chars, one special char, one uppercase
  return /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}
// const genders = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];
export default function SignUp({ setUser }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    country: '',
    dob: null, // use Date object for react-datepicker
    email: '',
    reEmail: '',
    password: '',
    rePassword: '',
  });
  const [error, setError] = useState('');
  const [customGender, setCustomGender] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'gender' && e.target.value !== 'Other') setCustomGender('');
  };
  const handleDateChange = date => {
    setForm({ ...form, dob: date });
  };
  const handleCountryChange = option => {
    setForm({ ...form, country: option ? option.label : '' });
  };

  const handlePasteBlock = e => {
    e.preventDefault();
  };
  // const handleDateChange = date => {
  //   setForm({ ...form, dob: date });
  // };
  // const handleCountryChange = option => {
  //   setForm({ ...form, country: option ? option.label : '' });
  // };
    }
    if (!validateEmail(form.reEmail)) {
      setError('Please re-enter a valid email address.');
      return;
    }
    if (form.email !== form.reEmail) {
      setError('Emails do not match.');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Password must be at least 8 characters, include one special character, and one uppercase letter.');
      return;
    }
    if (form.password !== form.rePassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    // Backend sign up logic
    try {
      const res = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          gender: form.gender,
          country: form.country,
          dob: form.dob ? form.dob.toISOString().slice(0, 10) : '',
          email: form.email,
          password: form.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sign up failed.');
        return;
      }
      // Automatically sign in after successful sign up
      const loginRes = await fetch('http://localhost:3001/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && setUser) {
        setUser(loginData.user);
        setError('');
        setForm({
          firstName: '', lastName: '', gender: '', country: '', dob: null, email: '', reEmail: '', password: '', rePassword: ''
        });
        navigate('/unbothered');
      } else {
        setError('Sign up succeeded but automatic sign in failed. Please sign in manually.');
      }
    } catch {
      setError('Server error. Please try again later.');
    }
  };

  
  

  

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form className="signup-form" onSubmit={handleSubmit} autoComplete="off">
        <input name="firstName" type="text" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input name="lastName" type="text" placeholder="Second Name" value={form.lastName} onChange={handleChange} required />
        <GenderPicker value={form.gender} onChange={handleChange} />
        {form.gender === 'Other' && (
          <input
            name="custom_gender"
            value={customGender}
            onChange={e => setCustomGender(e.target.value)}
            className="account-input"
            placeholder="Please specify your gender"
            required
            style={{ textAlign: 'left' }}
          />
        )}
<CountryPicker
  value={form.country}
  onChange={(e) => setForm({ ...form, country: e.target.value })}
/>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="off"
        />
        <input
          name="reEmail"
          type="email"
          placeholder="Re-enter your Email"
          value={form.reEmail}
          onChange={handleChange}
          required
          autoComplete="off"
          onPaste={handlePasteBlock}
          onDrop={handlePasteBlock}
          onCopy={handlePasteBlock}
          onCut={handlePasteBlock}
          inputMode="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
        <input
          name="rePassword"
          type="password"
          placeholder="Re-enter Password"
          value={form.rePassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
          onPaste={handlePasteBlock}
          onDrop={handlePasteBlock}
          onCopy={handlePasteBlock}
          onCut={handlePasteBlock}
        />
        {/* Modern Date of Birth Picker - after re-enter password */}
        <DropdownDOBPicker onChange={(dateString) => setForm({ ...form, dob: new Date(dateString) })} />

        <button type="submit">Sign Up</button>
        {error && <div style={{ color: 'red', fontSize: '0.95em' }}>{error}</div>}
      </form>
    </div>
  );
}
