
"use client";

import { useState } from "react";
import { LoaderCircle, Rocket, Sparkles, CheckCircle, XCircle, ArrowLeft, ArrowRight, RefreshCw, Award } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {quizState === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="text-center">
              <CardHeader>
                <Rocket className="mx-auto h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-3xl">Ready for a Challenge?</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Test your listening skills with a quick quiz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">You'll hear a Vietnamese word and pick the correct spelling from the options.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={startQuiz} className="w-full" size="lg">
                  <Sparkles className="mr-2" /> Start Quiz
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {quizState === "active" && currentQuestion && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardHeader>
                 <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-semibold">{currentQuestion.questionText}</CardTitle>
                    <SpeakButton text={currentQuestion.wordToPlay} size="default" />
                </div>
                <Progress value={progress} className="w-full mt-4 h-2" />
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <RadioGroup
                  value={userAnswers[currentQuestionIndex] || ""}
                  onValueChange={handleAnswerChange}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option}>
                      <RadioGroupItem value={option} id={option} className="peer sr-only" />
                      <Label
                        htmlFor={option}
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-card p-4 text-xl font-semibold hover:bg-accent/10 hover:border-accent transition-all cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:shadow-md [&:has([data-state=checked])]:border-primary"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-between mt-4">
                <Button variant="outline" onClick={goToPrevious} disabled={currentQuestionIndex === 0}>
                  <ArrowLeft className="mr-2" /> Previous
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={goToNext}>
                    Next <ArrowRight className="ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <CheckCircle className="mr-2" /> Submit
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {(quizState === "submitting") && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center p-8 min-h-[400px]">
                <LoaderCircle className="h-16 w-16 animate-spin text-primary mb-6" />
                <h2 className="text-3xl font-bold text-primary mb-2">Evaluating your quiz...</h2>
                <p className="text-lg text-muted-foreground">Our AI tutor is grading your answers.</p>
            </motion.div>
        )}
        
        {quizState === "results" && results && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card>
              <CardHeader className="text-center bg-primary/10 p-6">
                <Award className="mx-auto h-16 w-16 text-accent mb-4" />
                <CardTitle className="text-4xl font-bold">Quiz Complete!</CardTitle>
                <CardDescription className="text-2xl mt-2">Your Score: <span className="font-bold text-primary">{results.score}/100</span></CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <AlertTitle className="font-semibold text-primary text-lg">AI Feedback</AlertTitle>
                  <AlertDescription>
                    <ReactMarkdown className="prose prose-sm text-base">
                      {results.feedback}
                    </ReactMarkdown>
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold mb-3 text-xl">Your Answers</h3>
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {questions.map((q, i) => {
                      const userAnswer = userAnswers[i] || 'Not answered';
                      const isCorrect = userAnswer === q.correctAnswer;
                      return (
                        <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/70">
                          <div className="flex items-center gap-2">
                            <SpeakButton text={q.wordToPlay} />
                            <div className="font-medium">Q{i + 1}: <span className="font-normal text-muted-foreground">{q.correctAnswer}</span></div>
                          </div>
                          <div className="flex items-center gap-2">
                             {!isCorrect && userAnswer !== 'Not answered' && <SpeakButton text={userAnswer} />}
                            <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>{userAnswer}</span>
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
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
                  <RefreshCw className="mr-2" /> Try Another Quiz
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
