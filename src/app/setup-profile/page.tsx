/// <reference types="node" />

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '../../firebase';
import universities from '../../data/universities.json';
import { ProgramOptions } from '@/constants/programOptions';
import getAuthUser from '../hooks/getUser';
import useAuthUser from '../zustand/useAuthUser';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuthUser();
  const router = useRouter();
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
  const [experiences, setExperiences] = useState<Experience[]>([]);

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

  // Add handler to update experience at index
  const handleExperienceChange = (idx: number, field: string, value: string) => {
    setExperiences(prev => prev.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp));
  };

  // Add handler to add new empty experience
  const handleAddExperience = () => {
    setExperiences(prev => [
      ...prev,
      { role: '', organization: '', startDate: '', endDate: '', description: '' }
    ]);
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
        experiences: experiences,
        profileCompleted: true,
        lastUpdated: new Date(),
      });
      setSuccess('Profile updated!');
      // Redirect to dashboard after successful save
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500); // Wait 1.5 seconds to show success message
    } catch (err) {
      setError('Failed to update profile.');
    }
    setLoading(false);
  };

  const {userLoading} = getAuthUser();

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
          width: 500,
          padding: 40,
          border: '1.5px solid var(--color-border)',
          borderRadius: 18,
          background: 'var(--color-card-bg)',
          boxShadow: 'var(--color-card-shadow)',
        }}
      >
        <h1 style={{ textAlign: 'center', color: 'var(--color-text)', fontWeight: 700, fontSize: 28, margin: 0 }}>
          {userLoading ? 'Loading...' : user?.firstName ? `Welcome, ${user.firstName}!` : 'Welcome!'}
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
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {experiences.map((exp, idx) => (
              <li key={idx} style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid var(--color-border)' }}>
                <input
                  type="text"
                  placeholder="Role (e.g. Research Assistant)"
                  value={exp.role}
                  onChange={e => handleExperienceChange(idx, 'role', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 6,
                    border: '1.5px solid var(--color-border)',
                    fontSize: 15,
                    marginBottom: 4,
                    background: '#fff',
                    color: 'var(--color-text)',
                    outline: 'none',
                    width: '100%',
                  }}
                  maxLength={60}
                />
                <input
                  type="text"
                  placeholder="Organization (e.g. Harvard University)"
                  value={exp.organization}
                  onChange={e => handleExperienceChange(idx, 'organization', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 6,
                    border: '1.5px solid var(--color-border)',
                    fontSize: 15,
                    marginBottom: 4,
                    background: '#fff',
                    color: 'var(--color-text)',
                    outline: 'none',
                    width: '100%',
                  }}
                  maxLength={60}
                />
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={e => handleExperienceChange(idx, 'startDate', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 6,
                      border: '1.5px solid var(--color-border)',
                      fontSize: 15,
                      background: '#fff',
                      color: 'var(--color-text)',
                      outline: 'none',
                      flex: 1,
                    }}
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={e => handleExperienceChange(idx, 'endDate', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 6,
                      border: '1.5px solid var(--color-border)',
                      fontSize: 15,
                      background: '#fff',
                      color: 'var(--color-text)',
                      outline: 'none',
                      flex: 1,
                    }}
                  />
                </div>
                <textarea
                  placeholder="Description (e.g. Conducted research on ... )"
                  value={exp.description}
                  onChange={e => handleExperienceChange(idx, 'description', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 6,
                    border: '1.5px solid var(--color-border)',
                    fontSize: 15,
                    minHeight: 60,
                    resize: 'vertical',
                    marginBottom: 4,
                    background: '#fff',
                    color: 'var(--color-text)',
                    outline: 'none',
                    width: '100%',
                  }}
                  maxLength={400}
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleAddExperience}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 6,
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            Add Experience
          </button>
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