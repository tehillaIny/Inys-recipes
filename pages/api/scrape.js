import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  const method = req.method ? req.method.toUpperCase() : 'UNKNOWN';

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    let recipeData = {
      name: '',
      ingredients: [],
      method: [],
      imageUrl: '',
      rawText: '',
      geminiError: null
    };

    const isSocialMedia = url.includes('instagram.com') || url.includes('facebook.com') || url.includes('tiktok.com');

    if (isSocialMedia) {
      try {
        const microLinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
        const socialResponse = await fetch(microLinkUrl);
        const socialData = await socialResponse.json();

        if (socialData.status === 'success' && socialData.data) {
          recipeData.imageUrl = socialData.data.image?.url || socialData.data.image || '';
          const title = socialData.data.title || '';
          const desc = socialData.data.description || '';
          recipeData.rawText = `${title}\n${desc}`.trim();
        }
      } catch (e) {
        console.error('Microlink failed:', e);
      }
    }

    if (!recipeData.rawText) {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      recipeData.rawText = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html());
          const recipe = findRecipeDeep(json);
          if (recipe) {
            if (!recipeData.name && recipe.name) recipeData.name = cleanText(recipe.name);
            if (!recipeData.imageUrl && recipe.image) {
              const img = Array.isArray(recipe.image) ? recipe.image[0] : recipe.image;
              recipeData.imageUrl = typeof img === 'object' ? img.url : img;
            }
            if (recipeData.ingredients.length === 0 && recipe.recipeIngredient) {
              const rawIng = Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient.map(cleanText) : [cleanText(recipe.recipeIngredient)];
              if (!isMenu(rawIng)) recipeData.ingredients = rawIng;
            }
            if (recipeData.method.length === 0 && recipe.recipeInstructions) {
              recipeData.method = parseInstructions(recipe.recipeInstructions);
            }
          }
        } catch (e) {}
      });

      if (!recipeData.name) recipeData.name = $('h1').first().text().trim() || $('title').text().split('|')[0].trim();
      if (!recipeData.imageUrl) recipeData.imageUrl = $('meta[property="og:image"]').attr('content') || $('main img').first().attr('src') || '';

      const ingredientsRegex = /(מצרכים|רכיבים|מרכיבים|חומרים)/i;
      const methodRegex = /(אופן|הוראות|תהליך|שלבי)(\s+ה)?(\s+)?כנה|הכנות/i; 

      if (recipeData.ingredients.length === 0) {
        recipeData.ingredients = scrapeList($, ['.wprm-recipe-ingredient', '.recipeIngredients li'], ingredientsRegex);
      }
      if (recipeData.method.length === 0) {
        recipeData.method = scrapeList($, ['.wprm-recipe-instruction', '.recipeInstructions li'], methodRegex);
      }
    }

    if (recipeData.rawText && (recipeData.ingredients.length === 0 || recipeData.method.length === 0)) {
      try {
        const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
        
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                },
                required: ["title", "ingredients", "instructions"]
              }
            }
          });

          const prompt = `
  The following text is taken from a social media post and contains a recipe.
  Extract the real, short recipe name (without extra promotional words), the ingredients, and the instructions.
  Return a valid JSON object.
  If the text is cut off at the end, try to logically complete the final cooking step based on culinary common sense.
  
  CRITICAL: All extracted text values in the JSON (title, ingredients, instructions) MUST be in Hebrew.
  
  Text to analyze:
  ${recipeData.rawText}
`;

          const result = await model.generateContent(prompt);
          const cleanJsonString = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsedData = JSON.parse(cleanJsonString);

          recipeData.name = parsedData.title || recipeData.name;
          recipeData.ingredients = parsedData.ingredients || recipeData.ingredients;
          recipeData.method = parsedData.instructions || recipeData.method;
        } else {
          recipeData.geminiError = "API Key is missing on the server";
        }
      } catch (geminiErr) {
        console.error('Gemini error:', geminiErr);
        recipeData.geminiError = geminiErr.message || String(geminiErr);
      }
    }

    recipeData.ingredients = [...new Set(recipeData.ingredients)].filter(Boolean);
    recipeData.method = [...new Set(recipeData.method)].filter(Boolean);

    res.status(200).json(recipeData);

  } catch (err) {
    console.error('Scraping error:', err);
    res.status(500).json({ error: 'Failed to scrape recipe' });
  }
}

export default allowCors(handler);

function findRecipeDeep(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (isRecipe(obj)) return obj;
  if (Array.isArray(obj)) return obj.map(findRecipeDeep).find(Boolean);
  for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
         const found = findRecipeDeep(obj[key]);
         if (found) return found;
      }
  }
  return null;
}
function isRecipe(obj) {
  if (!obj || !obj['@type']) return false;
  const type = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
  return type.some(t => typeof t === 'string' && t.toLowerCase().includes('recipe'));
}
function parseInstructions(instructions) {
  if (typeof instructions === 'string') return [cleanText(instructions)];
  if (Array.isArray(instructions)) {
    return instructions.flatMap(item => {
      if (typeof item === 'string') return cleanText(item);
      if (item['@type'] === 'HowToStep') return cleanText(item.text);
      if (item['@type'] === 'HowToSection') return parseInstructions(item.itemListElement);
      return null;
    }).filter(Boolean);
  }
  return [];
}
function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').trim();
}
function scrapeList($, selectors, removeHeaderRegex) {
  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      let list = [];
      elements.each((_, el) => {
          const txt = cleanText($(el).text());
          if (txt) list.push(txt);
      });
      if (list.length > 0 && !isMenu(list)) return list;
    }
  }
  return [];
}
function isMenu(list) {
  if (!list || list.length === 0) return false;
  const menuKeywords = ['דף הבית', 'מתכונים', 'צור קשר', 'חיפוש'];
  return list.filter(item => menuKeywords.some(kw => item.toLowerCase().includes(kw))).length >= 2;
}