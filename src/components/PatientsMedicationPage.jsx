import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, TextField, Button, Box, Card, CardContent, 
  FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, 
  OutlinedInput, FormControlLabel, Collapse, IconButton 
} from '@mui/material';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../context/UserRoleContext';
import { AuthContext } from '../context/AuthContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const SCHEDULE_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];

const PatientsMedicationPage = () => {
  const { currentUser } = React.useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState('');
  const [newSchedule, setNewSchedule] = useState([]);
  const [newQuantity, setNewQuantity] = useState('');
  const [error, setError] = useState('');
  const [editModeId, setEditModeId] = useState(null);
  const [editedMedication, setEditedMedication] = useState('');
  const [editedSchedule, setEditedSchedule] = useState([]);
  const [editedQuantity, setEditedQuantity] = useState('');
  const [takenToday, setTakenToday] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const { userRole } = useUserRole();

  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const q = query(
          collection(db, 'medications'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const medicationsData = [];
        querySnapshot.forEach((doc) => {
          medicationsData.push({ id: doc.id, ...doc.data() });
        });
        setMedications(medicationsData);
        
        // Fetch takenToday data
        const takenDoc = await getDoc(doc(db, 'medications', `${userId}_takenToday`));
        if (takenDoc.exists()) {
          setTakenToday(takenDoc.data());
        }
      } catch (error) {
        console.error('Error fetching medications: ', error);
      }
    };

    if (userId !== '') {
      fetchMedications();
    }
  }, [userId]);

  const handleSubmit = async () => {
    if (newMedication.trim() === '' || newSchedule.length === 0 || newQuantity.trim() === '') {
      setError('Please enter medication name, schedule, and quantity');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'medications'), {
        userId,
        medication: newMedication,
        schedule: newSchedule,
        quantity: parseInt(newQuantity, 10),
        timestamp: new Date().toISOString()
      });

      setMedications([...medications, { id: docRef.id, medication: newMedication, schedule: newSchedule, quantity: parseInt(newQuantity, 10), timestamp: new Date().toISOString() }]);
      setNewMedication('');
      setNewSchedule([]);
      setNewQuantity('');
      setError('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding medication: ', error);
    }
  };

  const handleEdit = (id, medication, schedule, quantity) => {
    setEditModeId(id);
    setEditedMedication(medication);
    setEditedSchedule(schedule);
    setEditedQuantity(quantity);
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'medications', id), {
        medication: editedMedication,
        schedule: editedSchedule,
        quantity: parseInt(editedQuantity, 10),
        timestamp: new Date().toISOString()
      });
      const updatedMedications = medications.map(med => {
        if (med.id === id) {
          return { ...med, medication: editedMedication, schedule: editedSchedule, quantity: parseInt(editedQuantity, 10), timestamp: new Date().toISOString() };
        } else {
          return med;
        }
      });
      setMedications(updatedMedications);
      setEditModeId(null);
      setEditedMedication('');
      setEditedSchedule([]);
      setEditedQuantity('');
    } catch (error) {
      console.error('Error updating medication: ', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'medications', id));
      const updatedMedications = medications.filter(med => med.id !== id);
      setMedications(updatedMedications);
    } catch (error) {
      console.error('Error deleting medication: ', error);
    }
  };

  const handleTakenChange = async (id, time, checked) => {
    const key = `${id}_${time}`;
    const updatedTakenToday = { ...takenToday, [key]: checked };
    setTakenToday(updatedTakenToday);

    const medIndex = medications.findIndex(med => med.id === id);
    if (medIndex > -1) {
      const updatedMedications = [...medications];
      if (checked) {
        updatedMedications[medIndex].quantity -= 1;
      } else {
        updatedMedications[medIndex].quantity += 1;
      }
      setMedications(updatedMedications);
      await updateDoc(doc(db, 'medications', id), { quantity: updatedMedications[medIndex].quantity });
    }

    await setDoc(doc(db, 'medications', `${userId}_takenToday`), updatedTakenToday);
  };

  const renderScheduleDropdown = (schedule, setSchedule) => (
    <FormControl fullWidth margin="normal">
      <InputLabel id="schedule-label">Schedule</InputLabel>
      <Select
        labelId="schedule-label"
        multiple
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
        input={<OutlinedInput label="Schedule" />}
        renderValue={(selected) => selected.join(', ')}
      >
        {SCHEDULE_OPTIONS.map((time) => (
          <MenuItem key={time} value={time}>
            <Checkbox checked={schedule.indexOf(time) > -1} />
            <ListItemText primary={time} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    userRole === 'patient' ? (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Medication Tracker
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAddForm(!showAddForm)}
          endIcon={showAddForm ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {showAddForm ? 'Hide' : 'Add New Medication'}
        </Button>
        <Collapse in={showAddForm}>
          <Box mt={2}>
            <TextField
              label="Medication Name"
              variant="outlined"
              fullWidth
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              margin="normal"
            />
            {renderScheduleDropdown(newSchedule, setNewSchedule)}
            <TextField
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              margin="normal"
            />
            <Box mt={2}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Box>
            {error && <Typography color="error">{error}</Typography>}
          </Box>
        </Collapse>
        <Box mt={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Current Medications
          </Typography>
          {medications.map((med) => (
            <Box key={med.id} mb={2}>
              <Card>
                <CardContent>
                  {editModeId === med.id ? (
                    <>
                      <TextField
                        label="Medication Name"
                        variant="outlined"
                        fullWidth
                        value={editedMedication}
                        onChange={(e) => setEditedMedication(e.target.value)}
                        margin="normal"
                      />
                      {renderScheduleDropdown(editedSchedule, setEditedSchedule)}
                      <TextField
                        label="Quantity"
                        variant="outlined"
                        fullWidth
                        type="number"
                        value={editedQuantity}
                        onChange={(e) => setEditedQuantity(e.target.value)}
                        margin="normal"
                      />
                      <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={() => handleSaveEdit(med.id)}>
                          Save
                        </Button>
                        <Box ml={1} component="span">
                          <Button variant="contained" onClick={() => setEditModeId(null)}>
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6">{med.medication}</Typography>
                      <Typography variant="body1">Schedule: {med.schedule.join(', ')}</Typography>
                      <Typography variant="body1">Quantity: {med.quantity}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(med.timestamp).toLocaleString()}
                      </Typography>
                      <Box mt={2}>
                        {med.schedule.map((time) => (
                          <FormControlLabel
                            key={time}
                            control={
                              <Checkbox
                                checked={takenToday[`${med.id}_${time}`] || false}
                                onChange={(e) => handleTakenChange(med.id, time, e.target.checked)}
                              />
                            }
                            label={`Taken ${time}`}
                          />
                        ))}
                      </Box>
                      <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={() => handleEdit(med.id, med.medication, med.schedule, med.quantity)}>
                          Edit
                        </Button>
                        <Box ml={1} component="span">
                          <Button variant="contained" color="secondary" onClick={() => handleDelete(med.id)}>
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    ) : null
  );
};

export default PatientsMedicationPage;
