const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenge');
const submissionRoutes = require('./routes/submission');
const statsRoutes = require('./routes/stats');

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/challenges', challengeRoutes);
app.use('/submissions', submissionRoutes);
app.use('/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('CodeArena Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
