
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { UseEmblaCarouselType as CarouselApi } from 'embla-carousel-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { vietnameseWords, toneMarkers } from "@/data/words";
import type { WordVariant, WordGroup } from "@/types";
import { SpeakButton } from "./speak-button";
import { VoiceRecorder } from "./voice-recorder";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, HelpCircle } from "lucide-react";

// Sort the words alphabetically by base_spelling for display
const sortedVietnameseWords = [...vietnameseWords].sort((a, b) => 
  a.base_spelling.localeCompare(b.base_spelling)
);

const toneInfo = Object.entries(toneMarkers).map(([key, value]) => {
  const match = value.match(/(.+)\((.+)\) - (.+)/);
  if (match) {
    const symbol = match[1].trim();
    const englishName = key.replace('-', ' ');
    const vietnameseName = match[3].trim();
    return { englishName, vietnameseName, symbol };
  }
   // Handle "no mark" case
   const noMarkMatch = value.match(/no mark \((.+)\)/);
   if (noMarkMatch) {
     return { englishName: 'level', vietnameseName: noMarkMatch[1], symbol: 'no mark' };
   }
  return null;
}).filter(Boolean);

export function PracticeView() {
  const [emblaApi, setEmblaApi] = useState<CarouselApi | undefined>();
  const [selectedGroup, setSelectedGroup] = useState<WordGroup>(sortedVietnameseWords[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const alphabet = useMemo(() => {
    const letters = new Set(sortedVietnameseWords.map(group => group.base_spelling[0].toUpperCase()));
    return Array.from(letters).sort();
  }, []);

  const handleAlphabetClick = (letter: string) => {
    const index = sortedVietnameseWords.findIndex(group => group.base_spelling[0].toUpperCase() === letter);
    if (index !== -1 && emblaApi) {
      emblaApi.scrollTo(index);
    }
  };
  
  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    setSelectedGroup(sortedVietnameseWords[newIndex]);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);


  return (
    <div className="flex flex-col gap-4 md:gap-8 h-full">
      {/* Top Section: Carousel and Alphabet Shortcuts */}
      <Card>
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                    <CardHeader className="p-0 text-left">
                        <div className="flex items-center gap-2">
                            <CardTitle>Word Groups</CardTitle>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Tone Guide</h4>
                                            <p className="text-sm text-muted-foreground">
                                                A guide to the six tones in Vietnamese.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            {Object.entries(toneMarkers).map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-[auto,1fr] items-center gap-x-2">
                                                    <p className="font-mono text-sm font-bold text-primary">{value.split(' - ')[0].match(/`|´| |̉|~|\./)}</p>
                                                    <div className="text-sm">
                                                        <p className="font-semibold capitalize">{key.replace('-', ' ')} <span className="text-muted-foreground">({value.split(' - ')[1] || value.match(/\(([^)]+)\)/)?.[1]})</span></p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <CardDescription>Select a word group to practice listening and pronunciation.</CardDescription>
                    </CardHeader>
                </AccordionTrigger>
                <AccordionContent>
                    <CardContent className="flex flex-col gap-4 items-center -mt-4 py-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {alphabet.map(letter => (
                                <Button key={letter} variant="outline" size="sm" onClick={() => handleAlphabetClick(letter)} className="text-foreground">
                                {letter}
                                </Button>
                            ))}
                        </div>
                        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                            <Carousel 
                                setApi={setEmblaApi} 
                                className="w-full"
                                opts={{
                                    align: "center",
                                    loop: true,
                                }}
                            >
                                <CarouselContent className="-ml-4">
                                {sortedVietnameseWords.map((group, index) => (
                                    <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/3">
                                        <div className="p-1 h-full">
                                            <Card 
                                                className={cn(
                                                    "cursor-pointer transition-all h-full flex flex-col justify-center rounded-lg", 
                                                    index === selectedIndex ? "border-primary shadow-lg" : "border-transparent hover:shadow-md"
                                                )}
                                                onClick={() => emblaApi?.scrollTo(index)}
                                            >
                                                <CardContent className="flex flex-col items-center justify-center p-3 gap-2">
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
                                <CarouselPrevious className="absolute -left-10 top-1/2 -translate-y-1/2" />
                                <CarouselNext className="absolute -right-10 top-1/2 -translate-y-1/2" />
                            </Carousel>
                        </div>
                    </CardContent>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </Card>

      {/* Bottom Section: Selected Word Group Content */}
      <Card className="flex-grow flex flex-col">
        <CardHeader>
        <CardTitle className="text-3xl font-bold">{selectedGroup.base_spelling}</CardTitle>
        {selectedGroup.note && (
            <CardDescription className="text-muted-foreground">({selectedGroup.note})</CardDescription>
        )}
        <CardDescription className="text-muted-foreground pt-2">
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
                        <p className="font-semibold text-primary">{variant.word}</p>
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
