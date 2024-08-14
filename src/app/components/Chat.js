import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';

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
      console.log("fetching")
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
    <>
      <Box flexGrow={1} overflowY="auto" p={2}>
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
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <Button 
          onClick={handleSend} 
          sx={{ mt: 1 }} 
          variant="contained" 
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
    </>
  );
}