import { create } from 'zustand';
import axios from 'axios';
import Cookies from 'js-cookie';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,

  checkAuth: async () => {
    const token = Cookies.get('dp_token');
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.data.user, token, isAuthenticated: true });
    } catch {
      Cookies.remove('dp_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      const { token, user } = res.data;
      Cookies.set('dp_token', token, { expires: 7, secure: true, sameSite: 'strict' });
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  },

  logout: async () => {
    const token = get().token;
    try {
      await axios.post(`${API}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    Cookies.remove('dp_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  getHeaders: () => ({
    Authorization: `Bearer ${Cookies.get('dp_token')}`,
  }),
}));
