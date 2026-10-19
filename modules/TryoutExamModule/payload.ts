import { SubtestExam } from "./interface";

/**
 * EXAMPLE PAYLOAD STRUCTURE
 *
 * Example of a complete SubtestExam object with solution in markdown format:
 *
 * {
 *   subtestId: 1,
 *   subtestName: "Penalaran Umum",
 *   tryoutId: 1,
 *   tryoutTitle: "Try Out UTBK SNBT 4 2026",
 *   duration: 30,
 *   questions: [
 *     {
 *       id: 1,
 *       questionText: "Jika semua A adalah B, dan semua B adalah C...",
 *       options: [
 *         "Semua A adalah C",
 *         "Tidak semua A adalah C",
 *         "Semua C adalah A",
 *         "Tidak ada A yang merupakan C",
 *         "Tidak dapat disimpulkan"
 *       ],
 *       correctAnswer: 0, // Index 0 = Opsi A
 *       solution: `## Pembahasan Soal 1
 *
 * ### Analisis Soal
 * Soal ini menguji pemahaman tentang **silogisme** dan **logika deduktif**.
 *
 * ### Langkah Penyelesaian
 *
 * **Langkah 1:** Identifikasi premis
 * - Premis 1: Semua A adalah B
 * - Premis 2: Semua B adalah C
 *
 * **Langkah 2:** Analisis setiap opsi
 * - **Opsi A:** **Benar** - Kesimpulan valid dari silogisme
 * - **Opsi B:** Salah - Bertentangan dengan premis
 * - **Opsi C:** Salah - Salah arah kesimpulan
 * - **Opsi D:** Salah - Bertentangan dengan premis
 * - **Opsi E:** Salah - Kesimpulan dapat ditarik
 *
 * ### Jawaban yang Benar
 * **Jawaban: A - Semua A adalah C**
 *
 * ### Penjelasan Detail
 * Dalam logika silogisme, jika A⊆B dan B⊆C, maka A⊆C (transitif).
 *
 * > **Tips:** Untuk soal logika, buat diagram Venn untuk visualisasi!
 *
 * ### Konsep Penting yang Perlu Diingat
 * - Sifat transitif dalam himpunan
 * - Aturan silogisme kategoris
 * - Validitas argumen deduktif`
 *     }
 *   ]
 * }
 */

// Sample questions using the reference placeholder copy
const generateSampleQuestions = (count: number, startId: number = 1) => {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    questionText: `Meong ipsum dolor sit amet, consectetur adipiscing elit. Meong felis sit amet felis pulvinar, tincidunt felis meong. Purrr meong curabitur tristique felis vel felis posuere, ac vulputate meong felis vehicula. Sed do meong eiusmod tempor incididunt ut labore et dolore meong magna aliqua.\n\nUt enim ad minim meong veniam, quis nostrud exercitation meong ullamco laboris nisi ut aliquip ex ea meong commodo consequat. Meong duis aute irure dolor in meong reprehenderit in voluptate velit esse meong cillum dolore eu fugiat nulla meong pariatur.`,
    options: [
      "Meong ipsum",
      "Meong ipsum",
      "Meong ipsum",
      "Meong ipsum",
      "Meong ipsum",
    ],
    correctAnswer: Math.floor(Math.random() * 5), // Random correct answer for demo
    solution: `### Pembahasan Soal #${
      startId + i
    }\n\n### Analisis Soal\nSoal ini menguji pemahaman materi. Untuk menjawab soal ini, kita perlu memahami konsep utama dan hubungan antar premis.\n\n### Langkah Penyelesaian\n\n**Langkah 1:** Identifikasi kata kunci dalam soal\n\n**Langkah 2:** Analisis setiap opsi jawaban\n- **Opsi A:** Salah - Tidak sesuai dengan premis\n- **Opsi B:** Salah - Kurang tepat\n- **Opsi C:** **Benar** - Opsi ini paling tepat karena mencakup semua aspek penting\n- **Opsi D:** Salah - Salah interpretasi\n- **Opsi E:** Salah - Tidak relevan dengan konteks soal\n\n### Jawaban yang Benar\n**Jawaban: C**\n\n### Penjelasan Detail\nOpsi C adalah jawaban yang paling tepat berdasarkan konsep yang diuji.\n\n> **Tips:** Untuk soal sejenis, selalu perhatikan hubungan antar premis dalam konteks yang diberikan.`,
  }));
};

// Helper function to generate all 7 subtests for a tryout
const generateTryoutSubtests = (tryoutId: number, tryoutTitle: string) => {
  return {
    [`${tryoutId}-1`]: {
      subtestId: 1,
      subtestName: "Penalaran Umum",
      tryoutId,
      tryoutTitle,
      duration: 30,
      questions: generateSampleQuestions(30, 1),
    },
    [`${tryoutId}-2`]: {
      subtestId: 2,
      subtestName: "Pengetahuan dan Pemahaman Umum",
      tryoutId,
      tryoutTitle,
      duration: 15,
      questions: generateSampleQuestions(20, 31),
    },
    [`${tryoutId}-3`]: {
      subtestId: 3,
      subtestName: "Pemahaman Bacaan dan Menulis",
      tryoutId,
      tryoutTitle,
      duration: 25,
      questions: generateSampleQuestions(20, 51),
    },
    [`${tryoutId}-4`]: {
      subtestId: 4,
      subtestName: "Pengetahuan Kuantitatif",
      tryoutId,
      tryoutTitle,
      duration: 20,
      questions: generateSampleQuestions(20, 71),
    },
    [`${tryoutId}-5`]: {
      subtestId: 5,
      subtestName: "Literasi dalam Bahasa Indonesia",
      tryoutId,
      tryoutTitle,
      duration: 43,
      questions: generateSampleQuestions(30, 91),
    },
    [`${tryoutId}-6`]: {
      subtestId: 6,
      subtestName: "Literasi dalam Bahasa Inggris",
      tryoutId,
      tryoutTitle,
      duration: 20,
      questions: generateSampleQuestions(20, 121),
    },
    [`${tryoutId}-7`]: {
      subtestId: 7,
      subtestName: "Penalaran Matematika",
      tryoutId,
      tryoutTitle,
      duration: 43,
      questions: generateSampleQuestions(20, 141),
    },
  };
};

export const subtestExams: { [key: string]: SubtestExam } = {
  ...generateTryoutSubtests(1, "Try Out UTBK SNBT 4 2026"),
  ...generateTryoutSubtests(2, "Try Out UTBK SNBT 3 2026"),
  ...generateTryoutSubtests(3, "Try Out UTBK SNBT 2 2026"),
  ...generateTryoutSubtests(4, "Try Out UTBK SNBT 1 2026"),
  ...generateTryoutSubtests(5, "Try Out UTBK SNBT 14 2025"),
  ...generateTryoutSubtests(6, "Try Out UTBK SNBT 13 2025"),
};

export const getSubtestExam = (
  tryoutId: number,
  subtestId: number
): SubtestExam | undefined => {
  const key = `${tryoutId}-${subtestId}`;
  return subtestExams[key];
};
