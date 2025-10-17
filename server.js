require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const videoRoutes = require('./routes/video.routes');
// other routes e.g., authRoutes...
const authRoutes = require('./routes/authRoutes');

app.use(cors());
app.use(express.json());

// Connect to MongoDB (set MONGO_URI in .env)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true ,ssl:true})
  .then(()=> console.log('MongoDB connected'))
  .catch(err=> console.error(err));

// serve uploads statically so frontend can fetch /uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// api routes
app.use('/api/auth', authRoutes);      // existing
app.use('/api/videos', videoRoutes);

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
