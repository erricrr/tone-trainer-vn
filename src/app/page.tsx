"use client";

import { BookOpen, Ear, Zap } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PracticeView } from "@/components/practice-view";
import { QuizView } from "@/components/quiz-view";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 w-full bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Tone Trainer VN</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-2 sm:p-4 md:p-8">
        <Tabs defaultValue="practice" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
            <TabsTrigger value="practice">
              <BookOpen className="mr-2 h-4 w-4" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <Ear className="mr-2 h-4 w-4" />
              Quiz
            </TabsTrigger>
          </TabsList>
          <TabsContent value="practice" className="mt-4">
            <PracticeView />
          </TabsContent>
          <TabsContent value="quiz" className="mt-4">
            <QuizView />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="w-full bg-secondary text-secondary-foreground py-4 mt-8">
        <div className="container mx-auto text-center text-sm">
          <p>Made with ❤️ to help you master Vietnamese tones.</p>
        </div>
      </footer>
    </div>
  );
}
