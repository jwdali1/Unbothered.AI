import { useState, useEffect } from 'react';

export default function DropdownDOBPicker({ value, onChange, readOnly = false }) {
  const parseDateParts = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return { day: '', month: '', year: '' };
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    return {
      day: !isNaN(day) ? day : '',
      month: !isNaN(month) ? month - 1 : '', // month is 0-indexed
      year: !isNaN(year) ? year : '',
    };
  };

  const [dob, setDob] = useState(parseDateParts(value));

  // Sync when parent value changes
  useEffect(() => {
    setDob(parseDateParts(value));
  }, [value]);

  // Trigger parent update
  useEffect(() => {
    const { day, month, year } = dob;
    if (day && month !== '' && year) {
      const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onChange?.(formatted);
    }
  }, [dob, onChange]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Read-only display
if (readOnly) {
  return (
    <div className="dob-readonly-container">
      <input
        type="text"
        value={dob.day || ''}
        readOnly
        tabIndex={-1}
        className="readonly-dob-input"
        aria-label="Day"
      />
      <input
        type="text"
        value={dob.month !== '' ? months[dob.month] : ''}
        readOnly
        tabIndex={-1}
        className="readonly-dob-input"
        aria-label="Month"
      />
      <input
        type="text"
        value={dob.year || ''}
        readOnly
        tabIndex={-1}
        className="readonly-dob-input"
        aria-label="Year"
      />
    </div>
  );
}

  // Editable dropdowns
  return (
    <div className="dob-dropdown-container">
      <select
        value={dob.day?.toString() || ''}
        onChange={(e) => setDob({ ...dob, day: parseInt(e.target.value) })}
        className={dob.day ? 'has-value' : ''}
      >
        <option value="">Day</option>
        {days.map((day) => (
          <option key={day} value={day.toString()}>{day}</option>
        ))}
      </select>

      <select
        value={dob.month?.toString() || ''}
        onChange={(e) => setDob({ ...dob, month: parseInt(e.target.value) })}
        className={dob.month !== '' ? 'has-value' : ''}
      >
        <option value="">Month</option>
        {months.map((month, index) => (
          <option key={month} value={index.toString()}>{month}</option>
        ))}
      </select>

      <select
        value={dob.year?.toString() || ''}
        onChange={(e) => setDob({ ...dob, year: parseInt(e.target.value) })}
        className={dob.year ? 'has-value' : ''}
      >
        <option value="">Year</option>
        {years.map((year) => (
          <option key={year} value={year.toString()}>{year}</option>
        ))}
      </select>
    </div>
  );
}
