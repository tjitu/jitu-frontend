"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MarketingNavbar from "@/components/elements/MarketingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Target,
  BarChart3,
  Trophy,
  Zap,
  CheckCircle2,
  ChevronRight,
  Plus,
  Minus,
  Quote,
} from "lucide-react";
import Link from "next/link";

// --- Components ---

const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-orange-50 rounded-full blur-3xl -z-10 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Raih Kampus <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Impianmu
              </span>{" "}
              Sekarang.
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Simulasi ujian dengan sistem penilaian IRT (Item Response Theory)
              yang presisi, analisis peluang lolos real-time, dan bank soal HOTS
              standar SNBT 2026.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl   w-full sm:w-auto"
              >
                Coba Tryout Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Link href={"/login"}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg rounded-full border-2 hover:bg-gray-50 text-gray-700 w-full sm:w-auto"
                >
                  Punya Akun?
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> 100+ Paket
                Soal
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Update 2026
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Analisis AI
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="flex-1 w-full relative group">
            <div className="relative mx-auto flex min-h-[460px] max-w-[520px] items-end justify-center overflow-visible sm:min-h-[560px] lg:min-h-[650px]">
              <div className="absolute inset-x-8 bottom-0 top-16 rounded-[2rem] border border-white bg-gradient-to-br from-blue-50 via-white to-orange-50 shadow-2xl rotate-2 opacity-95 group-hover:rotate-3 transition-transform duration-500" />
              <Image
                src="/images/hero-student-cutout.png"
                alt="Mahasiswa UI siap menghadapi target kampus impian"
                width={846}
                height={1600}
                priority
                className="relative z-10 h-[450px] w-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.03] sm:h-[560px] lg:h-[650px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SocialProof = () => {
  const universities = [
    {
      name: "UI",
      logo: "/ui.png",
    },
    {
      name: "ITB",
      logo: "/itb.png",
    },
    {
      name: "UGM",
      logo: "/ugm.webp",
    },
    {
      name: "ITS",
      logo: "/its.png",
    },
    {
      name: "UNAIR",
      logo: "/unair.png",
    },
    {
      name: "UNPAD",
      logo: "/unpad.webp",
    },
  ];

  return (
    <section className="py-12 border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
          Target Kampus Favorit Pengguna Kami
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {universities.map((uni) => (
            <div
              key={uni.name}
              className="relative w-16 h-16 md:w-20 md:h-20 grayscale md:opacity-40 max-md:grayscale-0 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer hover:scale-110"
              title={`Universitas ${uni.name}`}
            >
              <img
                src={uni.logo}
                alt={`${uni.name} Logo`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BentoFeatures = () => {
  return (
    <section id="fitur" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Bukan Sekadar Latihan Soal Biasa.
          </h2>
          <p className="text-lg text-gray-600">
            Kami membangun ekosistem belajar yang dirancang khusus untuk
            adaptasi dengan tekanan UTBK sesungguhnya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(200px,auto)]">
          {/* Feature 1: IRT - Large */}
          <Card className="md:col-span-2 bg-white border-0 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
            <div className="p-8 h-full flex flex-col justify-between relative">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Sistem Penilaian IRT
                </h3>
                <p className="text-gray-600 max-w-md">
                  Menggunakan Item Response Theory, sama seperti standar UTBK
                  resmi. Skor kamu mencerminkan kemampuan asli, bukan sekadar
                  jumlah benar-salah.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-blue-50 to-transparent rounded-tl-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </Card>

          {/* Feature 2: Gamification */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-xl transition-all overflow-hidden">
            <div className="p-8 h-full">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Daily Streak
              </h3>
              <p className="text-gray-600 text-sm">
                Bangun disiplin belajar. Pertahankan api streak setiap hari dan
                menangkan rewards eksklusif.
              </p>
            </div>
          </Card>

          {/* Feature 3: Analysis */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-xl transition-all overflow-hidden">
            <div className="p-8 h-full">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Analisis Subtes
              </h3>
              <p className="text-gray-600 text-sm">
                Grafik performa detail per subtes (PU, PPU, PBM, dll) untuk
                identifikasi kelemahanmu.
              </p>
            </div>
          </Card>

          {/* Feature 4: Realtime */}
          <Card className="md:col-span-2 bg-gray-900 text-white border-0 shadow-sm hover:shadow-xl transition-all overflow-hidden relative">
            <div className="p-8 relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Blocking Time System
                  </h3>
                  <p className="text-gray-300 max-w-md">
                    Simulasi waktu per sub-bab yang ketat melatih manajemen
                    waktumu agar tidak panik saat hari-H.
                  </p>
                </div>
              </div>
            </div>
            {/* Abstract pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          </Card>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Amalia",
      role: "Lolos Kedokteran UI 2025",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      text: "Awalnya skeptis, tapi sistem IRT-nya beneran valid. Nilai TO di sini konsisten sama hasil asli UTBK gue. Recommended banget buat yang mau ngejar top PTN!",
    },
    {
      name: "Rizky Pratama",
      role: "Lolos STEI ITB 2025",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
      text: "Fitur blocking time-nya bikin stress, TAPI itu yang gue butuhin. Pas hari H ujian beneran, gue jadi jauh lebih tenang karena udah terbiasa dikejar waktu.",
    },
    {
      name: "Dinda Putri",
      role: "Lolos Psikologi UGM 2025",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
      text: "Analisis per subtes-nya detail parah. Gue jadi tau kalo gue lemah di Penalaran Matematika dan bisa fokus perbaiki di sisa waktu 2 bulan.",
    },
  ];

  return (
    <section id="testimoni" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kata Mereka yang Sudah <span className="text-blue-600">Lolos</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan siswa yang telah berhasil menembus kampus
            impian mereka bersama JituAcademy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <Card
              key={idx}
              className="bg-gray-50 border-0 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-8 space-y-6">
                <Quote className="w-10 h-10 text-blue-200" />
                <p className="text-gray-700 leading-relaxed italic">
                  <span>&quot;</span>
                  {item.text}
                  <span>&quot;</span>
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200/50">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {item.name}
                    </h4>
                    <p className="text-blue-600 text-xs font-medium">
                      {item.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apakah Tryout di JituAcademy Gratis?",
      a: "Kami menyediakan Paket Gratis yang bisa diakses kapan saja untuk mencoba fitur dasar. Untuk akses penuh ke bank soal, analisis mendalam, dan tryout premium, Anda bisa upgrade ke paket Premium dengan harga terjangkau.",
    },
    {
      q: "Bagaimana sistem penilaiannya bekerja?",
      a: "Kami menggunakan sistem Item Response Theory (IRT) yang diadopsi oleh LTMPT/SNPMB. Bobot setiap soal berbeda tergantung tingkat kesulitan dan respons peserta lain, memberikan prediksi skor yang jauh lebih akurat daripada sekadar menghitung jumlah benar.",
    },
    {
      q: "Apakah bisa diakses lewat HP?",
      a: "Tentu saja! Platform kami 100% responsif. Anda bisa mengerjakan latihan soal, melihat pembahasan, dan mengecek analisis grafik langsung dari smartphone atau tablet dengan nyaman.",
    },
    {
      q: "Jika saya beli paket, masa aktifnya berapa lama?",
      a: "Masa aktif paket Premium berlaku hingga pelaksanaan UTBK 2026 selesai. Jadi Anda cukup bayar sekali untuk akses sepuasnya sampai hari ujian.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Left Column: Header */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Pertanyaan yang Sering <br /> Diajukan
            </h2>
            <p className="text-gray-600 text-lg">
              Masih bingung? Berikut adalah jawaban untuk pertanyaan populer.
              Jika tidak menemukan jawabanmu, silakan hubungi tim support kami.
            </p>
            <Button variant="outline" className="rounded-full px-6 border-2">
              Hubungi WhatsApp Admin
            </Button>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  openIndex === idx
                    ? "border-blue-200 shadow-md"
                    : "border-gray-200 hover:border-blue-100"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span
                    className={`font-semibold text-lg ${openIndex === idx ? "text-blue-600" : "text-gray-900"}`}
                  >
                    {faq.q}
                  </span>
                  {openIndex === idx ? (
                    <Minus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === idx
                      ? "max-h-48 opacity-100 pb-6"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <Image
              src="/images/jitu-logo-light.png"
              alt="Logo Jitu"
              width={5672}
              height={2279}
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="text-gray-500 leading-relaxed max-w-sm">
            Platform ed-tech yang berfokus membantu siswa Indonesia menembus PTN
            impian melalui teknologi simulasi ujian yang adaptif dan akurat.
          </p>
          <div className="flex gap-4">
            {/* Socials Placeholder */}
            {["Instagram", "Twitter", "Youtube"].map((social, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer"
              >
                <span className="text-[10px] font-bold">
                  {social.substring(0, 2).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-gray-900 mb-6">Produk</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li className="hover:text-blue-600 cursor-pointer">Tryout SNBT</li>
            <li className="hover:text-blue-600 cursor-pointer">Bank Soal</li>
            <li className="hover:text-blue-600 cursor-pointer">Live Class</li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-gray-900 mb-6">Dukungan</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li className="hover:text-blue-600 cursor-pointer">
              Pusat Bantuan
            </li>
            <li className="hover:text-blue-600 cursor-pointer">
              Syarat & Ketentuan
            </li>
            <li className="hover:text-blue-600 cursor-pointer">
              Kebijakan Privasi
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-bold text-gray-900 mb-6">Tetap Terhubung</h4>
          <p className="text-gray-500 text-sm mb-4">
            Dapatkan tips lolos PTN langsung ke emailmu.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email kamu"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
        <p>© 2026 PT Jitu Edukasi Indonesia. All rights reserved.</p>
        <p>Dibuat dengan ❤️ untuk Pejuang PTN.</p>
      </div>
    </div>
  </footer>
);

// --- Main Page Component ---

const LandingPageModule = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <MarketingNavbar />

      <main>
        <HeroSection />
        <SocialProof />
        <BentoFeatures />
        <TestimonialsSection />
        <FAQSection />

        {/* Simple CTA Section */}
        <section className="py-24 px-4 bg-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl group">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Mulai Perjalananmu Sekarang.
              </h2>
              <p className="text-blue-100 text-lg">
                Ribuan pesaingmu sudah mulai belajar hari ini. Jangan sampai
                tertinggal. Daftar akun gratis dan akses tryout perdanamu.
              </p>
              <Button
                onClick={() => router.push("/register")}
                className="h-14 px-10 text-lg rounded-full bg-white text-blue-600 hover:bg-gray-50 font-bold shadow-lg transition-transform hover:scale-105"
              >
                Daftar Gratis Sekarang
              </Button>
            </div>

            {/* Decorative circles - Animated */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPageModule;
