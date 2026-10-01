export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const DEMO_USER = {
  id: "demo-user-001",
  name: "Alya Pratama",
  email: "alya@demo.jitu.test",
  image: null,
  role: "USER",
  target: "Kedokteran UI",
  tokenBalance: 25,
  emailVerified: true,
};

const TRYOUTS = [
  {
    id: "demo-snbt-01",
    title: "Simulasi SNBT #1 - Prediksi 2026",
    number: "01",
    badge: "SNBT",
    participants: 1248,
    solutionPrice: 0,
    tokenCost: 0,
    isFree: true,
    isPublic: true,
    isRegistered: true,
    scheduledStart: "2026-02-01T08:00:00.000Z",
    scheduledEnd: "2026-12-31T23:59:00.000Z",
  },
  {
    id: "demo-snbt-02",
    title: "Tryout Intensif SNBT #2",
    number: "02",
    badge: "PREMIUM",
    participants: 876,
    solutionPrice: 5,
    tokenCost: 5,
    isFree: false,
    isPublic: true,
    isRegistered: false,
    scheduledStart: "2026-03-15T08:00:00.000Z",
    scheduledEnd: "2026-12-31T23:59:00.000Z",
  },
  {
    id: "demo-literasi-01",
    title: "Bank Soal Literasi Bahasa Indonesia",
    number: "03",
    badge: "LITERASI",
    participants: 532,
    solutionPrice: 0,
    tokenCost: 0,
    isFree: true,
    isPublic: true,
    isRegistered: false,
    scheduledStart: "2026-01-20T08:00:00.000Z",
    scheduledEnd: "2026-12-31T23:59:00.000Z",
  },
];

const DETAIL = {
  ...TRYOUTS[0],
  description:
    "Simulasi lengkap dengan suasana ujian SNBT dan analisis kemampuan per subtes.",
  duration: 195,
  totalQuestions: 155,
  startDate: "2026-02-01T08:00:00.000Z",
  endDate: "2026-12-31T23:59:00.000Z",
  unlockedSolutions: [],
  benefits: [
    "Skor dan peringkat nasional setelah selesai",
    "Analisis performa per subtes",
    "Pembahasan soal lengkap",
  ],
  requirements: ["Siapkan waktu 195 menit", "Kerjakan dengan jujur seperti ujian asli"],
  categories: [
    { id: 1, name: "Penalaran Umum", questionCount: 30, duration: 30 },
    { id: 2, name: "Pengetahuan dan Pemahaman Umum", questionCount: 20, duration: 20 },
    { id: 3, name: "Pemahaman Bacaan dan Menulis", questionCount: 20, duration: 25 },
    { id: 4, name: "Pengetahuan Kuantitatif", questionCount: 20, duration: 20 },
  ],
  latestFinishedAttemptId: null,
  latestAttemptStatus: "NOT_STARTED",
  latestAttemptId: null,
  currentSubtestOrder: 1,
  latestScore: 0,
};

const DAILY_QUESTION = {
  alreadyAnswered: false,
  question: {
    id: "demo-daily-001",
    type: "MULTIPLE_CHOICE",
    content: "Manakah kalimat yang paling efektif?",
    imageUrl: null,
    narration: "Pilih satu jawaban yang paling tepat.",
    options: [
      { id: "a", content: "Para siswa-siswa sedang belajar.", order: 0 },
      { id: "b", content: "Dia menjelaskan tentang rencana itu.", order: 1 },
      { id: "c", content: "Mereka berdiskusi mengenai soal tersebut.", order: 2 },
      { id: "d", content: "Adik sangat paling suka membaca.", order: 3 },
    ],
  },
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

let registered = new Set(["demo-snbt-01"]);
let attemptCounter = 0;

export function installDemoFetch() {
  if (!DEMO_MODE || typeof window === "undefined") return;
  const marker = "__jituDemoFetchInstalled";
  if ((window as unknown as Record<string, boolean>)[marker]) return;
  (window as unknown as Record<string, boolean>)[marker] = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const url = new URL(rawUrl, window.location.origin);
    const path = url.pathname.replace(/^\/api\/(proxy|auth)/, "");
    const method = (init?.method || (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET")).toUpperCase();

    if (!url.pathname.startsWith("/api/")) return originalFetch(input, init);

    if (url.pathname.includes("/api/auth/get-session")) {
      return json({ user: DEMO_USER, session: { id: "demo-session", userId: DEMO_USER.id } });
    }
    if (url.pathname.includes("/api/auth/sign-in") || url.pathname.includes("/api/auth/sign-up")) {
      return json({ user: DEMO_USER, session: { id: "demo-session", userId: DEMO_USER.id } });
    }
    if (url.pathname.includes("/api/auth/sign-out")) return json({ success: true });

    if (path === "/dashboard/stats") {
      return json({ tokenBalance: 25, lastScore: 742, personalBest: 781, weeklyActivity: 5, totalFinished: 8, currentStreak: 6 });
    }
    if (path === "/dashboard/tryouts/ongoing") {
      return json(TRYOUTS.filter((item) => item.id !== "demo-literasi-01").map((item) => ({ ...item, isRegistered: registered.has(item.id), status: "IN_PROGRESS", score: item.id === "demo-snbt-01" ? 742 : undefined })));
    }
    if (path === "/dashboard/tryouts/available") return json(TRYOUTS.filter((item) => !registered.has(item.id)));
    if (path === "/dashboard/score-history") {
      return json([
        { to: "TO #1", total: 681, pu: 710, ppu: 655, pbm: 702, pk: 648, lbi: 690, lbe: 675, pm: 640 },
        { to: "TO #2", total: 724, pu: 735, ppu: 710, pbm: 720, pk: 705, lbi: 730, lbe: 715, pm: 725 },
        { to: "TO #3", total: 742, pu: 760, ppu: 735, pbm: 748, pk: 730, lbi: 744, lbe: 738, pm: 735 },
      ]);
    }
    if (path === "/tryout") return json(TRYOUTS.map((item) => ({ ...item, isRegistered: registered.has(item.id) })));
    if (path.match(/^\/tryout\/[^/]+\/leaderboard$/)) {
      return json({ top10: [{ rank: 1, name: "Raka Wijaya", score: 890, isCurrentUser: false }, { rank: 2, name: "Nadia Putri", score: 865, isCurrentUser: false }, { rank: 27, name: DEMO_USER.name, score: 742, isCurrentUser: true }], currentUserRank: { rank: 27, name: DEMO_USER.name, score: 742, isCurrentUser: true } });
    }
    if (path.match(/^\/tryout\/[^/]+$/)) return json({ ...DETAIL, isRegistered: registered.has("demo-snbt-01") });
    if (path.endsWith("/register")) {
      const id = path.split("/")[2];
      registered = new Set([...registered, id]);
      return json({ success: true, message: "Berhasil mendaftar tryout (mode demo)." });
    }
    if (path.match(/^\/exam\/[^/]+\/start$/) && method === "POST") return json({ attemptId: `demo-attempt-${++attemptCounter}` });
    if (path === "/daily/streak") return json({ currentStreak: 6, bestStreak: 14, totalProblemsSolved: 42 });
    if (path === "/daily/question") return json(DAILY_QUESTION);
    if (path === "/daily/answer") return json({ success: true, isCorrect: true, newStreak: 7, message: "Jawaban benar!", explanation: "Kalimat C paling efektif karena tidak mengandung pemborosan kata." });
    if (path === "/profile") return json({ stats: { totalTryout: 8, averageScore: 724, lastScore: 742, streak: 6 }, attempts: [{ id: "demo-attempt-01", title: "Simulasi SNBT #1", date: "2026-02-10T00:00:00.000Z", score: 742, status: "FINISHED" }] });
    if (path === "/shop/packages") return json([{ id: 1, tokenAmount: 10, title: "Paket Starter", subtitle: "Coba tryout premium pertama", originalPrice: 150000, discount: 33, finalPrice: 99000, savings: 51000, pricePerToken: "9.900", categoryBg: "from-blue-500 to-blue-600" }, { id: 2, tokenAmount: 25, title: "Paket Reguler", subtitle: "Pilihan terbaik untuk persiapan rutin", originalPrice: 350000, discount: 43, finalPrice: 199000, savings: 151000, pricePerToken: "7.960", categoryBg: "from-purple-500 to-purple-600" }]);
    if (path === "/shop/pending" || path === "/shop/past") return json([]);
    if (method !== "GET") return json({ success: true, message: "Perubahan tersimpan di mode demo." });
    return json({});
  };
}
