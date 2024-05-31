import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Card, CardContent } from '@mui/material';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../context/UserRoleContext';
import { AuthContext } from '../context/AuthContext';

const HealthDiaryPage = () => {
  const { currentUser } = React.useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ mood: '', waterIntake: '', meals: '', exercise: '', symptoms: '', notes: '' });
  const [error, setError] = useState('');
  const [editModeId, setEditModeId] = useState(null);
  const [editedEntry, setEditedEntry] = useState({});
  const { userRole } = useUserRole();

  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const q = query(
          collection(db, 'healthDiary'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const entriesData = [];
        querySnapshot.forEach((doc) => {
          entriesData.push({ id: doc.id, ...doc.data() });
        });
        setEntries(entriesData);
      } catch (error) {
        console.error('Error fetching entries: ', error);
      }
    };

    if (userId !== '') {
      fetchEntries();
    }
  }, [userId]);

  const handleChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { mood, waterIntake, meals, exercise, symptoms, notes } = newEntry;
    if (!mood || !waterIntake || !meals || !exercise || !symptoms || !notes) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'healthDiary'), {
        userId,
        ...newEntry,
        timestamp: new Date().toISOString()
      });

      setEntries([...entries, { id: docRef.id, ...newEntry, timestamp: new Date().toISOString() }]);
      setNewEntry({ mood: '', waterIntake: '', meals: '', exercise: '', symptoms: '', notes: '' });
      setError('');
    } catch (error) {
      console.error('Error adding diary entry: ', error);
    }
  };

  const handleEdit = (entry) => {
    setEditModeId(entry.id);
    setEditedEntry(entry);
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'healthDiary', id), {
        ...editedEntry,
        timestamp: new Date().toISOString()
      });
      const updatedEntries = entries.map(entry => (entry.id === id ? { ...entry, ...editedEntry, timestamp: new Date().toISOString() } : entry));
      setEntries(updatedEntries);
      setEditModeId(null);
      setEditedEntry({});
    } catch (error) {
      console.error('Error updating diary entry: ', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'healthDiary', id));
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error deleting diary entry: ', error);
    }
  };

  return (
    userRole === 'patient' ? (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Typography variant="h4" component="h1" >
          Daily Health Diary
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Mood"
            name="mood"
            variant="outlined"
            fullWidth
            value={newEntry.mood}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Water Intake (e.g., 2L)"
            name="waterIntake"
            variant="outlined"
            fullWidth
            value={newEntry.waterIntake}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Meals"
            name="meals"
            variant="outlined"
            fullWidth
            value={newEntry.meals}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Exercise"
            name="exercise"
            variant="outlined"
            fullWidth
            value={newEntry.exercise}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Symptoms"
            name="symptoms"
            variant="outlined"
            fullWidth
            value={newEntry.symptoms}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Notes"
            name="notes"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={newEntry.notes}
            onChange={handleChange}
            margin="normal"
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
        {error && (
          <Box mt={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        <Box mt={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Previous Entries
          </Typography>
          {entries.map((entry) => (
            <Box key={entry.id} mb={2}>
              <Card>
                <CardContent>
                  {editModeId === entry.id ? (
                    <>
                      <TextField
                        label="Mood"
                        name="mood"
                        variant="outlined"
                        fullWidth
                        value={editedEntry.mood}
                        onChange={(e) => setEditedEntry({ ...editedEntry, mood: e.target.value })}
                        margin="normal"
                      />
                      <TextField
                        label="Water Intake"
                        name="waterIntake"
                        variant="outlined"
                        fullWidth
                        value={editedEntry.waterIntake}
                        onChange={(e) => setEditedEntry({ ...editedEntry, waterIntake: e.target.value })}
                        margin="normal"
                      />
                      <TextField
                        label="Meals"
                        name="meals"
                        variant="outlined"
                        fullWidth
                        value={editedEntry.meals}
                        onChange={(e) => setEditedEntry({ ...editedEntry, meals: e.target.value })}
                        margin="normal"
                      />
                      <TextField
                        label="Exercise"
                        name="exercise"
                        variant="outlined"
                        fullWidth
                        value={editedEntry.exercise}
                        onChange={(e) => setEditedEntry({ ...editedEntry, exercise: e.target.value })}
                        margin="normal"
                      />
                      <TextField
                        label="Symptoms"
                        name="symptoms"
                        variant="outlined"
                        fullWidth
                        value={editedEntry.symptoms}
                        onChange={(e) => setEditedEntry({ ...editedEntry, symptoms: e.target.value })}
                        margin="normal"
                      />
                      <TextField
                        label="Notes"
                        name="notes"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={editedEntry.notes}
                        onChange={(e) => setEditedEntry({ ...editedEntry, notes: e.target.value })}
                        margin="normal"
                      />
                      <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={() => handleSaveEdit(entry.id)}>
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
                      <Typography variant="body1"><strong>Mood:</strong> {entry.mood}</Typography>
                      <Typography variant="body1"><strong>Water Intake:</strong> {entry.waterIntake}</Typography>
                      <Typography variant="body1"><strong>Meals:</strong> {entry.meals}</Typography>
                      <Typography variant="body1"><strong>Exercise:</strong> {entry.exercise}</Typography>
                      <Typography variant="body1"><strong>Symptoms:</strong> {entry.symptoms}</Typography>
                      <Typography variant="body1"><strong>Notes:</strong> {entry.notes}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Typography>
                      <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={() => handleEdit(entry)}>
                          Edit
                        </Button>
                        <Box ml={1} component="span">
                          <Button variant="contained" color="secondary" onClick={() => handleDelete(entry.id)}>
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
    ) : (
      null
    )
  );
};

export default HealthDiaryPage;
