const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - redirect all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Check if we're in development or production
if (process.env.NODE_ENV === 'production') {
  // In production, use HTTP
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} else {
  // In development, use HTTPS with local certificates
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certificates/localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certificates/localhost.pem'))
  };
  
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Development server running on https://localhost:${PORT}`);
  });
}