
'use client';

import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import localforage from 'localforage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowRight, Palette, Camera, Sparkles } from 'lucide-react';
import { Shirt } from 'lucide-react';

localforage.config({ name: 'kbeauty_color_advisor' });

const COLOR_PALETTES: Record<string, string[]> = {
  'Warm Spring': ['#FFDAB3', '#FFA07A', '#FFD700', '#FF6F61', '#FFC0CB'],
  'Warm Autumn': ['#C68642', '#8B4513', '#D2691E', '#A0522D', '#B87333'],
  'Cool Summer': ['#AEC6CF', '#B0E0E6', '#778899', '#C3CDE6', '#D8BFD8'],
  'Cool Winter': ['#0F52BA', '#191970', '#8A2BE2', '#DC143C', '#2F4F4F'],
  'Neutral': ['#F5F5DC', '#E6E6FA', '#F0E68C', '#D2B48C', '#C0C0C0'],
};

const AVOID_PALETTES: Record<string, string[]> = {
    'Warm Spring': ['#000080', '#4B0082', '#800080', '#A9A9A9', '#000000'], // Avoid dark, cool colors
    'Warm Autumn': ['#ADD8E6', '#E0FFFF', '#FFB6C1', '#DDA0DD', '#FFFFFF'], // Avoid light, cool pastels
    'Cool Summer': ['#FFA500', '#FF4500', '#B8860B', '#8B4513', '#FFD700'], // Avoid earthy, warm tones
    'Cool Winter': ['#F4A460', '#FFDEAD', '#EEE8AA', '#F5DEB3', '#D2B48C'], // Avoid muted, earthy colors
    'Neutral': [], // Neutrals have a wider range, less to strictly avoid
};

const CLOTHING_SHAPE_ADVICE: Record<string, { necklines: string[]; advice: string }> = {
    'Warm Spring': {
      necklines: ['Scoop Neck', 'Sweetheart', 'Square Neck'],
      advice: 'Open and soft necklines complement your fresh, vibrant coloring and create an inviting look.',
    },
    'Warm Autumn': {
      necklines: ['V-Neck', 'Cowl Neck', 'Turtleneck'],
      advice: 'Defined and structured necklines enhance your rich, earthy tones and create a sophisticated silhouette.',
    },
    'Cool Summer': {
      necklines: ['Boat Neck', 'Round Neck', 'Off-the-Shoulder'],
      advice: 'Graceful, flowing necklines harmonize with your soft, cool palette for an elegant appearance.',
    },
    'Cool Winter': {
      necklines: ['V-Neck', 'Asymmetrical', 'High Neck'],
      advice: 'Sharp, dramatic necklines accentuate your bold, crisp coloring and create a striking statement.',
    },
    'Neutral': {
      necklines: ['Crew Neck', 'V-Neck', 'Boat Neck'],
      advice: 'Classic and versatile necklines work well with your balanced tones, offering a wide range of flattering options.',
    },
};

const HAIR_COLOR_ADVICE: Record<string, { colors: string[]; advice: string }> = {
    'Warm Spring': {
      colors: ['Golden Blonde', 'Honey Brown', 'Strawberry Blonde', 'Light Auburn'],
      advice: 'Warm, golden hues will illuminate your complexion and bring out the natural warmth in your skin.',
    },
    'Warm Autumn': {
      colors: ['Rich Auburn', 'Chocolate Brown', 'Mahogany', 'Caramel Highlights'],
      advice: 'Deep, rich, and earthy hair colors will complement your natural coloring and add a sophisticated warmth.',
    },
    'Cool Summer': {
      colors: ['Ash Blonde', 'Light Ash Brown', 'Cool Brunette', 'Silver Tones'],
      advice: 'Cool, ashy tones will harmonize with your soft complexion and prevent any brassiness.',
    },
    'Cool Winter': {
      colors: ['Jet Black', 'Dark Cool Brown', 'Blue-Black', 'Deep Burgundy'],
      advice: 'Bold, striking and cool-toned hair colors will create a stunning contrast with your skin tone.',
    },
    'Neutral': {
      colors: ['Natural Brown', 'Beige Blonde', 'Muted Copper', 'Soft Black'],
      advice: 'A wide range of colors can work for you. Stick close to your natural shade or choose muted versions of other tones.',
    },
};


interface ScanResults {
    r: number;
    g: number;
    b: number;
    brightness: number;
    season: string;
}

export default function ColorAnalysisPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [undertone, setUndertone] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [avoidPalette, setAvoidPalette] = useState<string[]>([]);
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const p: any = await localforage.getItem('profile');
      if (p) {
        setUndertone(p.undertone || null);
        setPalette(p.palette || []);
        setAvoidPalette(p.avoidPalette || []);
        if (p.scanResults) setScanResults(p.scanResults);
      }
    })();
  }, []);

  useEffect(() => {
    if (undertone || palette.length > 0 || scanResults) {
        localforage.setItem('profile', { undertone, palette, avoidPalette, scanResults });
    }
  }, [undertone, palette, avoidPalette, scanResults]);

  const onImage = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const analyzeColorFromPhoto = () => {
    if (!photo) {
      toast({ variant: 'destructive', title: 'Upload a selfie or wrist photo first' });
      return;
    }
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const w = Math.max(10, Math.floor(c.width * 0.08));
      const h = Math.max(10, Math.floor(c.height * 0.05));
      const x = Math.floor(c.width * 0.45);
      const y = Math.floor(c.height * 0.6);
      const data = ctx.getImageData(x, y, w, h).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      const isWarm = r - g > 8 && r - b > 6;
      const isCool = b - r > 6 && b - g > 4;
      const u = isWarm ? 'Warm' : isCool ? 'Cool' : 'Neutral';
      const brightness = (r + g + b) / 3;
      let season = 'Neutral';
      if (u === 'Warm' && brightness > 140) season = 'Warm Spring';
      if (u === 'Warm' && brightness <= 140) season = 'Warm Autumn';
      if (u === 'Cool' && brightness > 130) season = 'Cool Summer';
      if (u === 'Cool' && brightness <= 130) season = 'Cool Winter';
      setUndertone(u);
      setPalette(COLOR_PALETTES[season] || COLOR_PALETTES['Neutral']);
      setAvoidPalette(AVOID_PALETTES[season] || []);
      setScanResults({ r, g, b, brightness, season });
    };
  };

  const shapeAdvice = scanResults ? CLOTHING_SHAPE_ADVICE[scanResults.season] : null;
  const hairAdvice = scanResults ? HAIR_COLOR_ADVICE[scanResults.season] : null;


  return (
    <div className="min-h-screen bg-background text-foreground">
        <canvas ref={canvasRef} className="hidden" />
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Palette className="text-primary"/>
            <h1 className="text-2xl font-bold font-headline">GlamLens AI</h1>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/" className="text-primary font-semibold">Color Analysis</Link>
            <Link href="/skin" className="hover:text-primary transition-colors">Skin Analysis</Link>
          </nav>
        </header>

        <section className="text-center py-10 md:py-16 bg-card rounded-xl shadow-sm border">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Discover Your Perfect Colors</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Upload a photo to instantly analyze your skin's undertone and find the shades that make you shine.</p>
        </section>

        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera /> Upload Your Photo</CardTitle>
                <CardDescription>Upload a selfie or a clear photo of your inner wrist in natural light for the best results.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <Input type="file" accept="image/*" onChange={onImage} />
                    <div className="mt-4">
                        {photo ? <img ref={imgRef} src={photo} alt="uploaded" className="max-h-60 w-full object-cover rounded-lg" /> : <div className="h-60 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">Photo Preview</div>}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={analyzeColorFromPhoto} className="w-full">Analyze Color</Button>
                        <Button onClick={() => { setPhoto(null); setScanResults(null); setUndertone(null); setPalette([]); setAvoidPalette([]); }} variant="outline" className="w-full">Reset</Button>
                    </div>
                </div>
                 <div>
                    {scanResults && (
                        <div className="space-y-4 p-4 border rounded-lg bg-background">
                          <h3 className="font-semibold text-lg">Your Analysis Results</h3>
                          <div>
                            <p className="text-sm text-muted-foreground">Detected Season</p>
                            <p className="font-bold text-xl text-primary">{scanResults.season}</p>
                          </div>
                          <div className="space-y-2">
                            <div>
                                <div className="font-semibold">Suggested Palette:</div>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                {palette.map((c, i) => (<div key={i} style={{ background: c }} className="w-10 h-10 rounded-full shadow-sm border" title={c}></div>))}
                                </div>
                            </div>
                            {avoidPalette.length > 0 && (
                                <div>
                                    <div className="font-semibold">Colors to Avoid:</div>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                    {avoidPalette.map((c, i) => (<div key={i} style={{ background: c }} className="w-10 h-10 rounded-full shadow-sm border" title={c}></div>))}
                                    </div>
                                </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground pt-2 border-t">
                            Avg. Color: rgb({scanResults.r},{scanResults.g},{scanResults.b}) &bull; Brightness: {Math.round(scanResults.brightness)}
                          </div>
                        </div>
                    )}
                 </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shapeAdvice && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shirt /> Flattering Necklines
                  </CardTitle>
                  <CardDescription>{shapeAdvice.advice}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {shapeAdvice.necklines.map((neckline) => (
                      <div
                        key={neckline}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                      >
                        {neckline}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {hairAdvice && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles /> Recommended Hair Colors
                        </CardTitle>
                        <CardDescription>{hairAdvice.advice}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {hairAdvice.colors.map((color) => (
                                <div
                                    key={color}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                                >
                                    {color}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>

        {scanResults && (
            <div className="text-center">
                <Link href="/skin">
                <Button size="lg" variant="default">
                    Next: Analyze Your Skin Type <ArrowRight className="ml-2"/>
                </Button>
                </Link>
            </div>
        )}

        <footer className="text-center text-sm text-muted-foreground py-4">
            This app is a free, client-side demo. For clinical advice, please consult a certified dermatologist.
        </footer>
      </div>
    </div>
  );
}
