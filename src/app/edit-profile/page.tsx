"use client";

import React, { useEffect, useState, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '../../firebase';
import universities from '../../data/universities.json';
import { ProgramOptions } from '@/constants/programOptions';
import { useRouter } from 'next/navigation';
import useAuthUser from '../zustand/useAuthUser';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthUser();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState('');
  const [programInput, setProgramInput] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [undergrad, setUndergrad] = useState('');
  const [undergradInput, setUndergradInput] = useState('');
  const [showUndergradOptions, setShowUndergradOptions] = useState(false);
  const undergradInputRef = useRef<HTMLInputElement>(null);
  const undergradOptionsRef = useRef<HTMLDivElement>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setProgram(user.programType ?? "");
      setProgramInput(user.programType ?? "");
      setUndergrad(user.undergraduateSchool ?? "");
      setUndergradInput(user.undergraduateSchool ?? "");
      setExperiences(user.experiences ?? []);
    }
  }, [user]);

  // Dropdown logic (same as profile page)
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

  const filteredOptions = ProgramOptions.filter(option =>
    option.value.toLowerCase().includes(programInput.toLowerCase())
  ).map(option => option.value);
  const filteredUniversities = universities.filter((u: string) =>
    u.toLowerCase().includes(undergradInput.toLowerCase())
  );

  // Experience editing logic
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

  // Save handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required.');
      return;
    }
    if (!program) {
      setError('Please select a program type.');
      return;
    }
    if (!undergrad) {
      setError('Please select your undergraduate school.');
      return;
    }
    setSaving(true);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to update your profile.');
      setSaving(false);
      return;
    }
    try {
      const updatedUserData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        programType: program,
        undergraduateSchool: undergrad,
        experiences: experiences,
        profileCompleted: true,
        lastUpdated: new Date(),
      };
      
      await updateDoc(doc(db, 'users', user.uid), updatedUserData);
      
      // Update Zustand store with new data
      setUser(updatedUserData);
      
      setSuccess('Profile updated!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch {
      setError('Failed to update profile.');
    }
    setSaving(false);
  };



  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-gradient)' }}>
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
          Edit Your Profile
        </h1>
        {error && <div style={{ color: '#ef4444', textAlign: 'center', fontSize: 15 }}>{error}</div>}
        {success && <div style={{ color: '#22c55e', textAlign: 'center', fontSize: 15 }}>{success}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 16, outline: 'none', background: '#fff', color: 'var(--color-text)' }}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 16, outline: 'none', background: '#fff', color: 'var(--color-text)' }}
            required
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 16, outline: 'none', background: '#fff', color: 'var(--color-text)' }}
          required
        />
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search program..."
            value={programInput}
            onChange={e => { setProgramInput(e.target.value); setShowOptions(true); setProgram(''); }}
            onFocus={() => setShowOptions(true)}
            style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 16, outline: 'none', width: '100%', background: '#fff', color: 'var(--color-text)' }}
            autoComplete="off"
          />
          {showOptions && filteredOptions.length > 0 && (
            <div
              ref={optionsRef}
              style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(14, 165, 233, 0.10)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}
            >
              {filteredOptions.map((option: string) => (
                <div
                  key={option}
                  onClick={() => { setProgram(option); setProgramInput(option); setShowOptions(false); }}
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', background: option === program ? 'var(--color-primary)' : 'transparent', color: option === program ? '#fff' : 'var(--color-text)', fontWeight: option === program ? 700 : 500, borderRadius: 6, margin: 2, transition: 'background 0.15s, color 0.15s' }}
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
          <input
            ref={undergradInputRef}
            type="text"
            placeholder="Type to search undergrad..."
            value={undergradInput}
            onChange={e => { setUndergradInput(e.target.value); setShowUndergradOptions(true); setUndergrad(''); }}
            onFocus={() => setShowUndergradOptions(true)}
            style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 16, outline: 'none', width: '100%', background: '#fff', color: 'var(--color-text)', marginBottom: 8 }}
            autoComplete="off"
          />
          {showUndergradOptions && filteredUniversities.length > 0 && (
            <div
              ref={undergradOptionsRef}
              style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(14, 165, 233, 0.10)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}
            >
              {filteredUniversities.map((school: string) => (
                <div
                  key={school}
                  onClick={() => { setUndergrad(school); setUndergradInput(school); setShowUndergradOptions(false); }}
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', background: school === undergrad ? 'var(--color-primary)' : 'transparent', color: school === undergrad ? '#fff' : 'var(--color-text)', fontWeight: school === undergrad ? 700 : 500, borderRadius: 6, margin: 2, transition: 'background 0.15s, color 0.15s' }}
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

        {/* Experiences section (same as profile page, editable) */}
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
                  style={{ padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, marginBottom: 4, background: '#fff', color: 'var(--color-text)', outline: 'none', width: '100%' }}
                  maxLength={60}
                />
                <input
                  type="text"
                  placeholder="Organization (e.g. Harvard University)"
                  value={exp.organization}
                  onChange={e => handleExperienceChange(idx, 'organization', e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, marginBottom: 4, background: '#fff', color: 'var(--color-text)', outline: 'none', width: '100%' }}
                  maxLength={60}
                />
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={e => handleExperienceChange(idx, 'startDate', e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, background: '#fff', color: 'var(--color-text)', outline: 'none', flex: 1 }}
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={e => handleExperienceChange(idx, 'endDate', e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, background: '#fff', color: 'var(--color-text)', outline: 'none', flex: 1 }}
                  />
                </div>
                <textarea
                  placeholder="Description (e.g. Conducted research on ... )"
                  value={exp.description}
                  onChange={e => handleExperienceChange(idx, 'description', e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: 15, minHeight: 60, resize: 'vertical', marginBottom: 4, background: '#fff', color: 'var(--color-text)', outline: 'none', width: '100%' }}
                  maxLength={400}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(idx)}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 0.75rem', fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}
                  aria-label="Delete Experience"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleAddExperience}
            style={{ padding: '0.5rem 1.2rem', borderRadius: 6, background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}
          >
            Add Experience
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            type="submit"
            disabled={saving}
            style={{ flex: 1, padding: '0.75rem', borderRadius: 8, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', color: '#fff', border: 'none', fontWeight: 700, fontSize: 17, letterSpacing: 0.5, boxShadow: '0 2px 8px rgba(14, 165, 233, 0.10)', cursor: saving ? 'not-allowed' : 'pointer', marginTop: 8, transition: 'background 0.2s', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{ flex: 1, padding: '0.75rem', borderRadius: 8, background: '#f1f5f9', color: 'var(--color-text)', border: '1.5px solid var(--color-border)', fontWeight: 700, fontSize: 17, letterSpacing: 0.5, boxShadow: '0 2px 8px rgba(14, 165, 233, 0.10)', cursor: 'pointer', marginTop: 8, transition: 'background 0.2s' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 