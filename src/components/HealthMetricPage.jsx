import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Paper, Card, CardContent } from '@mui/material';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HealthMetricTrackerPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [weight, setWeight] = useState('');
  const [sugarLevel, setSugarLevel] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [metricHistory, setMetricHistory] = useState([]);
  const { currentUser } = React.useContext(AuthContext);

  // Ensure currentUser exists before accessing its properties
  const userId = currentUser ? currentUser.uid : null;

  const fetchMetricHistory = async () => {
    try {
      if (!userId) return; // Don't fetch if userId is null

      const q = query(
        collection(db, 'health_metrics'),
        where('userId', '==', userId),
        orderBy('date', 'desc') // Order by date in descending order
      );
      const querySnapshot = await getDocs(q);
      const metricHistoryData = [];
      querySnapshot.forEach((doc) => {
        metricHistoryData.push({ id: doc.id, ...doc.data() });
      });
      setMetricHistory(metricHistoryData);
    } catch (error) {
      console.error('Error fetching metric history: ', error);
    }
  };

  // Fetch metric history only if userId is not null
  useEffect(() => {
    if (userId) {
      fetchMetricHistory();
    }
  }, [userId]);

  // Function to add a new health metric
  const addHealthMetric = async () => {
    try {
      if (!userId) return;

      const metricData = {
        userId: userId,
        date: selectedDate,
        weight,
        sugarLevel,
        bloodPressure,
        // Add other details as needed
      };

      await addDoc(collection(db, 'health_metrics'), metricData);

      // Clear form fields after adding metric
      setSelectedDate('');
      setWeight('');
      setSugarLevel('');
      setBloodPressure('');
      
      // Refetch metric history to update UI
      fetchMetricHistory();
    } catch (error) {
      console.error('Error adding health metric: ', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Health Metric Tracker
      </Typography>
      {/* Form to add new health metric */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
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
        />
        <TextField
          fullWidth
          label="Weight (in kg)"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Sugar Level (in mg/dL)"
          type="number"
          value={sugarLevel}
          onChange={(e) => setSugarLevel(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Blood Pressure (in mmHg)"
          type="text"
          value={bloodPressure}
          onChange={(e) => setBloodPressure(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={addHealthMetric}
          sx={{ mb: 2 }}
        >
          Add Metric
        </Button>
      </Paper>
      {/* Display metric history */}
      {metricHistory.map((metric) => (
        <Card key={metric.id} sx={{ boxShadow: 3, mb: 2 }}>
          <CardContent>
            <Typography variant="body1">
              Date: {metric.date}, Weight: {metric.weight} kg, Sugar Level: {metric.sugarLevel} mg/dL, Blood Pressure: {metric.bloodPressure} mmHg
            </Typography>
          </CardContent>
        </Card>
      ))}
      {/* Display charts */}
      <div>
        <Typography variant="h5" gutterBottom>
          Weight Over Time
        </Typography>
        <LineChart width={500} height={300} data={metricHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="weight" stroke="#8884d8" />
        </LineChart>
      </div>
      <div>
        <Typography variant="h5" gutterBottom>
          Sugar Level Over Time
        </Typography>
        <LineChart width={500} height={300} data={metricHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sugarLevel" stroke="#82ca9d" />
        </LineChart>
      </div>
      <div>
        <Typography variant="h5" gutterBottom>
          Blood Pressure Over Time
        </Typography>
        <LineChart width={500} height={300} data={metricHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="bloodPressure" stroke="#ffc658" />
        </LineChart>
      </div>
    </Container>
  );
};

export default HealthMetricTrackerPage;
