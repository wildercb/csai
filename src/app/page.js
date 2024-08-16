'use client'

import React, { useState } from 'react';
import { Button, Typography, Box, Container, AppBar, Toolbar, Modal, useTheme, useMediaQuery } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Auth from './components/Auth';
import PopupChat from './components/PopupChat';
import { auth } from './utils/firebase';
import { useRouter } from 'next/navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-nunito), Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#4caf50', // A friendlier green color
    },
    secondary: {
      main: '#ff7043', // A warm orange color
    },
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
          borderRadius: '25px',
        },
      },
    },
  },
});

const FeatureCard = ({ icon, title, description }) => (
  <Box
    sx={{
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    <Typography variant="h6" component="h3" sx={{ mb: 2, color: 'primary.main', textAlign: 'center' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', flexGrow: 1 }}>
      {description}
    </Typography>
  </Box>
);

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [medFriendOpen, setMedFriendOpen] = useState(false);
  const [user, setUser] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const handleAuthOpen = (loginMode) => {
    setIsLogin(loginMode);
    setAuthOpen(true);
  };

  const handleAuthClose = () => setAuthOpen(false);
  const handleTryMedFriend = () => setMedFriendOpen(true);
  const handleCloseMedFriend = () => setMedFriendOpen(false);

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
        <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)' }}>
          <Toolbar>
            <FavoriteIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
              Med-Friend
            </Typography>
            <Button color="primary" onClick={() => handleAuthOpen(true)} sx={{ mr: 1 }}>Login</Button>
            <Button color="primary" variant="contained" onClick={() => handleAuthOpen(false)}>Sign Up</Button>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            backgroundImage: 'url("/images/Health_friend.png")',
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
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: -1,
            },
          }}
        >
          <Container maxWidth="md" sx={{ 
            position: 'relative', 
            zIndex: 2, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Typography 
              variant={isMobile ? 'h3' : 'h2'} 
              component="h1" 
              gutterBottom 
              fontWeight="bold"
              sx={{
                color: 'primary.main',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
              }}
            >
              Your Friendly Health Companion
            </Typography>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{
                color: 'text.primary',
                mb: 4,
              }}
            >
              Get caring, reliable health advice anytime, anywhere
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ChatIcon />}
                onClick={handleTryMedFriend}
                sx={{ 
                  fontSize: '1.2rem', 
                  py: 1.5, 
                  px: 4,
                  backgroundColor: theme.palette.secondary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark,
                  },
                }}
              >
                Try Med-Friend
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleEnterChatRoom}
                sx={{ 
                  fontSize: '1.2rem', 
                  py: 1.5, 
                  px: 4, 
                  color: 'primary.main', 
                  borderColor: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    color: 'primary.dark',
                  },
                }}
              >
                Enter Chat 
              </Button>
            </Box>
          </Container>  
        </Box>

        <Box sx={{
          background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold" sx={{ color: 'primary.main', mb: 8 }}>
              Why Choose Med-Friend?
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
                <FeatureCard
                  icon={<ChatIcon sx={{ fontSize: 40, color: 'white' }} />}
                  title="Friendly Conversations"
                  description="Engage in warm, understanding chats about your health concerns with our AI companion."
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
                <FeatureCard
                  icon={<SecurityIcon sx={{ fontSize: 40, color: 'white' }} />}
                  title="Safe and Confidential"
                  description={<>Your privacy is our priority. All conversations are secure and anonymous. Learn more about our privacy practices from <a href="https://www.hhs.gov/hipaa/index.html" style={{color: theme.palette.secondary.main}}>HHS</a>.</>}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
                <FeatureCard
                  icon={<FavoriteIcon sx={{ fontSize: 40, color: 'white' }} />}
                  title="Reliable Health Guidance"
                  description="Our AI is trained on trusted medical resources to provide accurate and helpful health information."
                />
              </Box>
            </Box>
          </Container>
        </Box>

        <Box sx={{ 
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #81c784 0%, #4caf50 100%)',
          py: 8,
        }}>
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              textAlign="center" 
              gutterBottom 
              fontWeight="bold" 
              sx={{
                color: '#ffffff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              Ready for a Friendly Chat About Your Health?
            </Typography>
            <Typography 
              variant="body1" 
              textAlign="center" 
              paragraph 
              sx={{ 
                color: '#ffffff',
                fontSize: '1.1rem',
                mb: 4,
              }}
            >
              Med-Friend is here to listen, understand, and guide you towards better health.
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
                  bgcolor: '#ffffff',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  borderRadius: '30px',
                  boxShadow: '0 4px 14px rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.6)',
                  },
                }}
              >
                Join Med-Friend Now
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
                    borderColor: '#ffffff',
                    color: '#ffffff',
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

        {medFriendOpen && (
          <PopupChat user={user} onClose={handleCloseMedFriend} />
        )}

        <PopupChat user={user} />
      </Box>
    </ThemeProvider>
  );
}