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
 * - **Opsi A (✓):** **BENAR** - Kesimpulan valid dari silogisme
 * - **Opsi B (❌):** Bertentangan dengan premis
 * - **Opsi C (❌):** Salah arah kesimpulan
 * - **Opsi D (❌):** Bertentangan dengan premis
 * - **Opsi E (❌):** Kesimpulan dapat ditarik
 *
 * ### Jawaban yang Benar
 * **Jawaban: A - Semua A adalah C**
 *
 * ### Penjelasan Detail
 * Dalam logika silogisme, jika A⊆B dan B⊆C, maka A⊆C (transitif).
 *
 * > 💡 **Tips:** Untuk soal logika, buat diagram Venn untuk visualisasi!
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
    solution: `## Pembahasan Soal ${
      startId + i
    }\n\n### Analisis Soal\nSoal ini menguji pemahaman tentang **konsep dasar meong ipsum**. Untuk menjawab soal ini, kita perlu memahami:\n\n1. Konsep utama dari meong ipsum dolor sit amet\n2. Hubungan antara felis pulvinar dan tincidunt felis\n3. Penerapan meong curabitur dalam konteks soal\n\n### Langkah Penyelesaian\n\n**Langkah 1:** Identifikasi kata kunci dalam soal\n- Meong felis sit amet\n- Felis pulvinar\n- Tincidunt felis meong\n\n**Langkah 2:** Analisis setiap opsi jawaban\n- **Opsi A (❌):** Tidak sesuai karena tidak mempertimbangkan aspek meong curabitur\n- **Opsi B (❌):** Kurang tepat karena mengabaikan felis vehicula\n- **Opsi C (✓):** **BENAR** - Opsi ini paling tepat karena mencakup semua aspek penting\n- **Opsi D (❌):** Salah interpretasi tentang eiusmod tempor\n- **Opsi E (❌):** Tidak relevan dengan konteks soal\n\n### Jawaban yang Benar\n**Jawaban: C**\n\n### Penjelasan Detail\nOpsi C adalah jawaban yang paling tepat karena:\n\n1. **Konsep Meong Ipsum**: Memahami bahwa meong ipsum dolor sit amet adalah fondasi dari pemahaman materi ini\n2. **Analisis Kontekstual**: Dalam konteks soal, felis pulvinar memiliki hubungan langsung dengan tincidunt felis meong\n3. **Penerapan Praktis**: Meong curabitur tristique menunjukkan aplikasi dari konsep yang diuji\n\n> 💡 **Tips:** Untuk soal sejenis, selalu perhatikan hubungan antara meong felis dan aspek lainnya dalam konteks yang diberikan.\n\n### Konsep Penting yang Perlu Diingat\n- Meong ipsum ≠ Lorem ipsum biasa\n- Felis pulvinar selalu terkait dengan tincidunt\n- Dalam soal UTBK, konteks sangat penting untuk menentukan jawaban yang tepat`,
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
      subtestName: "Kemampuan Memahami Bacaan dan Menulis",
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
