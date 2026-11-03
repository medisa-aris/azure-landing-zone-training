// Builds docs/trainer_guide_azure-landing-zone-pertamina.docx (Bahasa Indonesia, English jargon kept)
// Usage: node scripts/build_trainer_guide.js
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, BorderStyle, TableOfContents } = require("docx");
const {
  FONT, BRAND, WARN, P, H1, H2, H3, B, N, BREAK, SP, CODE, LINK, table, callout, styles, numbering, footer, pageProps,
} = require("./lib/docx-helpers");

const ML = "https://learn.microsoft.com";
const c = [];

// ---------------------------------------------------------------- session renderer
function session(s) {
  const out = [H2(`${s.id}  ${s.title}`)];
  out.push(table([1, 3], [
    ["Item", "Detail"],
    ["Waktu", s.time],
    ["Tipe", s.type],
    ["Audiens", s.audience],
    ...(s.materials ? [["Materi", s.materials]] : []),
  ]));
  out.push(H3("Tujuan sesi"));
  s.objectives.forEach((o) => out.push(B(o)));
  out.push(H3("Pesan kunci yang harus dijelaskan trainer"));
  s.keyMessages.forEach((m) => out.push(B(m)));
  if (s.extra) out.push(...s.extra);
  if (s.flow) {
    out.push(H3("Alur penyampaian"));
    out.push(table([0.8, 3, 2], [["Menit", "Aktivitas", "Catatan trainer"], ...s.flow]));
  }
  if (s.demo) {
    out.push(SP(), callout(`DEMO ${s.demo.id}: ${s.demo.title}`, [
      "**Persiapan:** " + s.demo.prep,
      ...s.demo.steps.map((x, i) => `${i + 1}. ${x}`),
      "**Yang harus dikatakan:** " + s.demo.say,
    ]));
  }
  if (s.lab) {
    out.push(H3(`Lab ${s.lab.id}: ${s.lab.title}`));
    out.push(table([1, 3], [
      ["Level", "Yang dikerjakan peserta"],
      ["Build (TECH)", s.lab.build],
      ["Operate (EXEC/ANL)", s.lab.operate],
    ]));
    out.push(P("**Catatan trainer:**"));
    s.lab.notes.forEach((x) => out.push(B(x)));
    if (s.lab.issues) {
      out.push(P("**Masalah umum dan solusinya:**"));
      out.push(table([2, 3], [["Gejala", "Penyebab dan solusi"], ...s.lab.issues]));
    }
  }
  if (s.qa) {
    out.push(H3("Pertanyaan yang sering muncul"));
    out.push(table([2, 3], [["Pertanyaan peserta", "Arah jawaban trainer"], ...s.qa]));
  }
  if (s.tips) out.push(SP(), callout("Tips fasilitasi", s.tips, WARN));
  if (s.transition) out.push(SP(), P(`**Transisi:** ${s.transition}`));
  if (s.refs) {
    out.push(P("**Referensi Microsoft Learn:**"));
    s.refs.forEach(([l, u]) => out.push(LINK(l, u)));
  }
  return out;
}

// ---------------------------------------------------------------- cover + TOC
c.push(
  new Paragraph({ spacing: { before: 2200, after: 200 }, children: [new TextRun({ text: "Panduan Trainer", font: FONT, size: 56, bold: true, color: BRAND })] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Azure Landing Zone: Design, Operate, and Connect", font: FONT, size: 32, color: "404040" })] }),
  new Paragraph({ spacing: { after: 600 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BRAND, space: 4 } }, children: [new TextRun({ text: "Training 5 hari untuk PT Pertamina (Persero)", font: FONT, size: 26 })] }),
  table([1, 2], [
    ["Item", "Detail"],
    ["Dokumen", "Panduan Trainer (Instructor Guide) – pendamping Syllabus v1.0"],
    ["Durasi", "5 hari, 09:00–16:00 WIB"],
    ["Bahasa", "Bahasa Indonesia; istilah teknis (jargon) tetap dalam bahasa Inggris"],
    ["Untuk", "Lead trainer, co-trainer, dan lab assistant"],
    ["Versi", "v1.0 draft, November 2026"],
  ]),
  BREAK(),
  new Paragraph({ children: [new TextRun({ text: "Daftar Isi", font: FONT, size: 32, bold: true, color: BRAND })], spacing: { after: 200 } }),
  new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-2" }),
  P("Klik kanan pada daftar isi lalu pilih Update Field untuk memperbarui nomor halaman.", { run: { italics: true, size: 18, color: "808080" } }),
  BREAK(),
);

// ---------------------------------------------------------------- 1. Cara pakai
c.push(H1("1. Cara menggunakan panduan ini"),
  P("Panduan ini menjelaskan **apa yang harus diajarkan, bagaimana menyampaikannya, dan apa yang harus disiapkan** untuk setiap sesi. Gunakan bersama Syllabus (agenda dan learning outcomes) dan Lab Guide (langkah teknis untuk peserta)."),
  P("Setiap sesi di bagian 5–9 memiliki struktur yang sama:"),
  table([1.2, 3], [
    ["Bagian", "Isi"],
    ["Tujuan sesi", "Apa yang harus bisa dilakukan peserta di akhir sesi."],
    ["Pesan kunci", "Poin yang **wajib** dijelaskan trainer. Jika waktu kurang, pesan kunci tidak boleh dipotong; contoh dan cerita yang boleh dipersingkat."],
    ["Alur penyampaian", "Pembagian waktu per menit dan catatan cara menyampaikan."],
    ["Demo", "Persiapan, langkah demo di portal/CLI, dan kalimat inti yang harus disampaikan."],
    ["Lab", "Tugas untuk level Build dan Operate, catatan trainer, dan masalah umum beserta solusinya."],
    ["Pertanyaan yang sering muncul", "Antisipasi pertanyaan peserta dan arah jawabannya."],
    ["Tips fasilitasi", "Saran praktis untuk audiens campuran (manager, analyst, technical)."],
  ]),
  SP(),
  P("**Label audiens:** [ALL] semua peserta, [EXEC] manager/decision-maker, [ANL] analyst, [TECH] technical staff. **Level lab:** Build (TECH membangun dan mengonfigurasi) dan Operate (EXEC/ANL memeriksa, memutuskan, dan membuat laporan dengan akses read-only)."),
  callout("Prinsip utama training ini", [
    "1. Setiap topik dijawab dengan pertanyaan: **“Bagaimana ini terhubung dengan yang sudah kita jalankan?”**",
    "2. Platform landing zone harus siap **sebelum** workload pertama dimigrasi.",
    "3. Mulai dari **minimum viable platform landing zone**, lalu kembangkan sesuai kebutuhan workload. Jangan mendesain berbulan-bulan tanpa memindahkan apa pun.",
    "4. Manager, analyst, dan engineer harus **memutuskan bersama**. Itulah fungsi Design Pack.",
  ]),
);

// ---------------------------------------------------------------- 2. Timetable
c.push(BREAK(), H1("2. Timetable lengkap"),
  P("Jadwal harian mengikuti pola yang sama. Istirahat disesuaikan dengan waktu sholat Dzuhur dan Ashar; hari Jumat istirahat siang lebih panjang untuk sholat Jumat."),
  table([0.7, 0.9, 2.6, 0.9, 1.2], [
    ["Hari", "Waktu", "Sesi / topik", "Tipe", "Demo / Lab"],
    ["1", "09:00–09:15", "Pembukaan, pre-test", "Admin", "Pre-test"],
    ["1", "09:15–10:30", "S1.1 Cloud adoption di sektor energi", "Materi + studi kasus", "–"],
    ["1", "10:45–12:00", "S1.2 Current-state mapping Pertamina", "Workshop", "–"],
    ["1", "13:00–14:00", "S1.3 Azure core concepts dan landing zone", "Materi + demo", "Demo D1"],
    ["1", "14:00–15:00", "S1.4 Tur landing zone", "Lab", "Lab 1"],
    ["1", "15:15–16:00", "Design checkpoint 1", "Workshop", "Design Pack 1–2"],
    ["2", "09:15–10:30", "S2.1 Resource organization dan governance", "Materi + demo", "Demo D2"],
    ["2", "10:45–12:00", "S2.2 Governance in practice", "Lab", "Lab 2A"],
    ["2", "13:00–14:00", "S2.3 Security baseline, cost, operating model", "Materi + demo", "Demo D3"],
    ["2", "14:00–15:00", "S2.4 Cost and security posture", "Lab + workshop", "Lab 2B, RACI"],
    ["2", "15:15–16:00", "Design checkpoint 2", "Workshop", "Design Pack 3–4"],
    ["3", "09:15–10:30", "S3.1 Hybrid identity", "Materi + demo", "Demo D4"],
    ["3", "10:45–11:20", "S3.2a Identity and privileged access", "Lab", "Lab 3A"],
    ["3", "11:20–12:00", "S3.2b Hybrid identity sync (on-prem + Azure)", "Lab", "Lab 3C"],
    ["3", "13:00–14:00", "S3.3 Network topology", "Materi + demo", "Demo D5"],
    ["3", "14:00–15:00", "S3.4 Hub-and-spoke", "Lab", "Lab 3B"],
    ["3", "15:15–16:00", "Design checkpoint 3", "Workshop", "Design Pack 5–6"],
    ["4", "09:15–10:30", "S4.1 Koneksi ke on-premises dan hybrid DNS", "Materi + demo", "Demo D6"],
    ["4", "10:45–12:00", "S4.2 Site-to-site VPN dan hybrid DNS (on-prem + Azure)", "Lab", "Lab 4A"],
    ["4", "13:00–14:00", "S4.3 Operasi lintas dua dunia", "Materi + demo", "Demo D7"],
    ["4", "14:00–15:00", "S4.4 Azure Arc dan monitoring (on-prem + Azure)", "Lab", "Lab 4B"],
    ["4", "15:15–16:00", "Design checkpoint 4", "Workshop", "Design Pack 7–8"],
    ["5", "09:15–10:30", "S5.1 Platform automation", "Demo + lab", "Demo D8, Lab 5A"],
    ["5", "10:45–11:30", "S5.2 Workload onboarding dan readiness", "Materi + demo", "Demo D9"],
    ["5", "11:30–13:00", "Istirahat dan sholat Jumat", "–", "–"],
    ["5", "13:00–14:00", "S5.3 Game day", "Simulasi", "4 inject"],
    ["5", "14:15–15:30", "S5.4 Capstone", "Presentasi", "Rubric"],
    ["5", "15:30–16:00", "Penutupan, post-test, roadmap", "Admin", "Post-test"],
  ]),
  SP(),
  P("**Pola harian:** 09:00–09:15 recap + kuis 5 soal (Hari 2–5) · 10:30–10:45 istirahat · 12:00–13:00 makan siang dan Dzuhur · 15:00–15:15 istirahat dan Ashar · 15:15–16:00 design checkpoint."),
  H2("2.1 Daftar demo"),
  table([0.5, 2, 1, 2.5], [
    ["ID", "Demo", "Sesi", "Yang ditunjukkan"],
    ["D1", "Hierarki landing zone di portal", "S1.3", "Management group tree, subscription, policy assignment, hub VNet"],
    ["D2", "Policy “Allowed locations” menolak deployment", "S2.1", "Deploy ke Southeast Asia ditolak; membaca pesan deny"],
    ["D3", "Defender for Cloud dan Cost Management", "S2.3", "Secure score, satu recommendation, cost analysis per tag"],
    ["D4", "Aktivasi role melalui PIM", "S3.1", "Eligible vs active, approval, audit log"],
    ["D5", "Effective routes dan Next hop", "S3.3", "UDR ke Azure Firewall, Network Watcher next hop"],
    ["D6", "Hybrid DNS end-to-end", "S4.1", "`nslookup` dari on-prem sebelum dan sesudah conditional forwarder"],
    ["D7", "Arc-enabled server", "S4.3", "Server on-prem di portal: extensions, policy, insights"],
    ["D8", "ALZ IaC Accelerator dan pipeline", "S5.1", "Struktur repo, pull request, plan, approval, apply"],
    ["D9", "Azure Migrate assessment", "S5.2", "Discovery, assessment, dependency (screenshot atau recorded)"],
  ]),
  H2("2.2 Daftar lab"),
  table([0.5, 2, 0.8, 0.7, 2], [
    ["Lab", "Judul", "Hari", "Durasi", "Lingkungan"],
    ["1", "Tur landing zone", "1", "60 m", "Azure (Reader)"],
    ["2A", "Governance in practice", "2", "75 m", "Azure"],
    ["2B", "Cost and security posture", "2", "60 m", "Azure"],
    ["3A", "Identity and privileged access", "3", "35 m", "Entra ID"],
    ["3C", "Hybrid identity sync", "3", "40 m", "**On-prem (DC01) + Entra ID**"],
    ["3B", "Hub-and-spoke", "3", "60 m", "Azure"],
    ["4A", "Site-to-site VPN dan hybrid DNS", "4", "75 m", "**On-prem (RTR01, DC01) + Azure hub**"],
    ["4B", "Azure Arc dan monitoring", "4", "60 m", "**On-prem (APP01) + Azure**"],
    ["5A", "Platform automation", "5", "45 m", "Git repo + pipeline"],
  ]),
);

// ---------------------------------------------------------------- 3. Persiapan
c.push(BREAK(), H1("3. Persiapan trainer"),
  H2("3.1 Tim trainer"),
  table([1, 3], [
    ["Peran", "Tanggung jawab"],
    ["Lead trainer", "Menyampaikan materi dan demo, memfasilitasi diskusi, menjaga waktu, memimpin game day dan capstone."],
    ["Co-trainer / lab assistant", "Mendampingi tim saat lab (1 orang untuk 2–3 tim), memantau lingkungan lab, menangani masalah teknis tanpa menghentikan kelas, mencatat pertanyaan di parking lot."],
    ["Sponsor Pertamina (opsional)", "Membuka hari 1, ikut panel “steering committee” pada capstone hari 5."],
  ]),
  SP(),
  P("Untuk 20–30 peserta, rencanakan **minimal 1 lead trainer dan 1 lab assistant**. Hari 3 dan 4 (lab hybrid) sangat disarankan 2 lab assistant."),
  H2("3.2 Timeline persiapan"),
  table([0.9, 3.5], [
    ["Kapan", "Tugas"],
    ["T-21 hari", "Konfirmasi dengan Pertamina: jumlah peserta per role, bahasa slide, ruangan, akses internet (outbound HTTPS ke `*.azure.com`, `*.microsoft.com`, `login.microsoftonline.com`), apakah laptop peserta boleh RDP/Bastion."],
    ["T-14 hari", "Buat training tenant dan subscription. Deploy platform landing zone dengan ALZ IaC Accelerator. Ajukan VM quota di Indonesia Central dan Southeast Asia. Register resource provider: `Microsoft.HybridCompute`, `Microsoft.GuestConfiguration`, `Microsoft.HybridConnectivity`, `Microsoft.Insights`."],
    ["T-10 hari", "Buat akun peserta (`userNN@<tenant>.onmicrosoft.com`), grup per tim, assignment RBAC dan PIM eligibility (lihat 3.3). Kirim instruksi pre-course (Microsoft Learn AZ-900 path)."],
    ["T-7 hari", "Deploy satu lingkungan tim lengkap dan jalankan **semua lab** dari awal sampai akhir (dry run). Rekam video demo dan lab sebagai cadangan."],
    ["T-3 hari", "Siapkan resource “bermasalah” untuk Lab 2A (resource non-compliant) dan data biaya untuk Lab 2B (lihat catatan lab). Cetak kartu inject game day dan Design Pack."],
    ["T-1 hari", "Deploy lingkungan semua tim. Jalankan smoke test: DC01 sehat, RTR01 bisa dijangkau, APP01 sudah disiapkan untuk Arc, DNS Private Resolver dan VPN gateway hub berjalan. Siapkan pre-test di Microsoft Forms."],
    ["Pagi hari H (07:30)", "Start VM lab (auto-shutdown jalan 16:30). Cek proyektor, Wi-Fi, login 2 akun peserta acak, buka semua tab portal untuk demo hari itu."],
  ]),
  H2("3.3 Akun dan akses"),
  table([1.4, 3], [
    ["Akun / role", "Pengaturan"],
    ["Peserta (semua)", "Reader di management group root training. Akun cloud-only di training tenant, **bukan** akun Pertamina."],
    ["Tim N – Build", "Contributor di subscription/resource group spoke tim N. Network Contributor di resource group connectivity sebagai role **eligible** (PIM), hanya untuk jam lab."],
    ["Team lead tim N", "Hybrid Identity Administrator sebagai role **eligible** (PIM), untuk Lab 3C."],
    ["Lingkungan on-prem tim N", "Akun Domain Admin `teamN\\labadmin` di DC01; akun lokal di APP01; SSH ke RTR01. Kredensial dibagikan per tim di kartu tertutup."],
    ["Break-glass trainer", "2 akun Global Administrator cloud-only, dikecualikan dari Conditional Access, password di amplop tertutup."],
  ]),
  H2("3.4 Perlengkapan"),
  B("Proyektor dan layar kedua untuk portal, whiteboard besar, spidol, sticky notes 3 warna (stays / moves / must connect)."),
  B("Kanvas Design Pack ukuran A1 per tim (atau template docx), kartu peran tim, kartu inject game day, rubric capstone."),
  B("Timer yang terlihat semua peserta (untuk time-boxing lab dan game day)."),
  B("Folder cadangan offline: slide PDF, video demo, screenshot hasil lab."),
);

// ---------------------------------------------------------------- 4. Fasilitasi
c.push(BREAK(), H1("4. Panduan fasilitasi audiens campuran"),
  table([1.3, 3], [
    ["Tantangan", "Cara menangani"],
    ["Manager merasa sesi teknis tidak relevan", "Selalu mulai topik teknis dengan **keputusan bisnis** yang dipengaruhinya (biaya, risiko, waktu). Beri manager tugas Operate yang nyata: mereka yang menyetujui PIM request, policy change, dan menulis keputusan di Design Pack."],
    ["Engineer cepat bosan pada hari 1–2", "Minta engineer menjadi “technical advisor” timnya saat workshop. Beri tantangan tambahan Build (custom policy, query KQL)."],
    ["Analyst bingung posisinya", "Analyst memegang angka: biaya, compliance %, KPI. Di setiap checkpoint, analyst yang membacakan dampak biaya dan compliance."],
    ["Diskusi melebar ke masalah internal Pertamina", "Catat di **parking lot** (flipchart di dinding), janjikan dibahas di akhir hari atau di roadmap hari 5."],
    ["Peserta “click-ahead” saat demo", "Minta laptop setengah tertutup saat demo. Demo pendek (5–10 menit) lalu langsung praktik."],
    ["Peserta tertinggal di lab", "Gunakan **lab buddy** (pasangan dalam tim). Lab assistant memegang “jalur cepat”: konfigurasi siap pakai yang bisa ditempel supaya peserta tetap bisa lanjut ke langkah berikutnya."],
    ["Peserta enggan bertanya (budaya hierarki)", "Gunakan pertanyaan tertulis anonim (sticky note / Microsoft Forms) dan diskusi dalam tim kecil sebelum diskusi pleno."],
  ]),
  SP(),
  callout("Aturan kelas yang disampaikan di hari 1", [
    "Lingkungan lab adalah **training tenant**, bukan sistem produksi Pertamina. Jangan memasukkan data atau kredensial asli.",
    "Semua lab memiliki batas waktu. Jika timer habis, lanjut dengan jalur cepat dari lab assistant.",
    "Pertanyaan di luar topik masuk parking lot dan pasti dijawab.",
    "Telepon dalam mode senyap; pesan kerja dibalas saat istirahat.",
  ]),
);

// ---------------------------------------------------------------- DAY 1
c.push(BREAK(), H1("5. Hari 1 – Why and what: strategi cloud dan konsep landing zone"),
  P("**Fokus hari ini:** membangun pemahaman bersama mengapa landing zone harus ada sebelum workload pindah. Tidak ada command line. Semua peserta [ALL]."),
);

c.push(...session({
  id: "S1.0", title: "Pembukaan dan pre-test", time: "09:00–09:15 (pre-test boleh berlanjut sampai 09:30)", type: "Administrasi", audience: "[ALL]",
  objectives: ["Peserta memahami tujuan, aturan, dan cara kerja tim selama 5 hari.", "Mendapat baseline pengetahuan setiap peserta."],
  keyMessages: [
    "Tujuan akhir: Pertamina mampu **memutuskan, mengoperasikan, dan menghubungkan** Azure dengan infrastruktur yang sudah ada.",
    "Hasil nyata training: **Landing Zone Design Pack** per tim yang bisa dipakai di proyek sebenarnya.",
    "Pre-test bukan ujian; hasilnya untuk menyesuaikan kedalaman materi dan dibandingkan dengan post-test.",
  ],
  flow: [
    ["0–5", "Sambutan sponsor Pertamina (jika ada), perkenalan trainer.", "Singkat. Sebutkan bahwa pengalaman peserta di on-prem adalah modal, bukan hambatan."],
    ["5–10", "Pembentukan tim dan pembagian kartu peran.", "Campur role di setiap tim. Hindari satu tim berisi satu divisi saja."],
    ["10–30", "Pre-test (Microsoft Forms, 20 soal).", "Tampilkan QR code. Lab assistant memastikan semua bisa login."],
  ],
  tips: ["Siapkan daftar tim sebelumnya berdasarkan data peserta dari Pertamina supaya pembagian tidak memakan waktu."],
}));

c.push(...session({
  id: "S1.1", title: "Cloud adoption di sektor energi", time: "09:15–10:30", type: "Materi + studi kasus", audience: "[ALL] Executive dan architect level",
  objectives: [
    "Menjelaskan business driver dan constraint adopsi cloud untuk perusahaan energi.",
    "Menjelaskan fase Cloud Adoption Framework (CAF) dan posisi landing zone di dalamnya.",
    "Menjelaskan pergeseran konsep dari on-premises ke Azure.",
  ],
  keyMessages: [
    "**Cloud bukan sekadar data center milik orang lain.** Yang berubah adalah model operasional: siapa mengelola apa (shared responsibility model). Pada IaaS, Microsoft mengelola fisik, hypervisor, dan jaringan fisik; Pertamina tetap mengelola OS, aplikasi, data, identitas, NSG, dan firewall rules.",
    "**CAF terdiri dari tiga kelompok:** (1) fondasi – Strategy, Plan, Ready; (2) standar operasional – Govern, Secure, Manage; (3) onboarding workload – Migrate, Modernize, Cloud-native. **Landing zone adalah hasil fase Ready**, dan harus siap sebelum Migrate.",
    "**Pergeseran konsep yang perlu diterima engineer on-prem** (gunakan tabel di bawah). Tekankan bahwa hampir semua yang mereka kenal punya padanan di Azure, tetapi berbentuk software-defined dan dikelola lewat API.",
    "**Driver Pertamina:** agility proyek, data dan AI, resilience, efisiensi biaya. **Constraint:** residensi data (UU 27/2022 PDP, PP 71/2019 sebagai kerangka diskusi – interpretasi final oleh legal Pertamina), pemisahan OT/IT (sistem SCADA/DCS tetap di jaringan OT), audit BUMN.",
    "**Risiko terbesar adalah adopsi tanpa fondasi** (shadow IT): subscription dibuat per proyek, IP bentrok dengan on-prem, tidak ada logging terpusat, biaya tidak bisa dialokasikan.",
  ],
  extra: [
    H3("Tabel pergeseran konsep (tampilkan di slide)"),
    table([1.5, 1.5, 2], [
      ["On-premises", "Azure", "Perbedaan utama"],
      ["Segmen jaringan fisik / VLAN", "Virtual network / subnet", "Software-defined, tanpa batas fisik"],
      ["ACL di switch", "Network Security Group (NSG)", "Stateful, dipasang di subnet atau NIC"],
      ["Firewall fisik", "Azure Firewall / NVA di hub", "Layanan, bukan hardware"],
      ["Static route", "User-defined route (UDR)", "Dipasang di subnet"],
      ["Group Policy", "Azure Policy (+ Intune untuk endpoint)", "Mengatur resource Azure, bukan OS"],
      ["Kapasitas untuk beban puncak", "Kapasitas rata-rata + scale out", "Bayar sesuai pemakaian"],
      ["Warm standby di rak kedua", "Redeploy dari template / replikasi", "Reliability berbasis SLA dan design"],
      ["Patch server di tempat", "Ganti image yang sudah di-patch", "Server sebagai “cattle”, bukan “pet”"],
    ]),
  ],
  flow: [
    ["0–10", "Pembuka: polling “Siapa sudah pernah memakai Azure / cloud lain?”", "Gunakan angkat tangan atau Forms. Sesuaikan kedalaman."],
    ["10–30", "CAF dan posisi landing zone.", "Gambar tiga kelompok fase di whiteboard. Tandai “Ready = landing zone”."],
    ["30–50", "Shared responsibility dan tabel pergeseran konsep.", "Minta engineer memberi contoh nyata dari pekerjaan mereka untuk setiap baris."],
    ["50–65", "Studi kasus shadow IT (lihat di bawah).", "Diskusi tim 7 menit, lalu 2 tim berbagi."],
    ["65–75", "Konteks Pertamina: driver dan constraint.", "Tutup dengan pertanyaan diskusi untuk dibawa ke S1.2."],
  ],
  tips: [
    "**Studi kasus (fiktif, sampaikan sebagai cerita):** Sebuah perusahaan energi membiarkan 3 proyek membuat subscription sendiri. Proyek A memakai 10.10.0.0/16 yang ternyata sama dengan jaringan kilang. Proyek B membuka RDP ke internet. Proyek C tidak mengirim log ke mana pun. Enam bulan kemudian, saat VPN ke data center dipasang, proyek A tidak bisa terhubung, proyek B diserang brute force, dan tim audit tidak dapat bukti akses. Tanyakan: **keputusan apa yang seharusnya dibuat sebelum proyek pertama mulai?**",
    "Jangan masuk ke detail regulasi. Posisikan trainer sebagai fasilitator; keputusan hukum milik legal dan compliance Pertamina.",
  ],
  qa: [
    ["Apakah data kita aman di cloud?", "Keamanan adalah tanggung jawab bersama. Microsoft mengamankan fisik dan platform; Pertamina mengamankan identitas, konfigurasi, dan data. Ada region Indonesia Central (Jakarta), enkripsi dengan customer-managed key, dan opsi Sovereign Landing Zone. Kita bahas detail di hari 2."],
    ["Apakah cloud pasti lebih murah?", "Tidak otomatis. Lift-and-shift tanpa right-sizing sering lebih mahal. Penghematan datang dari scale on demand, reservasi, dan mematikan resource yang tidak dipakai. FinOps dibahas di hari 2."],
    ["Bagaimana dengan sistem OT/SCADA?", "Umumnya tetap on-prem di jaringan OT. Yang terhubung ke cloud biasanya data hasil (historian, laporan) melalui zona DMZ yang dikontrol. Landing zone harus menjaga pemisahan ini."],
  ],
  transition: "“Sekarang kita lihat seperti apa estate Pertamina hari ini, dan apa yang perlu terhubung.”",
  refs: [
    ["Fundamentals of Azure for on-premises experts", `${ML}/azure/migration/migrate-from-on-premises-fundamentals`],
    ["Why Azure? – How to adopt Azure (CAF phases)", `${ML}/azure/cloud-adoption-framework/why-azure`],
  ],
}));

c.push(...session({
  id: "S1.2", title: "Workshop current-state mapping", time: "10:45–12:00", type: "Workshop tim", audience: "[ALL]",
  materials: "Kanvas A1 per tim, sticky notes 3 warna",
  objectives: ["Setiap tim memetakan estate IT Pertamina dan mengelompokkan komponen: stays on-prem / moves / must connect."],
  keyMessages: [
    "Peta ini menjadi bagian 1 Design Pack dan dipakai sepanjang minggu.",
    "Yang paling sering terlupa adalah **layanan pendukung**: identitas (AD), DNS, monitoring, ITSM, backup, PKI/sertifikat, NTP. Semua ini menentukan desain hybrid.",
    "Batas OT/IT harus digambar jelas.",
  ],
  flow: [
    ["0–10", "Instruksi dan contoh kanvas yang sudah terisi sebagian.", "Tunjukkan 3 kolom dan legenda warna."],
    ["10–50", "Tim mengisi kanvas.", "Trainer berkeliling. Ajukan prompt: “Aplikasi ini login pakai apa?”, “DNS-nya di mana?”, “Siapa yang dapat alert jika mati?”"],
    ["50–70", "Gallery walk: tiap tim 3 menit presentasi.", "Catat pola yang sama di whiteboard (contoh: semua tim menyebut AD dan SAP)."],
    ["70–75", "Rangkuman: komponen “must connect” = kebutuhan hybrid kita.", "Hubungkan ke hari 3–4."],
  ],
  tips: [
    "Jika tim hanya menulis aplikasi, minta mereka menambahkan minimal 5 layanan infrastruktur.",
    "Jika peserta tidak boleh membuka detail sistem asli, gunakan nama generik (contoh: “ERP”, “Historian kilang”).",
    "Tanyakan: “Apakah Pertamina membangun platform baru, memperbaiki platform parsial, atau memvalidasi platform yang sudah matang?” Jawaban ini menentukan titik awal.",
  ],
}));

c.push(...session({
  id: "S1.3", title: "Azure core concepts dan landing zone", time: "13:00–14:00", type: "Materi + demo", audience: "[ALL]",
  objectives: [
    "Menjelaskan hierarki Azure: tenant, management group, subscription, resource group, resource.",
    "Menjelaskan region dan availability zone, termasuk Indonesia Central.",
    "Membedakan platform landing zone dan workload landing zone serta 8 design area.",
  ],
  keyMessages: [
    "**Hierarki:** policy dan RBAC yang dipasang di management group **diturunkan** ke semua subscription di bawahnya. Inilah cara governance diskalakan.",
    "**Indonesia Central (Jakarta)** memiliki 3 availability zone dan **tidak memiliki paired region**. Artinya resiliensi dalam negeri bisa dicapai dengan zone-redundant; DR lintas region harus didesain sendiri (dibahas hari 4).",
    "**Tenant dan billing:** EA, MCA, atau CSP menentukan cara kontrak dan pelaporan biaya. Satu tenant Entra ID untuk seluruh organisasi adalah rekomendasi umum.",
    "**Platform landing zone** (milik platform team, dibangun sekali, dipakai bersama: identity, management, connectivity) vs **workload landing zone** (per aplikasi, milik tim aplikasi).",
    "**Archetype:** Corp (butuh koneksi ke jaringan korporat melalui hub), Online (akses internet langsung), Sandbox (eksperimen, terputus dari corp), Decommissioned.",
    "**8 design area:** billing & tenant, identity & access, resource organization, network & connectivity, security, management, governance, platform automation & DevOps. Seluruh minggu ini mengikuti 8 area tersebut.",
    "**Minimum viable platform landing zone:** management group hierarchy, baseline policy, hub network dengan koneksi hybrid, DNS yang menjangkau on-prem, identitas sesuai workload, central logging, dan firewall. Mulai dari sini.",
  ],
  demo: {
    id: "D1", title: "Hierarki landing zone di portal",
    prep: "Login sebagai akun trainer Reader. Buka tab: Management groups, Policy > Assignments, Virtual networks (hub), Log Analytics workspaces.",
    steps: [
      "Buka **Management groups**, expand tree. Jelaskan Platform (Identity, Management, Connectivity) vs Landing Zones (Corp, Online) vs Sandbox.",
      "Klik management group Corp > **Policies**. Tunjukkan bahwa assignment diwarisi dari level atas (kolom Scope).",
      "Buka subscription Connectivity > hub VNet > **Peerings** dan **Subnets** (AzureFirewallSubnet, GatewaySubnet).",
      "Buka Log Analytics workspace di subscription Management. Sebutkan bahwa semua diagnostic settings diarahkan ke sini oleh policy.",
    ],
    say: "“Inilah fondasi yang dibangun sekali oleh platform team. Setiap proyek baru cukup meminta subscription, dan langsung mewarisi semua aturan ini.”",
  },
  qa: [
    ["Kenapa tidak satu subscription saja untuk semua?", "Subscription adalah batas skala, biaya, dan akses. Satu subscription untuk semua membuat RBAC, biaya, dan limit sulit dikelola."],
    ["Apa bedanya resource group dan subscription?", "Resource group adalah wadah lifecycle (dibuat dan dihapus bersama). Subscription adalah batas billing, kuota, dan unit governance."],
  ],
  refs: [
    ["Azure landing zone design areas", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/design-areas`],
    ["Azure regions list", `${ML}/azure/reliability/regions-list`],
    ["Tailor the ALZ architecture (archetypes)", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/tailoring-alz`],
  ],
}));

c.push(...session({
  id: "S1.4", title: "Tur landing zone", time: "14:00–15:00", type: "Lab", audience: "[ALL] Operate level (Reader)",
  objectives: ["Semua peserta mampu menavigasi portal dan menemukan komponen utama landing zone."],
  keyMessages: ["Peserta non-teknis harus merasa nyaman di portal. Ini modal untuk lab Operate di hari berikutnya."],
  lab: {
    id: "1", title: "Tur landing zone (scavenger hunt)",
    build: "Sama dengan Operate, ditambah: temukan alamat IP privat Azure Firewall dan route table yang memakainya.",
    operate: "Jawab 8 pertanyaan: jumlah management group; policy yang melarang public IP; address space hub; nama Log Analytics workspace; siapa Owner subscription Connectivity; region yang diizinkan; tag wajib; budget yang aktif.",
    notes: [
      "Siapkan kunci jawaban dari lingkungan yang sebenarnya pada T-1.",
      "Tim pertama yang menjawab semua benar mendapat poin bonus untuk capstone.",
      "Pastikan setiap peserta login sendiri; jangan satu laptop per tim.",
    ],
    issues: [
      ["Peserta tidak melihat management group", "Role Reader belum diwariskan atau peserta belum refresh token. Minta sign out dan sign in ulang."],
      ["Portal menampilkan direktori yang salah", "Peserta login ke tenant lain. Gunakan Settings > Directories untuk pindah ke training tenant."],
    ],
  },
}));

c.push(...session({
  id: "CP1", title: "Design checkpoint 1", time: "15:15–16:00", type: "Workshop", audience: "[ALL]",
  objectives: ["Tim mengisi Design Pack bagian 1 (scope, constraint, current state) dan bagian 2 (tenant dan billing)."],
  keyMessages: [
    "Setiap keputusan ditulis dengan format: **Keputusan – Alasan – Pemilik – Risiko**.",
    "Platform Owner (manager) yang menandatangani keputusan tim.",
  ],
  flow: [
    ["0–30", "Tim mengisi Design Pack.", "Trainer memberi feedback singkat per tim (3–4 menit)."],
    ["30–45", "Recap hari 1, parking lot, preview hari 2.", "Kumpulkan 1 pertanyaan anonim per peserta untuk dijawab besok pagi."],
  ],
}));

// ---------------------------------------------------------------- DAY 2
c.push(BREAK(), H1("6. Hari 2 – Govern before you build"),
  P("**Fokus hari ini:** governance, security, dan biaya. Semua lab di level Operate (Reader) sehingga semua peserta aktif. Tambahan Build untuk engineer."),
);

c.push(...session({
  id: "S2.1", title: "Resource organization dan governance", time: "09:15–10:30", type: "Materi + demo", audience: "[ALL]",
  objectives: [
    "Mendesain management group hierarchy, model subscription, serta naming dan tagging standard.",
    "Menjelaskan Azure Policy (effect, initiative, assignment, exemption) dan RBAC.",
  ],
  keyMessages: [
    "**Management group:** desain berdasarkan **perbedaan aturan**, bukan struktur organisasi. Dua unit bisnis dengan aturan yang sama sebaiknya berada di management group yang sama.",
    "**Subscription vending:** proses standar ketika tim aplikasi meminta subscription – otomatis ditempatkan di management group yang benar, dengan network, RBAC, budget, dan tag awal.",
    "**Naming dan tagging:** contoh tag wajib untuk Pertamina: `CostCenter`, `Owner`, `Environment`, `DataClassification`, `BusinessUnit`. Tag menjadi dasar showback biaya.",
    "**Azure Policy effects:** Audit (catat), Deny (tolak), DeployIfNotExists dan Modify (perbaiki otomatis). **Initiative** = kumpulan policy. **Exemption** = pengecualian resmi yang punya pemilik dan tanggal kedaluwarsa.",
    "**Baseline policy saat migrasi:** larang public exposure yang tidak dikelola, wajibkan diagnostic settings ke central logging, dan batasi region (allowed locations). Jika ada kebutuhan residensi data, allowed locations adalah **compliance control**, bukan sekadar kesiapan.",
    "**RBAC:** Owner, Contributor, Reader + role spesifik. Berikan akses ke **grup Entra ID**, bukan ke individu. Least privilege.",
    "**Sovereign Landing Zone** adalah varian dengan kontrol kedaulatan tambahan. Microsoft menyarankan memakainya hanya jika kebutuhan sovereignty sudah dikonfirmasi.",
  ],
  demo: {
    id: "D2", title: "Policy “Allowed locations” menolak deployment",
    prep: "Pastikan policy allowed locations (Indonesia Central saja) sudah ter-assign di management group Landing Zones. Siapkan subscription demo di bawahnya.",
    steps: [
      "Buat storage account di region **Southeast Asia** melalui portal.",
      "Klik Create. Tunjukkan error validasi **RequestDisallowedByPolicy** dan nama policy-nya.",
      "Buka Policy > Assignments > allowed locations. Tunjukkan scope dan parameter region.",
      "Ulangi deployment di Indonesia Central – berhasil.",
    ],
    say: "“Policy bekerja seperti satpam di pintu masuk. Engineer tidak perlu menghafal semua aturan; platform yang menegakkannya.”",
  },
  qa: [
    ["Kenapa tidak semua policy langsung Deny?", "Mulai dengan Audit untuk melihat dampak, komunikasikan ke tim, lalu naikkan ke Deny. Deny mendadak bisa menghentikan proyek yang sedang berjalan."],
    ["Bagaimana jika proyek butuh region lain untuk DR?", "Gunakan exemption yang terdokumentasi atau management group khusus dengan aturan berbeda. Keputusan ini dicatat di Design Pack."],
  ],
  refs: [
    ["Management groups design area", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-management-groups`],
    ["Subscription vending", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending`],
    ["Sovereign Landing Zone overview", `${ML}/azure/azure-sovereign-clouds/public/overview-sovereign-landing-zone`],
  ],
}));

c.push(...session({
  id: "S2.2", title: "Governance in practice", time: "10:45–12:00", type: "Lab", audience: "[ALL] Operate; Build tambahan untuk TECH",
  objectives: ["Membaca compliance dashboard dan menelusuri penyebab non-compliance."],
  keyMessages: ["Compliance adalah proses berkelanjutan: temukan, tentukan pemilik, perbaiki atau buat exemption."],
  lab: {
    id: "2A", title: "Governance in practice",
    build: "Menulis custom policy (contoh: wajib tag `CostCenter` pada resource group) dalam JSON, assign dengan effect Audit di subscription tim, lalu jalankan remediation untuk policy Modify.",
    operate: "Membuka Policy > Compliance, mencari resource non-compliant, membaca alasan, dan menelusuri effective role assignment di Access control (IAM).",
    notes: [
      "**Penting:** evaluasi policy setelah assignment baru bisa memakan waktu hingga sekitar 30 menit. Buat resource non-compliant pada T-3 supaya dashboard sudah berisi data saat lab.",
      "Untuk memaksa evaluasi saat demo: `az policy state trigger-scan --resource-group <rg>`.",
      "Manager mencatat: berapa persen compliance, siapa pemilik resource, dan keputusan perbaikannya.",
    ],
    issues: [
      ["Compliance masih “Not started”", "Evaluasi belum berjalan. Gunakan resource yang sudah disiapkan T-3 atau trigger scan."],
      ["Custom policy JSON gagal disimpan", "Cek struktur `if/then` dan `mode` (Indexed vs All). Tag pada resource group memerlukan `mode: All`."],
    ],
  },
}));

c.push(...session({
  id: "S2.3", title: "Security baseline, cost, dan operating model", time: "13:00–14:00", type: "Materi + demo", audience: "[ALL]",
  objectives: [
    "Menjelaskan Zero Trust dan security baseline landing zone.",
    "Menjelaskan dasar FinOps dan operating model platform team.",
  ],
  keyMessages: [
    "**Zero Trust:** verify explicitly, least privilege, assume breach. Di cloud, **identitas adalah perimeter utama**, bukan firewall.",
    "**Microsoft Defender for Cloud:** secure score dan recommendation untuk mengukur postur. **Key Vault** untuk secret dan sertifikat; gunakan **managed identity** daripada menyimpan password.",
    "**Microsoft Sentinel** dan SOC Pertamina: tentukan apakah log Azure dikirim ke SIEM yang ada atau Sentinel menjadi SIEM baru. Yang penting: setiap alert punya **jalur triage dan pemilik**.",
    "**FinOps:** budget dan alert di level management group/subscription sejak awal, reservations dan savings plan untuk beban stabil, tag untuk showback/chargeback. Jangan menunda landing zone karena desain chargeback yang sempurna.",
    "**Operating model:** Cloud Center of Excellence (CCoE) dan platform team memiliki fondasi; tim aplikasi memiliki workload. CAF Manage memakai pendekatan RAMP: Ready, Administer, Monitor, Protect.",
  ],
  demo: {
    id: "D3", title: "Defender for Cloud dan Cost Management",
    prep: "Subscription demo yang sudah berjalan minimal 2–3 hari (data biaya butuh waktu muncul). Defender CSPM foundational aktif.",
    steps: [
      "Defender for Cloud > Overview: tunjukkan **secure score** dan cara membacanya.",
      "Buka satu recommendation (contoh: VM dengan management port terbuka). Tunjukkan resource terdampak dan langkah remediasi.",
      "Cost Management > Cost analysis: group by tag `CostCenter`. Tunjukkan resource tanpa tag sebagai “untagged”.",
      "Budgets: tunjukkan budget dengan alert 80% dan 100%.",
    ],
    say: "“Security dan biaya bukan proyek sekali jalan. Keduanya dipantau setiap minggu oleh pemilik yang jelas.”",
  },
  qa: [
    ["Apakah kita harus pakai Sentinel?", "Tidak wajib. Jika SOC sudah memakai SIEM lain, log Azure bisa dikirim ke sana. Keputusan tergantung biaya, skill SOC, dan integrasi."],
    ["Siapa yang membayar firewall hub dan ExpressRoute?", "Ini keputusan operating model. Umumnya biaya platform ditanggung pusat atau dialokasikan proporsional. Dicatat di Design Pack."],
  ],
  refs: [
    ["CAF Secure methodology overview", `${ML}/azure/cloud-adoption-framework/secure/overview`],
    ["Ready your Azure cloud operations (RAMP)", `${ML}/azure/cloud-adoption-framework/manage/ready-cloud-operations`],
  ],
}));

c.push(...session({
  id: "S2.4", title: "Cost and security posture + RACI", time: "14:00–15:00", type: "Lab + workshop", audience: "[ALL]",
  objectives: ["Membuat budget, membaca biaya per tag, dan menyusun RACI platform."],
  keyMessages: ["RACI menjawab pertanyaan “siapa yang dibangunkan jam 2 pagi?” untuk setiap komponen platform."],
  lab: {
    id: "2B", title: "Cost and security posture",
    build: "Membuat remediation task untuk tag yang hilang dan memeriksa hasilnya.",
    operate: "Cost analysis per tag, membuat budget dengan alert, membaca secure score, lalu workshop RACI (20 menit) memakai template.",
    notes: [
      "Data biaya baru muncul beberapa jam setelah pemakaian. Gunakan subscription demo yang sudah berjalan beberapa hari, atau screenshot sebagai cadangan.",
      "RACI minimal mencakup: management group dan policy, hub network, VPN/ExpressRoute, DNS, identity sync, logging, backup, patching, incident response, biaya.",
    ],
  },
}));

c.push(...session({
  id: "CP2", title: "Design checkpoint 2", time: "15:15–16:00", type: "Workshop", audience: "[ALL]",
  objectives: ["Design Pack bagian 3 (hierarchy dan subscription model) dan bagian 4 (policy, security, biaya, RACI)."],
  keyMessages: ["Pertanyaan pemicu: data apa yang wajib tetap di Indonesia? Apakah allowed locations langsung Deny? Bagaimana alert Azure sampai ke SOC?"],
}));

// ---------------------------------------------------------------- DAY 3
c.push(BREAK(), H1("7. Hari 3 – Identity dan network: menghubungkan ke estate yang ada"),
  P("**Fokus hari ini:** mulai teknis. Engineer mengerjakan Build, manager dan analyst tetap mengikuti konsep dan mengerjakan Operate. Hari ini lab hybrid pertama (3C) berjalan."),
  callout("Cek pagi hari 3 (07:30–08:30)", [
    "Semua DC01 tim berjalan dan domain sehat (`Get-ADDomain` berhasil).",
    "DC01 bisa keluar ke internet melalui RTR01 (`Test-NetConnection login.microsoftonline.com -Port 443`).",
    "Role Hybrid Identity Administrator sudah **eligible** untuk setiap team lead di PIM.",
    "Installer Cloud Sync agent sudah diunduh ke `C:\\LabFiles` di setiap DC01 (menghemat waktu lab).",
  ], WARN),
);

c.push(...session({
  id: "S3.1", title: "Hybrid identity", time: "09:15–10:30", type: "Materi + demo", audience: "[ALL]",
  objectives: [
    "Memilih model hybrid identity yang tepat.",
    "Menjelaskan MFA, Conditional Access, PIM, dan emergency access.",
  ],
  keyMessages: [
    "**Empat keputusan identitas sebelum workload pertama:** (1) akses admin platform, (2) identitas workload/mesin (managed identity, service principal), (3) workload yang masih bergantung pada AD lama (Kerberos, LDAP, Group Policy), (4) workload cloud-native.",
    "**Entra Connect Sync vs Cloud Sync:** Cloud Sync memakai agent ringan, konfigurasi dikelola dari cloud, mendukung beberapa agent aktif (high availability) dan **disconnected forests**. Batasan Cloud Sync: sekitar 150.000 objek per domain dan grup hingga 50.000 anggota. Microsoft mengarahkan fitur baru ke Cloud Sync.",
    "**Metode sign-in:** Password Hash Sync (paling sederhana dan tahan gangguan on-prem), Pass-through Authentication, atau federation (AD FS). Rekomendasi umum: PHS sebagai baseline.",
    "**Conditional Access** menggantikan logika “di dalam jaringan = dipercaya”. **PIM** memberi hak admin just-in-time dengan approval dan audit.",
    "**Break-glass:** minimal 2 akun cloud-only, dikecualikan dari Conditional Access, dipantau setiap kali dipakai.",
    "**Pesan untuk hybrid:** sinkronisasi identitas **tidak memerlukan VPN**. Agent hanya butuh outbound HTTPS. Ini akan dibuktikan di Lab 3C.",
  ],
  demo: {
    id: "D4", title: "Aktivasi role melalui PIM",
    prep: "Akun demo dengan role eligible (contoh: Network Contributor di resource group demo) dan approver = akun trainer kedua.",
    steps: [
      "Entra admin center > Identity Governance > Privileged Identity Management > My roles. Tunjukkan role **Eligible**.",
      "Klik Activate, isi justification dan durasi.",
      "Pindah ke akun approver, setujui request.",
      "Kembali ke akun demo: role sekarang **Active** dengan waktu kedaluwarsa. Tunjukkan audit history.",
    ],
    say: "“Tidak ada lagi admin permanen. Hak diberikan saat dibutuhkan, dengan alasan, dan tercatat.”",
  },
  qa: [
    ["Apakah AD on-prem akan hilang?", "Tidak dalam waktu dekat. Selama ada aplikasi yang butuh Kerberos/LDAP/Group Policy, AD tetap ada. Entra ID menjadi identitas untuk cloud dan aplikasi modern."],
    ["Kami sudah punya Entra Connect untuk Microsoft 365. Perlu pindah ke Cloud Sync?", "Tidak wajib segera. Evaluasi dengan decision guide Microsoft. Jangan menjalankan dua sistem sync untuk objek yang sama tanpa rencana migrasi."],
    ["Perlukah domain controller di Azure?", "Hanya jika workload yang dipindah butuh autentikasi AD dengan latensi rendah atau harus tetap jalan saat link ke on-prem putus."],
  ],
  refs: [
    ["What is Microsoft Entra Cloud Sync?", `${ML}/entra/identity/hybrid/cloud-sync/what-is-cloud-sync`],
    ["Connect Sync to Cloud Sync decision guide", `${ML}/entra/identity/hybrid/cloud-sync/connect-to-cloud-sync-decision-guide`],
    ["Identity and access management design area", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/design-area/identity-access`],
  ],
}));

c.push(...session({
  id: "S3.2a", title: "Identity and privileged access", time: "10:45–11:20", type: "Lab", audience: "Build + Operate",
  objectives: ["Mengonfigurasi akses berbasis grup dan PIM, serta menyiapkan role untuk Lab 3C."],
  keyMessages: ["Lab ini diakhiri dengan aktivasi Hybrid Identity Administrator oleh team lead; tanpa itu Lab 3C tidak bisa berjalan."],
  lab: {
    id: "3A", title: "Identity and privileged access",
    build: "Assign role ke grup tim, buat role eligible di PIM, buat Conditional Access policy dalam mode **report-only**, lalu team lead mengaktifkan Hybrid Identity Administrator.",
    operate: "Membaca sign-in logs, menyetujui PIM request dari engineer tim (manager sebagai approver).",
    notes: [
      "Conditional Access **harus report-only**. Policy aktif yang salah bisa mengunci semua peserta.",
      "Aktivasi PIM bisa butuh beberapa menit sampai berlaku. Minta peserta sign out dan sign in ulang jika role belum terlihat.",
      "Waktu ketat (35 menit). Pada menit ke-30, pastikan semua team lead sudah aktif sebagai Hybrid Identity Administrator.",
    ],
    issues: [
      ["Role sudah diaktifkan tetapi akses ditolak", "Token lama. Sign out, tutup browser, sign in ulang."],
      ["Approval request tidak muncul", "Approver salah atau notifikasi tertunda. Buka PIM > Approve requests secara manual."],
    ],
  },
}));

c.push(...session({
  id: "S3.2b", title: "Hybrid identity sync (on-prem + Azure)", time: "11:20–12:00", type: "Lab hybrid", audience: "Build + Operate",
  objectives: ["Menyinkronkan user dari AD on-prem tim ke Entra ID dengan Cloud Sync, lalu login dengan akun tersebut."],
  keyMessages: [
    "Ini pertama kalinya peserta menghubungkan on-prem dan cloud. Tekankan bahwa jalurnya **hanya outbound HTTPS** dari DC01 melalui RTR01 (internet edge on-prem), tanpa VPN.",
    "Provision on demand mengabaikan scoping filter – berguna untuk tes, tetapi jangan dianggap bukti bahwa scoping sudah benar.",
  ],
  lab: {
    id: "3C", title: "Hybrid identity sync",
    build: "Di DC01: jalankan installer agent dari `C:\\LabFiles`, sign in dengan akun team lead (Hybrid Identity Administrator aktif), biarkan wizard membuat gMSA. Di Entra admin center > Entra ID > Entra Connect > Cloud sync: buat configuration untuk domain `teamN.corp.local`, scope ke OU `Sync-Users`, pastikan password hash sync aktif. Jalankan **Provision on demand** dengan distinguished name user, contoh `CN=Budi Santoso,OU=Sync-Users,DC=team1,DC=corp,DC=local`. Login ke portal dengan user tersebut.",
    operate: "Entra admin center > Cloud sync: cek status agent (healthy), buka provisioning logs, catat berapa user tersinkron dan apakah ada error.",
    notes: [
      "Hasil sukses provision on demand: **empat tanda centang hijau**.",
      "Domain `.local` tidak bisa diverifikasi di Entra ID, sehingga user tersinkron dengan UPN `nama@<tenant>.onmicrosoft.com`. Jadikan ini teaching point: di Pertamina, tambahkan UPN suffix yang routable dan terverifikasi (contoh domain email perusahaan) sebelum sinkronisasi.",
      "Semua tim memakai tenant yang sama dengan forest berbeda – ini contoh nyata **disconnected forests**, skenario yang umum saat merger/akuisisi atau anak perusahaan.",
      "Jika waktu habis, lab assistant menunjukkan hasil dari lingkungan “golden team”.",
    ],
    issues: [
      ["Installer gagal membuat gMSA (KDS)", "KDS root key belum ada atau belum efektif. Script setup sudah membuatnya; cek dengan `Get-KdsRootKey`. Jika kosong: `Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10))`."],
      ["Wizard menolak akun saat sign in", "Role Hybrid Identity Administrator belum aktif atau akun adalah guest. Aktifkan ulang di PIM."],
      ["Agent tidak muncul / unhealthy", "Outbound 443 dari DC01 terblokir. Cek RTR01 (NAT) dan `Test-NetConnection login.microsoftonline.com -Port 443`."],
      ["Provision on demand gagal pada langkah import", "Distinguished name salah ketik. Salin dari Active Directory Users and Computers > Attribute Editor."],
      ["User bisa disinkron tetapi tidak bisa login", "Password hash sync belum aktif atau belum jalan. Tunggu siklus sync atau reset password user di AD lalu provision on demand lagi."],
    ],
  },
  refs: [
    ["Cloud Sync prerequisites", `${ML}/entra/identity/hybrid/cloud-sync/how-to-prerequisites`],
    ["On-demand provisioning (AD to Entra ID)", `${ML}/entra/identity/hybrid/cloud-sync/how-to-on-demand-provision`],
  ],
}));

c.push(...session({
  id: "S3.3", title: "Network topology", time: "13:00–14:00", type: "Materi + demo", audience: "[ALL]",
  objectives: [
    "Memilih antara hub-and-spoke dan Virtual WAN.",
    "Menyusun IP plan yang tidak bentrok dengan on-prem.",
    "Menjelaskan pola ingress, egress, dan inspeksi trafik.",
  ],
  keyMessages: [
    "**Hub-and-spoke:** kontrol penuh, cocok untuk sebagian besar organisasi. **Virtual WAN:** layanan terkelola untuk banyak cabang/region dan transit global. Pilih berdasarkan jumlah site, region, dan kebutuhan kontrol.",
    "**IP plan adalah keputusan yang paling mahal jika salah.** Address space Azure tidak boleh bentrok dengan on-prem, cabang, atau mitra. Minta tim network Pertamina menyediakan blok khusus (contoh: satu /16 untuk Azure).",
    "**NSG** (filter L3/L4 di subnet/NIC) vs **Azure Firewall** (inspeksi terpusat, FQDN filtering, threat intelligence). Keduanya dipakai bersama.",
    "**Ingress yang disetujui:** Application Gateway (WAF), Front Door, Azure Firewall DNAT, Bastion untuk admin. **Egress:** Azure Firewall, NAT Gateway, UDR ke hub.",
    "**Private Link / private endpoint** agar PaaS (storage, SQL) diakses lewat IP privat, tidak lewat internet.",
    "**Forced tunneling** (semua internet lewat on-prem) umumnya antipattern: menambah latensi dan ketergantungan ke link on-prem. Gunakan hanya jika ada kewajiban compliance yang tidak bisa dipenuhi dengan cara lain.",
    "**Default outbound access:** VNet baru (setelah 30 September 2025) tidak lagi mendapat akses internet implisit. Setiap subnet butuh metode egress eksplisit. Ini juga alasan RTR01 di lab berfungsi sebagai internet edge on-prem.",
    "**OT tetap terpisah.** Jaringan OT tidak di-peer ke landing zone; data OT keluar melalui DMZ terkontrol.",
  ],
  demo: {
    id: "D5", title: "Effective routes dan Next hop",
    prep: "VM di spoke demo yang subnetnya punya UDR 0.0.0.0/0 ke Azure Firewall.",
    steps: [
      "Buka NIC VM > **Effective routes**. Tunjukkan route default sistem, route peering ke hub, dan UDR ke IP firewall.",
      "Network Watcher > **Next hop**: dari VM ke 8.8.8.8 → hasil VirtualAppliance (firewall).",
      "Next hop ke IP spoke lain → juga melalui firewall (inspeksi east-west).",
    ],
    say: "“Di Azure, routing bisa dilihat dan diverifikasi tanpa traceroute. Ini alat pertama saat troubleshooting.”",
  },
  qa: [
    ["Bisakah kami pakai firewall vendor yang sama dengan on-prem?", "Bisa, sebagai NVA di hub. Pertimbangkan biaya lisensi, HA, dan skill. Azure Firewall lebih sederhana dioperasikan."],
    ["Berapa besar address space yang perlu dicadangkan?", "Rencanakan untuk 3–5 tahun. Lebih mudah mencadangkan blok besar sekarang daripada memperluas nanti."],
  ],
  refs: [
    ["Network topology and connectivity design area", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/design-area/network-topology-and-connectivity`],
    ["Azure landing zones for on-premises experts", `${ML}/azure/migration/migrate-from-on-premises-platform-landing-zone`],
  ],
}));

c.push(...session({
  id: "S3.4", title: "Hub-and-spoke", time: "14:00–15:00", type: "Lab", audience: "Build + Operate",
  objectives: ["Menghubungkan spoke tim ke hub dan mengarahkan trafik melalui Azure Firewall."],
  keyMessages: ["Hub yang dibangun di lab ini adalah hub yang besok dipakai untuk VPN ke on-prem."],
  lab: {
    id: "3B", title: "Hub-and-spoke",
    build: "Membuat peering spoke–hub (dua arah, use remote gateway aktif di sisi spoke), membuat route table dengan 0.0.0.0/0 ke IP Azure Firewall, memverifikasi dengan Next hop.",
    operate: "Melihat topology di Network Watcher, membaca firewall logs di Log Analytics dengan query yang sudah disediakan.",
    notes: [
      "Peering sisi hub dikerjakan trainer (tim tidak punya akses ke hub kecuali melalui PIM). Siapkan script untuk sisi hub.",
      "**Use remote gateways** di sisi spoke harus aktif supaya besok spoke bisa menjangkau on-prem melalui VPN gateway hub.",
    ],
    issues: [
      ["Peering status “Initiated”", "Sisi hub belum dibuat. Trainer jalankan script peering hub."],
      ["VM spoke tidak bisa keluar internet", "Rule Azure Firewall belum mengizinkan. Gunakan rule collection lab yang sudah disiapkan."],
    ],
  },
}));

c.push(...session({
  id: "CP3", title: "Design checkpoint 3", time: "15:15–16:00", type: "Workshop", audience: "[ALL]",
  objectives: ["Design Pack bagian 5 (identity) dan bagian 6 (topology dan IP plan)."],
  keyMessages: ["Pertanyaan pemicu: aplikasi mana yang masih butuh Kerberos/LDAP? Siapa pemilik IP plan Azure? Internet dari Azure keluar lokal atau kembali ke on-prem?"],
}));

// ---------------------------------------------------------------- DAY 4
c.push(BREAK(), H1("8. Hari 4 – Hybrid connectivity dan operasi"),
  P("**Fokus hari ini:** dua lab hybrid utama. Lab 4A paling rawan masalah dalam training ini; siapkan 2 lab assistant."),
  callout("Cek pagi hari 4 (07:30–08:30)", [
    "VPN gateway hub dalam status Succeeded dan public IP-nya dicatat di papan.",
    "RTR01 setiap tim berjalan, strongSwan terpasang, file konfigurasi template ada di `/etc/ipsec.conf` (masih placeholder).",
    "NSG RTR01 mengizinkan UDP 500 dan 4500 dari IP VPN gateway hub.",
    "DNS Private Resolver: catat IP inbound endpoint di papan. Forwarding ruleset sudah ter-link ke hub VNet.",
    "APP01 setiap tim sudah melalui Arc prep (cek: `Get-Service WindowsAzureGuestAgent` = Stopped/Disabled).",
    "Siapkan konfigurasi “jalur cepat” strongSwan per tim (sudah terisi) di folder lab assistant.",
  ], WARN),
);

c.push(...session({
  id: "S4.1", title: "Koneksi ke on-premises dan hybrid DNS", time: "09:15–10:30", type: "Materi + demo", audience: "[ALL]",
  objectives: [
    "Membandingkan site-to-site VPN dan ExpressRoute untuk kebutuhan Pertamina.",
    "Menjelaskan alur hybrid DNS untuk private endpoint.",
  ],
  keyMessages: [
    "**VPN Gateway:** jalur tercepat untuk mendapatkan konektivitas. SKU Basic hanya sekitar 100 Mbps, tanpa BGP dan tanpa active-active, sehingga tidak cocok untuk produksi. Gunakan SKU berakhiran AZ (zone-redundant). Pembuatan gateway butuh **45 menit atau lebih**.",
    "**ExpressRoute:** koneksi privat melalui provider. Di Jakarta tersedia peering location **Jakarta** dan **Jakarta2** (lokal untuk Indonesia Central) serta **ExpressRoute Metro**. Provider antara lain Telin, XL Axiata, DCI Indonesia, NTT Indonesia, DE-CIX, Equinix, dan Zenlayer.",
    "**Lead time ExpressRoute: minggu sampai bulan** (bergantung provider dan procurement). Jalankan VPN secara paralel dan pertahankan sebagai failover setelah ExpressRoute aktif (coexistence).",
    "**BGP dan routing:** tentukan pemilik route advertisement dan summarization. Waspadai asymmetric routing jika ada inspeksi di hub dan lebih dari satu jalur.",
    "**Hybrid DNS (pesan paling penting hari ini):** on-prem DNS membuat **conditional forwarder** ke **inbound endpoint** DNS Private Resolver. Forward zona publik (contoh `blob.core.windows.net`), **bukan** `privatelink.blob.core.windows.net`. Sebaliknya, Azure memakai **outbound endpoint + forwarding ruleset** untuk meneruskan domain on-prem ke DNS on-prem.",
    "IP `168.63.129.16` (Azure DNS) **tidak bisa dijangkau dari luar VNet**. Kesalahan klasik: on-prem DNS diarahkan langsung ke IP ini.",
  ],
  extra: [
    H3("Gambar di whiteboard: alur DNS dari on-prem ke private endpoint"),
    ...CODE([
      "APP (on-prem) -> DC01 DNS",
      "   conditional forwarder: blob.core.windows.net -> Resolver inbound endpoint (hub)",
      "      -> Azure DNS -> privatelink.blob.core.windows.net (Private DNS zone, linked ke hub)",
      "         -> A record: 10.0.x.x (IP private endpoint)",
      "",
      "VM (Azure spoke) -> Azure DNS -> forwarding ruleset (outbound endpoint)",
      "   teamN.corp.local -> 172.16.N.4 (DC01) melalui VPN",
    ]),
  ],
  demo: {
    id: "D6", title: "Hybrid DNS end-to-end",
    prep: "Lingkungan “golden team” dengan VPN sudah tersambung. Storage account dengan private endpoint.",
    steps: [
      "Di DC01 golden team: `nslookup <storage>.blob.core.windows.net` → hasil **IP publik** (belum ada forwarder).",
      "Tambahkan conditional forwarder `blob.core.windows.net` ke IP inbound endpoint.",
      "Ulangi `nslookup` → hasil **IP privat 10.0.x.x** melalui alias privatelink.",
      "Dari VM di spoke Azure: `nslookup dc01.team0.corp.local` → berhasil melalui forwarding ruleset.",
    ],
    say: "“Konektivitas jaringan saja tidak cukup. Jika DNS salah, aplikasi tetap pergi ke IP publik dan diblokir.”",
  },
  qa: [
    ["Mana yang lebih baik untuk Pertamina, VPN atau ExpressRoute?", "Tergantung throughput, latensi, compliance, dan waktu. Untuk beban produksi besar dan SAP, ExpressRoute umumnya dibutuhkan; VPN tetap dipakai untuk awal dan failover."],
    ["Bisakah memakai provider yang sudah melayani Pertamina?", "Periksa daftar provider ExpressRoute di Jakarta/Jakarta2. Jika provider saat ini tidak ada di daftar, bisa melalui exchange (contoh DE-CIX/Equinix)."],
  ],
  refs: [
    ["ExpressRoute peering locations and providers", `${ML}/azure/expressroute/expressroute-locations-providers`],
    ["Private Endpoint DNS integration scenarios", `${ML}/azure/private-link/private-endpoint-dns-integration`],
    ["Resolve Azure and on-premises domains", `${ML}/azure/dns/private-resolver-hybrid-dns`],
  ],
}));

c.push(...session({
  id: "S4.2", title: "Site-to-site VPN dan hybrid DNS (on-prem + Azure)", time: "10:45–12:00", type: "Lab hybrid", audience: "Build + Operate",
  objectives: ["Membangun tunnel VPN dari “data center” tim ke hub, lalu membuktikan hybrid DNS bekerja."],
  keyMessages: ["Tekankan bahwa **kedua sisi tunnel harus cocok**: alamat, pre-shared key, dan IKE/IPsec proposal. Ini persis masalah yang dihadapi tim network Pertamina saat proyek nyata."],
  lab: {
    id: "4A", title: "Site-to-site VPN dan hybrid DNS",
    build: "Sisi Azure: aktifkan role Network Contributor melalui PIM, buat **Local Network Gateway** (IP publik RTR01, prefix `172.16.N.0/24`), buat **Connection** dengan PSK dan **custom IPsec/IKE policy** (IKE AES256/SHA256/DHGroup14, IPsec AES256/SHA256, PFS None). Sisi on-prem: isi `/etc/ipsec.conf` di RTR01 (IP gateway hub, PSK) lalu `sudo ipsec restart`. Verifikasi: `sudo ipsec statusall`, ping dari DC01 ke VM spoke. DNS: tambah conditional forwarder di DC01, tambah rule `teamN.corp.local` di forwarding ruleset, uji `nslookup` dua arah.",
    operate: "Memantau status Connection (Connected, data in/out), membaca VPN diagnostics, lalu menyusun perbandingan VPN vs ExpressRoute untuk Pertamina (biaya, risiko, lead time) di template.",
    notes: [
      "**Checkpoint waktu:** menit ke-35 semua tunnel harus Connected. Jika belum, lab assistant memberi konfigurasi jalur cepat agar tim tetap mengerjakan bagian DNS.",
      "Konfigurasi strongSwan referensi ada di bagian “Referensi konfigurasi RTR01” di atas.",
    ],
    issues: [
      ["Connection “Not connected”, log IKE: NO_PROPOSAL_CHOSEN", "Proposal tidak cocok. Samakan custom IPsec/IKE policy di Azure dengan baris `ike=` dan `esp=` di ipsec.conf."],
      ["Log: AUTHENTICATION_FAILED", "PSK berbeda atau `leftid` bukan IP publik RTR01. Periksa keduanya."],
      ["Tunnel tidak pernah mencoba tersambung", "NSG RTR01 tidak mengizinkan UDP 500/4500, atau `right=` berisi IP yang salah."],
      ["Tunnel Connected tetapi ping gagal", "IP forwarding mati di NIC RTR01 atau di Linux (`sysctl net.ipv4.ip_forward`), UDR on-prem tidak mengarah ke RTR01, NSG spoke memblokir 172.16.0.0/16, atau rule Azure Firewall belum mengizinkan trafik on-prem."],
      ["nslookup dari on-prem tetap IP publik", "Forwarder dibuat untuk zona `privatelink...` (salah) atau ke IP yang salah. Forward `blob.core.windows.net` ke IP inbound endpoint."],
      ["Azure tidak bisa resolve teamN.corp.local", "Rule ruleset salah (akhiri domain dengan titik), ruleset tidak ter-link ke VNet yang dipakai, atau DC01 belum bisa dijangkau melalui VPN."],
    ],
  },
  extra: [
    H3("Referensi konfigurasi RTR01 (untuk lab assistant)"),
    ...CODE([
      "# /etc/ipsec.conf  (strongSwan, Ubuntu)",
      "conn azure-hub",
      "    keyexchange=ikev2",
      "    type=tunnel",
      "    authby=secret",
      "    left=%defaultroute",
      "    leftid=<RTR01_PUBLIC_IP>",
      "    leftsubnet=172.16.N.0/24",
      "    right=<HUB_VPN_GATEWAY_PUBLIC_IP>",
      "    rightsubnet=10.0.0.0/16",
      "    ike=aes256-sha256-modp2048!",
      "    esp=aes256-sha256!",
      "    ikelifetime=28800s",
      "    lifetime=27000s",
      "    dpdaction=restart",
      "    auto=start",
      "",
      "# /etc/ipsec.secrets",
      "<RTR01_PUBLIC_IP> <HUB_VPN_GATEWAY_PUBLIC_IP> : PSK \"<PRE_SHARED_KEY>\"",
    ]),
    P("Catatan: Azure VPN Gateway berada di belakang NAT 1:1 dari sisi RTR01, sehingga `left` memakai IP privat (`%defaultroute`) dan `leftid` memakai IP publik. Validasi konfigurasi ini saat dry run T-7.", { run: { italics: true, size: 18 } }),
  ],
  refs: [
    ["Tutorial: Create a site-to-site VPN connection", `${ML}/azure/vpn-gateway/tutorial-site-to-site-portal`],
    ["Troubleshoot hybrid DNS with DNS Private Resolver", `${ML}/troubleshoot/azure/dns/troubleshoot-azure-dns-private-resolver-hybrid-resolution-failure`],
  ],
}));

c.push(...session({
  id: "S4.3", title: "Operasi lintas dua dunia", time: "13:00–14:00", type: "Materi + demo", audience: "[ALL]",
  objectives: [
    "Menjelaskan monitoring, alert routing, patching, backup, dan DR untuk lingkungan hybrid.",
    "Mengambil keputusan DR untuk region tanpa pasangan.",
  ],
  keyMessages: [
    "**Azure Monitor + Log Analytics** sebagai pusat telemetry. Diagnostic settings dipaksa oleh policy. Data collection rule (DCR) menentukan data apa yang dikumpulkan Azure Monitor Agent.",
    "**Alert → action group → ITSM** (contoh ServiceNow) atau email/Teams. Setiap alert harus punya pemilik dan runbook.",
    "**Azure Arc** membuat server on-prem terlihat dan dikelola seperti resource Azure: policy, monitoring, Update Manager, Defender for Servers – tanpa memindahkan server.",
    "**Masa transisi:** SCOM dan Azure Monitor boleh berjalan berdampingan untuk periode tertentu. Buat daftar tool mana yang tetap, diganti, dan kapan dipensiunkan.",
    "**Backup dan Site Recovery** untuk proteksi dan DR.",
    "**Keputusan DR untuk Indonesia Central (tanpa paired region):**",
  ],
  extra: [
    table([1.4, 2, 2], [
      ["Opsi", "Kelebihan", "Pertimbangan"],
      ["Zone-redundant di Indonesia Central", "Data tetap di Indonesia, failover otomatis untuk banyak layanan", "Tidak melindungi dari gangguan seluruh region"],
      ["DR ke region lain (Southeast Asia / Malaysia West)", "Melindungi dari gangguan region", "Data keluar Indonesia – perlu keputusan legal/compliance; biaya replikasi"],
      ["DR ke data center on-prem Pertamina", "Data tetap di Indonesia, memakai aset yang ada", "Butuh bandwidth ExpressRoute/VPN, kompleksitas operasional"],
    ]),
  ],
  demo: {
    id: "D7", title: "Arc-enabled server",
    prep: "APP01 golden team sudah onboarded ke Arc dengan AMA dan policy.",
    steps: [
      "Azure Arc > Machines: tunjukkan server on-prem dengan status Connected.",
      "Buka server: Extensions (AMA), Policies (compliance), Insights (performance).",
      "Update Manager: tampilkan assessment update untuk server tersebut.",
      "Log Analytics: query `Heartbeat | where Computer startswith \"APP01\"`.",
    ],
    say: "“Server ini tetap di data center. Yang pindah ke Azure hanya cara kita mengelolanya.”",
  },
  refs: [
    ["Management design area", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/design-area/management`],
    ["Azure region pairs and nonpaired regions", `${ML}/azure/reliability/regions-paired`],
  ],
}));

c.push(...session({
  id: "S4.4", title: "Azure Arc dan monitoring (on-prem + Azure)", time: "14:00–15:00", type: "Lab hybrid", audience: "Build + Operate",
  objectives: ["Onboard server on-prem ke Azure Arc, lalu terapkan policy, monitoring, dan alert."],
  keyMessages: ["Arc agent hanya butuh outbound HTTPS (sama seperti Cloud Sync). VPN tidak wajib untuk Arc."],
  lab: {
    id: "4B", title: "Azure Arc dan monitoring",
    build: "Portal: Azure Arc > Add machines > generate script (resource group tim, region Indonesia Central). Jalankan script di APP01 (PowerShell sebagai Administrator). Verifikasi status Connected. Assign policy/DCR untuk Azure Monitor Agent, buat alert CPU, uji dengan beban CPU.",
    operate: "Membuat workbook dashboard (server Azure + Arc), mendefinisikan 5 KPI operasional (contoh: % server compliant, patch tertunda, alert terbuka, waktu respons).",
    notes: [
      "APP01 adalah Azure VM yang **disiapkan agar terlihat seperti server on-prem**: extensions dihapus, Azure guest agent dimatikan, akses ke IMDS (169.254.169.254) diblokir, dan `MSFT_ARC_TEST` di-set. Ini hanya untuk evaluasi/training; jelaskan kepada peserta agar tidak bingung melihat dua resource (VM dan Arc machine).",
      "Script onboarding akan **berhenti dengan error** jika mendeteksi Azure VM yang belum disiapkan. Itu tanda Arc prep gagal, bukan kesalahan peserta.",
      "Data AMA dan alert butuh beberapa menit. Isi waktu tunggu dengan tugas Operate (workbook dan KPI).",
      "Akses ke APP01 melalui Bastion atau RDP dari DC01, karena Run Command dan extension tidak bisa dipakai setelah Arc prep.",
    ],
    issues: [
      ["Script: “running on an Azure VM” lalu berhenti", "Arc prep belum lengkap. Lab assistant menjalankan ulang langkah prep (guest agent, IMDS block, env var) lalu restart sesi PowerShell."],
      ["Status Disconnected / gagal register", "Outbound 443 diblokir (cek RTR01 NAT) atau resource provider `Microsoft.HybridCompute` belum terdaftar."],
      ["Extension AMA gagal terpasang", "Resource provider `Microsoft.GuestConfiguration`/`Microsoft.HybridConnectivity` belum terdaftar, atau DCR belum terasosiasi."],
      ["Tidak ada data di Log Analytics", "Tunggu 5–10 menit; cek tabel `Heartbeat`. Pastikan DCR mengarah ke workspace yang benar."],
    ],
  },
  refs: [
    ["Evaluate Azure Arc-enabled servers on an Azure VM", `${ML}/azure/azure-arc/servers/plan-evaluate-on-azure-virtual-machine`],
    ["What is Azure Arc-enabled servers?", `${ML}/azure/azure-arc/servers/overview`],
  ],
}));

c.push(...session({
  id: "CP4", title: "Design checkpoint 4", time: "15:15–16:00", type: "Workshop", audience: "[ALL]",
  objectives: ["Design Pack bagian 7 (konektivitas, DNS, pemilik) dan bagian 8 (monitoring, alert, backup, DR)."],
  keyMessages: ["Pertanyaan pemicu: bandwidth dan latensi yang dibutuhkan? Data apa yang boleh keluar Indonesia untuk DR? Tool monitoring mana yang dipensiunkan dan kapan?"],
  tips: ["Ingatkan tim: besok capstone. Malam ini Platform Owner meninjau Design Pack dan menandai bagian yang belum lengkap."],
}));

// ---------------------------------------------------------------- DAY 5
c.push(BREAK(), H1("9. Hari 5 (Jumat) – Automate, onboard, operate"),
  P("**Fokus hari ini:** automation, onboarding workload, game day, dan capstone. Istirahat siang 11:30–13:00 untuk sholat Jumat."),
);

c.push(...session({
  id: "S5.1", title: "Platform automation", time: "09:15–10:30", type: "Demo + lab", audience: "[ALL]",
  objectives: ["Menjelaskan cara landing zone dideploy dan diubah melalui IaC dan pull request."],
  keyMessages: [
    "Microsoft merekomendasikan **Azure Landing Zones IaC Accelerator** (Bicep atau Terraform berbasis Azure Verified Modules, dengan GitHub atau Azure DevOps). Empat fase: **Planning, Prerequisites, Bootstrap, Run**. Tersedia juga portal accelerator untuk tim tanpa skill IaC.",
    "**Setiap perubahan platform melalui pull request:** diusulkan, direview, plan/what-if dilihat, disetujui, lalu diterapkan pipeline. Tidak ada perubahan manual di portal untuk platform.",
    "**Subscription vending as code** dan **policy as code** (alternatif lanjutan: Enterprise Policy as Code / EPAC).",
    "Untuk manager: pipeline adalah **jejak audit**. Siapa mengubah apa, kapan, dan siapa yang menyetujui – semuanya tercatat.",
  ],
  demo: {
    id: "D8", title: "ALZ IaC Accelerator dan pipeline",
    prep: "Repo hasil bootstrap accelerator untuk training tenant, pipeline sudah pernah berjalan sukses.",
    steps: [
      "Tunjukkan struktur repo: konfigurasi management group, policy, hub network.",
      "Buat branch, ubah satu parameter kecil (contoh menambah tag default), buka pull request.",
      "Tunjukkan job plan/what-if di pipeline dan diff-nya.",
      "Approve dan merge; tunjukkan job apply dan hasilnya di portal.",
    ],
    say: "“Landing zone adalah kode. Mengubahnya sama seperti mengubah aplikasi: review dulu, baru deploy.”",
  },
  lab: {
    id: "5A", title: "Platform automation",
    build: "Menambah spoke baru untuk tim melalui modul yang tersedia, membuka pull request, membaca hasil plan.",
    operate: "Bertindak sebagai approver: membaca plan, menilai dampak (biaya, policy), lalu approve atau reject dengan alasan.",
    notes: [
      "Durasi pipeline bisa beberapa menit; siapkan branch per tim sebelum kelas.",
      "Batasi izin repo supaya peserta hanya bisa mengubah folder tim masing-masing.",
    ],
  },
  refs: [
    ["Platform landing zone implementation options", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/implementation-options`],
    ["Deploy Azure landing zones", `${ML}/azure/architecture/landing-zones/landing-zone-deploy`],
  ],
}));

c.push(...session({
  id: "S5.2", title: "Workload onboarding dan platform readiness", time: "10:45–11:30", type: "Materi + demo", audience: "[ALL]",
  objectives: ["Merencanakan onboarding workload pertama dan memvalidasi kesiapan platform."],
  keyMessages: [
    "**Azure Migrate:** discovery (appliance di on-prem), assessment (sizing dan biaya), dependency analysis (aplikasi mana yang saling bergantung).",
    "**Strategi migrasi:** retire, retain, rehost, replatform, refactor, replace. Tidak semua aplikasi harus pindah.",
    "**Workload pertama yang baik:** bisnis penting tetapi tidak kritikal, dependensi sedikit, tim aplikasi antusias.",
    "**Platform readiness checklist** (dari Microsoft) sebelum migrasi pertama: konektivitas live, DNS dan routing benar dari spoke, satu pola ingress teruji, policy dan budget aktif, akses admin melalui grup dan PIM teruji, log mengalir dan satu alert terbukti sampai, kapasitas sesuai kebutuhan nyata, resiliensi berbasis SLA, subscription vending berjalan, dan **uji dependensi nyata workload pertama**.",
    "**SAP di Azure:** memakai VM tersertifikasi SAP dan landing zone accelerator khusus SAP; biasanya membutuhkan ExpressRoute.",
    "Arsitektur konseptual ALZ terbaru juga menampilkan workload AI (Microsoft Foundry) di atas landing zone yang sama: fondasinya tetap.",
  ],
  demo: {
    id: "D9", title: "Azure Migrate assessment",
    prep: "Project Azure Migrate dengan data contoh, atau rekaman/screenshot (appliance discovery butuh waktu lama).",
    steps: [
      "Tunjukkan daftar server yang ditemukan.",
      "Buka assessment: rekomendasi VM size, perkiraan biaya bulanan.",
      "Tunjukkan dependency map antara dua server.",
    ],
    say: "“Data assessment yang baik mencegah migrasi yang ternyata lebih mahal dari on-prem.”",
  },
  refs: [["Azure landing zones for on-premises experts – Validate platform readiness", `${ML}/azure/migration/migrate-from-on-premises-platform-landing-zone`]],
}));

// Game day
c.push(H2("S5.3  Game day (13:00–14:00)"),
  P("**Tujuan:** tim mendiagnosis, menentukan pemilik, dan mengeskalasi insiden platform di bawah tekanan waktu. Gabungkan inject **live** (trainer benar-benar mengubah lingkungan) dan **kartu** (screenshot/log)."),
  table([0.6, 1, 3], [
    ["Menit", "Kegiatan", "Catatan"],
    ["0–5", "Briefing aturan dan scoring.", "Setiap tim punya Incident Commander (manager) dan scribe (analyst)."],
    ["5–17", "Inject 1 (live)", "Trainer mengganti PSK connection tim di Azure 2 menit sebelum inject."],
    ["17–29", "Inject 2 (kartu)", "Bagikan kartu dengan output nslookup."],
    ["29–41", "Inject 3 (live)", "Minta tim deploy resource ke Southeast Asia."],
    ["41–53", "Inject 4 (kartu)", "Bagikan screenshot budget alert dan Defender alert."],
    ["53–60", "Debrief dan skor.", "Kembalikan PSK yang benar untuk semua tim."],
  ]),
  SP(),
  table([0.4, 1.2, 1.6, 1.4, 2], [
    ["#", "Inject", "Info awal untuk tim", "Hint (setelah 5 menit)", "Jawaban yang diharapkan"],
    ["1", "VPN tunnel down", "“User cabang tidak bisa membuka aplikasi di Azure sejak 10 menit lalu.”", "“Lihat status Connection dan log RTR01.”", "Status Not connected; log AUTHENTICATION_FAILED → PSK berubah. Pemilik: tim network. Eskalasi: change management (siapa mengubah PSK?). Komunikasi ke user cabang."],
    ["2", "Private endpoint tidak resolve dari on-prem", "Output `nslookup` dari server on-prem menunjukkan IP publik storage; aplikasi ditolak.", "“Forwarder di DNS on-prem diarahkan ke mana?”", "Forwarder menunjuk `168.63.129.16` (tidak terjangkau dari luar VNet) atau ke zona privatelink. Perbaiki ke inbound endpoint dan zona publik. Pemilik: tim DNS/platform."],
    ["3", "Deployment ditolak policy", "Tim proyek mengeluh “Azure rusak”, deployment gagal.", "“Baca pesan error lengkapnya.”", "RequestDisallowedByPolicy – allowed locations. Bukan insiden; jelaskan aturan, tawarkan proses exemption bila ada alasan bisnis."],
    ["4", "Lonjakan biaya + security alert", "Budget alert 150% dan Defender alert brute force RDP pada VM dengan public IP.", "“Group cost by tag dan resource.”", "Temukan VM besar tanpa tag Owner; hapus public IP/tutup port; isolasi VM; kirim ke SOC; cari pemilik melalui activity log. Usulkan policy deny public IP."],
  ]),
  SP(),
  table([2, 1], [
    ["Kriteria skor per inject", "Poin"],
    ["Diagnosis akar masalah benar", "2"],
    ["Pemilik/tim yang tepat diidentifikasi", "1"],
    ["Eskalasi dan langkah berikutnya tepat", "1"],
    ["Komunikasi ke pengguna/manajemen jelas", "1"],
  ]),
  SP(),
  callout("Tips game day", [
    "Jangan beri jawaban terlalu cepat. Diam adalah bagian dari latihan.",
    "Saat debrief, tanyakan: “Monitoring apa yang seharusnya memberi tahu kita lebih dulu?” Hubungkan ke Design Pack bagian 8.",
    "Pastikan semua perubahan live dikembalikan sebelum capstone.",
  ], WARN),
);

// Capstone
c.push(H2("S5.4  Capstone (14:15–15:30)"),
  table([0.8, 3], [
    ["Menit", "Kegiatan"],
    ["0–15", "Persiapan tim. Trainer membagikan workload kasus (SAP non-production, dashboard operasi, atau data platform) jika belum."],
    ["15–75", "Presentasi: 10 menit + 5 menit tanya jawab per tim. Panel “steering committee”: sponsor Pertamina, lead trainer, satu peserta senior dari tim lain bergiliran."],
  ]),
  SP(),
  P("**Pertanyaan panel yang disarankan:** Apa keputusan paling berisiko di desain Anda? Bagaimana user on-prem login ke workload ini? Bagaimana DNS-nya? Siapa yang menerima alert pertama? Berapa perkiraan biaya bulanan dan siapa yang membayar? Apa yang terjadi jika region Indonesia Central bermasalah?"),
  table([2, 3, 0.7], [
    ["Kriteria rubric", "Indikator nilai tinggi", "Bobot"],
    ["Kelengkapan", "8 design area punya keputusan, pemilik, dan alasan", "25%"],
    ["Hybrid connectivity", "Jalur identitas, routing, dan DNS ke on-prem eksplisit dan teruji", "20%"],
    ["Governance dan compliance", "Policy sesuai residensi data dan audit; exception punya pemilik", "20%"],
    ["Operasi dan biaya", "Monitoring, alert routing, backup/DR, dan model biaya jelas", "20%"],
    ["Komunikasi", "Jelas untuk eksekutif dan engineer; risiko dan langkah berikut disebut", "15%"],
  ]),
);

// Close
c.push(H2("S5.5  Penutupan (15:30–16:00)"),
  B("Post-test 20 soal (Microsoft Forms), umpan balik training."),
  B("Sampaikan **roadmap 30-60-90 hari** sebagai rekomendasi:"),
  table([0.7, 3], [
    ["Periode", "Rekomendasi"],
    ["30 hari", "Bentuk platform team/CCoE. Putuskan tenant dan model billing. Jalankan Azure Landing Zone Review assessment. Pilih workload pertama."],
    ["60 hari", "Deploy minimum viable platform landing zone dengan accelerator. Pasang VPN ke data center. Pilot identity sync. Ajukan ExpressRoute ke provider."],
    ["90 hari", "Validasi platform readiness. Migrasikan workload pertama. Jalankan runbook operasi dan review biaya bulanan pertama."],
  ]),
  SP(),
  B("Jalur sertifikasi: AZ-900 (semua), SC-900 (manager/analyst), AZ-104 (administrator), AZ-700 (network engineer), AZ-305 (architect)."),
  B("Ucapkan terima kasih kepada sponsor dan serahkan Design Pack semua tim kepada Pertamina."),
);

// ---------------------------------------------------------------- 10. Troubleshooting & fallback
c.push(BREAK(), H1("10. Troubleshooting cepat lingkungan lab hybrid"),
  P("Tabel ini untuk lab assistant. Urutan pemeriksaan: **(1) jaringan dasar → (2) identitas/izin → (3) DNS → (4) layanan**."),
  table([1.5, 1.8, 2.5], [
    ["Komponen", "Gejala", "Pemeriksaan dan perbaikan"],
    ["RTR01 (internet edge)", "DC01/APP01 tidak bisa ke internet", "`sysctl net.ipv4.ip_forward` = 1; aturan NAT/MASQUERADE ada; NIC RTR01 IP forwarding = Enabled; route table subnet server 0.0.0.0/0 → RTR01."],
    ["RTR01 (VPN)", "Tunnel tidak naik", "`sudo ipsec statusall`, `journalctl -u strongswan-starter`; cocokkan PSK, IP, proposal; NSG UDP 500/4500."],
    ["DC01", "AD tidak sehat setelah restart", "`Get-Service NTDS,DNS,ADWS`; DNS VNet mengarah ke DC01; tunggu 5 menit setelah boot."],
    ["DC01 (Cloud Sync)", "Agent tidak bisa registrasi", "Outbound 443 dan 80 (CRL); TLS 1.2; akun Hybrid Identity Administrator aktif dan bukan guest; KDS root key."],
    ["APP01 (Arc)", "Installer menolak", "Guest agent Disabled, firewall rule BlockAzureIMDS ada, env var `MSFT_ARC_TEST=true` (sesi PowerShell baru)."],
    ["Hub", "Spoke tidak bisa ke on-prem", "Peering dengan use remote gateway; rule Azure Firewall untuk 172.16.0.0/16; route table GatewaySubnet (jika inspeksi lewat firewall)."],
    ["DNS Private Resolver", "Resolusi gagal dua arah", "Inbound endpoint IP benar di forwarder on-prem; ruleset ter-link ke VNet; Private DNS zone ter-link ke hub."],
    ["Entra ID / PIM", "Akses ditolak setelah aktivasi", "Sign out/in ulang; cek PIM assignment dan masa aktif."],
  ]),
  H2("10.1 Rencana cadangan"),
  table([1.5, 3], [
    ["Kejadian", "Tindakan"],
    ["Lingkungan satu tim rusak", "Tim bergabung dengan tim lain sebagai observer, atau pakai lingkungan cadangan (deploy 1 tim ekstra di T-1)."],
    ["Portal Azure / internet bermasalah", "Gunakan video rekaman lab dan screenshot; lanjutkan diskusi Design Pack."],
    ["Lab terlalu lama", "Pakai jalur cepat (konfigurasi siap tempel). Jangan mengorbankan design checkpoint."],
    ["Kuota VM tidak cukup saat deploy", "Kurangi ukuran VM (B-series), atau gabungkan 2 tim per lingkungan."],
  ]),
);

// ---------------------------------------------------------------- 11. Assessment admin
c.push(H1("11. Administrasi asesmen dan pelaporan"),
  B("Pre-test dan post-test memakai 20 topik yang sama (soal disusun ulang). Gunakan Microsoft Forms dengan kolom role (EXEC/ANL/TECH)."),
  B("Laporan ke Pertamina: rata-rata skor pre vs post per role group, peningkatan per design area, skor capstone per tim, dan rekomendasi pengembangan per peserta (opsional)."),
  B("Simpan Design Pack final semua tim dan foto kanvas sebagai lampiran laporan."),
  B("Isi daftar parking lot yang belum terjawab sebagai bagian “tindak lanjut” laporan."),
);

// ---------------------------------------------------------------- 12. References
c.push(H1("12. Referensi utama"),
  LINK("Azure landing zone design areas and conceptual architecture", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/design-areas`),
  LINK("Fundamentals of Azure for on-premises experts", `${ML}/azure/migration/migrate-from-on-premises-fundamentals`),
  LINK("Azure landing zones for on-premises experts", `${ML}/azure/migration/migrate-from-on-premises-platform-landing-zone`),
  LINK("Why Azure? – How to adopt Azure", `${ML}/azure/cloud-adoption-framework/why-azure`),
  LINK("Platform landing zone implementation options", `${ML}/azure/cloud-adoption-framework/ready/landing-zone/implementation-options`),
  LINK("ExpressRoute peering locations and connectivity partners", `${ML}/azure/expressroute/expressroute-locations-providers`),
  LINK("Private Endpoint DNS integration scenarios", `${ML}/azure/private-link/private-endpoint-dns-integration`),
  LINK("Microsoft Entra Cloud Sync prerequisites", `${ML}/entra/identity/hybrid/cloud-sync/how-to-prerequisites`),
  LINK("Evaluate Azure Arc-enabled servers on an Azure VM", `${ML}/azure/azure-arc/servers/plan-evaluate-on-azure-virtual-machine`),
  LINK("Tutorial: Create a site-to-site VPN connection", `${ML}/azure/vpn-gateway/tutorial-site-to-site-portal`),
  P("Fakta Azure di panduan ini diperiksa terhadap Microsoft Learn pada November 2026. Periksa ulang sebelum delivery karena layanan Azure berubah cepat.", { run: { italics: true, size: 18 } }),
);

// ---------------------------------------------------------------- build
const doc = new Document({
  creator: "Azure Landing Zone Training",
  title: "Panduan Trainer – Azure Landing Zone (Pertamina)",
  features: { updateFields: true },
  styles, numbering,
  sections: [{ properties: pageProps, footers: footer("Panduan Trainer – Azure Landing Zone – Pertamina"), children: c }],
});

const out = path.join(__dirname, "..", "docs", "trainer_guide_azure-landing-zone-pertamina.docx");
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(out, buf); console.log("Wrote", out); });
