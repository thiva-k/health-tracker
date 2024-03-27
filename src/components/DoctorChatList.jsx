import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

const DoctorChatList = () => {
  const { currentUser } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientQuery = query(collection(db, 'chats'), where('doctorId', '==', currentUser.uid));
        const patientSnapshot = await getDocs(patientQuery);
        const patientsData = patientSnapshot.docs.map(doc => {
          const chatData = doc.data();
          return {
            id: doc.id,
            patientId: chatData.patientId
          };
        });
        setPatients(patientsData);
      } catch (error) {
        console.error('Error fetching patients: ', error);
      }
    };

    fetchPatients();
  }, [currentUser]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Chat with Patients
      </Typography>
      <List>
        {patients.map(patient => (
          <ListItem key={patient.id} component={Link} to={`/doctor/chat/${patient.patientId}`}>
            <ListItemText primary={`Patient ID: ${patient.patientId}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default DoctorChatList;
