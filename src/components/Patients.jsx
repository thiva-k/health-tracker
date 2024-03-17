import React, { useEffect, useState } from 'react';
import { AuthContext } from "../context/AuthContext";
import { db, auth } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useUserRole } from '../context/UserRoleContext';

function Patients() {


  const userRole = useUserRole();

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
