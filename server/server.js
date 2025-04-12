const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

app.post('/api/extract', async (req, res) => {
  try {
    const { source, type } = req.body;
    
    if (!source) {
      return res.status(400).json({ message: 'Source is required' });
    }

    const response = await axios.post(
      `${process.env.ML_SERVICE_URL}/extract`,
      { source, type },
      { headers: { 'Content-Type': 'application/json' } }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Extraction error:', error.message);
    res.status(500).json({ 
      message: error.response?.data?.detail || 'Failed to extract contacts' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
