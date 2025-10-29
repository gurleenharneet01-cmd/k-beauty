
'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center py-20 md:py-24 bg-card rounded-xl shadow-sm border flex flex-col items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Thank You!</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Your style profile has been saved to your device for your next visit.
          </p>
          <p className="text-sm text-muted-foreground mt-4">You can now close this window or start over.</p>

          <Link href="/" className="mt-8">
            <Button>Start Over</Button>
          </Link>
        </section>

        <footer className="text-center text-sm text-muted-foreground py-4">
          Enjoy your personalized style journey!
        </footer>
      </div>
    </div>
  );
}
