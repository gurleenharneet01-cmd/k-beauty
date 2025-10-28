'use client';

import React from 'react';
import type { AnalysisResult } from '@/lib/color-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


export default function AnalysisResults({ analysis }: { analysis: AnalysisResult }) {
    
    const renderPalette = (title: string, colors: string[]) => (
        <div className="space-y-4">
            <h3 className="font-headline text-xl">{title}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {colors.map((color) => (
                    <Badge
                        key={color}
                        variant="outline"
                        className="justify-center py-2 text-base"
                    >
                        {color}
                    </Badge>
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
                <CardContent className="space-y-6 p-4">
                    {renderPalette('Recommended Fashion Colors', analysis.recommendations.fashion)}
                    {renderPalette('Recommended Makeup Colors', analysis.recommendations.makeup)}
                </CardContent>
            </Card>

            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                <ArrowLeft className="mr-2" />
                Start New Analysis
            </Button>
        </div>
    );
}
