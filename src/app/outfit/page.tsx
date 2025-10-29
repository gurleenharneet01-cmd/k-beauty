
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Palette, Gem, Paintbrush, Droplet, Heart, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// --- Data for Recommendations ---

const COLOR_CATEGORIES = {
    'red': { foundation: 'Neutral or slightly warm', blush: 'Soft Rose or Peach', lipstick: 'Classic Red or Nude Pink', earrings: 'Silver or Gold' },
    'pink': { foundation: 'Cool or neutral', blush: 'Cool Pink or Soft Berry', lipstick: 'Fuchsia or Baby Pink', earrings: 'Silver or Rose Gold' },
    'blue': { foundation: 'Cool or neutral', blush: 'Soft Pink or Plum', lipstick: 'Nude or Berry', earrings: 'Silver' },
    'green': { foundation: 'Warm or neutral', blush: 'Peach or Terracotta', lipstick: 'Coral or Warm Nude', earrings: 'Gold' },
    'yellow': { foundation: 'Warm or golden', blush: 'Warm Peach or Coral', lipstick: 'Peachy Nude or Bright Coral', earrings: 'Gold' },
    'orange': { foundation: 'Warm', blush: 'Terracotta or Bronze', lipstick: 'Orange-Red or Spiced Nude', earrings: 'Gold' },
    'purple': { foundation: 'Cool or neutral', blush: 'Plum or Cool Pink', lipstick: 'Deep Berry or Lavender Pink', earrings: 'Silver' },
    'black': { foundation: 'Match your skin', blush: 'Any - can be bold', lipstick: 'Bold Red, Deep Berry, or Nude', earrings: 'Any metal - statement or classic' },
    'white': { foundation: 'Match your skin', blush: 'Soft Pink or Peach', lipstick: 'Nude Pink or Coral', earrings: 'Any metal - pearls look great' },
    'gray': { foundation: 'Cool or neutral', blush: 'Cool Pink or Soft Mauve', lipstick: 'Berry or Muted Rose', earrings: 'Silver or Gunmetal' },
    'brown': { foundation: 'Warm', blush: 'Warm Bronze or Terracotta', lipstick: 'Earthy Nude or Brick Red', earrings: 'Gold or Bronze' },
};

function getDominantColorName(r: number, g: number, b: number): keyof typeof COLOR_CATEGORIES {
    if (r > g && r > b) {
        if (r > 150 && g < 100 && b < 100) return 'red';
    }
    if (r > 200 && g > 150 && b > 150) return 'pink';
    if (b > r && b > g) return 'blue';
    if (g > r && g > b) return 'green';
    if (r > 150 && g > 150 && b < 100) return 'yellow';
    if (r > 200 && g > 100 && g < 200 && b < 100) return 'orange';
    if (r > 100 && b > 100 && g < 100) return 'purple';

    const brightness = (r + g + b) / 3;
    if (brightness < 50) return 'black';
    if (brightness > 220) return 'white';
    if (Math.abs(r-g) < 20 && Math.abs(g-b) < 20) {
        if (brightness < 180) return 'gray';
        return 'brown'; // Beige tones
    }
    
    // Fallback logic
    const max = Math.max(r, g, b);
    if (max === r) return 'red';
    if (max === g) return 'green';
    return 'blue';
}


export default function OutfitPlannerPage() {
    const [dressColor, setDressColor] = useState('#ffffff');
    const [recommendations, setRecommendations] = useState(COLOR_CATEGORIES.white);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setDressColor(hex);

        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const colorName = getDominantColorName(r, g, b);
        setRecommendations(COLOR_CATEGORIES[colorName] || COLOR_CATEGORIES.white);
    };

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
                        <Link href="/skin" className="hover:text-primary transition-colors">Skin Analysis</Link>
                        <Link href="/outfit" className="text-primary font-semibold">Outfit Planner</Link>
                        <Link href="/thank-you" className="hover:text-primary transition-colors">Finish</Link>
                    </nav>
                </header>

                <section className="text-center py-10 md:py-16 bg-card rounded-xl shadow-sm border">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Outfit Color Planner</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Select your outfit's main color to get makeup and accessory recommendations.</p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Choose Your Color</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <Label htmlFor="dress-color-picker" className="text-center">Pick your dress color:</Label>
                            <Input 
                                id="dress-color-picker"
                                type="color" 
                                value={dressColor} 
                                onChange={handleColorChange} 
                                className="w-24 h-24 p-1"
                            />
                            <div className="text-sm font-mono text-muted-foreground">{dressColor}</div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2 space-y-6">
                         {recommendations && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Paintbrush /> Your Style Recommendations</CardTitle>
                                    <CardDescription>Based on your selected outfit color, here are some suggestions to complete your look.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-accent p-2 rounded-full"><Droplet className="text-accent-foreground" /></div>
                                        <div>
                                            <h4 className="font-semibold">Foundation</h4>
                                            <p className="text-sm text-muted-foreground">{recommendations.foundation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-accent p-2 rounded-full"><Heart className="text-accent-foreground" /></div>
                                        <div>
                                            <h4 className="font-semibold">Blush</h4>
                                            <p className="text-sm text-muted-foreground">{recommendations.blush}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                         <div className="bg-accent p-2 rounded-full"><Paintbrush className="text-accent-foreground" /></div>
                                        <div>
                                            <h4 className="font-semibold">Lipstick</h4>
                                            <p className="text-sm text-muted-foreground">{recommendations.lipstick}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-accent p-2 rounded-full"><Gem className="text-accent-foreground" /></div>
                                        <div>
                                            <h4 className="font-semibold">Earrings</h4>
                                            <p className="text-sm text-muted-foreground">{recommendations.earrings}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <Link href="/thank-you">
                    <Button size="lg" variant="default">
                        Finish & Save Profile <ArrowRight className="ml-2"/>
                    </Button>
                    </Link>
                </div>

                <footer className="text-center text-sm text-muted-foreground py-4">
                    This tool provides general style suggestions. Always choose what makes you feel best!
                </footer>
            </div>
        </div>
    );
}
