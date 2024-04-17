import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';

const PatientsReportViewPage = () => {
  const { patientId, section } = useParams(); // Get patientId and section from params
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, 'reports'), where('userId', '==', patientId), where('section', '==', section));
        const querySnapshot = await getDocs(q);
        const reportsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate(); // Convert createdAt to Date object
          }
          reportsData.push({ id: doc.id, ...data });
        });
        setReports(reportsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports: ', error);
      }
    };

    fetchReports();
  }, [patientId, section]);

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
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        )}
      </Grid>
    </Container>
  );
};

export default PatientsReportViewPage;
