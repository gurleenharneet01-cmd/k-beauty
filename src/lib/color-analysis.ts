import Jimp from 'jimp';

type RGB = { r: number; g: number; b: number };
type ColorInfo = { name: string; hex: string };

type MakeupRecommendations = {
  lipstick: ColorInfo[];
  blush: ColorInfo[];
};

type Recommendations = {
  fashion: ColorInfo[];
  makeup: MakeupRecommendations;
  avoid: ColorInfo[];
};

export type AnalysisResult = {
  skinTone: string;
  dominantColor: string;
  rgb: RGB;
  recommendations: Recommendations;
};

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function mapRgbToSkinTone(r: number, g: number, b: number): string {
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const hue = Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * (180 / Math.PI);

  let depth = 'medium';
  if (lum > 200) depth = 'fair';
  else if (lum < 85) depth = 'deep';

  let warmth = 'neutral';
  if (hue > -30 && hue < 60) warmth = 'warm';
  else if (hue <= -30 || hue >= 170) warmth = 'cool';

  return `${depth} ${warmth}`.trim();
}

function colorRecommendationsForTone(tone: string): Recommendations {
    const map: Record<string, Recommendations> = {
      'fair warm': {
        fashion: [ { name: 'Peach', hex: '#FFDAB9' }, { name: 'Coral', hex: '#FF7F50' }, { name: 'Warm Beige', hex: '#F5F5DC' }, { name: 'Camel', hex: '#C19A6B' }, { name: 'Olive Green', hex: '#808000' } ],
        makeup: {
          lipstick: [ { name: 'Coral', hex: '#FF7F50' }, { name: 'Peachy Nude', hex: '#E8A798' } ],
          blush: [ { name: 'Warm Peach', hex: '#FFCBA4' }, { name: 'Light Coral', hex: '#F08080' } ],
        },
        avoid: [ { name: 'Icy Blue', hex: '#ADD8E6' }, { name: 'Black', hex: '#000000' }, { name: 'Magenta', hex: '#FF00FF' } ],
      },
      'fair neutral': {
        fashion: [ { name: 'Soft Rose', hex: '#E0BBE4' }, { name: 'Dusty Blue', hex: '#6699CC' }, { name: 'Sage Green', hex: '#B2AC88' }, { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Light Gray', hex: '#D3D3D3' } ],
        makeup: {
          lipstick: [ { name: 'Rose', hex: '#FF007F' }, { name: 'Dusty Pink', hex: '#D4A6B1' } ],
          blush: [ { name: 'Soft Pink', hex: '#F9CCCA' }, { name: 'Neutral Rose', hex: '#C48189' } ],
        },
        avoid: [ { name: 'Bright Yellow', hex: '#FFFF00' }, { name: 'Neons', hex: '#39FF14' }, { name: 'Dark Brown', hex: '#654321' } ],
      },
      'fair cool': {
        fashion: [ { name: 'Icy Blue', hex: '#ADD8E6' }, { name: 'Lavender', hex: '#E6E6FA' }, { name: 'Charcoal', hex: '#36454F' }, { name: 'Soft Gray', hex: '#D3D3D3' }, { name: 'Mint Green', hex: '#98FF98' } ],
        makeup: {
          lipstick: [ { name: 'Plum', hex: '#8E4585' }, { name: 'Cool Pink', hex: '#E5B9B5' } ],
          blush: [ { name: 'Baby Pink', hex: '#F4C2C2' }, { name: 'Light Mauve', hex: '#D4B3C6' } ],
        },
        avoid: [ { name: 'Orange', hex: '#FFA500' }, { name: 'Gold', hex: '#FFD700' }, { name: 'Tomato Red', hex: '#FF6347' } ],
      },
      'medium warm': {
        fashion: [ { name: 'Terracotta', hex: '#E2725B' }, { name: 'Mustard', hex: '#FFDB58' }, { name: 'Warm Olive', hex: '#556B2F' }, { name: 'Cream', hex: '#FFFDD0' }, { name: 'Burnt Orange', hex: '#CC5500' } ],
        makeup: {
          lipstick: [ { name: 'Brick Red', hex: '#B22222' }, { name: 'Terracotta', hex: '#E2725B' } ],
          blush: [ { name: 'Bronze', hex: '#CD7F32' }, { name: 'Spiced Peach', hex: '#E49B61' } ],
        },
        avoid: [ { name: 'Pastel Pink', hex: '#FFD1DC' }, { name: 'Baby Blue', hex: '#89CFF0' }, { name: 'Ash Gray', hex: '#B2BEB5' } ],
      },
      'medium neutral': {
        fashion: [ { name: 'Teal', hex: '#008080' }, { name: 'Wine', hex: '#722F37' }, { name: 'Beige', hex: '#F5F5DC' }, { name: 'Denim Blue', hex: '#1560BD' }, { name: 'Mauve', hex: '#E0B0FF' } ],
        makeup: {
          lipstick: [ { name: 'Mauve', hex: '#E0B0FF' }, { name: 'Berry', hex: '#8A2A54' } ],
          blush: [ { name: 'Neutral Rose', hex: '#D29A8D' }, { name: 'Deeper Pink', hex: '#DE6FA1' } ],
        },
        avoid: [ { name: 'Neon Green', hex: '#39FF14' }, { name: 'Electric Orange', hex: '#FF4F00' }, { name: 'Stark White', hex: '#FFFFFF' } ],
      },
      'medium cool': {
        fashion: [ { name: 'Plum', hex: '#8E4585' }, { name: 'Steel Blue', hex: '#4682B4' }, { name: 'Forest Green', hex: '#228B22' }, { name: 'Burgundy', hex: '#800020' }, { name: 'Navy', hex: '#000080' } ],
        makeup: {
          lipstick: [ { name: 'Berry', hex: '#8A2A54' }, { name: 'Deep Rose', hex: '#8B0000' } ],
          blush: [ { name: 'Cool Mauve', hex: '#C6A9B4' }, { name: 'Cool Plum', hex: '#8B668B' } ],
        },
        avoid: [ { name: 'Golden Yellow', hex: '#FFC000' }, { name: 'Warm Brown', hex: '#964B00' }, { name: 'Cream', hex: '#FFFDD0' } ],
      },
      'deep warm': {
        fashion: [ { name: 'Rich Gold', hex: '#DAA520' }, { name: 'Burnt Orange', hex: '#CC5500' }, { name: 'Olive Green', hex: '#808000' }, { name: 'Chocolate Brown', hex: '#D2691E' }, { name: 'Rust', hex: '#B7410E' } ],
        makeup: {
          lipstick: [ { name: 'Brick', hex: '#B22222' }, { name: 'Deep Terracotta', hex: '#C8644A' } ],
          blush: [ { name: 'Warm Terracotta', hex: '#E2725B' }, { name: 'Rich Bronze', hex: '#8C4312' } ],
        },
        avoid: [ { name: 'Pale Lavender', hex: '#D8BFD8' }, { name: 'Light Pink', hex: '#FFB6C1' }, { name: 'Light Gray', hex: '#D3D3D3' } ],
      },
      'deep neutral': {
        fashion: [ { name: 'Eggplant', hex: '#614051' }, { name: 'Cobalt Blue', hex: '#0047AB' }, { name: 'Camel', hex: '#C19A6B' }, { name: 'Deep Teal', hex: '#003J3C' }, { name: 'Maroon', hex: '#800000' } ],
        makeup: {
          lipstick: [ { name: 'Deep Rose', hex: '#8B0000' }, { name: 'Chocolate', hex: '#7B3F00' } ],
          blush: [ { name: 'Neutral Plum', hex: '#7D4F50' }, { name: 'Deep Berry', hex: '#580F2A' } ],
        },
        avoid: [ { name: 'Baby Pink', hex: '#F4C2C2' }, { name: 'Pastel Yellow', hex: '#FDFFB6' }, { name: 'White', hex: '#FFFFFF' } ],
      },
      'deep cool': {
        fashion: [ { name: 'Black', hex: '#000000' }, { name: 'Royal Blue', hex: '#4169E1' }, { name: 'Emerald Green', hex: '#50C878' }, { name: 'Deep Fuchsia', hex: '#C154C1' }, { name: 'True Red', hex: '#FF0000' } ],
        makeup: {
          lipstick: [ { name: 'Deep Berry', hex: '#3A1226' }, { name: 'Rich Burgundy', hex: '#6D071A' } ],
          blush: [ { name: 'Plum', hex: '#8E4585' }, { name: 'Cool Berry', hex: '#993366' } ],
        },
        avoid: [ { name: 'Beige', hex: '#F5F5DC' }, { name: 'Light Orange', hex: '#FED8B1' }, { name: 'Warm Gold', hex: '#FFB347' } ],
      },
    };
  
    return map[tone] || {
      fashion: [{ name: 'Beige', hex: '#F5F5DC' }, { name: 'Navy', hex: '#000080' }, { name: 'Olive', hex: '#808000' }],
      makeup: {
        lipstick: [{ name: 'Nude Rose', hex: '#C48189' }],
        blush: [{ name: 'Neutral Pink', hex: '#D29A8D' }],
      },
      avoid: [{ name: 'Neon Green', hex: '#39FF14' }, { name: 'Stark White', hex: '#FFFFFF' }],
    };
  }
  

export async function performAnalysis(imageBuffer: Buffer): Promise<AnalysisResult> {
  const image = await Jimp.read(imageBuffer);
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  // Sample a 5% area from the center of the image
  const sampleSize = Math.max(1, Math.floor(Math.min(w, h) * 0.05));
  let rSum = 0, gSum = 0, bSum = 0, count = 0;

  const centerX = Math.floor(w / 2);
  const centerY = Math.floor(h / 2);

  for (let dx = -sampleSize; dx <= sampleSize; dx++) {
    for (let dy = -sampleSize; dy <= sampleSize; dy++) {
      const x = Math.min(w - 1, Math.max(0, centerX + dx));
      const y = Math.min(h - 1, Math.max(0, centerY + dy));
      const hex = image.getPixelColor(x, y);
      const rgba = Jimp.intToRGBA(hex);
      
      // Basic skin detection - ignore very dark/light or non-skin-like colors
      const isSkinLike = (rgba.r > 95 && rgba.g > 40 && rgba.b > 20 &&
                        (Math.max(rgba.r, rgba.g, rgba.b) - Math.min(rgba.r, rgba.g, rgba.b)) > 15 &&
                        Math.abs(rgba.r - rgba.g) > 15 && rgba.r > rgba.g && rgba.r > rgba.b);

      if (isSkinLike) {
        rSum += rgba.r;
        gSum += rgba.g;
        bSum += rgba.b;
        count += 1;
      }
    }
  }

  if (count === 0) {
    throw new Error("Could not detect skin tone in the center of the image. Please try a clearer, centered photo.");
  }

  const rAvg = Math.round(rSum / count);
  const gAvg = Math.round(gSum / count);
  const bAvg = Math.round(bSum / count);

  const tone = mapRgbToSkinTone(rAvg, gAvg, bAvg);
  const recommendations = colorRecommendationsForTone(tone);
  const dominantHex = rgbToHex(rAvg, gAvg, bAvg);
  const rgb = { r: rAvg, g: gAvg, b: bAvg };

  return {
    skinTone: tone,
    dominantColor: dominantHex,
    rgb,
    recommendations,
  };
}
