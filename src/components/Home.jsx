import  { useState, useEffect } from 'react';
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
    // Mock fetching health tips data from an API or database
    const data = [
      'Drink plenty of water every day to stay hydrated.',
      'Eat a balanced diet with plenty of fruits and vegetables.',
      'Get regular exercise to keep your body and mind healthy.',
      'Practice good hygiene to prevent the spread of germs and illness.',
      'Make time for relaxation and stress-relief activities.',
      'Get 8 hours of sleep daily for your body to repair.'
    ];
    setHealthTips(data);
  };

  useEffect(() => {
    fetchHealthTips();
    const intervalId = setInterval(() => {
      // Increment the photoIndex to move to the next photo
      setPhotoIndex(prevIndex => (prevIndex + 1) % photos.length);
    }, 3000); // Change photo every 3 seconds

    // Clear the interval when component unmounts to avoid memory leaks
    return () => clearInterval(intervalId);
  }, []);

  const handlePhotoChange = (index) => {
    setPhotoIndex(index);
  };

  return (

    <main>
      
      <Container maxWidth="lg" style={{ marginTop: '30px', paddingBottom: '20px' }}>

          <Paper
          elevation={3}
          sx={{
            position: 'relative',
            width: '100%',
            height: '300px',
            backgroundColor: '#f0f0f0', // Set background color
            backgroundImage: `url('https://slidebazaar.com/wp-content/uploads/2022/05/white-background-slides-SB02298.jpg')`, // Set background image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginBottom: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Health Tracker
          </Typography>
          <Typography variant="h6" gutterBottom>
            Track your health and well-being with us!
          </Typography>
        </Paper>

        <Grid container justifyContent="center">
          <Paper elevation={3} sx={{ position: 'relative', width: '850px', height: '450px', borderRadius: '16px', marginBottom: '20px' }}>
            <img
              src={photos[photoIndex]}
              alt="Health"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '16px',
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
          </Paper>
        </Grid>

        <Typography variant="h5" gutterBottom align="center" sx={{ marginBottom: '20px' }}>Health Tips:</Typography>

        <Grid container spacing={2} justifyContent="center">
          {healthTips.map((tip, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={3} sx={{ borderRadius: '16px' }}>
                <CardContent>
                  <Typography variant="h6">{tip}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </main>
  );
};

export default Home;
