// K-Beauty — Color & Skin Advisor (Single-file React + Tailwind)
// Features (all free, client-side):
// • Undertone & best-color palette detector (from uploaded photo or manual input)
// • Skin type detector: quick questionnaire + optional selfie heuristics
// • "Avoid" guidance and personalized tips for skin health
// • Ingredient scanner (paste list) with flags
// • Local storage (localforage) so nothing requires payment or server
// • Export/import user profile JSON
// How to use: drop into src/app/page.tsx in a React + Tailwind project.
'use client';

import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import localforage from 'localforage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

localforage.config({ name: 'kbeauty_color_advisor' });

const COLOR_PALETTES: Record<string, string[]> = {
  'Warm Spring': ['#FFDAB3', '#FFA07A', '#FFD700', '#FF6F61', '#FFC0CB'],
  'Warm Autumn': ['#C68642', '#8B4513', '#D2691E', '#A0522D', '#B87333'],
  'Cool Summer': ['#AEC6CF', '#B0E0E6', '#778899', '#C3CDE6', '#D8BFD8'],
  'Cool Winter': ['#0F52BA', '#191970', '#8A2BE2', '#DC143C', '#2F4F4F'],
  'Neutral': ['#F5F5DC', '#E6E6FA', '#F0E68C', '#D2B48C', '#C0C0C0'],
};

const SAFETY_RULES = [
  { keyword: 'paraben', flag: 'Potential irritant/preservative' },
  { keyword: 'fragrance', flag: 'Common sensitizer' },
  { keyword: 'alcohol', flag: 'Can be drying (depends on type)' },
  { keyword: 'niacinamide', flag: 'Generally beneficial' },
  { keyword: 'hyaluron', flag: 'Hydrating' },
];

interface QuizState {
  oily: boolean;
  dry: boolean;
  sensitive: boolean;
  acne: boolean;
  sunburns: boolean;
}

interface ScanResults {
    r: number;
    g: number;
    b: number;
    brightness: number;
    season: string;
}

export default function App() {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [undertone, setUndertone] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<QuizState>({ oily: false, dry: false, sensitive: false, acne: false, sunburns: false });
  const [skinType, setSkinType] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [ingFlags, setIngFlags] = useState<{ ingredient: string; flag: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const p: any = await localforage.getItem('profile');
      if (p) {
        setName(p.name || '');
        setQuiz(p.quiz || { oily: false, dry: false, sensitive: false, acne: false, sunburns: false });
        setUndertone(p.undertone || null);
        setPalette(p.palette || []);
      }
    })();
  }, []);

  useEffect(() => {
    localforage.setItem('profile', { name, quiz, undertone, palette });
  }, [name, quiz, undertone, palette]);

  // handle image upload
  const onImage = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  // sample center pixel area and decide undertone
  const analyzeColorFromPhoto = () => {
    if (!photo) return toast({ variant: 'destructive', title: 'Upload a selfie or wrist photo first' });
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
      // sample a rectangle near center or lower-left (wrist)
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
      // simple undertone heuristic:
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
      setScanResults({ r, g, b, brightness, season });
    };
  };

  // quick questionnaire-based skin type detection
  const detectSkinTypeFromQuiz = () => {
    const q = quiz;
    if (q.sensitive) return 'Sensitive';
    if (q.oily && q.acne) return 'Oily / Acne-prone';
    if (q.oily) return 'Oily';
    if (q.dry) return 'Dry';
    return 'Normal / Combination';
  };

  useEffect(() => {
    setSkinType(detectSkinTypeFromQuiz());
  }, [quiz]);

  const analyzeIngredients = () => {
    const tokens = ingredients.toLowerCase().split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    const found = tokens.map(t => {
      const r = SAFETY_RULES.find(rule => t.includes(rule.keyword));
      return { ingredient: t, flag: r ? r.flag : 'No specific flags' };
    });
    setIngFlags(found);
  };

  const exportProfile = () => {
    const data = { name, quiz, undertone, palette, scanResults };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kb_profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">K-Beauty — Color & Skin Advisor (Free)</h1>
            <p className="text-sm text-gray-500">Find colors that suit you, detect skin type, and learn what to avoid — no payment required.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>1) Upload Photo (selfie or inner wrist)</CardTitle></CardHeader>
            <CardContent>
              <Input type="file" accept="image/*" onChange={onImage} className="mt-2" />
              <div className="mt-3">
                {photo ? <img ref={imgRef} src={photo} alt="uploaded" className="max-h-48 rounded" /> : <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">No photo</div>}
              </div>
              <div className="mt-2 flex gap-2">
                <Button onClick={analyzeColorFromPhoto}>Analyze Color</Button>
                <Button onClick={() => { setPhoto(null); setScanResults(null); setUndertone(null); setPalette([]); }} variant="outline">Reset</Button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              {scanResults && (
                <div className="mt-3 text-sm">
                  <div>Detected season: <strong>{scanResults.season}</strong></div>
                  <div>Avg color: rgb({scanResults.r},{scanResults.g},{scanResults.b}) — brightness {Math.round(scanResults.brightness)}</div>
                  <div className="mt-2">Suggested palette:</div>
                  <div className="flex gap-2 mt-1">
                    {palette.map((c, i) => (<div key={i} style={{ background: c }} className="w-10 h-10 rounded shadow-sm border" title={c}></div>))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>2) Quick Skin Quiz</CardTitle></CardHeader>
            <CardContent>
              <div className="mt-2 space-y-3 text-sm">
                <div className="flex items-center space-x-2"><Checkbox id="q-oily" checked={quiz.oily} onCheckedChange={c=>setQuiz(q=>({...q, oily:!!c}))} /><label htmlFor="q-oily">I often have shine/oily T-zone</label></div>
                <div className="flex items-center space-x-2"><Checkbox id="q-dry" checked={quiz.dry} onCheckedChange={c=>setQuiz(q=>({...q, dry:!!c}))} /><label htmlFor="q-dry">My skin feels tight/dry after cleansing</label></div>
                <div className="flex items-center space-x-2"><Checkbox id="q-sensitive" checked={quiz.sensitive} onCheckedChange={c=>setQuiz(q=>({...q, sensitive:!!c}))} /><label htmlFor="q-sensitive">Skin reacts to new products easily</label></div>
                <div className="flex items-center space-x-2"><Checkbox id="q-acne" checked={quiz.acne} onCheckedChange={c=>setQuiz(q=>({...q, acne:!!c}))} /><label htmlFor="q-acne">I get frequent pimples</label></div>
                <div className="flex items-center space-x-2"><Checkbox id="q-sunburns" checked={quiz.sunburns} onCheckedChange={c=>setQuiz(q=>({...q, sunburns:!!c}))} /><label htmlFor="q-sunburns">I burn easily in the sun</label></div>
              </div>
              <div className="mt-4">
                <div>Detected skin profile: <strong>{skinType}</strong></div>
                <div className="mt-2 text-sm text-gray-500">Personalized tips:</div>
                <ul className="text-sm mt-1 list-disc list-inside">
                  {skinType === 'Oily' && <li>Use gentle, water-based cleansers and non-comedogenic moisturizers.</li>}
                  {skinType === 'Oily / Acne-prone' && <><li >Consider products with salicylic acid and niacinamide.</li ><li >Avoid heavy oils and pore-clogging ingredients.</li ></>}
                  {skinType === 'Dry' && <li>Use occlusive moisturizers, hyaluronic acid serums, and avoid harsh soaps.</li>}
                  {skinType === 'Sensitive' && <li>Patch-test new products and avoid fragrance-heavy formulas.</li>}
                  {skinType === 'Normal / Combination' && <li>Maintain a balanced routine: gentle cleanser, light moisturizer, SPF.</li>}
                  {quiz.sunburns && <li>Use broad-spectrum SPF 30+ daily and reapply when outdoors.</li>}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader><CardTitle>3) What to Avoid</CardTitle></CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        <li>Avoid over-exfoliation — limit to 1–2x/week depending on skin sensitivity.</li>
                        <li>Avoid mixing strong acids and retinoids without guidance.</li>
                        <li>Avoid products with high alcohol content if you are dry or sensitive.</li>
                        <li>Avoid heavy fragrances if you are prone to sensitivity or acne.</li>
                        <li>Always wear SPF — sun damage accelerates aging and pigmentation.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>4) Ingredient Scanner</CardTitle></CardHeader>
                <CardContent>
                    <Textarea value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="Paste ingredient list separated by commas" rows={4}></Textarea>
                    <div className="mt-2 flex gap-2">
                    <Button onClick={analyzeIngredients}>Scan</Button>
                    <Button onClick={() => { setIngredients(''); setIngFlags([]); }} variant="outline">Clear</Button>
                    </div>
                    <div className="mt-2 text-sm space-y-1">
                    {ingFlags.map((f, i) => (<div key={i} className="p-2 border rounded"><strong >{f.ingredient}</strong >: {f.flag}</div>))}
                    </div>
                </CardContent>
            </Card>
        </section>

        <Card>
            <CardHeader><CardTitle>Save / Export</CardTitle></CardHeader>
            <CardContent>
                <div className="mt-2 flex gap-2 items-center">
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" className="max-w-xs" />
                    <Button onClick={exportProfile} variant="secondary">Export Profile</Button>
                    <Button onClick={() => { localforage.clear(); toast({title: "Local data cleared"}); }} variant="destructive">Clear Local Data</Button>
                </div>
            </CardContent>
        </Card>

        <footer className="text-center text-sm text-gray-500">
            This app is a free, client-side demo. For clinical or precise color-matching integrate professional colorimeters or consult a certified color analyst/dermatologist.
        </footer>
      </div>
    </div>
  );
}
