import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { optimizeItinerary } from './optimizer.js';
import { TripConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoint for itinerary optimization
app.post('/api/optimize', (req, res) => {
  try {
    const config = req.body as TripConfig;
    
    // Basic validation
    if (!config.startDate || !config.endDate || !config.places || !config.accommodations) {
      return res.status(400).json({ error: '필수 필드(startDate, endDate, accommodations, places)가 누락되었습니다.' });
    }

    const result = optimizeItinerary(config);
    return res.json(result);
  } catch (error) {
    console.error('Itinerary optimization error:', error);
    return res.status(500).json({ error: '일정 최적화 연산 중 서버 에러가 발생했습니다.' });
  }
});

// Serve static assets in production
// When running with `tsx src/server/index.ts`, __dirname is <project-root>/src/server
// So dist/ is two levels up: ../../dist
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  // If request is for API, pass through
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Resource not found. If in development, please connect to Vite port 5173.');
    }
  });
});


app.listen(PORT, () => {
  console.log(`[NOMADFLOW Backend] Node.js Express server is running on http://localhost:${PORT}`);
});
