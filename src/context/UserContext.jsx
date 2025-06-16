import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [name, setName] = useState(() => localStorage.getItem('cq-name') || '');

  useEffect(() => {
    localStorage.setItem('cq-name', name);
  }, [name]);

  return (
    <UserContext.Provider value={{ name, setName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
