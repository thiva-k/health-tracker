import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Card, CardContent } from '@mui/material';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../context/UserRoleContext';
import { AuthContext } from '../context/AuthContext';

const HealthDiaryPage = () => {
  const { currentUser } = React.useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [error, setError] = useState('');
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
                  <Typography variant="body1">{entry.entry}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(entry.timestamp).toLocaleString()}
                  </Typography>
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
