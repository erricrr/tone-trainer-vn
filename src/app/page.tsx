
"use client";

import { BookOpen, Ear, HelpCircle } from "lucide-react";
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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
            <h1 className="text-xl font-semibold tracking-tight">VN Tone Trainer</h1>
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

          {/* About section at the bottom of the sidebar */}
          <div className="mt-auto">
  <SidebarMenu>
    <SidebarMenuItem>
      <Sheet>
        <SheetTrigger asChild>
          <SidebarMenuButton>
            <HelpCircle />
            About
          </SidebarMenuButton>
        </SheetTrigger>

                 <SheetContent side="bottom" className="h-auto max-h-[80vh] [&>button]:hidden">
          <SheetHeader className="text-left">
            <SheetTitle>About VN Tone Trainer</SheetTitle>
            <SheetDescription>
              This content was AI generated and the quizzes are AI generated and scored by Gemini-2.0-Flash.
              I created this as part of my Vietnamese learning journey to help master the challenging tonal aspects of the language.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 text-sm leading-relaxed">
            <div>
              <h4 className="font-medium mb-2">Note on Audio</h4>
              <p className="text-muted-foreground">
                The text-to-speech could use better voice over, but it’s okay for now and serves the purpose of pronunciation practice.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Contact</h4>
              <p className="text-muted-foreground">
                Email:{" "}
                <a
                  href="mailto:voicevoz321@gmail.com"
                  className="underline hover:text-primary transition-colors"
                >
                  voicevoz321@gmail.com
                </a>
              </p>
            </div>
          </div>

                     {/* Close button at the bottom */}
           <div className="mt-8 flex justify-center">
             <SheetClose asChild>
               <Button className="w-full max-w-xs">
                 Close
               </Button>
             </SheetClose>
           </div>
        </SheetContent>
      </Sheet>
    </SidebarMenuItem>
  </SidebarMenu>
</div>

        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b md:hidden">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">VN Tone Trainer</h1>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
