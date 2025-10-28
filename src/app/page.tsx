import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-accent/30 via-background to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  Welcome to BeautyLab Studio
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl font-body">
                  Analyze your skin to discover your perfect colors, then step into the lab to design and formulate your own bespoke cosmetic products from scratch.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/analysis">
                    Analyze Your Skin Tone <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/create">
                    Enter the BeautyLab <Sparkles className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <Card className="overflow-hidden rounded-xl shadow-2xl">
              <CardContent className="p-0">
                {heroImage && (
                  <Image
                    alt="Hero"
                    className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                    src={heroImage.imageUrl}
                    width={600}
                    height={400}
                    data-ai-hint={heroImage.imageHint}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
