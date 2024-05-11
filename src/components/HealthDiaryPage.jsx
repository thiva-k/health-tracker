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
  const [newEntry, setNewEntry] = useState('');
  const [error, setError] = useState('');
  const [editModeId, setEditModeId] = useState(null);
  const [editedEntry, setEditedEntry] = useState('');
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

  const handleSubmit = async () => {
    if (newEntry.trim() === '') {
      setError('Please enter a diary entry');
      return;
    }

    try {
      // Add diary entry to Firebase
      const docRef = await addDoc(collection(db, 'healthDiary'), {
        userId,
        entry: newEntry,
        timestamp: new Date().toISOString()
      });

      // Update state with the new entry
      setEntries([...entries, { id: docRef.id, entry: newEntry, timestamp: new Date().toISOString() }]);

      // Clear input field and error message
      setNewEntry('');
      setError('');
    } catch (error) {
      console.error('Error adding diary entry: ', error);
    }
  };

  const handleEdit = (id, entry) => {
    setEditModeId(id);
    setEditedEntry(entry);
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'healthDiary', id), {
        entry: editedEntry,
        timestamp: new Date().toISOString()
      });
      const updatedEntries = entries.map(entry => {
        if (entry.id === id) {
          return { ...entry, entry: editedEntry, timestamp: new Date().toISOString() };
        } else {
          return entry;
        }
      });
      setEntries(updatedEntries);
      setEditModeId(null);
      setEditedEntry('');
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
        <Typography variant="h4" component="h1" gutterBottom>
          Health Diary
        </Typography>
        <TextField
          multiline
          rows={4}
          label="Write your diary entry"
          variant="outlined"
          fullWidth
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          error={error !== ''}
          helperText={error}
          margin="normal"
        />
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
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
                        multiline
                        rows={4}
                        label="Edit your diary entry"
                        variant="outlined"
                        fullWidth
                        value={editedEntry}
                        onChange={(e) => setEditedEntry(e.target.value)}
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
                      <Typography variant="body1">{entry.entry}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Typography>
                      <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={() => handleEdit(entry.id, entry.entry)}>
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
