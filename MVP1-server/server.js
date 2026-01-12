const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('./config/passport');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenge');
const submissionRoutes = require('./routes/submission');
const statsRoutes = require('./routes/stats');
const profileRoutes = require('./routes/profile');
const runRoutes = require('./routes/run');
const mentorRoutes = require('./routes/mentor');

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/challenges', challengeRoutes);
app.use('/submissions', submissionRoutes);
app.use('/stats', statsRoutes);
app.use('/profile', profileRoutes);
app.use('/run', runRoutes);
app.use('/mentor', mentorRoutes);

app.get('/', (req, res) => {
  res.send('MVP1 Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
