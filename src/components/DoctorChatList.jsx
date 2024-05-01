import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Container, Typography, List, ListItem, ListItemText, Card, CardContent } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const DoctorChatList = () => {
  const { currentUser } = React.useContext(AuthContext);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (currentUser) {
          const patientQuery = query(collection(db, 'chats'), where('doctorId', '==', currentUser.uid));
          const patientSnapshot = await getDocs(patientQuery);
          const patientsData = [];

          for (const docSnap of patientSnapshot.docs) {
            const chatData = docSnap.data();
            const patientId = chatData.patientId;
            const userDocRef = doc(db, 'users', patientId);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();
            const patientName = userData.name;
            
            patientsData.push({ id: docSnap.id, patientId, patientName });
          }

          setPatients(patientsData);
        }
      } catch (error) {
        console.error('Error fetching patients: ', error);
      }
    };

    fetchPatients();
  }, [currentUser]);

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chat with Patients
      </Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {patients.map(patient => (
          <Card key={patient.patientId} style={{ margin: '5px', flex: '1 0 30%', height: '60px', display: 'flex', alignItems: 'center' }}>
            <ListItem component={Link} to={`/doctor/chat/${patient.patientId}`} style={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6">{`${patient.patientName}`}</Typography>
              </CardContent>
            </ListItem>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default DoctorChatList;
