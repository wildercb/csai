'use client'

import React, { useState } from 'react';
import { keyframes } from '@emotion/react';
import { Button, Typography, Box, Container, AppBar, Toolbar, Modal, useTheme, useMediaQuery } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import Auth from './components/Auth';
import PopupChat from './components/PopupChat';
import { auth } from './utils/firebase';
import { useRouter } from 'next/navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-nunito), Arial, sans-serif',
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-nunito), Arial, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-nunito), Arial, sans-serif',
        },
      },
    },
  },
});

const FeatureCard = ({ icon, title, description }) => (
  <Box
    sx={{
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '2rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
      },
    }}
  >
    <Box
      sx={{
        backgroundColor: 'primary.main',
        borderRadius: '50%',
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" component="h3" sx={{ mb: 2, color: 'white', textAlign: 'center' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', flexGrow: 1 }}>
      {description}
    </Typography>
  </Box>
);

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [healthBotOpen, setHealthBotOpen] = useState(false);
  const [user, setUser] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const handleAuthOpen = (loginMode) => {
    setIsLogin(loginMode);
    setAuthOpen(true);
  };

  const handleAuthClose = () => setAuthOpen(false);
  const handleTryHealthBot = () => setHealthBotOpen(true);
  const handleCloseHealthBot = () => setHealthBotOpen(false);

  const handleEnterChatRoom = () => {
    if (user) {
      router.push('/chat');
    } else {
      handleAuthOpen(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ fontFamily: 'var(--font-nunito), Arial, sans-serif' }}>
        <AppBar position="fixed" color = "transparent" elevation={0} sx={{ backgroundColor: "transparent" }}>
          <Toolbar>
            <HealthAndSafetyIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
              HealthChat AI
            </Typography>
            <Button color="inherit" variant= "contained" onClick={() => handleAuthOpen(true)} sx={{ mr: 1 }}>Login</Button>
            <Button color="inherit" variant="contained" onClick={() => handleAuthOpen(false)}>Sign Up</Button>
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
          <Container maxWidth="md" sx={{ 
            position: 'relative', 
            zIndex: 2, 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          }}>
            <Typography 
              variant={isMobile ? 'h3' : 'h2'} 
              component="h1" 
              gutterBottom 
              fontWeight="bold"
              sx={{
                color: '#ffffff',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Your Personal Health Assistant
            </Typography>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
              }}
            >
              Get instant answers to your health questions
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ChatIcon />}
                onClick={handleTryHealthBot}
                sx={{ 
                  fontSize: '1.2rem', 
                  py: 1.5, 
                  px: 4,
                  backgroundColor: '#ffe66d',
                  color: '#333',
                  '&:hover': {
                    backgroundColor: '#fff7aa',
                  },
                }}
              >
                Try HealthBot
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleEnterChatRoom}
                sx={{ 
                  fontSize: '1.2rem', 
                  py: 1.5, 
                  px: 4, 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: '#ffe66d',
                    color: '#ffe66d',
                  },
                }}
              >
                Enter Chat
              </Button>
            </Box>
          </Container>  
        </Box>

        <Box sx={{
          background: 'linear-gradient(135deg, #0a2463, #3e92cc)',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold" sx={{ color: 'white', mb: 8 }}>
              Why Choose HealthChat AI?
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
                <FeatureCard
                  icon={<ChatIcon sx={{ fontSize: 40, color: 'white' }} />}
                  title="Instant Responses"
                  description="Get quick and accurate answers to your health questions anytime, anywhere."
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
                <FeatureCard
                  icon={<SecurityIcon sx={{ fontSize: 40, color: 'white' }} />}
                  title="Privacy Focused"
                  description={<>Your health information is always kept confidential and secure. We highly recommend not sharing any sensitive information as our products interact with model provider APIs. Learn more about sensitive information from <a href="https://www.ncbi.nlm.nih.gov/books/NBK236546/" style={{color: '#ffe66d'}}>NCBI</a>.</>}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
                <FeatureCard
                  icon={<HealthAndSafetyIcon sx={{ fontSize: 40, color: 'white' }} />}
                  title="Safe and Secure Models"
                  description="Our AI has learned from the best medical experts to provide safe and accurate health advice."
                />
              </Box>
            </Box>
          </Container>
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("/images/dna-pattern.png")',
              backgroundSize: '200px',
              opacity: 0.05,
              animation: 'move 30s linear infinite',
              '@keyframes move': {
                '0%': { backgroundPosition: '0 0' },
                '100%': { backgroundPosition: '200px 200px' },
              },
            }}
          />
        </Box>

        <Box sx={{ 
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a2463 0%, #000000 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px), radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px), radial-gradient(rgba(255,255,255,.4), rgba(255,255,255,.1) 2px, transparent 30px)',
            backgroundSize: '550px 550px, 350px 350px, 250px 250px, 150px 150px',
            backgroundPosition: '0 0, 40px 60px, 130px 270px, 70px 100px',
            animation: 'twinkle 10s infinite linear',
          },
          '@keyframes twinkle': {
            '0%': { backgroundPosition: '0 0, 40px 60px, 130px 270px, 70px 100px' },
            '100%': { backgroundPosition: '0 -550px, 40px -490px, 130px -280px, 70px -450px' },
          },
        }}>
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              textAlign="center" 
              gutterBottom 
              fontWeight="bold" 
              sx={{
                color: '#ffffff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Ready to have the best health information at your fingertips?
            </Typography>
            <Typography 
              variant="body1" 
              textAlign="center" 
              paragraph 
              sx={{ 
                color: '#e0e0e0',
                fontSize: '1.1rem',
                mb: 4,
              }}
            >
              Start chatting with HealthBot today.
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 4,
            }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => handleAuthOpen(false)} 
                sx={{ 
                  mr: 2, 
                  bgcolor: '#ffe66d',
                  color: '#0a2463',
                  fontWeight: 'bold',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  borderRadius: '30px',
                  boxShadow: '0 4px 14px rgba(255, 230, 109, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#fff7aa',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 230, 109, 0.6)',
                  },
                }}
              >
                Sign Up Now
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => handleAuthOpen(true)}
                sx={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  borderRadius: '30px',
                  borderWidth: '2px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: '#ffe66d',
                    color: '#ffe66d',
                  },
                }}
              >
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
            fontFamily: 'var(--font-nunito), Arial, sans-serif',
          }}>
            <Auth isLogin={isLogin} onClose={handleAuthClose} />
          </Box>
        </Modal>

        {healthBotOpen && (
          <PopupChat user={user} onClose={handleCloseHealthBot} />
        )}

        <PopupChat user={user} />
      </Box>
    </ThemeProvider>
  );
}