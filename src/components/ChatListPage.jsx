import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, where} from 'firebase/firestore';
import { db } from '../config/firebase';

const ChatListPage = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
        const querySnapshot = await getDocs(q);
        const doctorsData = [];
        querySnapshot.forEach((doc) => {
          doctorsData.push({ id: doc.id, ...doc.data() });
        });
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors: ', error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div>
      <h1>Available Doctors</h1>
      <ul>
        {doctors.map(doctor => (
          <li key={doctor.id}>
            <Link to={`/chat/${doctor.id}`}>{doctor.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatListPage;
