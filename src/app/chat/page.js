'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, List, ListItem, ListItemText, Typography, Divider, Button, AppBar, Toolbar, IconButton, Avatar, TextField, Tooltip } from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { auth, db } from '../utils/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import ChatComponent from '../components/Chat';
import AddIcon from '@mui/icons-material/Add';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const ChatListContainer = styled(Box)(({ theme }) => ({
  width: '300px',
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  overflowY: 'auto',
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

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/');
      } else {
        // Access the user's specific document
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Query the conversations subcollection
        const conversationsQuery = query(
          collection(userDocRef, 'conversations'),
          orderBy('createdAt', 'desc')
        );

        const chatsUnsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
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
      const userDocRef = doc(db, 'users', user.uid);
      const newChatRef = await addDoc(collection(userDocRef, 'conversations'), {
        createdAt: serverTimestamp(),
        title: 'New Chat'
      });
      setSelectedChat(newChatRef.id);
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

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" height="100vh">
        <AppBar position="static">
          <Toolbar>
            <HealthAndSafetyIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Medical Health AI Assistant
            </Typography>
            <IconButton color="inherit" onClick={startNewChat}>
              <AddIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout}>
              <ExitToAppIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box display="flex" flexGrow={1}>
          <ChatListContainer>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>Chat History</Typography>
            </Box>
            <List>
              {chats.map((chat) => (
                <ListItem 
                  key={chat.id}
                  button 
                  onClick={() => setSelectedChat(chat.id)}
                  selected={selectedChat === chat.id}
                >
                  <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                    {chat.title ? chat.title[0].toUpperCase() : 'C'}
                  </Avatar>
                  <ListItemText 
                    primary={chat.title || 'Untitled Chat'} 
                    secondary={chat.createdAt ? new Date(chat.createdAt.toDate()).toLocaleString() : 'Just now'}
                  />
                </ListItem>
              ))}
            </List>
          </ChatListContainer>
          <MainContent>
            <ChatComponent chatId={selectedChat} user={user} />
          </MainContent>
        </Box>
      </Box>
    </ThemeProvider>
  );
}