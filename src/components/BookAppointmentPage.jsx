import React, { useState, useEffect } from 'react';
import { Container, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button, Box, Card, CardContent } from '@mui/material';
import { collection, query, where, getDocs, addDoc, updateDoc, arrayUnion, doc,getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { useUserRole } from '../context/UserRoleContext';


const BookAppointmentPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const { currentUser } = React.useContext(AuthContext);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const {userRole} = useUserRole();

  const fetchAppointmentHistory = async () => {
  try {
    const q = query(collection(db, 'appointments'), where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    const appointmentsData = [];

    await Promise.all(querySnapshot.docs.map(async (docSnap) => {
      const appointment = { id: docSnap.id, ...docSnap.data() };
      // Fetch doctor's name based on doctorId
      const doctorDoc = await getDoc(doc(db, 'users', appointment.doctorId));
      const doctorData = doctorDoc.data();
      appointment.doctorName = doctorData.name; // Assuming the doctor's name field is 'name'
      appointmentsData.push(appointment);
    }));

    setAppointmentHistory(appointmentsData);
  } catch (error) {
    console.error('Error fetching appointment history: ', error);
  }
};

  

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

  useEffect(() => {
    
    fetchAppointmentHistory();
    
  }, []);

  const handleAppointmentConfirmation = async () => {
    try {
      if (!currentUser) return; // Exit if currentUser is not available

      const appointmentData = {
        userId: currentUser.uid,
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        // Add other details as needed
      };
  
      // Add appointment to the appointments collection
      const appointmentRef = await addDoc(collection(db, 'appointments'), appointmentData);
  
      // Find the document ID where uid matches currentUser.uid
      const userQuerySnapshot = await getDocs(collection(db, 'users'));
      let userDocumentId;
      userQuerySnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.uid === currentUser.uid) {
          userDocumentId = doc.id;
        }
      });
  
      // Update patient's document with doctor's ID
      await updateDoc(doc(db, 'users', userDocumentId), {
        doctors: arrayUnion(selectedDoctor)
      });
  
      // Find the document ID where uid matches selectedDoctor
      let doctorDocumentId;
      userQuerySnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.uid === selectedDoctor) {
          doctorDocumentId = doc.id;
        }
      });
  
      // Update doctor's document with patient's ID
      await updateDoc(doc(db, 'users', doctorDocumentId), {
        patients: arrayUnion(currentUser.uid)
      });
  
      // Optionally, you can clear the form fields after confirmation
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
  
      // Fetch updated appointment history
      fetchAppointmentHistory();
    } catch (error) {
      console.error('Error confirming appointment: ', error);
    }
  };

  if (userRole !== "patient") return null;

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Appointment
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="doctor-label">Select Doctor</InputLabel>
        <Select
          labelId="doctor-label"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          {doctors.map((doctor) => (
            <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Select Date"
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        label="Select Time"
        type="time"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        sx={{ mb: 2 }}
        inputProps={{
          step: 300, // 5 min intervals
        }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAppointmentConfirmation}
        sx={{ mb: 2 }}
      >
        Confirm Appointment
      </Button>
      <Box>
        <Typography variant="h5" gutterBottom>
          Appointment History
        </Typography>
        {appointmentHistory.map((appointment) => (
          <Card key={appointment.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1">
                Date: {appointment.date}, Time: {appointment.time}, Doctor: {appointment.doctorName}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default BookAppointmentPage;
