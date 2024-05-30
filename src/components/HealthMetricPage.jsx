import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Paper, Card, CardContent, Box,
  Collapse, IconButton
} from '@mui/material';
import { collection, query, where, getDocs, addDoc, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { useUserRole } from '../context/UserRoleContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const HealthMetricTrackerPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [weight, setWeight] = useState('');
  const [sugarLevel, setSugarLevel] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [metricHistory, setMetricHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMetricHistory, setShowMetricHistory] = useState(false);
  const { currentUser } = React.useContext(AuthContext);
  const { userRole } = useUserRole();

  const userId = currentUser ? currentUser.uid : null;

  const fetchMetricHistory = async () => {
    try {
      if (!userId) return;

      const q = query(
        collection(db, 'health_metrics'),
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const metricHistoryData = [];
      querySnapshot.forEach((doc) => {
        metricHistoryData.push({ id: doc.id, ...doc.data() });
      });
      setMetricHistory(metricHistoryData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metric history: ', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMetricHistory();
    }
  }, [userId]);

  const addHealthMetric = async () => {
    try {
      if (!userId) return;

      const metricData = {
        userId: userId,
        date: selectedDate,
        weight,
        sugarLevel,
        bloodPressure,
        waterIntake,
      };

      await addDoc(collection(db, 'health_metrics'), metricData);

      setSelectedDate('');
      setWeight('');
      setSugarLevel('');
      setBloodPressure('');
      setWaterIntake('');

      fetchMetricHistory();
    } catch (error) {
      console.error('Error adding health metric: ', error);
    }
  };

  const deleteHealthMetric = async (id) => {
    try {
      await deleteDoc(doc(db, 'health_metrics', id));
      fetchMetricHistory();
    } catch (error) {
      console.error('Error deleting health metric: ', error);
    }
  };

  if (loading || !currentUser || userRole !== 'patient') {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Health Metric Tracker
      </Typography>
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
          inputProps={{ min: new Date().toISOString().split('T')[0] }}
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
        <TextField
          fullWidth
          label="Water Intake (in ml)"
          type="number"
          value={waterIntake}
          onChange={(e) => setWaterIntake(e.target.value)}
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

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowMetricHistory(!showMetricHistory)}
          endIcon={showMetricHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {showMetricHistory ? 'Hide Metric History' : 'View Metric History'}
        </Button>
        <Collapse in={showMetricHistory}>
          {metricHistory.map((metric) => (
            <Card key={metric.id} sx={{ boxShadow: 3, mt: 2 }}>
              <CardContent>
                <Typography variant="body1">
                  Date: {metric.date}, Weight: {metric.weight} kg, Sugar Level: {metric.sugarLevel} mg/dL, Blood Pressure: {metric.bloodPressure} mmHg, Water Intake: {metric.waterIntake} ml
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="secondary" onClick={() => deleteHealthMetric(metric.id)}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Collapse>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Paper elevation={3}>
          <Typography variant="h5" gutterBottom align="center">
            Weight Over Time
          </Typography>
          <ResponsiveContainer width="95%" height={300}>
            <LineChart data={metricHistory}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={3}>
          <Typography variant="h5" gutterBottom align="center">
            Sugar Level Over Time
          </Typography>
          <ResponsiveContainer width="95%" height={300}>
            <LineChart data={metricHistory}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sugarLevel" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={3}>
          <Typography variant="h5" gutterBottom align="center">
            Blood Pressure Over Time
          </Typography>
          <ResponsiveContainer width="95%" height={300}>
            <LineChart data={metricHistory}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bloodPressure" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={3}>
          <Typography variant="h5" gutterBottom align="center">
            Water Intake Over Time
          </Typography>
          <ResponsiveContainer width="95%" height={300}>
            <LineChart data={metricHistory}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="waterIntake" stroke="#0088FE" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
      <br />
    </Container>
  );
};

export default HealthMetricTrackerPage;
