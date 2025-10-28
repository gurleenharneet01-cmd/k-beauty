import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">
          Invent Your Own Product
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Unleash your creativity. Design, customize, and bring your unique product ideas to life with the help of AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>1. Name Your Creation</CardTitle>
            <CardDescription>What is your product called?</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">Feature coming soon...</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>2. Design & Customize</CardTitle>
            <CardDescription>Add materials, features, and colors.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">Feature coming soon...</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>3. Get AI Suggestions</CardTitle>
            <CardDescription>Let our AI help you improve it.</CardDescription>
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
                    <Bot /> AI-Powered Guidance
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                    Our new AI chat assistant will guide you through the entire creation process, from brainstorming to prototyping. This feature is currently under development.
                </p>
                <Button disabled>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Designing with AI (Coming Soon)
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
