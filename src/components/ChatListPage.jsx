import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../context/UserRoleContext';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, Typography } from '@mui/material';

const ChatListPage = () => {
  const [doctors, setDoctors] = useState([]);
  const { userRole } = useUserRole();
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors: ', error);
      }
    };

    fetchDoctors();
  }, []);

  if (loading || !currentUser || userRole !== 'patient') {
    return null;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center', marginTop: '20px' }}>
        Available Doctors
      </Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {doctors.map(doctor => (
          <Card key={doctor.id} style={{ minWidth: '250px', margin: '10px', flex: '1 0 30%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {doctor.name}
              </Typography>
              <Typography color="textSecondary">
                {doctor.specialty}
              </Typography>
              <Link to={`/chat/${doctor.id}`} style={{ textDecoration: 'none' }}>
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                  Start Chat
                </Typography>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <div style={{ paddingBottom: '400px' }}></div>
    </div>
  );
};

export default ChatListPage;
