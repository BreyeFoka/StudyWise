'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useTransition, useEffect } from 'react';
import { generateQuiz, type GenerateQuizInput, type GenerateQuizOutput, type QuizQuestion } from '@/ai/flows/generate-quiz-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Lightbulb, PlusCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import Image from 'next/image';

// export const metadata: Metadata = { // Metadata can't be used in client components
//   title: 'AI Quizzes - StudyWise',
// };

type UserAnswers = Record<number, string>; // questionIndex -> userAnswer

export default function QuizPage() {
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState<number>(5);

  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'AI Quizzes - StudyWise';
  }, []);

  const handleFileSelect = (file: File | null, dataUri: string | null) => {
    setFileDataUri(dataUri);
    setFileName(file?.name || null);
    // Reset quiz when file changes
    setGeneratedQuiz(null);
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const handleGenerateQuiz = async (e: FormEvent) => {
    e.preventDefault();
    if (!fileDataUri && !topic.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please upload a document or enter a topic to generate a quiz.',
        variant: 'destructive',
      });
      return;
    }

    startGeneratingTransition(async () => {
      setGeneratedQuiz(null); // Clear previous quiz
      setUserAnswers({});
      setIsSubmitted(false);
      try {
        const input: GenerateQuizInput = {
          numQuestions: Number(numQuestions),
        };
        if (fileDataUri) input.documentDataUri = fileDataUri;
        if (topic.trim()) input.topic = topic.trim();

        const result = await generateQuiz(input);
        setGeneratedQuiz(result);
        toast({
          title: 'Quiz Generated!',
          description: `Your quiz "${result.quizTitle}" is ready.`,
        });
      } catch (error) {
        console.error('Error generating quiz:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate the quiz. Please try again.';
        toast({
          title: 'Error Generating Quiz',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    });
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!generatedQuiz) return;

    let correctAnswers = 0;
    generatedQuiz.questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer) {
        if (q.questionType === 'true-false' || q.questionType === 'short-answer') {
          if (userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            correctAnswers++;
          }
        } else if (q.questionType === 'multiple-choice') {
          // correctAnswer for multiple-choice is the string of the option
          if (userAnswer === q.correctAnswer) {
            correctAnswers++;
          }
        }
      }
    });
    setScore((correctAnswers / generatedQuiz.questions.length) * 100);
    setIsSubmitted(true);
    toast({
      title: "Quiz Submitted!",
      description: `You scored ${correctAnswers}/${generatedQuiz.questions.length}.`
    });
  };
  
  const resetQuiz = () => {
    setGeneratedQuiz(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
    // Optionally clear file/topic as well, or keep them for quick regeneration
    // setFileDataUri(null);
    // setFileName(null);
    // setTopic('');
  }

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const userAnswer = userAnswers[index];
    const isCorrect = isSubmitted && userAnswer && userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    const isMultipleChoiceCorrect = isSubmitted && userAnswer && userAnswer === question.correctAnswer;


    return (
      <Card key={index} className={`mb-6 ${isSubmitted ? ( (question.questionType === 'multiple-choice' ? isMultipleChoiceCorrect : isCorrect) ? 'border-green-500' : 'border-red-500') : ''}`}>
        <CardHeader>
          <CardTitle className="text-lg">Question {index + 1}:</CardTitle>
          <CardDescription>
            <MarkdownRenderer content={question.questionText} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {question.questionType === 'multiple-choice' && question.options && (
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => handleAnswerChange(index, value)}
              disabled={isSubmitted}
            >
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2 mb-2 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                  <Label htmlFor={`q${index}-opt${optIndex}`} className="flex-1 cursor-pointer">
                    {option}
                    {isSubmitted && option === question.correctAnswer && <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />}
                    {isSubmitted && option === userAnswer && option !== question.correctAnswer && <XCircle className="inline-block ml-2 h-4 w-4 text-red-600" />}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {question.questionType === 'true-false' && (
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => handleAnswerChange(index, value)}
              disabled={isSubmitted}
            >
              {["True", "False"].map((option, optIndex) => (
                 <div key={optIndex} className="flex items-center space-x-2 mb-2 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                    <Label htmlFor={`q${index}-opt${optIndex}`} className="flex-1 cursor-pointer">
                        {option}
                        {isSubmitted && option === question.correctAnswer && <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />}
                        {isSubmitted && option === userAnswer && option !== question.correctAnswer && <XCircle className="inline-block ml-2 h-4 w-4 text-red-600" />}
                    </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {question.questionType === 'short-answer' && (
            <Textarea
              placeholder="Your answer..."
              value={userAnswer || ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange(index, e.target.value)}
              disabled={isSubmitted}
              rows={3}
            />
          )}
        </CardContent>
        {isSubmitted && (
          <CardFooter className="flex flex-col items-start bg-muted/50 p-4 rounded-b-lg">
            <p className="text-sm font-semibold">
              Correct Answer: <span className="text-accent">{question.correctAnswer}</span>
            </p>
            {userAnswer && userAnswer !== question.correctAnswer && (
                <p className="text-sm text-destructive">Your Answer: {userAnswer}</p>
            )}
            {question.explanation && (
              <div className="mt-2 text-sm text-muted-foreground">
                <strong>Explanation:</strong> <MarkdownRenderer content={question.explanation} />
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI-Generated Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge with quizzes based on your notes or a topic.</p>
        </div>
      </div>

      {!generatedQuiz ? (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Generate a New Quiz</CardTitle>
            <CardDescription>Upload a document or specify a topic to create your quiz.</CardDescription>
          </CardHeader>
          <form onSubmit={handleGenerateQuiz}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="file-upload">Upload Document (Optional)</Label>
                <FileUpload onFileSelect={handleFileSelect} acceptedFileTypes="application/pdf,text/plain,.md,.txt" />
                {fileName && <p className="text-sm text-muted-foreground mt-1">Selected: {fileName}</p>}
              </div>
              <div className="text-center my-2 text-sm text-muted-foreground">OR</div>
              <div>
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Cellular Respiration, World War II Causes"
                  value={topic}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div>
                <Label htmlFor="numQuestions">Number of Questions (1-20)</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 5)))}
                  disabled={isGenerating}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isGenerating || (!fileDataUri && !topic.trim())} className="w-full" size="lg">
                {isGenerating ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-5 w-5" />
                )}
                Generate Quiz
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        // Displaying the quiz
        <div>
          <Card className="mb-8 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">{generatedQuiz.quizTitle}</CardTitle>
                {isSubmitted && (
                   <div className="text-right">
                     <p className="text-xl font-bold">Score: {score.toFixed(0)}%</p>
                     <p className="text-sm text-muted-foreground">
                        ({Math.round(score/100 * generatedQuiz.questions.length)}/{generatedQuiz.questions.length} correct)
                     </p>
                   </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedQuiz.questions.map(renderQuestion)}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              {!isSubmitted ? (
                <Button onClick={handleSubmitQuiz} disabled={Object.keys(userAnswers).length !== generatedQuiz.questions.length} className="w-full sm:w-auto" size="lg">
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={resetQuiz} className="w-full sm:w-auto" variant="outline" size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" /> Try Another Quiz
                </Button>
              )}
            </CardFooter>
          </Card>
           {(!fileDataUri && !topic.trim() && !generatedQuiz) && // Fallback if something goes wrong and no quiz is generated
             <div className="text-center py-10">
                <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold">Ready to test your knowledge?</p>
                <p className="text-muted-foreground">Use the form above to generate a new quiz.</p>
                 <Image 
                    data-ai-hint="quiz education"
                    src="https://picsum.photos/seed/quizready/300/200" 
                    alt="Quiz illustration" 
                    width={300} 
                    height={200} 
                    className="mt-6 mx-auto rounded-lg shadow-md"
                />
            </div>
          }
        </div>
      )}
    </div>
  );
}
