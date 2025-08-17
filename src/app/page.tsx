
"use client";

import { BookOpen, Ear, Zap } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { PracticeView } from "@/components/practice-view";
import { QuizView } from "@/components/quiz-view";
import React from "react";

export default function Home() {
  const [activeView, setActiveView] = React.useState("practice");

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 pl-12 md:pl-12">
            <h1 className="text-xl font-semibold tracking-tight">Tone Trainer VN</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView("practice")}
                isActive={activeView === "practice"}
              >
                <BookOpen />
                Practice
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView("quiz")}
                isActive={activeView === "quiz"}
              >
                <Ear />
                Quiz
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b md:hidden">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold tracking-tight">Tone Trainer VN</h1>
            </div>
            <SidebarTrigger />
          </div>
        </header>
        {/* Desktop sidebar toggle - only visible on larger screens */}
        <div className="hidden md:block fixed top-4 left-4 z-20">
          <SidebarTrigger />
        </div>
        <main className="flex-grow container mx-auto p-2 sm:p-4 md:p-8">
            {activeView === 'practice' && <PracticeView />}
            {activeView === 'quiz' && <QuizView />}
        </main>
        <footer className="w-full bg-secondary/50 text-secondary-foreground py-4 mt-auto">
          <div className="container mx-auto text-center text-sm">
            <p>Made with ❤️ to help you master Vietnamese tones.</p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
