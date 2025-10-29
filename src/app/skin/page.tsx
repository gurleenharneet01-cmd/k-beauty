'use client';

import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

localforage.config({ name: 'kbeauty_color_advisor' });

interface QuizState {
  oily: boolean;
  dry: boolean;
  sensitive: boolean;
  acne: boolean;
  sunburns: boolean;
}

const SAFETY_RULES = [
  { keyword: 'paraben', flag: 'Potential irritant/preservative' },
  { keyword: 'fragrance', flag: 'Common sensitizer' },
  { keyword: 'alcohol', flag: 'Can be drying (depends on type)' },
  { keyword: 'niacinamide', flag: 'Generally beneficial' },
  { keyword: 'hyaluron', flag: 'Hydrating' },
];

export default function SkinAnalysisPage() {
  const [quiz, setQuiz] = useState<QuizState>({ oily: false, dry: false, sensitive: false, acne: false, sunburns: false });
  const [skinType, setSkinType] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [ingFlags, setIngFlags] = useState<{ ingredient: string; flag: string }[]>([]);

  useEffect(() => {
    (async () => {
      const p: any = await localforage.getItem('profile');
      if (p && p.quiz) {
        setQuiz(p.quiz);
      }
    })();
  }, []);

  const handleQuizChange = async (key: keyof QuizState, checked: boolean) => {
    const newQuiz = { ...quiz, [key]: checked };
    setQuiz(newQuiz);
    const profile = (await localforage.getItem('profile')) || {};
    await localforage.setItem('profile', { ...profile, quiz: newQuiz });
  };
  
  const detectSkinTypeFromQuiz = () => {
    if (!quiz) return 'Not determined';
    if (quiz.sensitive) return 'Sensitive';
    if (quiz.oily && quiz.acne) return 'Oily / Acne-prone';
    if (quiz.oily) return 'Oily';
    if (quiz.dry) return 'Dry';
    return 'Normal / Combination';
  };

  useEffect(() => {
    setSkinType(detectSkinTypeFromQuiz());
  }, [quiz]);

  const analyzeIngredients = () => {
    const tokens = ingredients.toLowerCase().split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    const found = tokens.map(t => {
        const r = SAFETY_RULES.find(rule => t.includes(rule.keyword));
        return { ingredient: t, flag: r ? r.flag : 'Standard ingredient' };
    });
    setIngFlags(found);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">K-Beauty — Color & Skin Advisor</h1>
            <p className="text-sm text-gray-500">Analyze your skin type and learn what to avoid.</p>
          </div>
           <nav className="flex gap-4">
            <Link href="/" className="hover:text-primary">Color Analysis</Link>
            <Link href="/skin" className="text-primary font-semibold">Skin Analysis</Link>
          </nav>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Card>
            <CardHeader><CardTitle>1) Quick Skin Quiz</CardTitle></CardHeader>
            <CardContent>
              <div className="mt-2 space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox id="q-oily" checked={quiz.oily} onCheckedChange={c => handleQuizChange('oily', !!c)} />
                  <Label htmlFor="q-oily">I often have shine/oily T-zone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="q-dry" checked={quiz.dry} onCheckedChange={c => handleQuizChange('dry', !!c)} />
                  <Label htmlFor="q-dry">My skin feels tight/dry after cleansing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="q-sensitive" checked={quiz.sensitive} onCheckedChange={c => handleQuizChange('sensitive', !!c)} />
                  <Label htmlFor="q-sensitive">Skin reacts to new products easily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="q-acne" checked={quiz.acne} onCheckedChange={c => handleQuizChange('acne', !!c)} />
                  <Label htmlFor="q-acne">I get frequent pimples</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="q-sunburns" checked={quiz.sunburns} onCheckedChange={c => handleQuizChange('sunburns', !!c)} />
                  <Label htmlFor="q-sunburns">I burn easily in the sun</Label>
                </div>
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
          <Card>
            <CardHeader><CardTitle>2) What to Avoid</CardTitle></CardHeader>
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
        </section>

        <Card>
            <CardHeader><CardTitle>Ingredient Scanner</CardTitle></CardHeader>
            <CardContent>
                <Textarea value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="Paste ingredient list separated by commas" rows={4}></Textarea>
                <div className="mt-2 flex gap-2">
                <Button onClick={analyzeIngredients}>Scan</Button>
                <Button onClick={() => { setIngredients(''); setIngFlags([]); }} variant="outline">Clear</Button>
                </div>
                <div className="mt-2 text-sm space-y-1 max-h-48 overflow-y-auto">
                {ingFlags.map((f, i) => (<div key={i} className="p-2 border rounded"><strong >{f.ingredient}</strong >: {f.flag}</div>))}
                </div>
            </CardContent>
        </Card>

        <footer className="text-center text-sm text-gray-500">
            This app is a free, client-side demo. For clinical advice, please consult a certified dermatologist.
        </footer>
      </div>
    </div>
  );
}