const express = require ('express');
const mongoose = require ('mongoose');
const dotenv = require('dotenv');
const cors = require ('cors');

const userRoutes = require('./routes/userRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const foundItemRoutes = require('./routes/foundItemRoutes');

dotenv.config();
const app = express ()
app.use (express.json())
app.use (cors())

const uri = 'mongodb+srv://nethindu359:test1234@cluster0.jpdr8js.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));



app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/lost', lostItemRoutes);
app.use('/api/found', foundItemRoutes);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});