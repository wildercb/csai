'use client'

import React, { useState } from 'react';
import { Button, Typography, Box, Container, Grid, AppBar, Toolbar, Modal, useTheme, useMediaQuery } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import Auth from './components/Auth';
import PopupChat from './components/PopupChat';

const Feature = ({ icon, title, description }) => (
  <Box sx={{ textAlign: 'center', p: 2 }}>
    {icon}
    <Typography variant="h6" component="h3" sx={{ my: 2 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAuthOpen = (loginMode) => {
    setIsLogin(loginMode);
    setAuthOpen(true);
  };

  const handleAuthClose = () => {
    setAuthOpen(false);
  };

  return (
    <Box>
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <HealthAndSafetyIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            HealthChat AI
          </Typography>
          <Button color="primary" onClick={() => handleAuthOpen(true)} sx={{ mr: 1 }}>Login</Button>
          <Button color="primary" variant="contained" onClick={() => handleAuthOpen(false)}>Sign Up</Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          backgroundImage: 'url("/images/Health_background_1.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          pt: 8,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: -1,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, backgroundColor: 'rgba(0, 0, 0, 0.5)', paddingBottom: '1rem' }}>
          <Typography variant={isMobile ? 'h3' : 'h2'} component="h1" gutterBottom fontWeight="bold">
            Your Personal Health Assistant
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Get instant answers to your health questions
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ChatIcon />}
            sx={{ mt: 4, fontSize: '1.2rem', py: 1.5, px: 4 }}
          >
            Start Chatting Now
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Why Choose HealthChat AI?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Feature
              icon={<ChatIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
              title="Instant Responses"
              description="Get quick and accurate answers to your health questions anytime, anywhere."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Feature
              icon={<SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
              title="Privacy Focused"
              description="Your health information is always kept confidential and secure."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Feature
              icon={<HistoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
              title="Personalized Experience"
              description="Our AI learns from your interactions to provide tailored health advice."
            />
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Ready to take control of your health?
          </Typography>
          <Typography variant="body1" textAlign="center" paragraph>
            Join thousands of users who trust HealthChat AI for their health inquiries.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button variant="contained" size="large" onClick={() => handleAuthOpen(false)} sx={{ mr: 2 }}>
              Sign Up Now
            </Button>
            <Button variant="outlined" size="large" onClick={() => handleAuthOpen(true)}>
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      <Modal
        open={authOpen}
        onClose={handleAuthClose}
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Auth isLogin={isLogin} onClose={handleAuthClose} />
        </Box>
      </Modal>

      <PopupChat />
    </Box>
  );
}