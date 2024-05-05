import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Card, CardContent } from '@mui/material';
import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../context/UserRoleContext';
import { AuthContext } from '../context/AuthContext';

const HealthInsurancePage = () => {
  const { currentUser } = React.useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [bills, setBills] = useState([]);
  const [newBillAmount, setNewBillAmount] = useState('');
  const [billDescription, setBillDescription] = useState('');
  const [insuranceLimit, setInsuranceLimit] = useState('');
  const [availableBalance, setAvailableBalance] = useState('');
  const [error, setError] = useState('');
  const [editingLimit, setEditingLimit] = useState(false);
  const { userRole } = useUserRole();

  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.uid);
      fetchInsuranceLimit(currentUser.uid);
    }
  }, [currentUser]);

  useEffect(() => {
    if (userId) {
      fetchBills();
    }
  }, [userId]);

  const fetchInsuranceLimit = async (userId) => {
    try {
      const insuranceLimitDocRef = doc(db, 'insuranceLimits', userId);
      const insuranceLimitDocSnap = await getDoc(insuranceLimitDocRef);
      if (insuranceLimitDocSnap.exists()) {
        const limitData = insuranceLimitDocSnap.data();
        setInsuranceLimit(limitData.limit.toFixed(2));
        calculateAvailableBalance(limitData.limit.toFixed(2));
      }
    } catch (error) {
      console.error('Error fetching insurance limit: ', error);
    }
  };

  const calculateAvailableBalance = (limit) => {
    const totalBillsAmount = bills.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const balance = parseFloat(limit) - totalBillsAmount;
    setAvailableBalance(balance.toFixed(2));
  };

  const handleSetInsuranceLimit = async () => {
    if (isNaN(parseFloat(insuranceLimit)) || parseFloat(insuranceLimit) < 0) {
      setError('Please enter a valid insurance limit');
      return;
    }
    setError('');

    try {
      const insuranceLimitDocRef = doc(db, 'insuranceLimits', userId);
      await setDoc(insuranceLimitDocRef, { limit: parseFloat(insuranceLimit).toFixed(2), timestamp: serverTimestamp() }, { merge: true });
      setEditingLimit(false);
      calculateAvailableBalance(parseFloat(insuranceLimit).toFixed(2));
    } catch (error) {
      console.error('Error updating insurance limit: ', error);
    }
  };

  const handleSubmitBill = async () => {
    if (newBillAmount.trim() === '') {
      setError('Please enter bill amount');
      return;
    }

    try {
      const billAmount = parseFloat(newBillAmount);
      if (isNaN(billAmount) || billAmount <= 0) {
        setError('Please enter a valid bill amount');
        return;
      }

      if (parseFloat(insuranceLimit) < billAmount) {
        setError('Bill amount exceeds insurance limit');
        return;
      }

      await addDoc(collection(db, 'healthInsuranceBills'), {
        userId,
        amount: billAmount.toFixed(2),
        description: billDescription,
        timestamp: new Date().toISOString()
      });

      setNewBillAmount('');
      setBillDescription('');
      setError('');
      fetchBills();
    } catch (error) {
      console.error('Error adding bill: ', error);
    }
  };

  const fetchBills = async () => {
    try {
      const q = query(
        collection(db, 'healthInsuranceBills'),
        where('userId', '==', userId),
      );
      const querySnapshot = await getDocs(q);
      const billsData = [];
      querySnapshot.forEach((doc) => {
        const billData = doc.data();
        billsData.push({ id: doc.id, ...billData });
      });
      setBills(billsData);
      calculateAvailableBalance(insuranceLimit);
    } catch (error) {
      console.error('Error fetching bills: ', error);
    }
  };

  return (
    userRole === 'patient' ? (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Health Insurance
        </Typography>
        <Box mt={2}>
          <Typography variant="h5" component="h2" gutterBottom>
            Insurance Limit: ${insuranceLimit}
            {editingLimit ? (
              <>
                <TextField
                  fullWidth
                  label="Set Insurance Limit"
                  variant="outlined"
                  value={insuranceLimit}
                  onChange={(e) => setInsuranceLimit(e.target.value)}
                  error={error !== ''}
                  helperText={error}
                  margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleSetInsuranceLimit}>
                  Submit
                </Button>
              </>
            ) : (
              <Button variant="outlined" onClick={() => setEditingLimit(true)}>
                Edit
              </Button>
            )}
          </Typography>
        </Box>
        <Box mt={2}>
          <Typography variant="h5" component="h2" gutterBottom>
            Add New Bill
          </Typography>
          <TextField
            fullWidth
            label="Bill Amount"
            variant="outlined"
            value={newBillAmount}
            onChange={(e) => setNewBillAmount(e.target.value)}
            error={error !== ''}
            helperText={error}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            value={billDescription}
            onChange={(e) => setBillDescription(e.target.value)}
            margin="normal"
          />
          <Box mt={1}>
            <Button variant="contained" color="primary" onClick={handleSubmitBill}>
              Submit Bill
            </Button>
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Available Balance: ${availableBalance}
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom>
            Bill History
          </Typography>
          {bills.map((bill) => (
            <Box key={bill.id} mb={2}>
              <Card>
                <CardContent>
                  <Typography variant="body1">Amount: ${bill.amount}</Typography>
                  <Typography variant="body2">Description: {bill.description}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(bill.timestamp).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    ) : (
      null
    )
  );
};

export default HealthInsurancePage;
