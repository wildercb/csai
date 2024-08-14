'use client'

import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Divider } from '@mui/material';
import { auth, db } from '../utils/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import PopupChat from '../components/PopupChat';

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const q = query(
          collection(db, 'chats'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        onSnapshot(q, (snapshot) => {
          setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      }
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return <Typography>Please log in to access your chats.</Typography>;
  }

  return (
    <Box display="flex" height="100vh">
      <Box width="300px" borderRight={1} borderColor="divider" p={2}>
        <Typography variant="h6" gutterBottom>Chat History</Typography>
        <List>
          {chats.map((chat) => (
            <React.Fragment key={chat.id}>
              <ListItem button>
                <ListItemText 
                  primary={chat.title || 'Untitled Chat'} 
                  secondary={new Date(chat.createdAt.toDate()).toLocaleString()}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
      <Box flexGrow={1} p={2}>
        <Typography variant="h5" gutterBottom>Welcome, {user.displayName || user.email}</Typography>
        <Typography>Select a chat from the history or start a new conversation.</Typography>
      </Box>
      <PopupChat user={user} />
    </Box>
  );
}