import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, TextField, Button, Paper, Card, CardContent } from '@mui/material';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { useUserRole } from '../context/UserRoleContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PatientsMetricPage = () => {
  const [metricHistory, setMetricHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const { currentUser } = React.useContext(AuthContext);
  const { userRole } = useUserRole();

  // Ensure currentUser exists before accessing its properties
  const { userId } = useParams();

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
      setLoading(false);
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


  if (loading || !currentUser || userRole !== 'doctor') {
    return null ;
  }

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Health Metris
      </Typography>
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

export default PatientsMetricPage;
