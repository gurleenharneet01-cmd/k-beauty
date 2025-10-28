import Jimp from 'jimp';

type RGB = { r: number; g: number; b: number };
type Recommendations = {
  fashion: string[];
  makeup: string[];
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
        fashion: ['Peach', 'Coral', 'Warm Beige', 'Camel', 'Olive Green'],
        makeup: ['Coral lipstick', 'Warm peach blush', 'Golden eyeshadow'],
      },
      'fair neutral': {
        fashion: ['Soft Rose', 'Dusty Blue', 'Sage Green', 'Ivory', 'Light Gray'],
        makeup: ['Rose lipstick', 'Soft pink blush', 'Champagne eyeshadow'],
      },
      'fair cool': {
        fashion: ['Icy Blue', 'Lavender', 'Charcoal', 'Soft Gray', 'Mint Green'],
        makeup: ['Plum lipstick', 'Cool pink blush', 'Silver eyeshadow'],
      },
      'medium warm': {
        fashion: ['Terracotta', 'Mustard', 'Warm Olive', 'Cream', 'Burnt Orange'],
        makeup: ['Brick red lipstick', 'Bronze blush', 'Copper eyeshadow'],
      },
      'medium neutral': {
        fashion: ['Teal', 'Wine', 'Beige', 'Denim Blue', 'Mauve'],
        makeup: ['Mauve lipstick', 'Neutral blush', 'Taupe eyeshadow'],
      },
      'medium cool': {
        fashion: ['Plum', 'Steel Blue', 'Forest Green', 'Burgundy', 'Navy'],
        makeup: ['Berry lipstick', 'Cool mauve blush', 'Graphite eyeshadow'],
      },
      'deep warm': {
        fashion: ['Rich Gold', 'Burnt Orange', 'Olive Green', 'Chocolate Brown', 'Rust'],
        makeup: ['Brick lipstick', 'Warm terracotta blush', 'Bronze eyeshadow'],
      },
      'deep neutral': {
        fashion: ['Eggplant', 'Cobalt Blue', 'Camel', 'Deep Teal', 'Maroon'],
        makeup: ['Deep rose lipstick', 'Neutral plum blush', 'Bronze-gold eyeshadow'],
      },
      'deep cool': {
        fashion: ['Black', 'Royal Blue', 'Emerald Green', 'Deep Fuchsia', 'True Red'],
        makeup: ['Deep berry lipstick', 'Plum blush', 'Smoky eyeshadow'],
      },
    };
  
    return map[tone] || {
      fashion: ['Beige', 'Navy', 'Olive'],
      makeup: ['Neutral lipstick', 'Peach blush', 'Soft brown eyeshadow'],
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
