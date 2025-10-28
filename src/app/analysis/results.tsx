'use client';

import React from 'react';
import type { AnalysisResult } from '@/lib/color-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, Wand2 } from 'lucide-react';
// import { provideReasoningForColorRecommendations } from '@/ai/flows/provide-reasoning-color-recommendations';
// import { suggestAlternativeColorPalette } from '@/ai/flows/suggest-alternative-color-palette';


function ColorSwatch({ color, name }: { color: string; name: string }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className="h-8 w-8 rounded-full border"
                style={{ backgroundColor: color }}
            ></div>
            <span>{name}</span>
        </div>
    );
}


export default function AnalysisResults({ analysis }: { analysis: AnalysisResult }) {
    const [fashionReasoning, setFashionReasoning] = React.useState('');
    const [makeupReasoning, setMakeupReasoning] = React.useState('');
    const [isReasoningLoading, setIsReasoningLoading] = React.useState(false);
    const [alternativePalette, setAlternativePalette] = React.useState<AnalysisResult['recommendations'] | null>(null);
    const [isAltLoading, setIsAltLoading] = React.useState(false);

    const handleGetReasoning = async () => {
        // setIsReasoningLoading(true);
        // try {
        //     const result = await provideReasoningForColorRecommendations({
        //         skinTone: analysis.skinTone,
        //         fashionColors: analysis.recommendations.fashion,
        //         makeupColors: analysis.recommendations.makeup,
        //     });
        //     setFashionReasoning(result.fashionReasoning);
        //     setMakeupReasoning(result.makeupReasoning);
        // } catch (e) {
        //     console.error(e);
        // } finally {
        //     setIsReasoningLoading(false);
        // }
    };

    const handleSuggestAlternatives = async () => {
        // setIsAltLoading(true);
        // try {
        //     const result = await suggestAlternativeColorPalette({ skinTone: analysis.skinTone });
        //     setAlternativePalette(result.recommendations);
        // } catch (e) {
        //     console.error(e);
        // }
        // finally {
        //     setIsAltLoading(false);
        // }
    };


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
                    {/* <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                        {fashionReasoning ? (
                            <p>{fashionReasoning}</p>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleGetReasoning}
                                disabled={isReasoningLoading}
                            >
                                <Wand2 className="mr-2" />
                                {isReasoningLoading ? "Thinking..." : "Why these colors?"}
                            </Button>
                        )}
                    </div> */}

                    {renderPalette('Recommended Makeup Colors', analysis.recommendations.makeup)}
                    {/* <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                        {makeupReasoning ? (
                            <p>{makeupReasoning}</p>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleGetReasoning}
                                disabled={isReasoningLoading || fashionReasoning} // Disable if already fetched
                            >
                                <Wand2 className="mr-2" />
                                {isReasoningLoading ? "Thinking..." : "Why these shades?"}
                            </Button>
                        )}
                    </div> */}

                    {/* {alternativePalette ? (
                        <div className="space-y-4 rounded-lg border border-dashed p-4">
                            <h3 className="text-center font-headline text-xl">Alternative Palettes</h3>
                            {renderPalette('Fashion Alternatives', alternativePalette.fashion)}
                            {renderPalette('Makeup Alternatives', alternativePalette.makeup)}
                        </div>
                    ) : (
                        <div className="text-center">
                            <Button
                                variant="outline"
                                onClick={handleSuggestAlternatives}
                                disabled={isAltLoading}
                            >
                                <Palette className="mr-2" />
                                {isAltLoading ? "Exploring..." : "Suggest Alternatives"}
                            </Button>
                        </div>
                    )} */}
                </CardContent>
            </Card>

            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                <ArrowLeft className="mr-2" />
                Start New Analysis
            </Button>
        </div>
    );
}
