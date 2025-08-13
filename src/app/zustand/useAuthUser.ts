import { create } from 'zustand';
import { User } from '@/app/types/types';

interface AuthUserState {
    user: User | null;
    setUser: (user: User | null) => void;
}

const useAuthUser = create<AuthUserState>((set) => ({
    user: null,
    setUser: (user) => set({user: user})
}));

export default useAuthUser;