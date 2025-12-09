const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// In-memory survey storage
let surveys = [];
let surveyId = 1;

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// API endpoints
app.get('/api/surveys', (req, res) => {
  res.json({ surveys });
});

app.post('/api/surveys', (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newSurvey = { id: surveyId++, ...req.body, createdAt: new Date() };
  surveys.push(newSurvey);
  res.status(201).json(newSurvey);
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`OnlineSurveySystem running on port ${PORT}`);
  });
}

module.exports = app;
