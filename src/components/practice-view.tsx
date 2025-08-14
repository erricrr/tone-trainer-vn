"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { vietnameseWords, toneMarkers } from "@/data/words";
import type { WordVariant } from "@/types";
import { SpeakButton } from "./speak-button";

export function PracticeView() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-4 md:p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Practice Words</h2>
          <p className="text-muted-foreground">
            Click on a word group to see the variations. Use the speaker icon to
            listen to the pronunciation.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {vietnameseWords.map((group, index) => (
            <AccordionItem value={`item-${index}`} key={group.base_spelling}>
              <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-lg px-4 data-[state=open]:bg-muted">
                {group.base_spelling}
                {group.note && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">({group.note})</span>
                )}
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <ul className="space-y-3 px-2">
                  {group.variants.map((variant: WordVariant) => (
                    <li
                      key={variant.word}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
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
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
