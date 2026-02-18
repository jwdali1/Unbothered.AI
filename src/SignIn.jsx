import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}
function validatePassword(password) {
  return /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

export default function SignIn({ setUser }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  function generateCaptcha() {
    // Simple 5-digit number captcha
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address.');
      setSuccess('');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Password must be at least 8 characters, include one special character, and one uppercase letter.');
      setSuccess('');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setError('Captcha is incorrect. Please try again.');
      setSuccess('');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
      return;
    }
    setError('');
    setSuccess('');
    // Backend sign in logic
    try {
      const res = await fetch('http://localhost:3001/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sign in failed.');
        setSuccess('');
        return;
      }
      setSuccess('Sign in successful!');
      if (setUser) setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('User saved to localStorage:', data.user);  // <-- Add this line
      navigate('/unbothered');
    } catch {
      setError('Server error. Please try again later.');
      setSuccess('');
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
       <form className="signin-form" onSubmit={handleSubmit} autoComplete="off">
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
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="off"
        />
        <div style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <span className="signin-captcha-box">{captcha}</span>
          <button type="button" onClick={() => setCaptcha(generateCaptcha())} className="signin-captcha-refresh">↻</button>
        </div>
        <input
          type="text"
          placeholder="Enter captcha"
          value={captchaInput}
          onChange={e => setCaptchaInput(e.target.value)}
          required
        />
        <button type="submit" style={{}}>Sign In</button>
        {error && <div style={{ color: 'red', fontSize: '0.95em'}}>{error}</div>}
        {success && <div style={{ color: 'green', fontSize: '0.95em'}}>{success}</div>}
      </form>
    </div>
  );
}
