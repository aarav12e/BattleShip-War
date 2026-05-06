import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfileSetup.css';

export default function ProfileSetup() {
  const { updateProfile } = useAuth();

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!age || age < 5 || age > 120) return setError('Enter a valid age (5–120).');
    if (!gender) return setError('Please select your gender.');

    setLoading(true);
    try {
      const result = await updateProfile({ age: Number(age), gender });
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-root grid-bg">
      <div className="setup-panel fade-in">

        {/* Header */}
        <div className="setup-header">
          <div className="setup-anchor">⚓</div>
          <h1 className="setup-title glow">COMMANDER PROFILE</h1>
          <p className="setup-sub">COMPLETE YOUR NAVAL IDENTITY</p>
        </div>

        <div className="setup-divider">
          <span /><span className="setup-divider-text">ENLISTMENT FORM</span><span />
        </div>

        <form className="setup-form" onSubmit={handleSubmit} noValidate>

          {/* Age */}
          <div className="setup-field">
            <label className="setup-label" htmlFor="setup-age">
              📅 AGE <span className="setup-required">*</span>
            </label>
            <input
              id="setup-age"
              className="setup-input"
              type="number"
              placeholder="Your age"
              value={age}
              onChange={e => setAge(e.target.value)}
              min={5}
              max={120}
            />
          </div>

          {/* Gender */}
          <div className="setup-field">
            <label className="setup-label">
              ⚡ GENDER <span className="setup-required">*</span>
            </label>
            <div className="setup-gender-group">
              {[
                { value: 'male',   label: '♂ MALE' },
                { value: 'female', label: '♀ FEMALE' },
                { value: 'other',  label: '◈ OTHER' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`setup-gender-btn ${gender === opt.value ? 'selected' : ''}`}
                  onClick={() => setGender(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <div className="setup-error">⚠ {error}</div>}

          {/* Submit */}
          <button
            className="setup-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="setup-spinner" />
            ) : (
              '⚔ ENLIST AS COMMANDER'
            )}
          </button>
        </form>

        <div className="setup-footer">
          <span className="pulse" style={{ color:'#00ff41' }}>●</span>
          &nbsp; PROFILE SAVED PERMANENTLY · LOGIN REMEMBERS YOU
        </div>
      </div>
    </div>
  );
}
