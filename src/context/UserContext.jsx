// context/UserContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [name, setName] = useState(() => localStorage.getItem('cq-normalized-name') || '');
  const [originalName, setOriginalName] = useState(() => localStorage.getItem('cq-original-name') || '');

  useEffect(() => {
    localStorage.setItem('cq-normalized-name', name);
    localStorage.setItem('cq-original-name', originalName);
  }, [name, originalName]);

  return (
    <UserContext.Provider value={{ name, setName, originalName, setOriginalName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
