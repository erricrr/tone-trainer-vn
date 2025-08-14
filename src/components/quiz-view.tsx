"use client";

import { useState } from "react";
import { LoaderCircle, Rocket, Sparkles, CheckCircle, XCircle, ArrowLeft, ArrowRight, RefreshCw, Award } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { useWordDifficulty } from "@/hooks/useWordDifficulty";
import { generateQuiz } from "@/lib/quiz";
import type { QuizQuestion } from "@/types";
import { SpeakButton } from "./speak-button";

import { evaluateQuiz } from "@/ai/flows/quiz-evaluation";
import type { EvaluateQuizInput, EvaluateQuizOutput } from "@/ai/flows/quiz-evaluation";
import { useToast } from "@/hooks/use-toast";

type QuizState = "idle" | "active" | "submitting" | "results";

export function QuizView() {
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [results, setResults] = useState<EvaluateQuizOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  const { difficulties, adjustDifficulty } = useWordDifficulty();
  const { toast } = useToast();

  const startQuiz = () => {
    const newQuestions = generateQuiz(difficulties, 10);
    setQuestions(newQuestions);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setResults(null);
    setQuizState("active");
  };

  const handleAnswerChange = (answer: string) => {
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(userAnswers).length !== questions.length) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer all ${questions.length} questions before submitting.`,
        variant: "destructive",
      });
      return;
    }

    setQuizState('submitting');
    const quizData: EvaluateQuizInput['quizData'] = questions.map((q, i) => ({
      question: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[i] || "",
    }));

    try {
      const evaluation = await evaluateQuiz({ quizData });
      setResults(evaluation);
      quizData.forEach(item => {
        if (item.userAnswer === item.correctAnswer) {
          adjustDifficulty(item.correctAnswer, -1);
        } else {
          adjustDifficulty(item.correctAnswer, 2);
        }
      });
      setQuizState('results');
    } catch (error) {
      console.error("Quiz evaluation failed", error);
      toast({
        title: "Evaluation Error",
        description: "There was a problem evaluating your quiz. Please try again.",
        variant: "destructive",
      });
      setQuizState('active');
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        {quizState === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}>
            <CardHeader className="text-center">
              <Rocket className="mx-auto h-12 w-12 text-accent mb-4" />
              <CardTitle className="text-2xl">Ready for a Challenge?</CardTitle>
              <CardDescription>Test your listening skills with a quick quiz.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">You'll hear a Vietnamese word and you have to pick the correct spelling from a list of options.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={startQuiz} className="w-full" size="lg">Start Quiz</Button>
            </CardFooter>
          </motion.div>
        )}

        {quizState === "active" && currentQuestion && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
              <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
              <CardTitle className="text-xl">{currentQuestion.questionText}</CardTitle>
              <Progress value={progress} className="w-full mt-2" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <SpeakButton text={currentQuestion.wordToPlay} size="lg" />
              <RadioGroup
                value={userAnswers[currentQuestionIndex] || ""}
                onValueChange={handleAnswerChange}
                className="grid grid-cols-2 gap-4 w-full"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option}>
                    <RadioGroupItem value={option} id={option} className="peer sr-only" />
                    <Label
                      htmlFor={option}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 text-lg font-semibold hover:bg-accent/20 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goToPrevious} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={goToNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90">Submit</Button>
              )}
            </CardFooter>
          </motion.div>
        )}

        {(quizState === "submitting") && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center p-8 min-h-[400px]">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-semibold text-primary">Evaluating your quiz...</h2>
                <p className="text-muted-foreground">Our AI tutor is grading your answers.</p>
            </motion.div>
        )}
        
        {quizState === "results" && results && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <CardHeader className="text-center bg-muted/50 p-6">
              <Award className="mx-auto h-12 w-12 text-accent mb-4" />
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">Your Score: <span className="font-bold text-primary">{results.score}/100</span></CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Alert className="bg-primary/10 border-primary/50">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold text-primary">AI Feedback</AlertTitle>
                <AlertDescription>{results.feedback}</AlertDescription>
              </Alert>

              <div>
                <h3 className="font-semibold mb-3 text-lg">Your Answers</h3>
                <ul className="space-y-2">
                  {questions.map((q, i) => {
                    const isCorrect = userAnswers[i] === q.correctAnswer;
                    return (
                      <li key={i} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                        <div className="font-medium">Question {i + 1}: <span className="font-normal text-muted-foreground">{q.correctAnswer}</span></div>
                        <div className="flex items-center gap-2">
                          <span className={`${isCorrect ? 'text-green-600' : 'text-destructive'}`}>{userAnswers[i] || 'Not answered'}</span>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={startQuiz} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Another Quiz
              </Button>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
