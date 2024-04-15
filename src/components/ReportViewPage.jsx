import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase'; // Ensure db is the Firestore instance
import { AuthContext } from '../context/AuthContext';
import { Typography, Button, Grid, Card, CardContent, CardActions, TextField } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary functions from Firebase Storage

const ReportViewPage = () => {
  const { section } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReport, setNewReport] = useState('');
  const [newImage, setNewImage] = useState(null);
  const storage = getStorage();

  const fetchReports = async () => {
    try {
      const q = query(collection(db, 'reports'), where('userId', '==', currentUser.uid), where('section', '==', section));
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
      const reportData = {
        userId: currentUser.uid,
        section: section,
        report: newReport,
        createdAt: serverTimestamp(),
      };

      if (newImage) {
        const storageRef = ref(storage, `reports/${currentUser.uid}/${Date.now()}_${newImage.name}`);
        const uploadTask = uploadBytes(storageRef, newImage);
        const snapshot = await uploadTask;
        const imageURL = await getDownloadURL(snapshot.ref);
        reportData.imageURL = imageURL;
      }

      await addDoc(collection(db, 'reports'), reportData);
      setNewReport('');
      setNewImage(null);
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
                    {report.imageURL && <img src={report.imageURL} alt="Report" style={{ maxWidth: '100%' }} />}
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
        <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} style={{ marginTop: '10px' }} />
        <Button variant="contained" color="primary" onClick={handleUpload} style={{ marginTop: '10px' }}>
          Upload Report
        </Button>
      </div>
    </div>
  );
};

export default ReportViewPage;
