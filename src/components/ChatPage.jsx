import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { useUserRole } from '../context/UserRoleContext';
import { Container, Typography, Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatPage = () => {
  const { doctorId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { userRole } = useUserRole();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const chatQuery = query(collection(db, 'chats'), where('patientId', '==', currentUser.uid), where('doctorId', '==', doctorId));
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
  }, [doctorId, currentUser]);

  const sendMessage = async () => {
    try {
      const messageData = {
        text: newMessage,
        sender: currentUser.uid 
      };

      const chatQuery = query(collection(db, 'chats'), where('patientId', '==', currentUser.uid), where('doctorId', '==', doctorId));
      const chatSnapshot = await getDocs(chatQuery);
      let chatId;

      if (chatSnapshot.empty) {
        const newChatDocRef = await addDoc(collection(db, 'chats'), { patientId: currentUser.uid, doctorId });
        chatId = newChatDocRef.id;
      } else {
        chatId = chatSnapshot.docs[0].id;
      }

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        ...messageData,
        timestamp: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  if (userRole !== "patient") return null;

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Chat with Doctor
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

export default ChatPage;
