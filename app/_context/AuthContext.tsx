'use client'; 
import { onAuthStateChanged, User } from "firebase/auth";
import {
  ReactNode,
  useContext,
  createContext,
  useEffect,
  useState,
} from "react";
import { auth } from "../auth/firebase";

interface AuthContextType{
  user: User | null;
  loading: boolean;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({children}: AuthProviderProps)=> {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};