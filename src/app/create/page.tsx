import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, FlaskConical, Package, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CreatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">
          Welcome to BeautyLab Studio
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Where innovation meets personalization. Design, formulate, and visualize your own bespoke cosmetic products with intelligent guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-center mb-2"><FlaskConical className="h-8 w-8 text-primary"/></div>
            <CardTitle className="text-center">1. Choose Your Canvas</CardTitle>
            <CardDescription className="text-center">Start by selecting a product category—skincare, makeup, or fragrance—and give your creation a unique name.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
              <div className="space-y-2">
                <Badge variant="secondary">Skincare</Badge>
                <Badge variant="secondary">Makeup</Badge>
                <Badge variant="secondary">Fragrance</Badge>
                <Badge variant="secondary">Haircare</Badge>
              </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-center mb-2"><TestTube className="h-8 w-8 text-primary"/></div>
            <CardTitle className="text-center">2. Formulate & Refine</CardTitle>
            <CardDescription className="text-center">Select active ingredients, textures, and scents with AI-powered, science-based recommendations tailored to you.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
             <div className="space-y-2">
                <p className="text-sm text-muted-foreground">e.g. Add Hyaluronic Acid</p>
                <p className="text-sm text-muted-foreground">e.g. Select 'Gel' Texture</p>
                <p className="text-sm text-muted-foreground">e.g. Infuse with Rose Oil</p>
              </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-center mb-2"><Package className="h-8 w-8 text-primary"/></div>
            <CardTitle className="text-center">3. Visualize Your Brand</CardTitle>
            <CardDescription className="text-center">See a live virtual preview of your product’s appearance, packaging, and branding mockups.</CardDescription>
          </CardHeader>
           <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
             <p className="text-sm text-muted-foreground">Generate bottle shapes, labels, and logos to complete your vision.</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Card className="max-w-3xl mx-auto p-6 bg-secondary/50">
            <CardHeader className="p-0 mb-4">
                <div className="text-2xl font-semibold leading-none tracking-tight flex items-center justify-center gap-2">
                    <Bot /> AI Formulation Assistant
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                    Our AI assistant guides you through formulation, providing cost estimates, sustainability insights, and educational modules on cosmetic science.
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
