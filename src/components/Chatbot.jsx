import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, IconButton, Paper, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const apiKey = "AIzaSyDwwb0KXcuSlviiafGlfcL9CxKYds8Pntw";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef(null);
  const initialMessageSentRef = useRef(false);

  // Start chat session only once
  useEffect(() => {
    const startChatSession = async () => {
      if (!chatSessionRef.current) {
        chatSessionRef.current = await model.startChat({
          generationConfig,
          safetySettings,
          history: [],
        });
        // Send "hi" message automatically and handle response
        handleSendInitialMessage();
      }
    };

    startChatSession();
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSendInitialMessage = async () => {
    if (initialMessageSentRef.current) return;
    
    initialMessageSentRef.current = true;
    const initialMessage = "hi";
    const healthContext = "This is a health-related conversation. Please provide responses related to health topics.";
    const inputWithContext = `${healthContext} ${initialMessage}`;

    try {
      const result = await chatSessionRef.current.sendMessage(inputWithContext);
      const botMessage = result.response.text();
      
      setMessages(prevMessages => [
        ...prevMessages,
        { text: botMessage, sender: 'bot', timestamp: new Date() },
      ]);
    } catch (error) {
      console.error('Error sending initial message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    const healthContext = "This is a health-related conversation. Please provide responses related to health topics.";
    const inputWithContext = `${healthContext} ${input}`;

    try {
      const result = await chatSessionRef.current.sendMessage(inputWithContext);
      const botMessage = result.response.text();
      
      setMessages(prevMessages => [
        ...prevMessages,
        { text: botMessage, sender: 'bot', timestamp: new Date() },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setIsLoading(false);
  };

  const parseResponseText = (text) => {
    const lines = text.split('\n').map((line) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const listItemRegex = /^•\s(.*)$/gm;
      
      if (boldRegex.test(line)) {
        return line.split(boldRegex).map((segment, index) => {
          if (index % 2 === 1) {
            return { type: 'bold', text: segment };
          } else {
            return { type: 'normal', text: segment };
          }
        });
      } else if (listItemRegex.test(line)) {
        return { type: 'listItem', text: line.replace(listItemRegex, '$1') };
      } else {
        return { type: 'normal', text: line };
      }
    }).flat();
    
    return lines;
  };

  const renderParsedResponse = (parsedText) => {
    return parsedText.map((line, index) => {
      if (line.type === 'bold') {
        return <Typography key={index} variant="body1" component="span" sx={{ fontWeight: 'bold' }}>{line.text}</Typography>;
      } else if (line.type === 'listItem') {
        return <Typography key={index} variant="body2" sx={{ marginLeft: 2 }}>{`• ${line.text}`}</Typography>;
      } else {
        return <Typography key={index} variant="body1">{line.text}</Typography>;
      }
    });
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      {!isOpen ? (
        <Button variant="contained" color="primary" onClick={handleToggle} startIcon={<ChatIcon />}>
          Chat
        </Button>
      ) : (
        <Paper elevation={3} sx={{ p: 2, width: 300, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Health Chatbot</Typography>
            <IconButton onClick={handleToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg, index) => {
              if (msg.sender === 'bot') {
                const parsedText = parseResponseText(msg.text);
                return (
                  <Box key={index} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1, p: 1, mb: 1 }}>
                    {renderParsedResponse(parsedText)}
                  </Box>
                );
              } else {
                return (
                  <Typography
                    key={index}
                    variant="body1"
                    align="right"
                    sx={{
                      backgroundColor: '#e0e0e0',
                      borderRadius: 1,
                      p: 1,
                      mb: 1,
                      alignSelf: 'flex-end',
                    }}
                  >
                    {msg.text}
                  </Typography>
                );
              }
            })}
            {isLoading && (
              <Typography
                variant="body1"
                align="left"
                sx={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  p: 1,
                  mb: 1,
                  alignSelf: 'flex-start',
                }}
              >
                ...
              </Typography>
            )}
          </Box>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Type a message"
            value={input}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            sx={{ mt: 1 }}
            disabled={isLoading}
          >
            Send
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Chatbot;
