import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { AuthContext } from './AuthContext';
import { doc, getDoc } from 'firebase/firestore';

const UserRoleContext = createContext();

export const useUserRole = () => useContext(UserRoleContext);

export const UserRoleProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      }
    };

    fetchUserRole();
  }, [currentUser]);

  return (
    <UserRoleContext.Provider value={userRole}>
      {children}
    </UserRoleContext.Provider>
  );
};
