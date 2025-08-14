
"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { EmblaCarouselType } from 'embla-carousel-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { vietnameseWords, toneMarkers } from "@/data/words";
import type { WordVariant, WordGroup } from "@/types";
import { SpeakButton } from "./speak-button";
import { VoiceRecorder } from "./voice-recorder";

// Sort the words alphabetically by base_spelling for display
const sortedVietnameseWords = [...vietnameseWords].sort((a, b) => 
  a.base_spelling.localeCompare(b.base_spelling)
);

export function PracticeView() {
  const [api, setApi] = React.useState<EmblaCarouselType>()
  const [selectedGroup, setSelectedGroup] = useState<WordGroup>(sortedVietnameseWords[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const alphabet = useMemo(() => {
    const letters = new Set(sortedVietnameseWords.map(group => group.base_spelling[0].toUpperCase()));
    return Array.from(letters).sort();
  }, []);

  const handleAlphabetClick = (letter: string) => {
    const index = sortedVietnameseWords.findIndex(group => group.base_spelling[0].toUpperCase() === letter);
    if (index !== -1 && api) {
      api.scrollTo(index);
    }
  };

  useEffect(() => {
    if (!api) {
      return
    }
 
    const onSelect = (api: EmblaCarouselType) => {
       setSelectedIndex(api.selectedScrollSnap())
       setSelectedGroup(sortedVietnameseWords[api.selectedScrollSnap()])
    }

    onSelect(api)
    api.on('select', onSelect)
 
    return () => {
      api.off('select', onSelect)
    }
  }, [api])


  return (
    <div className="flex flex-col gap-4 md:gap-8 h-full">
      {/* Top Section: Carousel and Alphabet Shortcuts */}
      <Card>
        <CardHeader>
            <CardTitle>Word Groups</CardTitle>
            <CardDescription>Select a word group to practice from the carousel below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center">
            <div className="flex flex-wrap gap-2 justify-center">
                {alphabet.map(letter => (
                    <Button key={letter} variant="outline" size="sm" onClick={() => handleAlphabetClick(letter)}>
                    {letter}
                    </Button>
                ))}
            </div>
          <Carousel setApi={setApi} className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <CarouselContent>
              {sortedVietnameseWords.map((group, index) => (
                <CarouselItem key={index}>
                    <div className="p-1">
                        <Card 
                            className={cn(
                                "cursor-pointer transition-all", 
                                index === selectedIndex ? "border-primary shadow-lg" : "hover:shadow-md"
                            )}
                            onClick={() => api?.scrollTo(index)}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                                <span className="text-xl font-semibold text-primary">{group.base_spelling}</span>
                                <p className="text-sm text-center text-muted-foreground">
                                    {group.variants.map(v => v.word).join(' / ')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </CardContent>
      </Card>

      {/* Bottom Section: Selected Word Group Content */}
      <Card className="flex-grow flex flex-col">
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
            <ScrollArea className="h-[30vh] pr-4">
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
  );
}
