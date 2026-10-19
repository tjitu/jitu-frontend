# WRITING.md — Jitu (jituptn.com)

Reference for every word on the site and in the app: landing, student app, admin, emails, WhatsApp notices. Pairs with `design.md` (visual design, layout, tokens, components). For copy, voice and microcopy, this file is the sole authority. This document is in English; all shipped copy is in Indonesian.

Reworked 19 Oct 2026. Replaces the earlier version that modelled siakjuara.com. The reference voices are now SainsIn and Pahamify.

## 0. How to use this file

1. Find the surface you're writing for (§3) and use its register.
2. Find the closest example in §7 (landing) or §8 (microcopy). Copy its shape, not its exact words.
3. Check every fact against §9. If a fact isn't there, don't invent it.
4. Run the checklist in §10 before finishing.

Placeholders like `[confirm]` live in code comments or this file only. They never render in the UI.

## 1. Voice in one line

Jitu sounds like a kakak kelas who just got into PTN, explaining over chat how the tryout works. Friendly, straight, a bit playful. Never a brochure, never a lecturer.

Four values:

1. **Clear first.** The reader gets it in one pass.
2. **Talks like a person.** Everyday spoken Indonesian, the way students actually type.
3. **Honest about money and limits.** Say what's free, what costs, and what we don't do.
4. **Facts over praise.** A number, date or example beats an adjective.

## 2. What we take from SainsIn and Pahamify

Borrow the patterns. Never copy their lines.

| From | Pattern | Our version |
|---|---|---|
| SainsIn | Calm, clear sentences with "kamu". Headings are plain statements. | "Gimana cara ikutnya?" |
| SainsIn | Free and paid side by side with plain labels. | "Gratis" / "Pakai 1 coin" |
| SainsIn | Price shown with context (starting price, normal price). | "Mulai Rp8.900 per tryout" plus the per-tryout math |
| SainsIn | FAQ written as real questions. | "Coin bisa hangus nggak?" |
| SainsIn | Proof as plain counts. | "300+ siswa dari 14 sekolah" |
| Pahamify | Peer warmth that reassures. | "Kerjakannya gratis kok." |
| Pahamify | Spoken particles (lho, kok, sih, deh), used lightly. | "Kalau nilaimu udah aman, coin-mu tetap utuh." |
| Pahamify | A small playful aside, once in a while. | One per page, never near prices |
| Pahamify | Invitations with "yuk". | "Yuk, lihat jadwalnya." Once per page |

Leave behind: Pahamify's branded vocabulary (Rockstar Teacher, Pahamifren), hashtags, "terbaik/terlengkap" claims, long SEO paragraphs, hype exclamation marks. Leave behind SainsIn's "Raih ... impianmu" style slogans.

## 3. Voice rules

**Address.** "kamu". Never "Anda", never "para pelajar". Jitu may say "kami" when it has to, but prefer to describe what happens ("Coin dipotong 1") over talking about ourselves.

**Register by surface**

| Surface | Register |
|---|---|
| Landing hero, section intros | Warm and chatty. Particles allowed. |
| Prices, rules, refund and coin terms | Casual words, exact facts. No jokes. |
| Student app (dashboard, lists, settings) | Neutral and short. |
| Test screen | Labels only. Zero personality. |
| Result screen after submitting | Warm. One encouraging line is fine. |
| Errors | Calm and direct. No jokes. |
| Admin | Plain and functional. |
| Email and WhatsApp | Like a short chat message, 2–4 lines. |

**Particles** (kok, lho, sih, deh, nih): at most one per sentence, two or three per screen. Put them where people actually say them, at the end of a clause. Never stack them ("sih lho banget").

**Spelling.** One casual form, used everywhere: "nggak" (not "ga", "gak", "gk"). Marketing prose and messages may use "aja", "udah", "kayak", "biar", "buat", "gimana", "banget", "ngerjain". The app UI keeps labels and buttons in standard form ("Kerjakan", "Kumpulkan", "sudah") but "nggak" is fine there too.

**Say / don't say**

| Say | Don't say |
|---|---|
| gratis | secara cuma-cuma, free |
| coin (singular and plural: "1 coin", "5 coin") | coins, koin, token, kuota, Jitu Token |
| pembahasan | evaluasi, analisis mendalam |
| soal | butir soal |
| tryout | try out, simulasi tryout |
| skor IRT | skor IRT resmi (only "resmi" if an official body issued it) |
| Masuk, Daftar | Login, Sign up |
| Kumpulkan | Submit |
| tryout terakhir | gelombang penutup |
| Segera | Terjadwal |
| Harga (nav) | Biaya & coins |

English words only when everyone already uses them (tryout, QRIS, IRT). Otherwise Indonesian.

**Subtests.** First mention shows the full name, later mentions use the code. PU Penalaran Umum · PPU Pengetahuan dan Pemahaman Umum · PBM Pemahaman Bacaan dan Menulis · PK Pengetahuan Kuantitatif · LBI Literasi dalam Bahasa Indonesia · LBE Literasi dalam Bahasa Inggris · PM Penalaran Matematika.

**Exclamation marks.** Allowed sparingly: at most one per page or screen, only for good news ("Selesai!", "Pembayaran berhasil."). Never on prices, deadlines, errors, the timer or the test screen.

**Emoji.** None (design.md).

## 4. Writing for clarity

- Answer first. No warm-up sentence.
- Order inside any block: what it is → what it costs → when → what to do next.
- One idea per sentence. Average about 18 words. Hard cap 25 in marketing, 12 in UI.
- Say each fact once per page. Later mentions point back ("harga di atas").
- Prefer a table, formula or real UI sample over a paragraph that describes one.
- Prices always carry their unit: "Rp59.000 untuk 5 coin (Rp11.800 per tryout)".
- Formats: Rp15.000 (dot thousands), "2 Nov 2026", 24-hour time, "90 menit".
- Paid actions state the cost on the control: "Buka pembahasan · 1 coin".
- Write in sentence case. If design.md wants uppercase labels, that is CSS; don't type copy in capitals.

**Word budgets**

| Element | Limit |
|---|---|
| H1 | ≤12 words |
| H2 | ≤8 words |
| Hero support line | ≤30 words, two short sentences max |
| Section intro | ≤2 sentences |
| Button | 1–3 words, verb first |
| Modal title / body | ≤6 words / ≤2 sentences |
| Toast | ≤8 words |
| Error | ≤2 sentences: what happened + what to do |
| Empty state | 1 sentence + 1 button |
| Meta description | ≤155 characters |

**Delete test.** Remove the line. If nobody would miss it, it stays removed.

## 5. Sounding natural

The old version of this guide tried hard not to look AI-written and ended up stiff. The fix is simpler: write the way a person talks, and avoid the short list of tells below.

**Tells to avoid**

| Pattern | Do instead |
|---|---|
| "Bukan hanya X, tetapi juga Y" | Say Y. |
| Stock aspiration: raih impianmu, wujudkan, perjalananmu, tingkatkan potensimu, selamat datang di, di era digital | Say what the product does. |
| Superlatives with no proof: terbaik, terlengkap, nomor 1 | A number, or nothing. |
| Corporate nouns: solusi, ekosistem, platform pembelajaran, komprehensif, holistik, optimal | Plain verbs: "lihat", "kerjakan", "buka". |
| Rhetorical question the next line doesn't answer | Question headings only when the next line answers them. |
| A closing line that sums up the section | Stop when the information ends. |
| A sentence that restates its heading | Delete it. |
| Em dashes as a habit | Period or comma. None in UI copy. |
| Flattery ("pelajar cerdas sepertimu") | Say nothing about the reader's character. |
| Always three items, three icon cards | List as many as are true. Use a table or a real UI sample. |
| "mari kita", "dengan demikian", "berbagai macam" | Cut. |
| English leakage: unlock, elevate, seamless, powerful, game-changer | Indonesian. |

**Allowed, because real people write this way:** "yuk" (once per page), question headings, a light "kok/lho", one playful aside per page, fragments that carry information.

**Specificity.** Every claim carries a number, date, name or mechanism. "Pembahasan tiap soal" passes. "Pembahasan berkualitas" fails.

**Swap test.** Put a competitor's name in place of ours. If the sentence still reads true, rewrite it.

## 6. Known cringe on the current site, and the fix

Straight from the live page. Use the right column wherever the same idea appears.

| Now | Why it grates | Rewrite |
|---|---|---|
| "#RaihKampusImpian" + emoji | Slogan, hashtag, emoji on a page that bans them | Delete |
| "Bikin akun gratis tanpa syarat kartu kredit." | Students don't pay by card here | "Daftar gratis. Nggak perlu bayar apa-apa dulu." |
| "...langsung tampil di layar secara cuma-cuma." | Legal-sounding | "Habis kumpulin jawaban, jumlah benar, salah, dan kosongmu langsung muncul. Gratis." |
| "skor IRT resmi dan pembahasan detail tiap butir soal" | "resmi" is a claim we can't back; "butir" is exam-paper language | "skor IRT dan pembahasan tiap soal" |
| "1 Coin = 1 Evaluasi Tryout Lengkap" | "Evaluasi" is school-office language | "1 coin = 1 pembahasan tryout" |
| "16-BIT RETRO TOKEN SYSTEM", "JITU TOKEN" | Design theme leaking into copy | Delete. The pixel look belongs to design.md. |
| "Coins tidak pernah hangus sampai 21 April 2027" | Contradicts itself: it does expire | "Coin berlaku sampai 21 Apr 2027." |
| "Gelombang penutup", "Terjadwal" | Stiff | "Tryout terakhir", "Segera" |
| "Minggu ke-2", "Minggu ke-3" as card titles | Reads as filler | "Tryout #2", "Tryout #3" |
| "Cerita dan skor siswa baru dipasang setelah Tryout #1..." and visible `[SLOT CERITA]` boxes | Page talks about its own unfinished state | Don't render the section until real stories exist |
| "Diisi dari data peserta nyata, bukan karangan." | Defensive, invites doubt | Delete |
| "Populer" badge on the 5-coin pack | Unsourced claim | No badge. "Paling hemat" on the 10-coin pack is provable, keep it. |
| "Daftar akun sekarang, gratis. Pas jadwalnya buka, kamu tinggal langsung kerjakan." | Wordy, mixes registers | "Daftar dulu, gratis. Pas jadwalnya buka, tinggal kerjain." |
| "Simulasi tryout mingguan" | Redundant ("simulasi" + "tryout") | "Tryout mingguan" |
| Mixed "Coin / Coins / coins" | Inconsistent | "coin" everywhere |
| Nav "Biaya & coins" | Clunky | "Harga" |

## 7. Landing page copy deck

Approved wording. Change facts only through §9.

**Meta**
- Title: Jitu · Tryout SNBT Gratis, Pembahasan Mulai Rp8.900
- Description: Tryout SNBT tiap minggu mulai 2 Nov 2026. Gratis dikerjakan, pembahasan dan skor IRT mulai Rp8.900 per tryout.

**Nav:** Cara kerja · Jadwal · Harga · Peserta · Masuk · Daftar gratis

**Hero**
- H1: Kerjakan gratis. Bayar kalau mau tahu salahnya di mana.
- Support: Tryout SNBT tiap minggu, mulai 2 Nov 2026. Selesai ngerjain, kamu langsung tahu benar, salah, dan kosongnya. Skor IRT dan pembahasan dibuka pakai 1 coin.
- Buttons: Daftar gratis · Lihat jadwal

**Cara kerja**
- H2: Gimana cara ikutnya?
- Intro: Tryout-nya gratis. Coin cuma kepakai kalau kamu mau lihat skor IRT dan pembahasan.
- Step 1, Daftar, lalu kerjakan: Bikin akun gratis, pilih jadwal tryout, terus kerjain 7 subtes SNBT dengan batas waktu. `[confirm timer matches real SNBT before saying "sama kayak ujian asli"]`
- Step 2, Skor langsung keluar: Habis kumpulin jawaban, jumlah benar, salah, dan kosongmu langsung muncul. Gratis.
- Step 3, Buka pembahasan kalau perlu: Pakai 1 coin buat lihat skor IRT dan pembahasan tiap soal. Kalau nilaimu udah aman, coin-mu tetap utuh.

**Free vs coin card**
- Gratis (Rp0): Tryout mingguan mulai 2 Nov 2026 · 7 subtes SNBT, TPS dan Literasi · Jumlah benar, salah, dan kosong langsung keluar
- Pakai 1 coin (mulai Rp8.900): Semua yang gratis, plus: skor IRT total dan per subtes · Kunci jawaban dan pembahasan langkah demi langkah tiap nomor · Coin dipakai di tryout mana aja, berlaku sampai 21 Apr 2027

**Jadwal**
- H2: Tryout tiap minggu mulai 2 Nov 2026. `[confirm cadence, see §9]`
- Card: "Tryout #1 · Dibuka · 2 Nov 2026 · Gratis dikerjakan · Pembahasan 1 coin" · button "Kerjakan"
- Later cards: same line, status "Segera", button "Daftar gratis". Last card title: "Tryout terakhir".

**Harga**
- H2: Bayarnya gimana?
- Intro: Tryout gratis. Coin cuma buat pembahasan. Makin banyak coin, makin murah per tryout.
- Short box: 1 coin = 1 pembahasan tryout (skor IRT dan pembahasan 155 soal). Berlaku sampai 21 Apr 2027. Bayar pakai QRIS, tanpa langganan.
- Packs: 1 coin Rp15.000 · 3 coin Rp39.000 (Rp13.000 per tryout) · 5 coin Rp59.000 (Rp11.800 per tryout) · 10 coin Rp89.000 (Rp8.900 per tryout), badge "Paling hemat". Pack button: "Pilih paket".
- Formula block:
```
Harga per tryout = harga paket ÷ jumlah coin
Contoh: Rp59.000 ÷ 5 = Rp11.800 per tryout
```
- Small print: 1 coin buat 1 pembahasan tryout. Coin yang udah dibeli nggak bisa diuangkan lagi.

**Peserta**
- H2: 300+ siswa dari 14 sekolah.
- Intro: Dipakai siswa SMA di Jakarta buat persiapan SNBT.
- Stats: "300+ siswa terdaftar" · "14 SMA di Jakarta"
- Testimonials: not rendered until real. When real: real name, school, real quote, written permission.

**FAQ** (optional; only questions §9 can answer)
- Beneran gratis? — Beneran. Semua tryout gratis dikerjakan, dan jumlah benar, salah, kosongmu langsung keluar. Coin cuma kepakai kalau kamu mau skor IRT dan pembahasan.
- Coin bisa hangus nggak? — Berlaku sampai 21 Apr 2027. Selama itu coin bisa dipakai di tryout mana aja.
- Bayarnya lewat apa? — QRIS.

**Closing CTA**
- H2: Tryout #1 dibuka 2 Nov 2026.
- Body: Daftar dulu, gratis. Pas jadwalnya buka, tinggal kerjain.
- Button: Daftar gratis

**Footer:** Tryout SNBT tiap minggu, 2 Nov 2026 sampai 21 Apr 2027. Gratis dikerjakan. Pembahasan mulai Rp8.900 per tryout. `[confirm cadence]`

## 8. Microcopy

| Context | Copy |
|---|---|
| Primary buttons | Daftar gratis · Masuk · Kerjakan · Kumpulkan · Buka pembahasan · 1 coin · Beli coin |
| Dashboard, empty | "Belum ada tryout yang kamu kerjakan. Tryout #1 dibuka 2 Nov." + button "Lihat jadwal" |
| Submit modal | Title "Kumpulkan sekarang?" Body "11 dijawab, 1 ragu, 8 kosong." Buttons "Kumpulkan" / "Lanjut ngerjain" |
| Result, free part | "Selesai! Benar 98, salah 40, kosong 17." then "Mau tahu salahnya di mana?" + button "Buka pembahasan · 1 coin" |
| Unlock modal | Title "Pakai 1 coin untuk Tryout #3?" Body "Sisa coin kamu jadi 4. Ini nggak bisa dibatalkan." Buttons "Pakai 1 coin" / "Nanti dulu" |
| No coin left | "Coin kamu habis. Beli coin dulu buat buka pembahasan." + button "Beli coin" |
| Payment success | "Pembayaran berhasil. 5 coin udah masuk ke akunmu." |
| Offline during test | "Tidak ada koneksi. Jawabanmu tersimpan di perangkat." `[only if the app really does this]` |
| Timer, last 5 min | "Sisa 5 menit." No jokes. |
| Form error | Say the rule: "Kata sandi minimal 8 karakter." Not "Input tidak valid". |
| Login error | "Email atau kata sandi salah." |
| Email already used | "Email ini udah terdaftar. Coba masuk." |
| Generic failure | "Gagal menyimpan. Coba lagi." Never "Oops!" |
| WhatsApp reminder | "Halo [nama]. Tryout #2 buka besok, 9 Nov. Gratis dikerjakan. Masuk di jituptn.com." |
| Email subject | "Tryout #2 buka besok" |

## 9. Fact sheet (the only facts copy may use)

- Audience: SMA students in Jakarta preparing for SNBT/UTBK.
- 300+ siswa, 14 sekolah.
- Tryout #1: 2 Nov 2026. Last tryout on the site: 21 Apr 2027.
- `[confirm before shipping]` The site says "tiap minggu" until 21 Apr 2027 but lists only 6 tryouts (the fifth on 30 Nov 2026, then a jump to 21 Apr 2027). Confirm cadence and total count before printing "tiap minggu sampai ..." or a tryout count. Also confirm the weekday before writing "tiap Senin".
- 7 subtests, 155 soal.
- All tryouts are free to take. The free result shows benar, salah, kosong.
- 1 coin opens the IRT score and explanations for one tryout.
- Coins are valid until 21 Apr 2027, usable on any tryout. They are not refundable as cash. Never write "tidak pernah hangus".
- Payment by QRIS. No subscription.
- Packs: 1 coin Rp15.000 · 3 coin Rp39.000 (Rp13.000 each) · 5 coin Rp59.000 (Rp11.800 each) · 10 coin Rp89.000 (Rp8.900 each).
- **Not allowed until sourced:** win rate, score-improvement figures, rankings, "terbaik", "resmi" for the IRT score, "populer" badges, tutor or university credentials, quota scarcity, testimonials, any "tryout paling ..." claim.

## 10. Edit pass (run before shipping any copy)

- [ ] Reads like a message from a kakak kelas, not a brochure. Read it aloud: would a 17-year-old say it?
- [ ] Delete test passed on every line
- [ ] Every number and date is in §9
- [ ] "kamu", "nggak", "coin" used consistently
- [ ] No banned phrases (§5), no emoji, at most one "!" per page and never on prices or errors
- [ ] Particles at most one per sentence
- [ ] No placeholder text or "coming soon" explanations visible in the UI
- [ ] Sentence case, no colon subtitles, no closing summary line
- [ ] Sentence lengths vary and stay under the caps
- [ ] Swap test passed
- [ ] Real `<title>` and meta description on every page
