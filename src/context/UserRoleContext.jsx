import  { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { AuthContext } from './AuthContext';
import { doc, getDoc } from 'firebase/firestore';

const UserRoleContext = createContext();

export const useUserRole = () => useContext(UserRoleContext);

// eslint-disable-next-line react/prop-types
export const UserRoleProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [currentUser]);

  return (
    <UserRoleContext.Provider value={{userRole,setUserRole, loading}}>
      {children}
    </UserRoleContext.Provider>
  );
};
