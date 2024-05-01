import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Card, CardContent, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { useUserRole } from '../context/UserRoleContext';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const { currentUser } = React.useContext(AuthContext);
  const { userRole } = useUserRole();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (currentUser) {
          const doctorRef = doc(db, 'users', currentUser.uid);
          const doctorSnapshot = await getDoc(doctorRef);
          const doctorData = doctorSnapshot.data();
          const patientIds = doctorData.patients || [];

          const patientsData = [];
          for (const patientId of patientIds) {
            const patientRef = doc(db, 'users', patientId);
            const patientSnapshot = await getDoc(patientRef);
            const patientData = patientSnapshot.data();
            patientsData.push({ id: patientId, name: patientData.name });
          }

          setPatients(patientsData);
        }
      } catch (error) {
        console.error('Error fetching patients: ', error);
      }
    };

    fetchPatients();
  }, [currentUser]);

  if (userRole !== 'doctor') return null;
  
  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Patients
      </Typography>
      {patients.map((patient) => (
        <Card key={patient.id} variant="outlined" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{patient.name}</Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`/patients/diary/${patient.id}`}
            >
              View Diary
            </Button>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`/patients/metrics/${patient.id}`}
            >
              View Metrics
            </Button>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`/patients/reports/${patient.id}`}
            >
              View Reports
            </Button>
          </CardActions>
        </Card>
      ))}
    </Container>
  );
};

export default PatientsPage;
