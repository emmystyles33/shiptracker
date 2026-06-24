import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import shipmentRoutes from './routes/shipments.js';
import imageRoutes from './routes/images.js';
import geocodeRoutes from './routes/geocode.js';
import { createSession } from './authStore.js';
import { supabaseAdmin } from './supabaseAdmin.js';

console.log('ENV URL:', process.env.VITE_SUPABASE_URL);
console.log('ENV KEY EXISTS:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const app = express();
const PORT = process.env.API_PORT || 8787;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('shipments')
      .select('*')
      .limit(1);

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// DEV ONLY: create a temporary admin session token for local testing.
// This endpoint is intentionally available only when not in production.
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/token', (req, res) => {
    const token = createSession();
    res.json({ token });
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/geocode', geocodeRoutes);

app.listen(PORT, () => {
  console.log(`ShipTrack API listening on http://localhost:${PORT}`);
});

// Global error handlers to prevent silent exits and surface useful logs
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
