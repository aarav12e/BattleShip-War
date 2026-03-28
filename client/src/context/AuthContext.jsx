import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { user: clerkUser }                = useUser();
  const [gameProfile, setGameProfile]      = useState(null);
  const [loading, setLoading]              = useState(true);

  const syncUser = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      // POST /auth/sync — creates or updates user in MongoDB
      const { data } = await axios.post(`${API}/auth/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGameProfile(data);
    } catch (err) {
      console.error('Failed to sync user:', err);
      setGameProfile(null);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Whenever Clerk's auth state is ready, sync/fetch the game profile
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setGameProfile(null);
      setLoading(false);
      return;
    }
    syncUser();
  }, [isLoaded, isSignedIn]);

  // Combined user object: Clerk identity + game stats from MongoDB
  const user = isSignedIn && gameProfile
    ? {
        ...gameProfile,
        name:    gameProfile.name    || clerkUser?.fullName    || '',
        email:   gameProfile.email   || clerkUser?.primaryEmailAddress?.emailAddress || '',
        picture: gameProfile.picture || clerkUser?.imageUrl    || '',
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, loading, API, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
