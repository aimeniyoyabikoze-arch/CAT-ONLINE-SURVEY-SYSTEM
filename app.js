const express = require('express');
const app = express();

app.use(express.json());

// Root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>OnlineSurveySystem</title></head>
      <body>
        <h1>OnlineSurveySystem</h1>
        <p>API available at <a href="/api/surveys">/api/surveys</a></p>
        <p>Health: <a href="/health">/health</a></p>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// API endpoints
app.get('/api/surveys', (req, res) => {
  res.json({ surveys: [] });
});

app.post('/api/surveys', (req, res) => {
  res.status(201).json({ id: 1, ...req.body });
});

module.exports = app;
