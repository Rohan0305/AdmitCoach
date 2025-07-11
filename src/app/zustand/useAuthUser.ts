import { create } from 'zustand';

interface AuthUserState {
    user: User | null;
    setUser: (user: User) => void;
}

const useAuthUser = create<AuthUserState>((set) => ({
    user: null,
    setUser: (user) => set({user: user})
}));

export default useAuthUser;