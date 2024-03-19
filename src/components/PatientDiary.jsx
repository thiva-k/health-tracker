// PatientDiary.jsx

import  { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Card, CardContent } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../context/UserRoleContext';

const PatientDiary = () => {
  const { userId } = useParams();
  const [diaryEntries, setDiaryEntries] = useState([]);
  const { userRole } = useUserRole();

  useEffect(() => {
    const fetchDiaryEntries = async () => {
      try {
        const q = query(
          collection(db, 'healthDiary'),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const entriesData = [];
        querySnapshot.forEach((doc) => {
          entriesData.push({ id: doc.id, ...doc.data() });
        });
        setDiaryEntries(entriesData);
      } catch (error) {
        console.error('Error fetching diary entries: ', error);
      }
    };

    fetchDiaryEntries();
  }, [userId]);

  console.log(userRole)

  if (userRole !== 'doctor') return null;

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Patient Diary
      </Typography>
      {diaryEntries.map((entry) => (
        <Card key={entry.id} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body1">{entry.entry}</Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(entry.timestamp).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default PatientDiary;
