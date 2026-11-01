import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DailyQuestionResponse } from "@/lib/api/AdminDailyApi";
import { BookOpen, Calendar } from "lucide-react";

interface TodayQuestionPreviewProps {
  question: DailyQuestionResponse;
}

export const TodayQuestionPreview: React.FC<TodayQuestionPreviewProps> = ({ question }) => {
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="bg-surface-muted border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Calendar className="h-4 w-4" />
            Soal hari ini
          </div>
          <Badge variant="default" className="font-mono">#{question.id.slice(-6).toUpperCase()}</Badge>
        </div>
        <CardTitle className="pt-2 text-lg">{question.subtest.tryOut.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px]">{question.subtest.name}</Badge>
          <span className="text-xs text-text-muted">• {question.points} poin</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
            <BookOpen className="h-4 w-4" />
            Konten soal
          </div>
          <div 
            className="prose prose-sm max-w-none p-4 rounded-md bg-surface-muted border border-border"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            {question.items.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-md border text-xs flex items-center gap-2.5 ${item.isCorrect ? "bg-success-soft border-success/40 text-success-text font-medium" : "bg-surface border-border text-text-body"}`}
              >
                <div className={`w-6 h-6 rounded-sm flex items-center justify-center font-mono font-bold border shrink-0 ${item.isCorrect ? "bg-success text-white border-transparent" : "bg-surface-muted border-border text-text-body"}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{item.content}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
