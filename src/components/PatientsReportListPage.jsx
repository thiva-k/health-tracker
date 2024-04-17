import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Card, CardContent, Typography } from '@mui/material';

const PatientsReportListPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { patientId } = useParams(); // Get patientId from params

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sectionsData = ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Psychiatry']; // Hardcoded sections
        setSections(sectionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sections: ', error);
      }
    };

    fetchSections();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ pt: 4 }} style={{ marginBottom: '20px' }}>
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center', marginTop: '20px' }}>
        Health Sections
      </Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {sections.map(section => (
          <Card key={section} style={{ minWidth: '250px', margin: '10px', flex: '1 0 30%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {section}
              </Typography>
              <Link to={`/patients/reports/${patientId}/${section}`} style={{ textDecoration: 'none' }}>
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                  View Reports
                </Typography>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default PatientsReportListPage;
