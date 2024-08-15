import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Paper, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

export default function ChatComponent({ chatId, user }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your HealthChat AI assistant. How can I help you with your health questions today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], chatId }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, data.choices[0].message]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble responding right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box flexGrow={1} overflowY="auto" p={2}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main', width: 24, height: 24, mr: 1 }}>
                  {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Avatar>
                <Typography variant="subtitle2" fontWeight="bold">
                  {msg.role === 'user' ? 'You' : 'HealthChat AI'}
                </Typography>
              </Box>
              <Typography variant="body1">{msg.content}</Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: 'background.paper',
                borderRadius: '20px 20px 20px 0',
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', width: 24, height: 24, mr: 1 }}>
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle2" fontWeight="bold">
                  HealthChat AI
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Thinking...</Typography>
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your health question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          multiline
          maxRows={4}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <Button
                onClick={handleSend}
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{ minWidth: 'auto', p: '10px' }}
              >
                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
              </Button>
            ),
          }}
        />
      </Box>
    </Box>
  );
}