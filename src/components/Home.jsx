import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Paper } from '@mui/material';

const Home = () => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [healthTips, setHealthTips] = useState([]);

  // Sample photos and health tips data
  const photos = [
    'https://assets-global.website-files.com/658dbca5f0868b08d48985ce/65b269838758ed004ceb5da5_Frame-1-7-1024x640.png',
    'https://media.istockphoto.com/id/1465315686/video/woman-monitoring-health-data-in-smart-phone-with-smart-phone-at-home.jpg?s=640x640&k=20&c=a7h5jSQ768-c3tu3FdEkI1xHQ7lckuqIEeQ-rH50wkk=',
    'https://www.anytimefitness.com/wp-content/uploads/2023/11/homepage-hero-afp-december-treadmill-1x.webp',
  ];

  const fetchHealthTips = async () => {
    // Fetch health tips data from API or database
    // Example: const response = await fetch('https://api.example.com/health-tips');
    // const data = await response.json();
    const data = [
      'Drink plenty of water every day to stay hydrated.',
      'Eat a balanced diet with plenty of fruits and vegetables.',
      'Get regular exercise to keep your body and mind healthy.',
      'Practice good hygiene to prevent the spread of germs and illness.',
      'Make time for relaxation and stress-relief activities.',
    ];
    setHealthTips(data);
  };

  useEffect(() => {
    fetchHealthTips();
  }, []);

  const handlePhotoChange = (index) => {
    setPhotoIndex(index);
  };

  return (
    <>
      <main>
        <Container maxWidth="lg" style={{ marginTop: '50px' }}>
          <Typography variant="h4" gutterBottom align="center">Welcome to Health Tracker</Typography>
          <Typography variant="body1" gutterBottom align="center">Track your health and well-being with us!</Typography>

          <Grid container justifyContent="center" style={{ marginTop: '40px' }}>
            <div style={{ position: 'relative', width: '80vw', height: 'auto', maxWidth: '600px', maxHeight: '400px' }}>
              <img
                src={photos[photoIndex]}
                alt="Health"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  maxWidth: '600px', // Set fixed width
                  maxHeight: '400px', // Set fixed height
                }}
              />
              <Paper
                sx={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  paddingY: '5px',
                }}
              >
                {photos.map((_, index) => (
                  <span
                    key={index}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: index === photoIndex ? '#1976d2' : '#bdbdbd',
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePhotoChange(index)}
                  />
                ))}
              </Paper>
            </div>
          </Grid>

          <Grid container justifyContent="center" style={{ marginTop: '40px' }}>
            <Typography variant="h5" gutterBottom>Health Tips:</Typography>
          </Grid>

          <Grid container spacing={2} justifyContent="center">
            {healthTips.map((tip, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={3} sx={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', minHeight: '120px' }}>
                  <CardContent>
                    <Typography variant="body1">{tip}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="body1" gutterBottom style={{ marginTop: '40px' }}>
            Whether you're looking to improve your fitness, manage a chronic condition, or simply stay healthy, Health Tracker is here to support you on your journey to well-being.
          </Typography>

          <Typography variant="body1" gutterBottom style={{ marginTop: '20px' }}>
            Start tracking your health today and discover a happier, healthier you!
          </Typography>
        </Container>
      </main>
    </>
  );
};

export default Home;
