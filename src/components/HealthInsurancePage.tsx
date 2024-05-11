import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Card, CardContent, IconButton } from '@mui/material';
import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../context/UserRoleContext';
import { AuthContext } from '../context/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const HealthInsurancePage = () => {
  const { currentUser } = React.useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [bills, setBills] = useState([]);
  const [newBillAmount, setNewBillAmount] = useState('');
  const [billDescription, setBillDescription] = useState('');
  const [insuranceLimit, setInsuranceLimit] = useState('');
  const [editedInsuranceLimit, setEditedInsuranceLimit] = useState('');
  const [availableBalance, setAvailableBalance] = useState('');
  const [error, setError] = useState('');
  const [editingLimit, setEditingLimit] = useState(false);
  const { userRole } = useUserRole();
  const [selectedBillDate, setSelectedBillDate] = useState(null);
  const [editingBill, setEditingBill] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, [currentUser]);

  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        await fetchInsuranceLimit(userId);
        await fetchBills();
        if (insuranceLimit !== '' && bills.length > 0) {
          calculateAvailableBalance();
        }
      };
      fetchData();
    }
  }, [userId, insuranceLimit, bills]);

  const fetchInsuranceLimit = async (userId) => {
    try {
      const insuranceLimitDocRef = doc(db, 'insuranceLimits', userId);
      const insuranceLimitDocSnap = await getDoc(insuranceLimitDocRef);
      if (insuranceLimitDocSnap.exists()) {
        const limitData = insuranceLimitDocSnap.data();
        if (limitData && typeof limitData.limit === 'string') {
          const limit = parseFloat(limitData.limit);
          if (!isNaN(limit)) {
            setInsuranceLimit(limit.toFixed(2));
          } else {
            setError('Insurance limit data is invalid.');
          }
        } else {
          setError('Insurance limit data is invalid.');
        }
      }
    } catch (error) {
      console.error('Error fetching insurance limit: ', error);
      setError('Error fetching insurance limit. Please try again later.');
    }
  };

  const handleSetInsuranceLimit = async () => {
    if (isNaN(parseFloat(editedInsuranceLimit)) || parseFloat(editedInsuranceLimit) < 0) {
      setError('Please enter a valid insurance limit');
      return;
    }
    setError('');

    try {
      const insuranceLimitDocRef = doc(db, 'insuranceLimits', userId);
      await setDoc(insuranceLimitDocRef, { limit: parseFloat(editedInsuranceLimit).toFixed(2), timestamp: serverTimestamp() }, { merge: true });
      setEditingLimit(false);
      await fetchInsuranceLimit(userId);
      if (bills.length > 0) {
        calculateAvailableBalance();
      }
    } catch (error) {
      console.error('Error updating insurance limit: ', error);
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
    } catch (error) {
      console.error('Error fetching bills: ', error);
    }
  };

  const calculateAvailableBalance = () => {
    const totalBillsAmount = bills.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const balance = parseFloat(insuranceLimit) - totalBillsAmount;
    setAvailableBalance(balance.toFixed(2));
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

      if (!billDescription.trim()) {
        setError('Please enter bill description');
        return;
      }

      // Check if date is selected, if not, set it to current date
      const billDate = selectedBillDate ? selectedBillDate.toISOString() : new Date().toISOString();

      await addDoc(collection(db, 'healthInsuranceBills'), {
        userId,
        amount: billAmount.toFixed(2),
        description: billDescription,
        timestamp: billDate  // Using the selected or current date
      });

      setNewBillAmount('');
      setBillDescription('');
      setError('');
      fetchBills();
    } catch (error) {
      console.error('Error adding bill: ', error);
    }
  };

  const handleDeleteBill = async (billId) => {
    try {
      await deleteDoc(doc(db, 'healthInsuranceBills', billId));
      fetchBills();
    } catch (error) {
      console.error('Error deleting bill: ', error);
    }
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setNewBillAmount(bill.amount);
    setBillDescription(bill.description);
    setSelectedBillDate(new Date(bill.timestamp));
  };

  const handleCancelEdit = () => {
    setEditingBill(null);
    setNewBillAmount('');
    setBillDescription('');
    setSelectedBillDate(null);
  };

  const handleUpdateBill = async () => {
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

      if (!billDescription.trim()) {
        setError('Please enter bill description');
        return;
      }

      // Check if date is selected, if not, set it to current date
      const billDate = selectedBillDate ? selectedBillDate.toISOString() : new Date().toISOString();

      await setDoc(doc(db, 'healthInsuranceBills', editingBill.id), {
        amount: billAmount.toFixed(2),
        description: billDescription,
        timestamp: billDate
      }, { merge: true });

      setEditingBill(null);
      setNewBillAmount('');
      setBillDescription('');
      setSelectedBillDate(null);
      fetchBills();
    } catch (error) {
      console.error('Error updating bill: ', error);
    }
  };

  return (
    userRole === 'patient' ? (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Health Insurance Tracker
        </Typography>
        <Box mt={2}>
          <Typography variant="h5" component="h2" gutterBottom>
            Insurance Limit: <> ${insuranceLimit} </>  
            {editingLimit ? (
              <>
                <TextField
                  fullWidth
                  label="Set Insurance Limit"
                  variant="outlined"
                  value={editedInsuranceLimit}
                  onChange={(e) => setEditedInsuranceLimit(e.target.value)}
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
            label="Description"
            variant="outlined"
            value={billDescription}
            onChange={(e) => setBillDescription(e.target.value)}
            margin="normal"
          />
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
            label="Date"
            type="date"
            value={selectedBillDate ? selectedBillDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setSelectedBillDate(new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
          />
          <Box mt={1}>
            {editingBill ? (
              <>
                <Button variant="contained" color="primary" onClick={handleUpdateBill}>
                  Update Bill
                </Button>
                <Button variant="outlined" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={handleSubmitBill}>
                Submit Bill
              </Button>
            )}
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
                  {bill.timestamp && (
                    <Typography variant="caption" color="textSecondary">
                      {new Date(bill.timestamp).toLocaleString()}
                    </Typography>
                  )}
                  <IconButton aria-label="edit" onClick={() => handleEditBill(bill)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDeleteBill(bill.id)}>
                    <DeleteIcon />
                  </IconButton>
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
