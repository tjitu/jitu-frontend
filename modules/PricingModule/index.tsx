import Link from "next/link";
import MarketingNavbar from "@/components/elements/MarketingNavbar";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  GraduationCap,
  MessageCircle,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  accent: string;
  badge?: string;
}

interface FeatureHighlight {
  title: string;
  description: string;
  icon: typeof GraduationCap;
}

const bimbelPlans: PricingPlan[] = [
  {
    name: "Bimbel Grup",
    price: "Rp 499.000",
    period: "/bulan",
    description:
      "Kelas live rutin untuk bangun fondasi SNBT bareng mentor dan teman seperjuangan.",
    features: [
      "2x kelas live per minggu",
      "Latihan soal per topik",
      "Grup diskusi mentor",
      "Rekaman kelas 30 hari",
    ],
    cta: "Mulai Bimbel",
    href: "/register",
    accent: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    name: "Bimbel Intensif",
    price: "Rp 1.299.000",
    period: "/program",
    description:
      "Program persiapan padat untuk fase akhir sebelum UTBK dengan tracking progres.",
    features: [
      "Sprint belajar 8 minggu",
      "Review performa mingguan",
      "Bedah soal HOTS",
      "Prioritas konsultasi mentor",
    ],
    cta: "Ambil Paket Intensif",
    href: "/register",
    badge: "Paling diminati",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    name: "Private Mentor",
    price: "Konsultasi",
    period: "",
    description:
      "Pendampingan personal untuk target jurusan kompetitif dan strategi belajar spesifik.",
    features: [
      "Sesi 1-on-1 dengan mentor",
      "Rencana belajar personal",
      "Evaluasi kelemahan subtes",
      "Jadwal fleksibel",
    ],
    cta: "Konsultasi Admin",
    href: "https://wa.me/6281234567890",
    accent: "border-orange-200 bg-orange-50 text-orange-700",
  },
];

const tryoutPlans: PricingPlan[] = [
  {
    name: "TO Gratis",
    price: "Rp 0",
    period: "",
    description:
      "Coba pengalaman tryout pertama dan lihat format analisis skor JituPTN.",
    features: [
      "1 akses tryout gratis",
      "Ranking dasar peserta",
      "Pembahasan pilihan",
      "Akses dashboard progres",
    ],
    cta: "Coba Gratis",
    href: "/register",
    accent: "border-slate-200 bg-slate-50 text-slate-700",
  },
  {
    name: "Paket Starter TO",
    price: "Rp 99.000",
    period: "",
    description:
      "10 token untuk latihan tryout premium berkala saat persiapan mulai serius.",
    features: [
      "10 token tryout premium",
      "Pembahasan lengkap",
      "Analisis subtes",
      "Token tidak hangus",
    ],
    cta: "Beli Token",
    href: "/shop",
    accent: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    name: "Paket Intensif TO",
    price: "Rp 299.000",
    period: "",
    description:
      "50 token untuk simulasi rutin, evaluasi ranking, dan latihan sampai hari ujian.",
    features: [
      "50 token tryout premium",
      "Harga token paling hemat",
      "Leaderboard dan analisis IRT",
      "Cocok untuk program intensif",
    ],
    cta: "Beli Paket Hemat",
    href: "/shop",
    badge: "Best value",
    accent: "border-violet-200 bg-violet-50 text-violet-700",
  },
];

const highlights: FeatureHighlight[] = [
  {
    title: "Kelas dan tryout saling nyambung",
    description:
      "Materi bimbel diarahkan ke pola soal yang muncul di TO, jadi evaluasi belajar lebih jelas.",
    icon: GraduationCap,
  },
  {
    title: "Simulasi waktu UTBK",
    description:
      "TO premium memakai batas waktu per subtes untuk melatih pacing sebelum ujian asli.",
    icon: NotebookPen,
  },
  {
    title: "Pantau progres dari dashboard",
    description:
      "Lihat perkembangan skor, subtes lemah, dan riwayat latihan dalam satu tempat.",
    icon: ShieldCheck,
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  const isExternal = plan.href.startsWith("http");

  return (
    <Card
      className={`relative h-full overflow-hidden border-2 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        plan.badge ? "border-blue-300" : "border-gray-100"
      }`}
    >
      {plan.badge && (
        <div className="absolute right-5 top-5 z-10">
          <Badge variant="chips" color="blue" className="h-7 px-3">
            <Sparkles className="h-3 w-3" />
            {plan.badge}
          </Badge>
        </div>
      )}

      <CardContent className="flex h-full flex-col p-6">
        <div
          className={`mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${plan.accent}`}
        >
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-950">{plan.name}</h3>
          <p className="min-h-[72px] text-sm leading-6 text-gray-600">
            {plan.description}
          </p>
        </div>

        <div className="mt-6 flex items-end gap-1 border-y border-gray-100 py-5">
          <span className="text-3xl font-black tracking-tight text-gray-950">
            {plan.price}
          </span>
          {plan.period && (
            <span className="pb-1 text-sm font-medium text-gray-500">
              {plan.period}
            </span>
          )}
        </div>

        <ul className="mt-6 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-3 text-sm text-gray-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button asChild className="mt-8 h-12 w-full rounded-xl">
          <Link
            href={plan.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
          >
            {plan.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PricingSection({
  eyebrow,
  title,
  description,
  plans,
}: {
  eyebrow: string;
  title: string;
  description: string;
  plans: PricingPlan[];
}) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl space-y-4">
          <Badge variant="outline" className="border-blue-200 text-blue-700">
            {eyebrow}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            {title}
          </h2>
          <p className="text-base leading-7 text-gray-600 md:text-lg">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

const PricingModule = () => {
  return (
    <div className="min-h-screen bg-white font-open-sans text-gray-950">
      <MarketingNavbar />

      <main className="pt-20">
        <section className="border-b border-gray-100 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center space-y-7">
              <Badge
                variant="chips"
                color="green"
                className="h-8 px-4 text-sm"
              >
                Pricing JituPTN
              </Badge>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-gray-950 md:text-6xl">
                  Paket Bimbel dan TO untuk target PTN kamu.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
                  Pilih kelas pendampingan, token tryout, atau gabungkan
                  keduanya supaya latihan, pembahasan, dan evaluasi progres
                  berjalan dalam satu alur.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="#bimbel">
                    Lihat Paket Bimbel
                    <GraduationCap className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-2 bg-white"
                >
                  <Link href="#tryout">
                    Lihat Paket TO
                    <NotebookPen className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Kombinasi populer
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-gray-950">
                      Bimbel Intensif + 50 Token
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Video className="mb-3 h-5 w-5 text-blue-600" />
                    <p className="text-2xl font-black text-gray-950">8</p>
                    <p className="text-xs font-medium text-gray-500">
                      minggu sprint belajar
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <NotebookPen className="mb-3 h-5 w-5 text-emerald-600" />
                    <p className="text-2xl font-black text-gray-950">50</p>
                    <p className="text-xs font-medium text-gray-500">
                      token tryout premium
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Users className="mb-3 h-5 w-5 text-violet-600" />
                    <p className="text-2xl font-black text-gray-950">Live</p>
                    <p className="text-xs font-medium text-gray-500">
                      diskusi mentor mingguan
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <ShieldCheck className="mb-3 h-5 w-5 text-orange-600" />
                    <p className="text-2xl font-black text-gray-950">IRT</p>
                    <p className="text-xs font-medium text-gray-500">
                      analisis skor dan ranking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div id="bimbel">
          <PricingSection
            eyebrow="Bimbel"
            title="Paket belajar dengan mentor"
            description="Untuk siswa yang butuh struktur belajar, kelas live, pembahasan terarah, dan evaluasi berkala."
            plans={bimbelPlans}
          />
        </div>

        <div id="tryout" className="bg-slate-50">
          <PricingSection
            eyebrow="Tryout Online"
            title="Paket TO berbasis token"
            description="1 token berlaku untuk 1 akses tryout premium. Token bisa dipakai kapan saja selama paket tryout tersedia."
            plans={tryoutPlans}
          />
        </div>

        <section className="border-y border-gray-100 bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-950 py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="max-w-2xl space-y-4">
              <Badge
                variant="outline"
                className="border-white/20 bg-white/10 text-white"
              >
                Masih bingung pilih paket?
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Konsultasi dulu sebelum checkout.
              </h2>
              <p className="text-sm leading-6 text-gray-300 md:text-base">
                Ceritakan target jurusan, posisi skor terakhir, dan waktu
                belajar kamu. Tim JituPTN akan bantu arahkan paket yang paling
                masuk akal.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-gray-950 hover:bg-gray-100"
              >
                <Link href="https://wa.me/6281234567890" target="_blank">
                  <MessageCircle className="h-4 w-4" />
                  Chat Admin
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/register">
                  Daftar Akun
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-100 bg-slate-50 p-6">
              <div className="flex gap-4">
                <CircleHelp className="mt-1 h-5 w-5 flex-none text-blue-600" />
                <div>
                  <h2 className="font-bold text-gray-950">
                    Catatan harga dan pembayaran
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Harga Bimbel di halaman ini bersifat statis dan bisa
                    disesuaikan dari file modul pricing. Paket TO mengikuti
                    struktur token yang sudah tersedia di halaman shop.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PricingModule;
