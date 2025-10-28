import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult } from '@/lib/color-analysis';
import { Paintbrush, Shirt, Palette } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
  imagePreviewUrl: string | null;
}

function ColorDisplay({ hexCode }: { hexCode: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-16 w-16 rounded-full border-4 border-white shadow-lg"
        style={{ backgroundColor: hexCode }}
      />
      <span className="font-mono text-sm tracking-widest">{hexCode.toUpperCase()}</span>
    </div>
  );
}

export function AnalysisResults({ result, imagePreviewUrl }: AnalysisResultsProps) {
  return (
    <Card className="overflow-hidden shadow-lg animate-in fade-in-50 bg-gradient-to-br from-card to-secondary/20">
      <CardHeader className="p-0">
        {imagePreviewUrl && (
          <div className="aspect-[4/3] relative">
            <Image
              src={imagePreviewUrl}
              alt="Analyzed photo"
              layout="fill"
              objectFit="cover"
              className="opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
          </div>
        )}
        <div className="p-6 relative -mt-24 text-center">
            <div className="flex justify-center mb-4">
                <div className="relative">
                    <Image
                        src={imagePreviewUrl!}
                        alt="User Photo"
                        width={128}
                        height={128}
                        className="rounded-full object-cover border-4 border-white shadow-xl aspect-square"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 text-primary-foreground shadow-md">
                        <Palette className="h-6 w-6"/>
                    </div>
                </div>
            </div>
          <CardTitle className="text-3xl font-headline">Your Color Analysis</CardTitle>
          <CardDescription>Based on your photo, here are your personalized results.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Predicted Skin Tone</p>
                <p className="text-xl font-bold capitalize text-primary-foreground bg-primary/80 rounded-full px-4 py-1 inline-block mt-2">{result.skinTone}</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Dominant Skin Color</p>
                <ColorDisplay hexCode={result.dominantColor} />
            </div>
        </div>

        <div className="p-4 bg-background/50 rounded-lg">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2 text-foreground/90">
            <Shirt className="h-5 w-5 text-accent" />
            Fashion Recommendations
          </h3>
          <div className="flex flex-wrap gap-3">
            {result.recommendations.fashion.map((color) => (
              <Badge key={color} variant="outline" className="text-base px-4 py-1 border-accent text-accent-foreground bg-accent/10 hover:bg-accent/20">
                {color}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-4 bg-background/50 rounded-lg">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2 text-foreground/90">
            <Paintbrush className="h-5 w-5 text-accent" />
            Makeup Recommendations
          </h3>
          <div className="flex flex-wrap gap-3">
            {result.recommendations.makeup.map((color) => (
               <Badge key={color} variant="outline" className="text-base px-4 py-1 border-accent text-accent-foreground bg-accent/10 hover:bg-accent/20">
               {color}
             </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
