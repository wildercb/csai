'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your health assistant. How can I assist you today? ",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: 'Let me check the best options for you...' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      const assistantMessage = data.choices[0].message.content

      setMessages((messages) => [
        ...messages.slice(0, messages.length - 1),
        { role: 'assistant', content: assistantMessage },
      ])
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        {
          role: 'assistant',
          content: "I'm sorry, but I encountered an error. Please try again later.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="500px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#d0f0c0' // Light green for assistant messages
                    : '#b0e57c' // Slightly different light green for user messages
                }
                color="black" // Ensure text color is visible
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems="center">
          <TextField
            label="Describe your symptoms or request a medicine"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              backgroundColor: '#f0f0f0', // Light gray background color
              borderRadius: '8px', // Optional: rounded corners
              '& .MuiInputBase-root': {
                backgroundColor: 'inherit', // Ensures the input field matches the background
              },
              '& .Mui-disabled': {
                backgroundColor: '#e0e0e0', // Slightly darker gray for disabled state
              },
              height: '56px', // Set height to match the button's height
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              backgroundColor: '#232323', // Dark gray background color
              color: 'white', // White text color for contrast
              border: '1px solid #ccc', // Light gray border
              height: '56px', // Match height with the TextField
              '&:hover': {
                backgroundColor: '#1f1f1f', // Slightly lighter dark gray on hover
              },
              '&:active': {
                backgroundColor: '#000000', // Black background when clicked
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
