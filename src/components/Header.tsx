'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Palette } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const navLinks = [
    { href: '/', label: 'Color Analysis' },
    { href: '/skin', label: 'Skin Analysis' },
    { href: '/outfit', label: 'Outfit Planner' },
    { href: '/thank-you', label: 'Finish' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Palette className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              GlamLens AI
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>
                     <Link href="/" className="flex items-center space-x-2">
                        <Palette className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline">GlamLens AI</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <nav className="grid gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex w-full items-center py-2 text-lg font-semibold',
                        pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center md:hidden">
             <Link href="/" className="flex items-center space-x-2">
                <Palette className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline">GlamLens AI</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
