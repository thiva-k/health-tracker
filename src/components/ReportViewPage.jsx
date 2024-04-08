import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { Typography, Button, Grid, Card, CardContent, CardActions, TextField } from '@mui/material';

const ReportViewPage = () => {
  const { section } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReport, setNewReport] = useState('');

  const fetchReports = async () => {
    try {
      const userRef = collection(db, 'reports');
      const q = query(userRef, where('userId', '==', currentUser.uid), where('section', '==', section));
      const querySnapshot = await getDocs(q);
      const reportsData = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() });
      });
      setReports(reportsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports: ', error);
    }
  };

  useEffect(() => {
    

    fetchReports();
  }, [currentUser, section]);

  const handleUpload = async () => {
    try {
      await db.collection('reports').add({
        userId: currentUser.uid,
        section: section,
        report: newReport,
        createdAt: new Date().toISOString(),
      });
      setNewReport('');
      fetchReports();
    } catch (error) {
      console.error('Error uploading report: ', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center', marginTop: '20px' }}>
        {section} Reports
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            {reports.map((report) => (
              <Grid item key={report.id}>
                <Card style={{ minWidth: '250px', margin: '10px' }}>
                  <CardContent>
                    <Typography variant="body1">{report.report}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        )}
      </Grid>
      <div style={{ marginTop: '20px' }}>
        <TextField
          label="New Report"
          variant="outlined"
          multiline
          fullWidth
          rows={3}
          value={newReport}
          onChange={(e) => setNewReport(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleUpload} style={{ marginTop: '10px' }}>
          Upload Report
        </Button>
      </div>
    </div>
  );
};

export default ReportViewPage;
