import type { Metadata } from "next";
import {
  ContactEmail,
  LegalDocument,
  LegalList,
  LegalSection,
  type LegalTocItem,
} from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Kebijakan Privasi · Jitu PTN",
  description:
    "Cara Jitu PTN mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat memakai tryout, latihan soal, dan layanan lainnya.",
};

const toc: LegalTocItem[] = [
  { id: "tentang", title: "Tentang kebijakan ini" },
  { id: "data-dikumpulkan", title: "Data yang kami kumpulkan" },
  { id: "penggunaan", title: "Bagaimana kami menggunakan data" },
  { id: "dasar-pemrosesan", title: "Dasar pemrosesan" },
  { id: "pihak-ketiga", title: "Penyedia layanan yang membantu kami" },
  { id: "cookie", title: "Cookie dan penyimpanan di peramban" },
  { id: "berbagi", title: "Berbagi data" },
  { id: "luar-negeri", title: "Pemrosesan di luar Indonesia" },
  { id: "penyimpanan-keamanan", title: "Penyimpanan dan keamanan" },
  { id: "hak-anda", title: "Hak Anda" },
  { id: "anak", title: "Pengguna di bawah 18 tahun" },
  { id: "perubahan", title: "Perubahan kebijakan" },
  { id: "kontak", title: "Hubungi kami" },
];

export default function KebijakanPrivasiPage() {
  return (
    <LegalDocument
      title="Kebijakan Privasi"
      toc={toc}
      otherPage={{ href: "/syarat-ketentuan", label: "Syarat & Ketentuan" }}
      intro={
        <p>
          Jitu PTN (“Jitu”, “kami”) menyediakan tryout SNBT, latihan soal, arsip soal, dan pembahasan di
          jituptn.com. Kebijakan ini menjelaskan data pribadi apa yang kami kumpulkan, untuk apa kami
          menggunakannya, dengan siapa kami membagikannya, dan apa saja pilihan yang Anda miliki. Dengan
          memakai layanan kami, Anda menyatakan telah membaca kebijakan ini.
        </p>
      }
    >
      <LegalSection id="tentang" title="1. Tentang kebijakan ini">
        <p>
          Layanan ini dioperasikan oleh Jitu Edukasi dan berlaku untuk situs jituptn.com beserta fitur-fiturnya.
          Kebijakan ini disusun dengan memperhatikan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data
          Pribadi. Untuk pertanyaan apa pun tentang data Anda, hubungi <ContactEmail />.
        </p>
      </LegalSection>

      <LegalSection id="data-dikumpulkan" title="2. Data yang kami kumpulkan">
        <p>Kami hanya mengumpulkan data yang dibutuhkan untuk menjalankan layanan. Jenisnya adalah:</p>
        <LegalList
          items={[
            <>
              <strong>Data akun.</strong> Nama, alamat email, status verifikasi email, dan foto profil. Jika Anda
              masuk dengan Google, data ini kami terima dari akun Google Anda sesuai izin yang Anda berikan.
              Autentikasi (termasuk kata sandi untuk akun email) dijalankan oleh Firebase Authentication.
            </>,
            <>
              <strong>Data profil yang Anda isi sendiri.</strong> Misalnya target kampus atau jurusan, asal sekolah,
              dan nomor telepon. Mengisinya bersifat opsional kecuali dinyatakan lain pada formulir.
            </>,
            <>
              <strong>Aktivitas belajar.</strong> Jawaban dan skor tryout, riwayat latihan soal, soal harian,
              rangkaian belajar harian (streak), soal yang dibuka pembahasannya, serta saldo koin dan status Premium.
            </>,
            <>
              <strong>Data transaksi.</strong> Paket yang dibeli, jumlah, metode dan status pembayaran, kode voucher
              atau referral yang dipakai, serta nomor pesanan. Pembayaran diproses oleh Midtrans; kami tidak
              menerima atau menyimpan nomor kartu, PIN, atau kredensial dompet digital Anda.
            </>,
            <>
              <strong>Data kunjungan.</strong> Halaman yang dibuka, lama kunjungan, pengenal pengunjung acak yang
              disimpan di peramban Anda, serta pengenal akun jika Anda sedang masuk. Data ini kami pakai untuk
              memahami fitur mana yang berguna.
            </>,
            <>
              <strong>Data teknis.</strong> Alamat IP, jenis perangkat dan peramban, serta waktu akses, yang dicatat
              oleh sistem hosting dan keamanan kami.
            </>,
            <>
              <strong>Data lamaran kerja.</strong> Jika Anda melamar melalui program JITU Open Hiring: nama, email,
              nomor WhatsApp, kampus, jurusan, domisili, tautan CV atau portofolio, dan jawaban esai yang Anda kirim.
            </>,
            <>
              <strong>Komunikasi.</strong> Pesan yang Anda kirim kepada kami melalui email.
            </>,
          ]}
        />
        <p>
          <strong>Papan peringkat.</strong> Nama dan skor tryout Anda dapat tampil pada papan peringkat yang dilihat
          peserta lain dari tryout yang sama.
        </p>
      </LegalSection>

      <LegalSection id="penggunaan" title="3. Bagaimana kami menggunakan data">
        <LegalList
          items={[
            "Membuat dan mengelola akun serta memverifikasi identitas Anda saat masuk.",
            "Menyediakan tryout, latihan soal, pembahasan, penilaian, dan papan peringkat.",
            "Memproses pembelian koin atau paket, voucher, dan mengirim bukti transaksi.",
            "Mengirim informasi layanan yang penting, seperti verifikasi email atau perubahan syarat.",
            "Menjaga keamanan, mencegah penyalahgunaan dan kecurangan, serta memperbaiki kesalahan teknis.",
            "Menganalisis penggunaan secara agregat untuk meningkatkan kualitas soal dan fitur.",
            "Memproses lamaran kerja dan menghubungi pelamar.",
            "Memenuhi kewajiban hukum, termasuk pembukuan dan perpajakan.",
          ]}
        />
        <p>Kami tidak menjual data pribadi Anda dan tidak menampilkan iklan pihak ketiga di layanan kami.</p>
      </LegalSection>

      <LegalSection id="dasar-pemrosesan" title="4. Dasar pemrosesan">
        <p>Kami memproses data pribadi Anda berdasarkan salah satu atau beberapa dasar berikut:</p>
        <LegalList
          items={[
            "pelaksanaan perjanjian dengan Anda, yaitu menyediakan layanan yang Anda minta;",
            "persetujuan Anda, misalnya saat mengisi data profil opsional, yang dapat Anda tarik kapan saja;",
            "kepentingan yang sah, seperti menjaga keamanan layanan dan memahami penggunaan secara agregat;",
            "kewajiban hukum yang berlaku bagi kami.",
          ]}
        />
      </LegalSection>

      <LegalSection id="pihak-ketiga" title="5. Penyedia layanan yang membantu kami">
        <p>Kami memakai penyedia layanan berikut untuk menjalankan Jitu. Mereka memproses data atas nama kami:</p>
        <LegalList
          items={[
            <>
              <strong>Google (Firebase Authentication dan Masuk dengan Google)</strong> untuk proses masuk dan
              pendaftaran akun.
            </>,
            <>
              <strong>Supabase</strong> untuk penyimpanan basis data.
            </>,
            <>
              <strong>Vercel</strong> untuk hosting situs dan pengukuran kunjungan (Vercel Web Analytics).
            </>,
            <>
              <strong>Midtrans</strong> untuk pemrosesan pembayaran (misalnya QRIS dan dompet digital).
            </>,
          ]}
        />
        <p>
          Setiap penyedia memiliki kebijakan privasinya sendiri. Kami hanya membagikan data yang diperlukan agar
          layanannya berjalan.
        </p>
      </LegalSection>

      <LegalSection id="cookie" title="6. Cookie dan penyimpanan di peramban">
        <p>Kami memakai cookie dan penyimpanan lokal (local storage) hanya untuk fungsi yang diperlukan:</p>
        <LegalList
          items={[
            "menjaga sesi masuk Anda (dikelola Firebase) dan menandai sesi yang tidak aktif;",
            "mengingat preferensi tampilan, seperti keadaan bilah samping;",
            "menyimpan progres sementara, misalnya rangkaian belajar harian dan jawaban pada arsip soal;",
            "menyimpan pengenal pengunjung acak untuk pengukuran kunjungan;",
            "menandai bahwa lamaran kerja sudah dikirim dari peramban Anda.",
          ]}
        />
        <p>
          Kami tidak memakai cookie periklanan atau pelacak lintas situs. Anda dapat menghapus cookie dan data
          penyimpanan lewat pengaturan peramban. Sebagian fitur, seperti tetap masuk, mungkin tidak berfungsi
          setelah itu.
        </p>
      </LegalSection>

      <LegalSection id="berbagi" title="7. Berbagi data">
        <p>Kami membagikan data pribadi Anda hanya dalam keadaan berikut:</p>
        <LegalList
          items={[
            "kepada penyedia layanan pada bagian 5, sebatas yang dibutuhkan untuk menjalankan layanan;",
            "kepada peserta lain, terbatas pada nama dan skor di papan peringkat;",
            "jika diwajibkan oleh hukum, putusan pengadilan, atau permintaan resmi dari instansi yang berwenang;",
            "untuk melindungi hak, keamanan, dan properti Jitu, pengguna kami, atau pihak lain;",
            "jika terjadi penggabungan atau pengalihan usaha, dengan tetap menjaga perlindungan atas data Anda.",
          ]}
        />
      </LegalSection>

      <LegalSection id="luar-negeri" title="8. Pemrosesan di luar Indonesia">
        <p>
          Sebagian penyedia layanan kami memproses data di luar wilayah Indonesia, termasuk di Australia dan Amerika
          Serikat. Dengan memakai layanan kami, Anda memahami bahwa data Anda dapat ditransfer ke lokasi tersebut. Kami
          berupaya memastikan penyedia tersebut menerapkan perlindungan yang memadai.
        </p>
      </LegalSection>

      <LegalSection id="penyimpanan-keamanan" title="9. Penyimpanan dan keamanan">
        <p>
          Kami menyimpan data selama akun Anda aktif dan selama diperlukan untuk tujuan dalam kebijakan ini. Catatan
          transaksi disimpan selama diwajibkan oleh ketentuan pembukuan dan perpajakan. Setelah tidak diperlukan, data
          dihapus atau dianonimkan.
        </p>
        <p>
          Kami menerapkan langkah pengamanan yang wajar, antara lain koneksi terenkripsi (HTTPS), pembatasan akses
          ke basis data, dan pemeriksaan identitas pada proses masuk. Tidak ada sistem yang sepenuhnya bebas risiko;
          jika terjadi insiden yang memengaruhi data pribadi Anda, kami akan memberi tahu Anda sesuai ketentuan hukum
          yang berlaku.
        </p>
      </LegalSection>

      <LegalSection id="hak-anda" title="10. Hak Anda">
        <p>Sesuai peraturan pelindungan data pribadi yang berlaku, Anda berhak untuk:</p>
        <LegalList
          items={[
            "mengetahui dan meminta salinan data pribadi Anda yang kami simpan;",
            "meminta perbaikan data yang tidak akurat atau tidak lengkap;",
            "meminta penghapusan data atau akun Anda;",
            "menarik persetujuan yang pernah Anda berikan;",
            "mengajukan keberatan atau meminta pembatasan pemrosesan tertentu;",
            "meminta data Anda dalam format yang umum digunakan bila memungkinkan.",
          ]}
        />
        <p>
          Kirim permintaan ke <ContactEmail /> dari alamat email yang terdaftar di akun Anda. Kami dapat meminta
          informasi tambahan untuk memastikan permintaan benar-benar dari Anda. Beberapa data, seperti catatan
          transaksi, mungkin harus tetap kami simpan karena kewajiban hukum.
        </p>
      </LegalSection>

      <LegalSection id="anak" title="11. Pengguna di bawah 18 tahun">
        <p>
          Layanan kami ditujukan bagi pelajar dan peserta persiapan SNBT. Jika Anda berusia di bawah 18 tahun,
          gunakan layanan ini dengan sepengetahuan dan persetujuan orang tua atau wali. Orang tua atau wali dapat
          menghubungi kami di <ContactEmail /> untuk meminta akses, perbaikan, atau penghapusan data anak mereka.
        </p>
      </LegalSection>

      <LegalSection id="perubahan" title="12. Perubahan kebijakan">
        <p>
          Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Tanggal pembaruan terakhir tercantum di bagian
          atas halaman. Untuk perubahan yang penting, kami akan memberi tahu Anda melalui situs atau email. Dengan
          tetap memakai layanan setelah perubahan berlaku, Anda dianggap menerima kebijakan yang telah diperbarui.
        </p>
      </LegalSection>

      <LegalSection id="kontak" title="13. Hubungi kami">
        <p>
          Jitu Edukasi
          <br />
          Email: <ContactEmail />
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
