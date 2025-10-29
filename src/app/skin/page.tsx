'use client';

import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Palette } from 'lucide-react';

localforage.config({ name: 'kbeauty_color_advisor' });

interface QuizState {
  oily: boolean;
  dry: boolean;
  sensitive: boolean;
  acne: boolean;
  sunburns: boolean;
}

export default function SkinAnalysisPage() {
  const [quiz, setQuiz] = useState<QuizState>({ oily: false, dry: false, sensitive: false, acne: false, sunburns: false });
  const [skinType, setSkinType] = useState<string | null>(null);

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


  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Palette className="text-primary"/>
            <h1 className="text-2xl font-bold font-headline">GlamLens AI</h1>
          </div>
           <nav className="flex gap-4 items-center">
            <Link href="/" className="hover:text-primary transition-colors">Color Analysis</Link>
            <Link href="/skin" className="text-primary font-semibold">Skin Analysis</Link>
          </nav>
        </header>

        <section className="text-center py-10 md:py-16 bg-card rounded-xl shadow-sm border">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Understand Your Skin</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Take our quick quiz to identify your skin profile and get personalized advice.</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card>
            <CardHeader><CardTitle>Quick Skin Quiz</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
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
              <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                <p>Detected skin profile: <strong className="text-primary">{skinType}</strong></p>
                <div className="mt-4 text-sm text-muted-foreground">Personalized tips:</div>
                <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                  {skinType === 'Oily' && <li>Use gentle, water-based cleansers and non-comedogenic moisturizers.</li>}
                  {skinType === 'Oily / Acne-prone' && <><li>Consider products with salicylic acid and niacinamide.</li><li>Avoid heavy oils and pore-clogging ingredients.</li></>}
                  {skinType === 'Dry' && <li>Use occlusive moisturizers, hyaluronic acid serums, and avoid harsh soaps.</li>}
                  {skinType === 'Sensitive' && <li>Patch-test new products and avoid fragrance-heavy formulas.</li>}
                  {skinType === 'Normal / Combination' && <li>Maintain a balanced routine: gentle cleanser, light moisturizer, SPF.</li>}
                  {quiz.sunburns && <li>Use broad-spectrum SPF 30+ daily and reapply when outdoors.</li>}
                  {!skinType || (skinType === 'Normal / Combination' && !quiz.sunburns) && <li>Answer the quiz to see personalized tips.</li>}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>General Skincare Advice</CardTitle></CardHeader>
            <CardContent>
                <ul className="list-disc list-inside text-sm space-y-2">
                    <li><span className="font-semibold">Over-exfoliation:</span> Limit to 1–2x/week depending on skin sensitivity.</li>
                    <li><span className="font-semibold">Mixing Actives:</span> Avoid mixing strong acids and retinoids without guidance.</li>
                    <li><span className="font-semibold">Alcohol Content:</span> Avoid products with high alcohol content if you are dry or sensitive.</li>
                    <li><span className="font-semibold">Fragrance:</span> Be cautious with heavy fragrances if you are prone to sensitivity or acne.</li>
                    <li><span className="font-semibold">Sun Protection:</span> Always wear SPF. Sun damage accelerates aging and pigmentation.</li>
                </ul>
            </CardContent>
          </Card>
        </div>


        <footer className="text-center text-sm text-muted-foreground py-4">
            This app is a free, client-side demo. For clinical advice, please consult a certified dermatologist.
        </footer>
      </div>
    </div>
  );
}
