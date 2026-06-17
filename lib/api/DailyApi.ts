import { BACKEND_URL } from "../api";

export interface DailyQuestion {
  id: string;
  type: string;
  content: string | null;
  imageUrl: string | null;
  narration: string | null;
  options: {
    id: string;
    content: string | null;
    order: number;
  }[];
}

export interface DailyQuestionResponse {
  alreadyAnswered: boolean;
  isCorrect?: boolean;
  userAnswer?: string;
  question: DailyQuestion;
}

export interface StreakResponse {
  currentStreak: number;
  bestStreak: number;
  totalProblemsSolved: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  message?: string;
  isCorrect?: boolean;
  newStreak?: number;
  explanation?: string;
}

export const getDailyQuestion = async (): Promise<DailyQuestionResponse> => {
  const response = await fetch(`${BACKEND_URL}/daily/question`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    // Temporary fallback until backend implements this endpoint
    if (response.status === 404) {
      return {
        alreadyAnswered: false,
        question: {
          id: "sample-1",
          type: "MULTIPLE_CHOICE",
          content:
            "Manakah di antara kalimat berikut yang merupakan kalimat efektif?",
          imageUrl: null,
          narration: null,
          options: [
            {
              id: "opt-1",
              content: "Budi adalah merupakan seorang anak yang pintar.",
              order: 0,
            },
            {
              id: "opt-2",
              content:
                "Meskipun lelah, tetapi dia tetap melanjutkan pekerjaannya.",
              order: 1,
            },
            {
              id: "opt-3",
              content: "Para hadirin dimohon untuk duduk kembali.",
              order: 2,
            },
            {
              id: "opt-4",
              content: "Dia menjelaskan tentang masalah itu secara rinci.",
              order: 3,
            },
          ],
        },
      };
    }
    throw new Error("Failed to fetch daily question");
  }

  return response.json();
};

export const getUserStreak = async (): Promise<StreakResponse> => {
  const response = await fetch(`${BACKEND_URL}/daily/streak`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    // Temporary fallback until backend implements this endpoint
    if (response.status === 404) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalProblemsSolved: 0,
      };
    }
    throw new Error("Failed to fetch user streak");
  }

  return response.json();
};

export const submitAnswer = async (
  questionId: string,
  answer: string
): Promise<SubmitAnswerResponse> => {
  const response = await fetch(`${BACKEND_URL}/daily/answer`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questionId, answer }),
  });

  if (!response.ok) {
    // Temporary fallback until backend implements this endpoint
    if (response.status === 404) {
      // Temporary sample answer for option C (id: opt-3)
      const isCorrect = answer === "opt-3";
      return {
        success: true,
        isCorrect,
        newStreak: isCorrect ? 1 : 0,
        explanation: isCorrect
          ? "Kalimat C adalah kalimat efektif karena tidak mengandung pleonasme (pengulangan kata yang bermakna sama) dan tidak memiliki kontradiksi konjungsi."
          : "Jawaban yang benar adalah C. Kalimat C adalah kalimat efektif karena tidak mengandung pleonasme dan tidak memiliki kontradiksi konjungsi.",
        message: isCorrect
          ? "Jawaban benar!"
          : "Jawaban salah. Coba lagi besok!",
      };
    }
    throw new Error("Failed to submit answer");
  }

  return response.json();
};
