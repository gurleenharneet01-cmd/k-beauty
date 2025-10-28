import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, FlaskConical, Palette, Beaker } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">
          BeautyLab Studio
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Where innovation meets personalization. Design, formulate, and visualize your own cosmetic products with intelligent guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-center mb-2"><FlaskConical className="h-8 w-8 text-primary"/></div>
            <CardTitle className="text-center">1. Choose Your Category</CardTitle>
            <CardDescription className="text-center">Start by selecting skincare, makeup, fragrance, or haircare and give it a unique name.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">Feature coming soon...</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-center mb-2"><Beaker className="h-8 w-8 text-primary"/></div>
            <CardTitle className="text-center">2. Formulate & Refine</CardTitle>
            <CardDescription className="text-center">Select active ingredients, textures, and fragrances with AI-powered, science-based recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">Feature coming soon...</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-center mb-2"><Palette className="h-8 w-8 text-primary"/></div>
            <CardTitle className="text-center">3. Visualize Your Creation</CardTitle>
            <CardDescription className="text-center">Experience a live virtual preview of your product’s appearance, texture, and branding mockups.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">Feature coming soon...</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-3xl mx-auto p-6 bg-secondary/50">
            <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Bot /> AI Formulation Assistant
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                    Our AI assistant will guide you through formulation, providing cost estimates, sustainability insights, and educational modules on cosmetic science.
                </p>
                <Button disabled>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Formulating with AI (Coming Soon)
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
