import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult } from '@/lib/color-analysis';
import { Paintbrush, Shirt } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
  imagePreviewUrl: string | null;
}

function ColorDisplay({ hexCode }: { hexCode: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 rounded-full border shadow-inner"
        style={{ backgroundColor: hexCode }}
      />
      <span className="font-mono text-sm">{hexCode.toUpperCase()}</span>
    </div>
  );
}

export function AnalysisResults({ result, imagePreviewUrl }: AnalysisResultsProps) {
  return (
    <Card className="overflow-hidden shadow-lg animate-in fade-in-50">
      <CardHeader className="p-0">
        {imagePreviewUrl && (
          <div className="aspect-[4/3] relative">
            <Image
              src={imagePreviewUrl}
              alt="Analyzed photo"
              layout="fill"
              objectFit="cover"
              className="opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}
        <div className="p-6 relative -mt-16">
          <CardTitle className="text-2xl">Your Color Analysis</CardTitle>
          <CardDescription>Based on your photo, here are your results.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center">
            <div>
                <p className="text-sm text-muted-foreground">Predicted Skin Tone</p>
                <p className="text-lg font-semibold capitalize">{result.skinTone}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Dominant Color</p>
                <div className="flex justify-center items-center h-full">
                    <ColorDisplay hexCode={result.dominantColor} />
                </div>
            </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Shirt className="h-5 w-5 text-primary-foreground/80" />
            Fashion Recommendations
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.recommendations.fashion.map((color) => (
              <Badge key={color} variant="secondary" className="text-base px-3 py-1">
                {color}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-primary-foreground/80" />
            Makeup Recommendations
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.recommendations.makeup.map((color) => (
              <Badge key={color} variant="secondary" className="text-base px-3 py-1">
                {color}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
