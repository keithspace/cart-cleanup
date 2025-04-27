require('dotenv').config();
const express = require('express');
const { processCustomerCarts } = require('./cleanup-service');

const app = express();

app.get('/', (req, res) => {
  res.send('Cart Cleanup Service is running.');
});

// Wake-up endpoint
app.get('/wake-up', (req, res) => {
  console.log('Wake-up call received at', new Date().toISOString());
  res.status(200).send('Service is awake');
});

// Main cleanup endpoint
app.get('/clean', async (req, res) => {
  console.log('Received external cron trigger at', new Date().toISOString());
  try {
    const result = await processCustomerCarts();
    console.log('Cleanup completed:', result);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
