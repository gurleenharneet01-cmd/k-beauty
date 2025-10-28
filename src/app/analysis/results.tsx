'use client';

import React from 'react';
import type { AnalysisResult } from '@/lib/color-analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Palette, X } from 'lucide-react';

export default function AnalysisResults({ analysis }: { analysis: AnalysisResult }) {
    
    const renderPalette = (title: string, colors: {name: string, hex: string}[], icon: React.ReactNode) => (
        <div className="space-y-4">
            <h3 className="font-headline text-xl flex items-center">{icon}<span className="ml-2">{title}</span></h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {colors.map((color) => (
                    <div key={color.name} className="flex items-center space-x-2 rounded-md border p-2">
                         <div
                            className="h-6 w-6 rounded-md border"
                            style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm">{color.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 p-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="h-16 w-16 rounded-lg border-4 border-white shadow-lg"
                            style={{ backgroundColor: analysis.dominantColor }}
                        />
                        <div>
                            <CardTitle className="text-2xl">Your Analysis is Ready!</CardTitle>
                            <p className="font-headline text-4xl capitalize text-primary">
                                {analysis.skinTone}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 p-4">
                    {renderPalette('Recommended Fashion', analysis.recommendations.fashion, <Palette className="text-green-500" />)}
                    {renderPalette('Recommended Makeup', analysis.recommendations.makeup, <Check className="text-green-500" />)}
                    {renderPalette('Colors to Avoid', analysis.recommendations.avoid, <X className="text-red-500" />)}
                </CardContent>
            </Card>

            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                <ArrowLeft className="mr-2" />
                Start New Analysis
            </Button>
        </div>
    );
}
