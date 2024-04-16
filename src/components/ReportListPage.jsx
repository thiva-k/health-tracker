import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../context/UserRoleContext';
import { AuthContext } from '../context/AuthContext';
import { Container, Card, CardContent, Typography } from '@mui/material';

const ReportListPage = () => {
  const [sections, setSections] = useState([]);
  const { userRole } = useUserRole();
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

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

  if (loading || !currentUser || userRole !== 'patient') {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ pt: 4 }} style={{  marginBottom: '20px' }}>
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
              <Link to={`/report/${section}`} style={{ textDecoration: 'none' }}>
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

export default ReportListPage;
