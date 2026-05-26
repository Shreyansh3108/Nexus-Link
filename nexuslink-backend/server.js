import { supabase } from './src/config/supabase.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linkRoutes from './src/routes/linkRoutes.js';
import rateLimit from 'express-rate-limit';
import { Redis } from '@upstash/redis'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

app.use(cors());
app.use(express.json());

const authenticateAPIKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    req.isVIP = false; 
    return next();
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id')
    .eq('api_key', apiKey)
    .single();

  if (data) {
    console.log(" VIP User Authenticated!");
    req.isVIP = true;
  } else {
    req.isVIP = false;
  }
  next();
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req, res) => {
    return req.isVIP ? 100 : 5; 
  },
  message: { error: "429: Too many requests! Upgrade your API key for higher limits." }
});

app.use('/api', authenticateAPIKey);
app.use('/api', apiLimiter);
app.use('/api', linkRoutes);

app.get('/api/analytics/:code', async (req, res) => {
  const shortCode = req.params.code;

  try {
    const { data, error } = await supabase
      .from('clicks')
      .select('ip_address, user_agent, clicked_at')
      .eq('short_code', shortCode);

    if (error) throw error;

    return res.status(200).json({
      short_code: shortCode,
      total_clicks: data.length,
      click_data: data
    });

  } catch (err) {
    console.error("Analytics API Error:", err);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.get('/:code', async (req, res) => {
  const shortCode = req.params.code;

  try {
    const cachedUrl = await redis.get(shortCode);
    let targetUrl = cachedUrl;

    if (!targetUrl) {
      console.log(" Cache miss! Fetching from Database...");
      const { data, error } = await supabase
        .from('links')
        .select('original_url')
        .eq('short_code', shortCode)
        .single(); 
        
      if (error || !data) {
        return res.status(404).send("404: Link not found in NexusLink database.");
      }

      targetUrl = data.original_url;
      await redis.set(shortCode, targetUrl, { ex: 86400 });
    } else {
      console.log(" Cache hit! Loaded instantly from Redis!");
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    supabase
      .from('clicks')
      .insert([{ 
        short_code: shortCode, 
        ip_address: ip, 
        user_agent: userAgent 
      }])
      .then(({ error }) => {
        if (error) console.error("Analytics Error:", error);
      });

    return res.redirect(targetUrl);

  } catch (err) {
    console.error("Read Path Error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`NexusLink Backend running on http://localhost:${PORT}`);
});