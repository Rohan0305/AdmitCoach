"use client";

import React, { useState, useRef, useEffect } from 'react';

const PROGRAM_OPTIONS = [
  'Medical School',
  'Dental School',
  'Pharmacy School',
  'Physician Assistant (PA) Program',
  'Nursing School',
  'Veterinary School',
  'Optometry School',
  'Law School',
  'Business School (MBA)',
  'Graduate School (MS/PhD)',
  'Physical Therapy (PT)',
  'Occupational Therapy (OT)',
  'Other',
];

export default function ProfilePage() {
  const [program, setProgram] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  const filteredOptions = PROGRAM_OPTIONS.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    setProgram(option);
    setInputValue(option);
    setShowOptions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowOptions(true);
    setProgram('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!program) {
      setError('Please select a program type.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSuccess('Profile updated!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-gradient)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: 350,
          padding: 40,
          border: '1.5px solid var(--color-border)',
          borderRadius: 18,
          background: 'var(--color-card-bg)',
          boxShadow: 'var(--color-card-shadow)',
        }}
      >
        <h1 style={{ textAlign: 'center', color: 'var(--color-text)', fontWeight: 700, fontSize: 28, margin: 0 }}>Welcome!</h1>
        <h2 style={{ textAlign: 'center', color: 'var(--color-text)', fontWeight: 700, fontSize: 24, margin: 0 }}>Set Up Your Profile</h2>
        <p style={{ color: 'var(--color-label)', fontSize: 16, marginTop: 4, textAlign: 'center' }}>
          Select the type of program you are preparing for:
        </p>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search..."
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowOptions(true)}
            style={{
              padding: '0.75rem',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 16,
              outline: 'none',
              width: '100%',
              background: '#fff',
              color: 'var(--color-text)',
              boxShadow: showOptions ? '0 2px 8px rgba(14, 165, 233, 0.10)' : undefined,
              transition: 'box-shadow 0.2s',
            }}
            autoComplete="off"
          />
          {showOptions && filteredOptions.length > 0 && (
            <div
              ref={optionsRef}
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                background: '#fff',
                border: '1.5px solid var(--color-border)',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(14, 165, 233, 0.10)',
                zIndex: 10,
                maxHeight: 200,
                overflowY: 'auto',
              }}
            >
              {filteredOptions.map(option => (
                <div
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    background: option === program ? 'var(--color-primary)' : 'transparent',
                    color: option === program ? '#fff' : 'var(--color-text)',
                    fontWeight: option === program ? 700 : 500,
                    borderRadius: 6,
                    margin: 2,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseDown={e => e.preventDefault()}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            borderRadius: 8,
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 0.5,
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.10)',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 8,
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {error && <div style={{ color: '#ef4444', textAlign: 'center', fontSize: 15 }}>{error}</div>}
        {success && <div style={{ color: '#22c55e', textAlign: 'center', fontSize: 15 }}>{success}</div>}
      </form>
    </div>
  );
} 