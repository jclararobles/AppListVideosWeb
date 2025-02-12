import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const auth = getAuth();
    
    // Suscribirse al cambio de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Actualiza el estado del usuario
    });
    
    return () => unsubscribe(); // Limpiar suscripción cuando el componente se desmonte
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
