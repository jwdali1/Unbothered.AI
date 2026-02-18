
const genderOptions = [
  { value: '', label: 'Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
  { value: 'Other', label: 'Other' },
];

export default function GenderPicker({ value, onChange, ...props }) {
  return (
    <select
      name="gender"
      value={value}
      onChange={onChange}
      required
      className="account-select gender-picker"
      style={{ textAlign: 'left', direction: 'ltr', color: value ? '#f5f5f5' : '#5b5b5b', fontFamily: 'inherit', fontSize: '1.3rem' }}
      {...props}
    >
      {genderOptions.map(opt => (
        <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
