import React, { useEffect, useState } from 'react';
import { AuthContext } from "../context/AuthContext";
import { db, auth } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

function Patients() {
  const { currentUser } = React.useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = React.useState(true);

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

  if (loading) {
    return null;
  }

  return (
    <div>
      {userRole === 'doctor' ? (
        <h2>Patients</h2>
      ) : (
        <p>Not found</p>
      )}
    </div>
  );
}

export default Patients;
