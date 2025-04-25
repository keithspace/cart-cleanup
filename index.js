require('dotenv').config();
const cron = require('node-cron');
const { processCustomerCarts } = require('./cleanup-service');

// Schedule the cleanup daily at 9 PM (UTC+3)
cron.schedule('0 18 * * *', async () => { // 18:00 UTC = 21:00 UTC+3
  console.log('Running daily cart cleanup at', new Date().toISOString());
  try {
    const result = await processCustomerCarts();
    console.log('Cleanup completed:', result);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}, {
  scheduled: true,
  timezone: process.env.TIMEZONE
});

console.log(`Scheduled cart cleanup daily at 9 PM ${process.env.TIMEZONE}`);
console.log('Node.js cron job is running...');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// For testing: uncomment to run immediately
// (async () => {
//   await processCustomerCarts();
// })();
