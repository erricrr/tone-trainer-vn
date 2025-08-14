"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { vietnameseWords, toneMarkers } from "@/data/words";
import type { WordVariant } from "@/types";
import { SpeakButton } from "./speak-button";

export function PracticeView() {
  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Practice Words</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Click on a word group to see the variations. Use the speaker icon to listen to the pronunciation.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {vietnameseWords.map((group, index) => (
            <AccordionItem value={`item-${index}`} key={group.base_spelling} className="border-b-0">
              <Card className="overflow-hidden">
                <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-lg px-4 py-4 bg-card data-[state=open]:bg-muted/50 data-[state=open]:rounded-b-none">
                  {group.base_spelling}
                  {group.note && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">({group.note})</span>
                  )}
                </AccordionTrigger>
                <AccordionContent className="pt-2 bg-card rounded-b-lg">
                  <ul className="space-y-3 p-4">
                    {group.variants.map((variant: WordVariant) => (
                      <li
                        key={variant.word}
                        className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <SpeakButton text={variant.word} />
                          <div>
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
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
