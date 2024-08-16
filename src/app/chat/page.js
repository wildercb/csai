'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, List, ListItem, ListItemText, Typography, Button, AppBar, Toolbar, 
  IconButton, Avatar, Tooltip, Drawer, useMediaQuery, Divider, TextField
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { auth, db } from '../utils/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import ChatComponent from '../components/Chat';
import AddIcon from '@mui/icons-material/Add';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-nunito), Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9e80',
      dark: '#f4511e',
    },
    background: {
      default: '#f0f4f8',
      paper: '#ffffff',
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
          textTransform: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#4caf50',
        },
      },
    },
  },
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const ChatListContainer = styled(Box)(({ theme }) => ({
  width: '300px',
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  overflowY: 'auto',
  height: '100%',
}));

const ChatListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: '4px 8px',
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MainContent = styled(Box)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#f5f5f5',
});

const DisclaimerBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        router.push('/');
      } else {
        const chatsQuery = query(
          collection(db, 'chats'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const chatsUnsubscribe = onSnapshot(chatsQuery, (snapshot) => {
          const chatList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setChats(chatList);
          if (chatList.length > 0 && !selectedChat) {
            setSelectedChat(chatList[0].id);
          }
        });

        return () => chatsUnsubscribe();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const startNewChat = async () => {
    try {
      const newChatRef = await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        createdAt: serverTimestamp(),
        title: 'New Chat'
      });
      setSelectedChat(newChatRef.id);
      if (isMobile) {
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chatList = (
    <ChatListContainer>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>Saved Messages</Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
          }}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={startNewChat}
          sx={{ mb: 2 }}
        >
          New Chat
        </Button>
      </Box>
      <Divider />
      <List>
        {filteredChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            button
            onClick={() => {
              setSelectedChat(chat.id);
              if (isMobile) setDrawerOpen(false);
            }}
            selected={selectedChat === chat.id}
          >
            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
              {chat.title ? chat.title[0].toUpperCase() : 'C'}
            </Avatar>
            <ListItemText
              primary={chat.title || 'Untitled Chat'}
              secondary={chat.createdAt ? new Date(chat.createdAt.toDate()).toLocaleString() : 'Just now'}
            />
          </ChatListItem>
        ))}
      </List>
    </ChatListContainer>
  );

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" height="100vh" sx={{ fontFamily: 'var(--font-nunito), Arial, sans-serif' }}>
        <StyledAppBar position="static">
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <MedicalServicesIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Med-friend Assistant
            </Typography>
            {!isMobile && (
              <Tooltip title="Start a new chat">
                <IconButton color="inherit" onClick={startNewChat}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Log out">
              <IconButton color="inherit" onClick={handleLogout}>
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </StyledAppBar>
        <Box display="flex" flexGrow={1}>
          {!isMobile && chatList}
          <MainContent>
            <DisclaimerBox>
              <Typography variant="body2" color="text.secondary">
                <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Disclaimer: This AI assistant provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.
              </Typography>
            </DisclaimerBox>
            <ChatComponent chatId={selectedChat} user={user} />
          </MainContent>
        </Box>
      </Box>
      <Drawer
        anchor="left"
        open={isMobile && drawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: 300,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        {chatList}
      </Drawer>
    </ThemeProvider>
  );
}