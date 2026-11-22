import type { Metadata } from "next";
import Link from "next/link";
import {
  ContactEmail,
  LegalDocument,
  LegalList,
  LegalSection,
  type LegalTocItem,
} from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan · Jitu PTN",
  description:
    "Aturan penggunaan Jitu PTN: akun, koin dan pembayaran, penggunaan yang diperbolehkan, hak kekayaan intelektual, dan batas tanggung jawab.",
};

const toc: LegalTocItem[] = [
  { id: "penerimaan", title: "Penerimaan syarat" },
  { id: "layanan", title: "Tentang layanan" },
  { id: "akun", title: "Akun dan keamanan" },
  { id: "pembayaran", title: "Koin, pembelian, dan pembayaran" },
  { id: "penggunaan", title: "Penggunaan yang diperbolehkan" },
  { id: "integritas", title: "Integritas tryout dan papan peringkat" },
  { id: "kekayaan-intelektual", title: "Hak kekayaan intelektual" },
  { id: "tanpa-jaminan", title: "Skor, pembahasan, dan tidak ada jaminan" },
  { id: "ketersediaan", title: "Ketersediaan dan perubahan layanan" },
  { id: "tanggung-jawab", title: "Pembatasan tanggung jawab" },
  { id: "penghentian", title: "Penangguhan dan penghentian" },
  { id: "privasi", title: "Privasi" },
  { id: "hukum", title: "Hukum yang berlaku dan sengketa" },
  { id: "perubahan", title: "Perubahan syarat" },
  { id: "kontak", title: "Hubungi kami" },
];

export default function SyaratKetentuanPage() {
  return (
    <LegalDocument
      title="Syarat & Ketentuan"
      toc={toc}
      otherPage={{ href: "/kebijakan-privasi", label: "Kebijakan Privasi" }}
      intro={
        <p>
          Selamat datang di Jitu PTN. Dokumen ini adalah perjanjian antara Anda dan Jitu Edukasi (“Jitu”, “kami”)
          tentang penggunaan situs jituptn.com dan seluruh layanannya. Mohon dibaca dengan saksama sebelum membuat
          akun atau menggunakan layanan.
        </p>
      }
    >
      <LegalSection id="penerimaan" title="1. Penerimaan syarat">
        <p>
          Dengan membuat akun, masuk, atau memakai layanan Jitu, Anda menyatakan telah membaca, memahami, dan
          menyetujui syarat ini serta <Link href="/kebijakan-privasi" className="font-semibold text-primary underline underline-offset-4">Kebijakan Privasi</Link>.
          Jika Anda tidak setuju, mohon jangan memakai layanan. Jika Anda berusia di bawah 18 tahun, gunakan layanan
          ini dengan sepengetahuan dan persetujuan orang tua atau wali.
        </p>
      </LegalSection>

      <LegalSection id="layanan" title="2. Tentang layanan">
        <p>Jitu menyediakan sarana belajar untuk persiapan SNBT, antara lain:</p>
        <LegalList
          items={[
            "tryout berjadwal dengan penilaian dan papan peringkat;",
            "latihan soal per subtes, soal harian, dan rangkaian belajar harian;",
            "arsip soal ujian terdahulu;",
            "pembahasan soal dan skor yang diperkirakan dengan metode IRT;",
            "artikel dan informasi pendukung lainnya.",
          ]}
        />
        <p>
          Fitur dapat bertambah, berubah, atau dihentikan sewaktu-waktu. Sebagian fitur gratis, sebagian lainnya
          memerlukan koin atau paket berbayar.
        </p>
      </LegalSection>

      <LegalSection id="akun" title="3. Akun dan keamanan">
        <LegalList
          items={[
            "Anda wajib memberikan data yang benar dan menjaganya tetap akurat.",
            "Satu akun hanya untuk satu orang. Dilarang membagikan, menjual, atau memindahkan akun, koin, atau akses Premium kepada pihak lain.",
            "Anda bertanggung jawab atas semua aktivitas yang terjadi melalui akun Anda dan wajib menjaga kerahasiaan kredensial masuk.",
            "Segera hubungi kami jika Anda menduga akun Anda dipakai tanpa izin.",
          ]}
        />
      </LegalSection>

      <LegalSection id="pembayaran" title="4. Koin, pembelian, dan pembayaran">
        <LegalList
          items={[
            "Koin dan paket dibeli dengan Rupiah. Harga, jumlah koin, dan masa berlaku paket ditampilkan pada halaman toko atau halaman paket terkait sebelum Anda membayar.",
            "Koin digunakan untuk membuka fitur tertentu, misalnya pembahasan dan peringkat tryout. Koin dan akses Premium tidak dapat diuangkan atau dipindahtangankan.",
            "Pembayaran diproses oleh Midtrans. Anda tunduk pada ketentuan Midtrans dan penyedia metode pembayaran yang Anda pilih.",
            "Kode voucher atau referral hanya berlaku sesuai syaratnya (misalnya masa berlaku, kuota, atau minimum pembelian) dan dapat kami batalkan jika disalahgunakan.",
            "Pembelian dianggap berhasil setelah pembayaran terkonfirmasi. Jika pembayaran berhasil tetapi koin belum masuk, hubungi kami dengan nomor pesanan Anda.",
            "Permintaan pengembalian dana kami tinjau satu per satu. Ajukan melalui email dengan menyertakan nomor pesanan dan alasannya.",
          ]}
        />
      </LegalSection>

      <LegalSection id="penggunaan" title="5. Penggunaan yang diperbolehkan">
        <p>Anda setuju untuk tidak:</p>
        <LegalList
          items={[
            "menyalin, menyebarkan, atau menjual ulang soal, pembahasan, atau materi lain dari Jitu tanpa izin tertulis;",
            "memakai bot, skrip, atau cara otomatis lain untuk mengambil konten atau mengakses layanan;",
            "mencoba mengakses akun, data, atau sistem yang bukan milik Anda, atau menguji kerentanan tanpa izin tertulis;",
            "mengganggu atau membebani layanan, termasuk menyerang, memalsukan permintaan, atau menyebarkan perangkat berbahaya;",
            "membongkar, merekayasa balik, atau menyalahgunakan kode dan antarmuka layanan;",
            "menyalahgunakan voucher, referral, atau celah sistem untuk memperoleh koin atau akses secara tidak wajar;",
            "memakai layanan untuk tujuan yang melanggar hukum atau merugikan pihak lain.",
          ]}
        />
      </LegalSection>

      <LegalSection id="integritas" title="6. Integritas tryout dan papan peringkat">
        <p>
          Tryout dimaksudkan untuk mengukur kemampuan Anda secara jujur. Dilarang berbagi jawaban, mengerjakan atas
          nama orang lain, atau memakai cara apa pun untuk memanipulasi skor atau peringkat. Kami dapat membatalkan
          hasil, menghapus entri dari papan peringkat, atau membatasi akun yang kami nilai melakukan kecurangan.
          Nama dan skor Anda dapat tampil pada papan peringkat yang dilihat peserta lain.
        </p>
      </LegalSection>

      <LegalSection id="kekayaan-intelektual" title="7. Hak kekayaan intelektual">
        <p>
          Desain, tampilan, perangkat lunak, merek Jitu, serta soal, pembahasan, dan artikel yang dibuat oleh atau
          untuk Jitu dilindungi hak cipta dan hak kekayaan intelektual lainnya. Kami memberi Anda hak terbatas, tidak
          eksklusif, dan tidak dapat dialihkan untuk memakai konten tersebut bagi keperluan belajar pribadi.
        </p>
        <p>
          Sebagian materi, seperti arsip soal ujian terdahulu, berasal dari sumber pihak ketiga atau sumber publik.
          Hak atas materi tersebut tetap pada pemiliknya, dan materi itu disediakan untuk tujuan pembelajaran. Jika
          Anda adalah pemegang hak dan berpendapat ada materi yang melanggar hak Anda, kirim pemberitahuan ke{" "}
          <ContactEmail /> beserta identitas Anda, uraian materi, dan dasar klaim Anda. Kami akan menindaklanjutinya,
          termasuk menurunkan materi bila diperlukan.
        </p>
      </LegalSection>

      <LegalSection id="tanpa-jaminan" title="8. Skor, pembahasan, dan tidak ada jaminan">
        <p>
          Skor, estimasi IRT, peringkat, dan pembahasan di Jitu adalah alat bantu belajar. Semuanya bukan prediksi
          pasti dan bukan jaminan hasil SNBT, kelulusan, atau diterimanya Anda di kampus atau program studi tertentu.
          Kami berupaya menjaga ketepatan soal dan pembahasan, tetapi kesalahan dapat terjadi. Laporkan kepada kami
          jika menemukannya.
        </p>
        <p>
          Layanan disediakan sebagaimana adanya dan sebagaimana tersedia, sejauh diizinkan hukum, tanpa jaminan
          tersirat atas kelayakan untuk tujuan tertentu.
        </p>
      </LegalSection>

      <LegalSection id="ketersediaan" title="9. Ketersediaan dan perubahan layanan">
        <p>
          Kami berupaya menjaga layanan tetap berjalan, tetapi tidak menjamin layanan selalu tersedia tanpa gangguan.
          Pemeliharaan, gangguan teknis, atau kejadian di luar kendali kami dapat memengaruhi akses, termasuk saat
          tryout berlangsung. Kami dapat mengubah, menjadwalkan ulang, atau menghentikan fitur, tryout, atau harga
          dengan pemberitahuan yang wajar bila memungkinkan.
        </p>
      </LegalSection>

      <LegalSection id="tanggung-jawab" title="10. Pembatasan tanggung jawab">
        <p>
          Sejauh diizinkan hukum yang berlaku, Jitu tidak bertanggung jawab atas kerugian tidak langsung, insidental,
          atau konsekuensial, termasuk hilangnya kesempatan atau data, yang timbul dari penggunaan atau
          ketidakmampuan menggunakan layanan. Total tanggung jawab kami atas klaim apa pun terkait layanan dibatasi
          pada jumlah yang Anda bayarkan kepada kami dalam 12 bulan terakhir sebelum klaim tersebut timbul. Ketentuan
          ini tidak membatasi tanggung jawab yang menurut hukum tidak dapat dibatasi.
        </p>
      </LegalSection>

      <LegalSection id="penghentian" title="11. Penangguhan dan penghentian">
        <p>
          Kami dapat menangguhkan atau menghentikan akses Anda, sebagian atau seluruhnya, jika Anda melanggar syarat
          ini, menyalahgunakan layanan, atau jika diwajibkan hukum. Anda dapat berhenti memakai layanan kapan saja dan
          meminta penghapusan akun melalui <ContactEmail />. Ketentuan yang menurut sifatnya tetap berlaku setelah
          penghentian, seperti hak kekayaan intelektual dan pembatasan tanggung jawab, akan tetap berlaku.
        </p>
      </LegalSection>

      <LegalSection id="privasi" title="12. Privasi">
        <p>
          Cara kami mengumpulkan dan memakai data pribadi Anda dijelaskan dalam{" "}
          <Link href="/kebijakan-privasi" className="font-semibold text-primary underline underline-offset-4">
            Kebijakan Privasi
          </Link>
          , yang merupakan bagian dari syarat ini.
        </p>
      </LegalSection>

      <LegalSection id="hukum" title="13. Hukum yang berlaku dan sengketa">
        <p>
          Syarat ini diatur oleh hukum Republik Indonesia. Jika timbul sengketa, para pihak akan menyelesaikannya
          lebih dulu secara musyawarah. Bila tidak tercapai kesepakatan, sengketa diselesaikan melalui pengadilan yang
          berwenang di Indonesia.
        </p>
      </LegalSection>

      <LegalSection id="perubahan" title="14. Perubahan syarat">
        <p>
          Kami dapat memperbarui syarat ini sewaktu-waktu. Tanggal pembaruan terakhir tercantum di bagian atas halaman.
          Untuk perubahan yang penting, kami akan memberi tahu Anda melalui situs atau email. Dengan tetap memakai
          layanan setelah perubahan berlaku, Anda dianggap menerima syarat yang telah diperbarui.
        </p>
      </LegalSection>

      <LegalSection id="kontak" title="15. Hubungi kami">
        <p>
          Jitu Edukasi
          <br />
          Email: <ContactEmail />
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
