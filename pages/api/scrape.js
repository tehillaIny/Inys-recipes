import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    // כאן ננסה לחלץ את המידע הגנרי
    const name = $('h1').first().text().trim() || '';
    const ingredients = $('[class*="ingredient"], [id*="ingredient"]').text().trim().split('\n').map(i => i.trim()).filter(Boolean);
    const method = $('[class*="instruction"], [class*="step"], [id*="method"]').text().trim().split('\n').map(s => s.trim()).filter(Boolean);
    const imageUrl = $('img').first().attr('src') || '';

    res.status(200).json({ name, ingredients, method, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to scrape' });
  }
}