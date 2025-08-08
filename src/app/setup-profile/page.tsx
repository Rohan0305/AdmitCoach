/// <reference types="node" />

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
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
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const filteredOptions = ProgramOptions.filter(option =>
    option.value.toLowerCase().includes(programInput.toLowerCase())
  ).map(option => option.value);

  const filteredUniversities = universities.filter((u: string) =>
    u.toLowerCase().includes(undergradInput.toLowerCase())
  );

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



  const handleExperienceChange = (idx: number, field: string, value: string) => {
    setExperiences(prev => prev.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp));
  };

  const handleAddExperience = () => {
    setExperiences(prev => [
      ...prev,
      { role: '', organization: '', startDate: '', endDate: '', description: '' }
    ]);
  };

  const handleDeleteExperience = (idx: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== idx));
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
        experiences: experiences,
        profileCompleted: true,
        lastUpdated: new Date(),
      });
      setSuccess('Profile updated!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
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

        {/* Experiences Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15 }}>Experiences</label>
            {experiences.map((exp, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <input
                  type="text"
                placeholder="Role"
                  value={exp.role}
                  onChange={e => handleExperienceChange(idx, 'role', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, background: '#fff', color: 'var(--color-text)' }}
                />
                <input
                  type="text"
                placeholder="Organization"
                  value={exp.organization}
                  onChange={e => handleExperienceChange(idx, 'organization', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, background: '#fff', color: 'var(--color-text)' }}
              />
                  <input
                type="text"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={e => handleExperienceChange(idx, 'startDate', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, background: '#fff', color: 'var(--color-text)' }}
                  />
                  <input
                type="text"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={e => handleExperienceChange(idx, 'endDate', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, background: '#fff', color: 'var(--color-text)' }}
              />
              <input
                type="text"
                placeholder="Description"
                  value={exp.description}
                  onChange={e => handleExperienceChange(idx, 'description', e.target.value)}
                style={{ flex: 2, padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, background: '#fff', color: 'var(--color-text)' }}
              />
              <button
                type="button"
                onClick={() => handleDeleteExperience(idx)}
                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 0.75rem', fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}
                aria-label="Delete Experience"
              >
                Delete
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddExperience}
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', marginTop: 4, alignSelf: 'flex-start' }}
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