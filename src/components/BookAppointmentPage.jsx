import React, { useState, useEffect } from 'react';
import { Container, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button, Box, Card, CardContent } from '@mui/material';
import { collection, query, where, getDocs, addDoc, updateDoc, arrayUnion, doc, getDoc , deleteDoc} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { useUserRole } from '../context/UserRoleContext';

const BookAppointmentPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentUserData, setCurrentUserData] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const { userRole } = useUserRole();
  const { currentUser } = React.useContext(AuthContext);

  const fetchAppointmentHistory = async () => {
    try {
      if (!currentUser) return;
      const q = query(collection(db, 'appointments'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const appointmentsData = [];

      await Promise.all(querySnapshot.docs.map(async (docSnap) => {
        const appointment = { id: docSnap.id, ...docSnap.data() };
        const doctorDoc = await getDoc(doc(db, 'users', appointment.doctorId));
        const doctorData = doctorDoc.data();
        appointment.doctorName = doctorData.name;
        appointment.status = appointment.status || 'completed'; // Set default status to completed if not available
        appointmentsData.push(appointment);
      }));

      setAppointmentHistory(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointment history: ', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) return;
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setCurrentUserData(userDoc.data());
      } catch (error) {
        console.error('Error fetching user data: ', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        let q;
        if (selectedSpeciality) {
          q = query(collection(db, 'users'), where('role', '==', 'doctor'), where('doctorType', '==', selectedSpeciality));
        } else {
          q = query(collection(db, 'users'), where('role', '==', 'doctor'));
        }
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
  }, [selectedSpeciality]);

  useEffect(() => {
    fetchAppointmentHistory();
  }, [currentUser]);

  const handleAppointmentConfirmation = async () => {
    try {
      if (!currentUser) return;

      const appointmentData = {
        userId: currentUser.uid,
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        status: 'pending', // Set the initial status to pending
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      const userQuerySnapshot = await getDocs(collection(db, 'users'));
      let userDocumentId;
      userQuerySnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.uid === currentUser.uid) {
          userDocumentId = doc.id;
        }
      });

      if (userDocumentId) {
        await updateDoc(doc(db, 'users', userDocumentId), {
          doctors: arrayUnion(selectedDoctor)
        });
      }

      let doctorDocumentId;
      userQuerySnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.uid === selectedDoctor) {
          doctorDocumentId = doc.id;
        }
      });

      if (doctorDocumentId) {
        await updateDoc(doc(db, 'users', doctorDocumentId), {
          patients: arrayUnion(currentUser.uid)
        });
      }

      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');

      fetchAppointmentHistory();
    } catch (error) {
      console.error('Error confirming appointment: ', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      fetchAppointmentHistory();
    } catch (error) {
      console.error('Error deleting appointment: ', error);
    }
  };

  if (userRole !== "patient") return null;

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Virtual Appointment
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="speciality-label">Select Speciality</InputLabel>
        <Select
          labelId="speciality-label"
          value={selectedSpeciality}
          onChange={(e) => setSelectedSpeciality(e.target.value)}
        >
          <MenuItem value="">Select Speciality</MenuItem>
          <MenuItem value="Cardiology">Cardiology</MenuItem>
          <MenuItem value="Dermatology">Dermatology</MenuItem>
          <MenuItem value="Neurology">Neurology</MenuItem>
          <MenuItem value="Orthopedics">Orthopedics</MenuItem>
          <MenuItem value="Psychiatry">Psychiatry</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="doctor-label">Select Doctor</InputLabel>
        <Select
          labelId="doctor-label"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          disabled={!selectedSpeciality}
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
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ mb: 2 }}
        inputProps={{ min: new Date().toISOString().split('T')[0] }} // Allow only dates after current date
      />
      <TextField
        fullWidth
        label="Select Time"
        type="time"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        sx={{ mb: 2 }}
        inputProps={{
          step: 300,
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
                Date: {appointment.date}, Time: {appointment.time}, Doctor: {appointment.doctorName}, 
                Status: 
                <span style={{ color: appointment.status === 'pending' ? 'yellow' : 
                                  appointment.status === 'confirmed' ? 'green' : 'red'}}>
                  {appointment.status}
                </span>
              </Typography>
              {new Date(appointment.date + ' ' + appointment.time) > new Date() && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteAppointment(appointment.id)}
                  sx={{ mt: 1 }}
                >
                  Delete
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default BookAppointmentPage;
