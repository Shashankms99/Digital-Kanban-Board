const mongoose = require('mongoose');
const BacklogModel = require('../Models/backlog'); 
const mongo_url = process.env.MONGO_CONN;

mongoose.connect(mongo_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB Connected...');

    try {
      await BacklogModel.syncIndexes();
      console.log('Indexes synced successfully');
    } catch (err) {
      console.error('Error syncing indexes:', err);
    }
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
  });