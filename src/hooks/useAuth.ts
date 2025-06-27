
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { AuthManager } from '@/lib/auth'; // Assuming AuthManager exists

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = AuthManager.getUserData();
      if (userData) {
        setUser(userData);
      } else {
        // In a real app, you might fetch user data from an API here
        // based on a token or session, and then set it via AuthManager.setUserData
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  return { user, isLoading };
};
