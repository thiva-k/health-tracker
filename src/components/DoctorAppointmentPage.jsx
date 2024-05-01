import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';

const DoctorAppointmentPage = () => {
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const { currentUser } = React.useContext(AuthContext);

  const fetchAppointmentHistory = async () => {
    try {
      if (!currentUser) return;
      const q = query(collection(db, 'appointments'), where('doctorId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const appointmentsData = [];

      await Promise.all(querySnapshot.docs.map(async (docSnap) => {
        const appointment = { id: docSnap.id, ...docSnap.data() };
        const userDoc = await getDoc(doc(db, 'users', appointment.userId));
        const userData = userDoc.data();
        appointment.patientName = userData.name;
        appointment.status = appointment.status || 'completed'; // Set default status to completed if not available
        appointmentsData.push(appointment);
      }));

      setAppointmentHistory(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointment history: ', error);
    }
  };

  useEffect(() => {
    fetchAppointmentHistory();
  }, [currentUser]);

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      fetchAppointmentHistory();
    } catch (error) {
      console.error('Error deleting appointment: ', error);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'confirmed',
      });
      fetchAppointmentHistory();
    } catch (error) {
      console.error('Error confirming appointment: ', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Appointment History
      </Typography>
      <Box>
        {appointmentHistory.map((appointment) => (
          <Card key={appointment.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1">
                Patient: {appointment.patientName}, Date: {appointment.date}, Time: {appointment.time}, 
                Status: 
                <span style={{ color: appointment.status === 'pending' ? 'yellow' : 
                                  appointment.status === 'confirmed' ? 'green' : 'red'}}>
                  {appointment.status}
                </span>
              </Typography>
              {appointment.status === 'pending' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleConfirmAppointment(appointment.id)}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Confirm
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDeleteAppointment(appointment.id)}
                sx={{ mt: 1 }}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default DoctorAppointmentPage;
