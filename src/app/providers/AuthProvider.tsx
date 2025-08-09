"use client";

import React from 'react';
import getAuthUser from '../hooks/getUser';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  getAuthUser();
  
  return <>{children}</>;
} 