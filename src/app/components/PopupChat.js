import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

export default function PopupChat({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, data.choices[0].message]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble responding right now." }]);
    }
  };

  return (
    <>
      {!isOpen && (
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{ position: 'fixed', bottom: 20, right: 20, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <ChatIcon />
        </IconButton>
      )}
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 300,
            height: 400,
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 2,
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
            <Typography>Chat with HealthBot</Typography>
            <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {messages.map((msg, index) => (
              <Box key={index} sx={{ mb: 2, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                <Typography
                  sx={{
                    display: 'inline-block',
                    bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.200',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {msg.content}
                </Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ p: 2, display: 'flex' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} sx={{ ml: 1 }}>Send</Button>
          </Box>
        </Box>
      )}
    </>
  );
}