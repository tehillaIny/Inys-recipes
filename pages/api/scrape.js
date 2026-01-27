import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// פונקציית עזר לטיפול ב-CORS (אישור גישה לאפליקציה)
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // מאפשר גישה מכולם (כולל האפליקציה)
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

/*const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();*/

  const handler = async (req, res) => {
  // בדיקה חכמה יותר: המרה לאותיות גדולות וקבלת מידע על השגיאה
  const method = req.method ? req.method.toUpperCase() : 'UNKNOWN';

  if (method !== 'POST') {
    return res.status(405).json({ 
      error: `Method Not Allowed. Server received: ${method}`,
      receivedMethod: method
    });
  }

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);

    let recipeData = {
      name: '',
      ingredients: [],
      method: [],
      imageUrl: ''
    };

    // --- (כאן נכנס כל הקוד הלוגי שלך לניתוח המתכון, העתקתי אותו למטה בשבילך) ---
    
    // 1. JSON-LD
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
      } catch (e) { /* ignore */ }
    });

    // 2. HTML Fallback
    if (!recipeData.name) {
      recipeData.name = $('h1').first().text().trim() || $('.ArticleTitle').first().text().trim() || $('title').text().split('|')[0].trim();
    }
    if (!recipeData.imageUrl) {
      recipeData.imageUrl = $('meta[property="og:image"]').attr('content') || $('.wprm-recipe-image img').attr('src') || $('main img').first().attr('src') || '';
    }

    const ingredientsRegex = /(מצרכים|רכיבים|מרכיבים|חומרים)/i;
    const methodRegex = /(אופן|הוראות|תהליך|שלבי)(\s+ה)?(\s+)?כנה|הכנות/i; 

    if (recipeData.ingredients.length === 0) {
      const exactSelectors = ['.wprm-recipe-ingredient', '.wprm-recipe-ingredients li', '.recipeIngredients li span', '.recipeIngredients li', '.penci-recipe-ingredients p', '.penci-recipe-ingredients li', '[itemprop="recipeIngredient"]', '#ingredients p', '#ingredients'];
      recipeData.ingredients = scrapeList($, exactSelectors, ingredientsRegex);
      if (recipeData.ingredients.length === 0) recipeData.ingredients = scrapeByHeaderText($, ingredientsRegex, methodRegex);
      if (recipeData.ingredients.length === 0) recipeData.ingredients = scrapeList($, ['.ingredients li', '.recipe-ingredients li'], null);
    }

    if (recipeData.method.length === 0) {
      const methodSelectors = ['.wprm-recipe-instruction', '.wprm-recipe-instructions li', '.recipeInstructions p', '.recipeInstructions li', '[itemprop="recipeInstructions"]', '.penci-recipe-method p, .penci-recipe-method li', '.instructions li', '.recipe-steps li'];
      recipeData.method = scrapeList($, methodSelectors, methodRegex);
      if (recipeData.method.length === 0) recipeData.method = scrapeByHeaderText($, methodRegex, /הערות|תגובות|comments|share|בתיאבון|בתאבון|טיפים/i);
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

// ---------------------------------------------------------
// פונקציות עזר משודרגות
// ---------------------------------------------------------

function scrapeByHeaderText($, startRegex, stopRegex) {
  let items = [];
  
  $('h2, h3, h4, h5, h6, strong, b, p, div').filter((_, el) => {
    const text = $(el).text().trim();
    return text.length < 100 && startRegex.test(text);
  }).each((_, el) => {
    if (items.length > 0) return;

    let currentElement = $(el);
    if (currentElement.parent().is('p') || currentElement.parent().is('div')) {
        if (currentElement.parent().text().length < 150) {
            currentElement = currentElement.parent();
        }
    }

    let next = currentElement.next();
    let tries = 0;
    
    while (tries < 60 && next.length) {
      const text = next.text().trim();
      
      if (stopRegex && stopRegex.test(text) && (next.is('h2, h3, h4, strong') || text.length < 100)) {
        break;
      }

      if (next.is('ul, ol')) {
        const listItems = next.find('li').map((_, li) => cleanText($(li).text())).get();
        items.push(...listItems);
      } 
      else if (next.is('div, p, section')) {
        // בדיקת ילדים חכמה
        const childParagraphs = next.find('p');
        if (childParagraphs.length > 0) {
            childParagraphs.each((_, p) => {
                const pText = cleanText($(p).text());
                if (isValidLine(pText, startRegex, stopRegex)) items.push(pText);
            });
        } else {
            // ניסיון פיצול אוטומטי
            const htmlContent = next.html();
            if (htmlContent) {
               const hasBr = /<br\s*\/?>/i.test(htmlContent);
               if (hasBr) {
                   const lines = htmlContent.split(/<br\s*\/?>/i);
                   lines.forEach(line => {
                       const cleanLine = cleanText(cheerio.load(line).text());
                       if (isValidLine(cleanLine, startRegex, stopRegex)) items.push(cleanLine);
                   });
               } else {
                   const cleanLine = cleanText(text);
                   if (isValidLine(cleanLine, startRegex, stopRegex)) items.push(cleanLine);
               }
            }
        }
      }

      next = next.next();
      tries++;
    }
  });
  
  if (isMenu(items)) return [];
  return items;
}

function isValidLine(line, startRegex, stopRegex) {
    return line && 
           line.length > 1 && 
           !startRegex.test(line) && 
           (!stopRegex || !stopRegex.test(line)) &&
           !isMenu([line]);
}

function scrapeList($, selectors, removeHeaderRegex) {
  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      let list = [];
      
      // הלוגיקה החדשה: לא בודקים שמות מחלקות, אלא את התוכן
      elements.each((_, el) => {
          const html = $(el).html() || '';
          
          // בדיקה אם האלמנט מכיל ירידות שורה
          const hasBr = /<br\s*\/?>/i.test(html);
          
          if (hasBr) {
              const lines = html.split(/<br\s*\/?>/i);
              lines.forEach(line => {
                  const txt = cleanText(cheerio.load(line).text());
                  if (txt && (!removeHeaderRegex || !removeHeaderRegex.test(txt))) {
                      list.push(txt);
                  }
              });
          } else {
              // חילוץ רגיל
              const clone = $(el).clone();
              clone.find('input, .checkbox, script, style, .ad').remove();
              const txt = cleanText(clone.text());
              if (txt && (!removeHeaderRegex || !removeHeaderRegex.test(txt))) {
                  list.push(txt);
              }
          }
      });

      if (list.length > 0 && !isMenu(list)) return list;
    }
  }
  return [];
}

function isMenu(list) {
  if (!list || list.length === 0) return false;
  const menuKeywords = ['דף הבית', 'מתכונים', 'צור קשר', 'אודות', 'חיפוש', 'סדנאות', 'נגישות', 'home', 'contact', 'print', 'email'];
  const matches = list.filter(item => menuKeywords.some(kw => item.toLowerCase().includes(kw)));
  return matches.length >= 2;
}

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