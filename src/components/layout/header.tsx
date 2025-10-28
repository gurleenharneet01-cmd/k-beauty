
'use client';

import Link from 'next/link';
import { Palette } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Palette className="h-6 w-6 text-primary-foreground" style={{ backgroundColor: 'hsl(var(--primary))', padding: '2px', borderRadius: '4px' }} />
          <span className="font-bold font-headline">GlamLens AI</span>
        </Link>
      </div>
    </header>
  );
}
