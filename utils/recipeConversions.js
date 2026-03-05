// utils/recipeConversions.js

const conversionRates = [
  { names: ['קמח מלא'], cup: 125, tbsp: 8, tsp: 3 },
  { names: ['קמח', 'קורנפלור', 'קקאו', 'אבקת אפייה', 'סודה לשתייה'], cup: 140, tbsp: 10, tsp: 5 },
  { names: ['סוכר חום'], cup: 240, tbsp: 15, tsp: 5 },
  { names: ['סוכר', 'סולת', 'שמן', 'שוקולד צ\'יפס', 'חמאה', 'מרגרינה'], cup: 200, tbsp: 10, tsp: 4 },
  { names: ['אבקת סוכר'], cup: 120, tbsp: 8, tsp: 3 },
  { names: ['פרג', 'שקדים', 'אגוזים', 'שיבולת שועל', 'קוקוס'], cup: 100, tbsp: 6, tsp: 2 },
  { names: ['דבש', 'סילאן', 'סירופ'], cup: 360, tbsp: 20, tsp: 7 },
  { names: ['מים', 'חלב', 'מיץ', 'מייפל', 'טחינה'], cup: 240, tbsp: 15, tsp: 5 },
  { names: ['שמנת מתוקה', 'חמאת בוטנים'], cup: 250, tbsp: 15 },
  { names: ['ממרח שוקולד', 'נוטלה', 'השחר'], cup: 280, tbsp: 18 },
  { names: ['ריבת חלב', 'קרם קוקוס', 'חלב קוקוס'], cup: 400, tbsp: 25 },
  { names: ['ריבה'], cup: 330, tbsp: 20 },
  { names: ['מלח'], cup: 250, tbsp: 20, tsp: 5 },
];

const formatNumberForDisplay = (n, unit) => {
  if (isNaN(n)) return "";
  
  if (unit && ['גרם', 'ג\'', 'גר\'', 'מ"ל', 'מל'].includes(unit)) {
    return Math.round(n).toString(); 
  }
  
  if (Number.isInteger(n)) return n.toString();
  const whole = Math.floor(n);
  const fraction = n - whole;
  
  if (Math.abs(fraction - 0.5) < 0.05) return whole > 0 ? `${whole} 1/2` : '1/2';
  if (Math.abs(fraction - 0.25) < 0.05) return whole > 0 ? `${whole} 1/4` : '1/4';
  if (Math.abs(fraction - 0.75) < 0.05) return whole > 0 ? `${whole} 3/4` : '3/4';
  if (Math.abs(fraction - 0.33) < 0.05) return whole > 0 ? `${whole} 1/3` : '1/3';
  if (Math.abs(fraction - 0.67) < 0.05) return whole > 0 ? `${whole} 2/3` : '2/3';
  if (Math.abs(fraction - 0.125) < 0.05) return whole > 0 ? `${whole} 1/8` : '1/8'; 
  if (Math.abs(fraction - 0.375) < 0.05) return whole > 0 ? `${whole} 3/8` : '3/8';

  return Number(n.toFixed(2)).toString();
};

export const processIngredientLine = (line, scale, mode) => {
  if (scale === 1 && mode === 'original') return { text: line, isModified: true };

  let workLine = line.trim();
  let isModified = false;

  const unicodeFractions = {
    '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4',
    '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5', '⅙': '1/6',
    '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8'
  };
  for (const [char, frac] of Object.entries(unicodeFractions)) {
    workLine = workLine.replace(new RegExp(char, 'g'), frac);
  }

  const wordToNum = {
    'קילו': '1000 גרם', 'חצי': '1/2', 'רבע': '1/4', 'שליש': '1/3',
    'אחד': '1', 'אחת': '1', 'שניים': '2', 'שתי': '2'
  };

  for (const [word, num] of Object.entries(wordToNum)) {
    const regex = new RegExp(`(^|\\s|\\-)${word}(?=\\s|\\-|\\.|,|$)`, 'g');
    workLine = workLine.replace(regex, `$1${num}`);
  }

  workLine = workLine.replace(/(?:(\d+)\s+)?(כוסות|כוס|כפות|כף|כפיות|כפית)\s*ו?(1\/2|1\/4|1\/3|3\/4|2\/3)/g, (match, num, unit, frac) => {
    let n = num ? parseFloat(num) : 1;
    let f = frac === '1/2' ? 0.5 : frac === '1/4' ? 0.25 : frac === '1/3' ? 0.33 : frac === '3/4' ? 0.75 : 0.67;
    return (n + f) + ' ' + unit;
  });

  workLine = workLine.replace(/^(כוסות|כוס|כפות|כף|כפיות|כפית|גרם|ג'|גר'|מ"ל|מל|ק"ג|קג)(\s+|$)/, "1 $1$2");

  const regex = /^([\d\s\/\.]+)?\s*(כוסות|כוס|כפות|כף|כפיות|כפית|גרם|ג'|גר'|מ"ל|מל|ק"ג|קג)\s+(.*)/;
  const match = workLine.match(regex);
  
  if (!match) {
    let replaced = false; 
    let finalLine = workLine.replace(/(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+)/, (m) => {
      if (replaced) return m; 
      replaced = true;
      isModified = true;
      let n = 0;
      if (m.includes('/')) {
          const parts = m.trim().split(/\s+/);
          if (parts.length === 2) {
              const [whole, frac] = parts;
              const [num, den] = frac.split('/');
              n = parseInt(whole) + parseInt(num) / parseInt(den);
          } else {
              const [num, den] = m.split('/');
              n = parseInt(num) / parseInt(den);
          }
      } else {
          n = parseFloat(m);
      }
      return formatNumberForDisplay(n * scale, null);
    });
    
    return { text: isModified ? finalLine : line, isModified: isModified };
  }

  isModified = true;
  let numStr = match[1] ? match[1].trim() : "1";
  let unit = match[2];
  let restOfLine = match[3];

  let num = 0;
  if (numStr.includes('/')) {
    const parts = numStr.split(/\s+/);
    if (parts.length === 2) {
      const [n, d] = parts[1].split('/');
      num = parseInt(parts[0]) + (parseInt(n) / parseInt(d));
    } else {
      const [n, d] = numStr.split('/');
      num = parseInt(n) / parseInt(d);
    }
  } else {
    num = parseFloat(numStr) || 1;
  }

  if (unit === 'ק"ג' || unit === 'קג') {
      num = num * 1000;
      unit = 'גרם';
  }

  let calculatedNum = num;
  let calculatedUnit = unit;

  if (mode !== 'original') {
    const lowerLine = restOfLine.toLowerCase();
    const itemRates = conversionRates.find(item => item.names.some(name => lowerLine.includes(name)));
    
    if (itemRates) {
      const isVolume = ['כוסות', 'כוס', 'כפות', 'כף', 'כפיות', 'כפית'].includes(unit);
      const isWeight = ['גרם', 'ג\'', 'גר\'', 'מ"ל', 'מל'].includes(unit);

      if (mode === 'grams' && isVolume) {
        let multiplier = 0;
        if (unit.startsWith('כוס')) multiplier = itemRates.cup;
        else if (unit.startsWith('כפ') && unit.includes('ת')) { 
            if (unit === 'כף' || unit === 'כפות') multiplier = itemRates.tbsp;
            else if (unit === 'כפית' || unit === 'כפיות') multiplier = itemRates.tsp;
        }

        if (multiplier > 0) {
          calculatedNum = num * multiplier;
          calculatedUnit = 'גרם';
        }
      } 
      else if (mode === 'volume' && isWeight) {
        let volumeInCups = num / itemRates.cup;
        if (volumeInCups >= 0.25) { 
          calculatedNum = volumeInCups;
          calculatedUnit = calculatedNum <= 1 ? 'כוס' : 'כוסות';
        } else {
          let volumeInTbsp = num / itemRates.tbsp;
          calculatedNum = volumeInTbsp;
          calculatedUnit = calculatedNum <= 1 ? 'כף' : 'כפות';
        }
      }
    }
  }

  calculatedNum = calculatedNum * scale;
  const finalNumStr = formatNumberForDisplay(calculatedNum, calculatedUnit);
  
  return { text: `${finalNumStr} ${calculatedUnit} ${restOfLine}`, isModified: true };
};