import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Paper, IconButton, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { AuthContext } from "../context/AuthContext";
import { useContext } from 'react';

function Footer() {
  const { currentUser } = useContext(AuthContext);
  const [footerPosition, setFooterPosition] = useState('relative');

  useEffect(() => {
    const handleResize = () => {
      const contentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      if (contentHeight < viewportHeight) {
        setFooterPosition('fixed');
      } else {
        setFooterPosition('relative');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const footerStyle = {
    backgroundColor: '#f5f5f5', // Slightly gray background
    color: 'black', // Text color
    padding: '20px 0', // Add padding top and bottom
    width: '100%',
    position: footerPosition, // Fix footer position dynamically
    bottom: 0, // Stick to the bottom if fixed
    zIndex: 999, // Ensure footer is above other content
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    padding: '0', // Disable gutters
  };

  const paperStyle = {
    padding: '20px', // Add padding inside the paper
    marginTop: '20px', // Add margin top
    marginBottom: '20px', // Add margin bottom
  };

  return (
    <div style={footerStyle}>
      <Container disableGutters style={containerStyle}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: '8px' }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: '8px' }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </IconButton>
            </div>
          </Grid>
          {currentUser && (
            <Grid item>
              <Typography variant="body2">
                <a href="/">About</a>
                <span style={{ margin: '0 8px' }}>|</span> {/* Add separator */}
                <a href="/">Contact Us</a>
              </Typography>
            </Grid>
          )}
          {!currentUser && (
            <Grid item>
              <Paper elevation={3} style={paperStyle}>
                <Typography variant="h6" gutterBottom>
                  Contact Us
                </Typography>
                <Typography variant="body1" gutterBottom>
                  For inquiries, you can reach us at:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Phone: 011-123-4567
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Email: info@health-tracker.com
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Address: No.123, Kattubedda Road, Moratuwa
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
      <Typography variant="body2" align="center">
        ©2024. All Rights Reserved.
      </Typography>
    </div>
  );
}

export default Footer;
