
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { vietnameseWords, toneMarkers } from "@/data/words";
import type { WordVariant, WordGroup } from "@/types";
import { SpeakButton } from "./speak-button";
import { VoiceRecorder } from "./voice-recorder";
import { Separator } from "./ui/separator";

export function PracticeView() {
  const [selectedGroup, setSelectedGroup] = useState<WordGroup>(vietnameseWords[0]);

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-10rem)]">
      {/* Left Column: Word Group List */}
      <div className="w-full md:w-1/3 lg:w-1/4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Word Groups</CardTitle>
          </CardHeader>
          <CardContent className="p-2 flex-grow">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-1">
                {vietnameseWords.map((group, index) => (
                  <React.Fragment key={group.base_spelling}>
                    <button
                      onClick={() => setSelectedGroup(group)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors",
                        selectedGroup.base_spelling === group.base_spelling
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <p className="font-semibold text-base">{group.base_spelling}</p>
                      <p className={cn("text-sm mt-1 leading-relaxed", selectedGroup.base_spelling === group.base_spelling ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        {group.variants.map(v => v.word).join(' / ')}
                      </p>
                    </button>
                    {index < vietnameseWords.length - 1 && <Separator className="my-1" />}
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Selected Word Group Content */}
      <div className="w-full md:w-2/3 lg:w-3/4">
        <Card className="h-full flex flex-col">
           <CardHeader>
            <CardTitle className="text-3xl font-bold">{selectedGroup.base_spelling}</CardTitle>
            {selectedGroup.note && (
                <CardDescription className="text-lg text-muted-foreground">({selectedGroup.note})</CardDescription>
            )}
            <CardDescription className="text-lg text-muted-foreground pt-2">
                Listen to the pronunciation, then record your own voice to compare.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <ScrollArea className="h-full pr-4">
              <ul className="space-y-3">
                {selectedGroup.variants.map((variant: WordVariant) => (
                  <li
                    key={variant.word}
                    className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <SpeakButton text={variant.word} />
                      <VoiceRecorder />
                      <div className="flex-grow">
                        <p className="font-semibold text-lg text-primary">{variant.word}</p>
                        <p className="text-muted-foreground">{variant.meaning}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-right hidden sm:block">
                      {toneMarkers[variant.tone as keyof typeof toneMarkers]}
                    </p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
