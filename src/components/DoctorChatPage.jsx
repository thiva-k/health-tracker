import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const DoctorChatPage = () => {
  const { patientId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!currentUser || !patientId) return; // Check if currentUser or patientId is null

        const chatQuery = query(collection(db, 'chats'), where('patientId', '==', patientId), where('doctorId', '==', currentUser.uid));
        const chatSnapshot = await getDocs(chatQuery);
        
        if (!chatSnapshot.empty) {
          const chatId = chatSnapshot.docs[0].id;
          const messagesQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp')); 
          const querySnapshot = await getDocs(messagesQuery);
          const messagesData = querySnapshot.docs.map(doc => doc.data());
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Error fetching messages: ', error);
      }
    };

    fetchMessages();
  }, [patientId, currentUser]);

  const sendMessage = async () => {
    try {
      if (!currentUser || !patientId) return; // Check if currentUser or patientId is null

      const messageData = {
        text: newMessage,
        sender: currentUser.uid 
      };

      const chatQuery = query(collection(db, 'chats'), where('patientId', '==', patientId), where('doctorId', '==', currentUser.uid));
      const chatSnapshot = await getDocs(chatQuery);
      let chatId;

      if (chatSnapshot.empty) {
        const newChatDocRef = await addDoc(collection(db, 'chats'), { patientId, doctorId: currentUser.uid });
        chatId = newChatDocRef.id;
      } else {
        chatId = chatSnapshot.docs[0].id;
      }

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        ...messageData,
        timestamp: serverTimestamp()
      });

      // Fetch and update messages after sending a new message
      const messagesQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp')); 
      const querySnapshot = await getDocs(messagesQuery);
      const messagesData = querySnapshot.docs.map(doc => doc.data());
      setMessages(messagesData);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chat with Patient ID: {patientId}
      </Typography>
      <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'auto', maxHeight: '60vh', padding: '10px', marginBottom: '20px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '10px', textAlign: message.sender === currentUser.uid ? 'right' : 'left' }}>
            <Typography variant="body1" sx={{ backgroundColor: message.sender === currentUser.uid ? '#DCF8C6' : '#E8E8E8', borderRadius: '10px', padding: '8px' }}>
              {message.text}
            </Typography>
          </div>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Type your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{ flexGrow: 1, marginRight: '10px' }}
        />
        <IconButton color="primary" onClick={sendMessage} disabled={!newMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </Container>
  );
};

export default DoctorChatPage;
