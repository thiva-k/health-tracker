import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Button, Grid, Card, CardContent, TextField } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ReportViewPage = () => {
  const { section } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReport, setNewReport] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [reportDate, setReportDate] = useState('');
  const storage = getStorage();

  const fetchReports = async () => {
    try {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      const q = query(collection(db, 'reports'), where('userId', '==', currentUser.uid), where('section', '==', section));
      const querySnapshot = await getDocs(q);
      const reportsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt && data.createdAt.toDate) {
          data.createdAt = data.createdAt.toDate();
        }
        reportsData.push({ id: doc.id, ...data });
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

      if (reportDate) {
        reportData.createdAt = new Date(reportDate);
      }

      await addDoc(collection(db, 'reports'), reportData);
      setNewReport('');
      setNewImage(null);
      setReportDate('');
      fetchReports();
    } catch (error) {
      console.error('Error uploading report: ', error);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId)); // Construct document reference using doc() function
      setReports(reports.filter((report) => report.id !== reportId));
    } catch (error) {
      console.error('Error deleting report: ', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 4 }} style={{ marginBottom: '20px' }}>
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
                    {report.createdAt && (
                      <Typography variant="caption" color="textSecondary" style={{ marginBottom: '8px' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                    <Typography variant="body1">{report.report}</Typography>
                    {report.imageURL && <img src={report.imageURL} alt="Report" style={{ maxWidth: '100%' }} />}
                    <Button variant="outlined" color="error" onClick={() => handleDelete(report.id)} style={{ marginTop: '10px' }}>
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        )}
      </Grid>
      <div style={{ marginTop: '20px' }}>
        <TextField
          fullWidth
          label="Select Date"
          type="date"
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ marginBottom: 2 }}
          inputProps={{ min: new Date().toISOString().split('T')[0] }} // Allow only dates after current date
        />
        <TextField
          label="New Report"
          variant="outlined"
          multiline
          fullWidth
          rows={3}
          value={newReport}
          onChange={(e) => setNewReport(e.target.value)}
        />
        <div>
          <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} style={{ marginTop: '10px' }} />
        </div>
        <Button variant="contained" color="primary" onClick={handleUpload} style={{ marginTop: '10px' }}>
          Upload Report
        </Button>
      </div>
    </Container>
  );
};

export default ReportViewPage;
