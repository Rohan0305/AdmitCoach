/// <reference types="node" />

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '../../firebase';
import universities from '../../data/universities.json';
import { ProgramOptions } from '@/constants/programOptions';

export default function ProfilePage() {
  const [program, setProgram] = useState('');
  const [programInput, setProgramInput] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [undergrad, setUndergrad] = useState('');
  const [undergradInput, setUndergradInput] = useState('');
  const [showUndergradOptions, setShowUndergradOptions] = useState(false);
  const undergradInputRef = useRef<HTMLInputElement>(null);
  const undergradOptionsRef = useRef<HTMLDivElement>(null);
  const [gpa, setGpa] = useState('4.0');

  // Experiences state
  const [experiences, setExperiences] = useState<{ title: string; description: string }[]>([]);
  const [expTitle, setExpTitle] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  // Filter options based on input
  const filteredOptions = ProgramOptions.filter(option =>
    option.value.toLowerCase().includes(programInput.toLowerCase())
  ).map(option => option.value);

  // Filter universities based on input
  const filteredUniversities = universities.filter((u: string) =>
    u.toLowerCase().includes(undergradInput.toLowerCase())
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

  // Handle click outside to close undergrad dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        undergradOptionsRef.current &&
        !undergradOptionsRef.current.contains(event.target as Node) &&
        undergradInputRef.current &&
        !undergradInputRef.current.contains(event.target as Node)
      ) {
        setShowUndergradOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProgramOptionClick = (option: string) => {
    setProgram(option);
    setProgramInput(option);
    setShowOptions(false);
  };

  const handleProgramInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgramInput(e.target.value);
    setShowOptions(true);
    setProgram('');
  };

  const handleUndergradOptionClick = (school: string) => {
    setUndergrad(school);
    setUndergradInput(school);
    setShowUndergradOptions(false);
  };

  const handleUndergradInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUndergradInput(e.target.value);
    setShowUndergradOptions(true);
    setUndergrad('');
  };

  const handleGpaChange = (value: string) => {
    setGpa(value);
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expDescription.trim()) return;
    setExperiences(prev => [...prev, { title: expTitle.trim(), description: expDescription.trim() }]);
    setExpTitle('');
    setExpDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!program) {
      setError('Please select a program type.');
      return;
    }
    if (!undergrad) {
      setError('Please select your undergraduate school.');
      return;
    }
    const gpaNum = parseFloat(gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
      setError('GPA must be a number between 0 and 4.0');
      setLoading(false);
      return;
    }
    setLoading(true);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to update your profile.');
      setLoading(false);
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        programType: program,
        undergraduateSchool: undergrad,
        gpa: gpaNum,
      });
      setSuccess('Profile updated!');
    } catch (err) {
      setError('Failed to update profile.');
    }
    setLoading(false);
  };

  const [userData, setUserData] = useState<{ firstName?: string } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth(app);
      const db = getFirestore(app);
      const user = auth.currentUser;
      if (!user) {
        setUserData(null);
        setUserLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setUserData(null);
        }
      } catch (err) {
        setUserData(null);
      }
      setUserLoading(false);
    };
    fetchUserData();
  }, []);

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
        <h1 style={{ textAlign: 'center', color: 'var(--color-text)', fontWeight: 700, fontSize: 28, margin: 0 }}>
          {userLoading ? 'Loading...' : userData?.firstName ? `Welcome, ${userData.firstName}!` : 'Welcome!'}
        </h1>
        <h2 style={{ textAlign: 'center', color: 'var(--color-text)', fontWeight: 700, fontSize: 24, margin: 0 }}>Set Up Your Profile</h2>
        <p style={{ color: 'var(--color-label)', fontSize: 16, marginTop: 4, textAlign: 'center' }}>
          Select the type of program you are preparing for:
        </p>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search..."
            value={programInput}
            onChange={handleProgramInputChange}
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
              {filteredOptions.map((option: string) => (
                <div
                  key={option}
                  onClick={() => handleProgramOptionClick(option)}
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
                  onMouseEnter={e => (e.currentTarget.style.background = option === program ? 'var(--color-primary)' : '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.background = option === program ? 'var(--color-primary)' : 'transparent')}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <label htmlFor="undergrad" style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15, marginBottom: 4 }}>
            Undergraduate School
          </label>
          <input
            ref={undergradInputRef}
            type="text"
            placeholder="Type to search..."
            value={undergradInput}
            onChange={handleUndergradInputChange}
            onFocus={() => setShowUndergradOptions(true)}
            style={{
              padding: '0.75rem',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 16,
              outline: 'none',
              width: '100%',
              background: '#fff',
              color: 'var(--color-text)',
              boxShadow: showUndergradOptions ? '0 2px 8px rgba(14, 165, 233, 0.10)' : undefined,
              transition: 'box-shadow 0.2s',
              marginBottom: 8,
            }}
            autoComplete="off"
          />
          {showUndergradOptions && filteredUniversities.length > 0 && (
            <div
              ref={undergradOptionsRef}
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
              {filteredUniversities.map((school: string) => (
                <div
                  key={school}
                  onClick={() => handleUndergradOptionClick(school)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    background: school === undergrad ? 'var(--color-primary)' : 'transparent',
                    color: school === undergrad ? '#fff' : 'var(--color-text)',
                    fontWeight: school === undergrad ? 700 : 500,
                    borderRadius: 6,
                    margin: 2,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseDown={e => e.preventDefault()}
                  onMouseEnter={e => (e.currentTarget.style.background = school === undergrad ? 'var(--color-primary)' : '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.background = school === undergrad ? 'var(--color-primary)' : 'transparent')}
                >
                  {school}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="gpa" style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15, marginBottom: 4 }}>
            GPA
          </label>
          <input
            id="gpa"
            type="text"
            value={gpa}
            onChange={e => handleGpaChange(e.target.value)}
            placeholder="e.g. 3.7"
            style={{
              width: 80,
              textAlign: 'center',
              padding: '0.5rem',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 16,
              outline: 'none',
              background: '#fff',
              color: 'var(--color-text)',
            }}
            maxLength={4}
          />
        </div>
        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Experiences</h3>
          {(!showExperienceForm && experiences.length === 0) ? (
            <button
              type="button"
              onClick={() => setShowExperienceForm(true)}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: 6,
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Add Experience
            </button>
          ) : (
            <>
              <form onSubmit={handleAddExperience} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Title (e.g. Research Assistant)"
                  value={expTitle}
                  onChange={e => setExpTitle(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 6,
                    border: '1.5px solid var(--color-border)',
                    fontSize: 15,
                    marginBottom: 4,
                  }}
                  maxLength={60}
                />
                <textarea
                  placeholder="Description (e.g. Conducted research on ... )"
                  value={expDescription}
                  onChange={e => setExpDescription(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 6,
                    border: '1.5px solid var(--color-border)',
                    fontSize: 15,
                    minHeight: 60,
                    resize: 'vertical',
                    marginBottom: 4,
                  }}
                  maxLength={400}
                />
                <button
                  type="submit"
                  style={{
                    alignSelf: 'flex-end',
                    padding: '0.5rem 1.2rem',
                    borderRadius: 6,
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    opacity: !expTitle.trim() || !expDescription.trim() ? 0.6 : 1,
                  }}
                  disabled={!expTitle.trim() || !expDescription.trim()}
                >
                  Add Experience
                </button>
              </form>
              {experiences.length === 0 ? (
                <div style={{ color: 'var(--color-label)', fontSize: 15 }}>No experiences added yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {experiences.map((exp, idx) => (
                    <li key={idx} style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid var(--color-border)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 16 }}>{exp.title}</div>
                      <div style={{ color: 'var(--color-label)', fontSize: 15, marginTop: 2 }}>{exp.description}</div>
                    </li>
                  ))}
                </ul>
              )}
            </>
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