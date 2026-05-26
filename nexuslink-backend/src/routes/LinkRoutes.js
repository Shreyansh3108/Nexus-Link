import express from 'express';
import { supabase } from '../config/supabase.js';
import { generateShortCode } from '../utils/base62.js';
import { checkSafeBrowsing } from '../services/safety.js';

const router = express.Router();

router.post("/shorten", async (req, res) => {
  const { longUrl, customAlias } = req.body;

  if (!longUrl) return res.status(400).json({ error: "URL is required" });

  const isSafe = await checkSafeBrowsing(longUrl);
  if (!isSafe) {
    return res.status(400).json({ error: "Malicious URL detected." });
  }

  let shortCode = customAlias || generateShortCode();

  try {
    const { data, error } = await supabase
      .from('links')
      .insert([{ short_code: shortCode, original_url: longUrl }]);

    if (error) {
      if (error.code === '23505') { 
        return res.status(409).json({ error: "Alias already taken." });
      }
      throw error;
    }

    return res.status(201).json({ 
      shortUrl: `http://localhost:${process.env.PORT}/${shortCode}`,
      code: shortCode 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
  }
});

export default router;