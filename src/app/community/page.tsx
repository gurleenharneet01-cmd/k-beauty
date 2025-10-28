import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

export default function CommunityPage() {
  const communityImages = PlaceHolderImages.filter(p => p.id.startsWith('community-'));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Community Inspiration
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Coming Soon! Get inspired by looks from our amazing community.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {communityImages.map((image, index) => (
          <Card key={image.id} className="overflow-hidden group">
            <CardContent className="p-0">
              <div className="aspect-w-3 aspect-h-4">
                 <Image
                  src={image.imageUrl}
                  alt={image.description}
                  width={400}
                  height={600}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={image.imageHint}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
