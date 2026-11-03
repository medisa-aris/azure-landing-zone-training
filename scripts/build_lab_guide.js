// Builds docs/lab_guide_azure-landing-zone-pertamina.docx (Bahasa Indonesia, English jargon kept)
// Usage: node scripts/build_lab_guide.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, TableOfContents,
} = require("docx");
const {
  FONT, BRAND, CONTENT_W, runs, P, H1, H2, H3, B, BREAK, SP, CODE, table, callout, styles, numbering, footer, pageProps,
} = require("./lib/docx-helpers");

// ---------------------------------------------------------------- step markers
const KINDS = {
  click: { label: "▶ KLIK", fill: "0F4C81", text: "FFFFFF", body: "EAF2FB" },
  type: { label: ">_ KETIK", fill: "1F1F1F", text: "FFFFFF", body: "1F1F1F" },
  result: { label: "✔ HASIL", fill: "2E7D32", text: "FFFFFF", body: "E8F5E9" },
  why: { label: "? MENGAPA", fill: "B8860B", text: "FFFFFF", body: "FFF8E1" },
  warn: { label: "! PERHATIAN", fill: "C55A11", text: "FFFFFF", body: "FDEBDD" },
  info: { label: "i INFO", fill: "595959", text: "FFFFFF", body: "F2F2F2" },
};
const LABEL_W = 1500;
const thin = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const cellBorders = { top: thin, bottom: thin, left: thin, right: thin };

function codeParas(where, lines) {
  const out = [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `Ketik di: ${where}`, font: FONT, size: 17, italics: true, color: "BFBFBF" })] })];
  lines.forEach((l) => out.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: l === "" ? " " : l, font: "Consolas", size: 18, color: "FFFFFF" })] })));
  return out;
}

function stepTable(items) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [LABEL_W, CONTENT_W - LABEL_W],
    rows: items.map((it) => {
      const k = KINDS[it.k];
      const body = it.k === "type"
        ? codeParas(it.where, it.code)
        : String(it.t).split("\n").map((line) => new Paragraph({ spacing: { after: 40 }, children: runs(line, { size: 19 }) }));
      return new TableRow({
        cantSplit: it.k !== "type",
        children: [
          new TableCell({
            width: { size: LABEL_W, type: WidthType.DXA }, borders: cellBorders,
            shading: { fill: k.fill, type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: k.label, bold: true, font: FONT, size: 17, color: k.text })] })],
          }),
          new TableCell({
            width: { size: CONTENT_W - LABEL_W, type: WidthType.DXA }, borders: cellBorders,
            shading: { fill: k.body, type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: body,
          }),
        ],
      });
    }),
  });
}

// shorthand constructors
const click = (t) => ({ k: "click", t });
const type = (where, code) => ({ k: "type", where, code });
const result = (t) => ({ k: "result", t });
const why = (t) => ({ k: "why", t });
const warn = (t) => ({ k: "warn", t });
const info = (t) => ({ k: "info", t });

// ---------------------------------------------------------------- lab renderer
function lab(L) {
  const out = [BREAK(), H1(`Lab ${L.id} – ${L.title}`)];
  out.push(table([1, 3], [
    ["Item", "Detail"],
    ["Hari / waktu", L.when],
    ["Durasi", L.duration],
    ["Level", L.level],
    ["Lingkungan", L.env],
  ]));
  out.push(H2("Tujuan"));
  L.goals.forEach((g) => out.push(B(g)));
  out.push(H2("Use case"));
  out.push(callout("Skenario Pertamina", L.usecase));
  out.push(H2("Prasyarat"));
  L.prereq.forEach((p) => out.push(B("☐ " + p)));
  L.parts.forEach((part) => {
    out.push(H2(part.title));
    if (part.intro) out.push(P(part.intro));
    part.steps.forEach((s, i) => {
      out.push(H3(`Langkah ${part.prefix}${i + 1} – ${s.title}`));
      out.push(stepTable(s.items));
      out.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    });
  });
  out.push(H2("Validasi akhir"));
  out.push(table([3, 0.6], [["Kriteria", "✔"], ...L.validate.map((v) => [v, "☐"])]));
  if (L.issues) {
    out.push(H2("Troubleshooting"));
    out.push(table([2, 3], [["Gejala", "Penyebab dan solusi"], ...L.issues]));
  }
  if (L.cleanup) {
    out.push(H2("Pembersihan"));
    out.push(P(L.cleanup));
  }
  return out;
}

const c = [];

// ---------------------------------------------------------------- cover
c.push(
  new Paragraph({ spacing: { before: 2200, after: 200 }, children: [new TextRun({ text: "Lab Guide", font: FONT, size: 56, bold: true, color: BRAND })] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Azure Landing Zone: Design, Operate, and Connect", font: FONT, size: 32, color: "404040" })] }),
  new Paragraph({ spacing: { after: 600 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BRAND, space: 4 } }, children: [new TextRun({ text: "Panduan langkah demi langkah untuk peserta – PT Pertamina (Persero)", font: FONT, size: 26 })] }),
  table([1, 2], [
    ["Item", "Detail"],
    ["Isi", "9 lab: Lab 1, 2A, 2B, 3A, 3C, 3B, 4A, 4B, 5A"],
    ["Bahasa", "Bahasa Indonesia; istilah teknis tetap dalam bahasa Inggris"],
    ["Pendamping", "Syllabus, Panduan Trainer, Outline Slide"],
    ["Versi", "v1.0 draft, November 2026"],
  ]),
  BREAK(),
  new Paragraph({ children: [new TextRun({ text: "Daftar Isi", font: FONT, size: 32, bold: true, color: BRAND })], spacing: { after: 200 } }),
  new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-2" }),
  P("Klik kanan pada daftar isi lalu pilih Update Field untuk memperbarui nomor halaman.", { run: { italics: true, size: 18, color: "808080" } }),
);

// ---------------------------------------------------------------- how to use
c.push(BREAK(), H1("1. Cara membaca lab guide ini"),
  P("Setiap langkah ditulis dalam kotak dengan **penanda berwarna** di sisi kiri. Penanda menunjukkan apa yang harus Anda lakukan:"),
  stepTable([
    click("Klik tombol, menu, atau tautan di layar. Nama elemen ditulis tebal dalam kurung siku, contoh **[Review + create]**, beserta posisi dan warnanya, contoh “tombol biru di kiri bawah”. Urutan menu ditulis dengan tanda ›, contoh **Settings › Peerings**."),
    type("Cloud Shell (Bash) – contoh", ["az account show -o table"]),
    result("Apa yang seharusnya Anda lihat jika langkah berhasil."),
    why("Penjelasan mengapa hasilnya seperti itu – inilah bagian yang paling penting untuk dipahami."),
    warn("Hal yang mudah salah atau berisiko. Baca sebelum melanjutkan."),
    info("Informasi tambahan atau alternatif cara."),
  ]),
  SP(),
  H2("1.1 Aturan penulisan"),
  table([1.3, 3], [
    ["Penulisan", "Artinya"],
    ["**[Create]**", "Tombol atau tautan yang harus diklik."],
    ["**Settings › Peerings**", "Menu kiri “Settings”, lalu pilih “Peerings”."],
    ["`teamN`", "Ganti **N** dengan nomor tim Anda. Contoh tim 2: `team2`, `172.16.2.0/24`, `10.0.12.0/24`."],
    ["`<RTR01_PUBLIC_IP>`", "Nilai di dalam tanda < > diganti dengan nilai dari **kartu tim** atau papan kelas. Tanda < > ikut dihapus."],
    ["Kotak hitam berhuruf putih", "Teks yang harus **diketik persis** (huruf besar/kecil, spasi, tanda kutip). Baris pertama menyebutkan tempat mengetiknya."],
  ]),
  SP(),
  H2("1.2 Tata letak umum Azure portal"),
  P("Lab ini memakai Azure portal (`https://portal.azure.com`) dan Microsoft Entra admin center (`https://entra.microsoft.com`). Posisi elemen yang sering dipakai:"),
  table([1.3, 3], [
    ["Elemen", "Posisi"],
    ["Kotak pencarian", "Bar atas, tengah layar. Ketik nama layanan lalu pilih dari daftar **Services**."],
    ["Cloud Shell", "Ikon **>_** di bar atas sebelah kanan kotak pencarian. Pilih **Bash** saat pertama kali dibuka."],
    ["Settings (Directories)", "Ikon roda gigi di bar atas kanan. Dipakai untuk pindah tenant."],
    ["Notifications", "Ikon lonceng di bar atas kanan. Status deployment muncul di sini."],
    ["Command bar", "Baris tombol di atas daftar resource, contoh **[+ Create]**, **[+ Add]**, **[Refresh]**, **[Delete]**."],
    ["Menu kiri resource", "Daftar menu di sisi kiri halaman resource, dikelompokkan: Overview, Activity log, Access control (IAM), Settings, Monitoring, dll."],
    ["Tombol wizard", "Tombol biru **[Review + create]** atau **[Create]** di kiri bawah; **[Next]** di sebelahnya."],
  ]),
  SP(),
  callout("Catatan versi", [
    "Microsoft memperbarui tampilan portal secara berkala. Jika nama menu sedikit berbeda, gunakan kotak pencarian portal atau tanyakan kepada lab assistant.",
    "Lingkungan lab adalah **training tenant**. Jangan memasukkan data atau kredensial asli Pertamina.",
  ]),
);

// ---------------------------------------------------------------- environment
c.push(BREAK(), H1("2. Informasi lingkungan lab"),
  P("Setiap tim memiliki satu **spoke** di landing zone Azure dan satu **data center simulasi** (on-premises) yang terpisah. Satu-satunya jalan antara keduanya adalah koneksi yang Anda bangun di Lab 4A."),
  ...CODE([
    "DATA CENTER SIMULASI TIM N  (vnet-onprem-teamN 172.16.N.0/24, Southeast Asia)",
    "  DC01  172.16.N.4    AD DS + DNS --- HTTPS 443 ---> Microsoft Entra ID  (Lab 3C)",
    "  APP01 172.16.N.5    server Arc ---- HTTPS 443 ---> Azure Arc, Monitor  (Lab 4B)",
    "  RTR01 172.16.N.132  strongSwan ==== IPsec VPN ===> vgw-hub             (Lab 4A)",
    "        (internet edge on-prem)                         |",
    "                                                        v",
    "AZURE LANDING ZONE  (Indonesia Central)",
    "  vnet-hub 10.0.0.0/22 (rg-conn): vgw-hub, fw-hub 10.0.1.4,",
    "                                  DNS resolver inbound 10.0.2.4",
    "        |  peering (Lab 3B)",
    "  vnet-spoke-teamN 10.0.1N.0/24: vm-app-teamN 10.0.1N.4,",
    "                                 private endpoint storage tim",
  ]),
  SP(),
  H2("2.1 Nama resource dan alamat IP"),
  table([1.4, 1.6, 1.6], [
    ["Komponen", "Nama", "Alamat / catatan"],
    ["Hub VNet", "vnet-hub (rg-conn)", "10.0.0.0/22"],
    ["Azure Firewall", "fw-hub", "IP privat 10.0.1.4"],
    ["VPN gateway", "vgw-hub", "IP publik: lihat papan kelas"],
    ["DNS Private Resolver", "dnspr-hub", "Inbound endpoint 10.0.2.4"],
    ["DNS forwarding ruleset", "frs-hub", "Ter-link ke vnet-hub dan semua spoke"],
    ["Log Analytics", "law-platform-idc", "Subscription Management"],
    ["Spoke tim N", "vnet-spoke-teamN (rg-spoke-teamN)", "10.0.1N.0/24 (tim 1 = 10.0.11.0/24)"],
    ["VM aplikasi", "vm-app-teamN (Ubuntu)", "10.0.1N.4"],
    ["Storage + private endpoint", "stteamNlab…", "Nama lengkap di kartu tim"],
    ["Data center simulasi", "vnet-onprem-teamN (rg-onprem-teamN)", "172.16.N.0/24"],
    ["Domain controller", "dc01-teamN", "172.16.N.4 · domain teamN.corp.local"],
    ["Server untuk Arc", "app01-teamN", "172.16.N.5"],
    ["Router / VPN on-prem", "rtr01-teamN", "172.16.N.132 · IP publik di kartu tim"],
    ["Resource group Arc", "rg-arc-teamN", "Indonesia Central"],
  ]),
  SP(),
  H2("2.2 Akun dan role"),
  table([1.4, 3], [
    ["Akun / role", "Kegunaan"],
    ["`userNN@<tenant>.onmicrosoft.com`", "Akun pribadi peserta. Reader di seluruh landing zone; Contributor di rg-spoke-teamN dan rg-arc-teamN."],
    ["Role **eligible** (PIM) – engineer", "Network Contributor di rg-conn (Lab 3B, 4A); Role Based Access Control Administrator di rg-spoke-teamN (Lab 3A)."],
    ["Role **eligible** (PIM) – team lead", "Conditional Access Administrator dan Hybrid Identity Administrator (Lab 3A, 3C)."],
    ["Approver PIM", "Manager tim (Platform Owner)."],
    ["`teamN\\labadmin`", "Domain Admin di DC01; admin lokal di APP01 dan RTR01. Password di kartu tim."],
    ["User AD untuk sinkronisasi", "OU Sync-Users, contoh Budi Santoso, Siti Rahma. Password di kartu tim."],
  ]),
  SP(),
  H2("2.3 Daftar lab"),
  table([0.5, 2, 0.6, 0.8, 1.8], [
    ["Lab", "Judul", "Hari", "Durasi", "Lingkungan"],
    ["1", "Tur landing zone", "1", "60 m", "Azure (Reader)"],
    ["2A", "Governance in practice", "2", "75 m", "Azure"],
    ["2B", "Cost and security posture + RACI", "2", "60 m", "Azure"],
    ["3A", "Identity and privileged access", "3", "35 m", "Entra ID + Azure"],
    ["3C", "Hybrid identity sync", "3", "40 m", "On-prem (DC01) + Entra ID"],
    ["3B", "Hub-and-spoke", "3", "60 m", "Azure"],
    ["4A", "Site-to-site VPN dan hybrid DNS", "4", "75 m", "On-prem (RTR01, DC01) + Azure"],
    ["4B", "Azure Arc dan monitoring", "4", "60 m", "On-prem (APP01) + Azure"],
    ["5A", "Platform automation", "5", "30 m", "Git repo + pipeline"],
  ]),
  SP(),
  P("**Build** = dikerjakan engineer (TECH). **Operate** = dikerjakan manager dan analyst (EXEC/ANL), umumnya hanya membaca dan memutuskan. Semua anggota tim boleh mengikuti kedua bagian bila waktu memungkinkan."),
);

// ================================================================ LAB 1
c.push(...lab({
  id: "1", title: "Tur Landing Zone (Scavenger Hunt)",
  when: "Hari 1 · 14:00–15:00", duration: "60 menit", level: "Semua peserta (Operate); tugas tambahan Build", env: "Azure portal, akses Reader",
  goals: [
    "Menavigasi Azure portal dengan percaya diri.",
    "Menemukan komponen utama landing zone: management group, policy, hub network, logging, akses, dan biaya.",
    "Memahami bagaimana aturan diwariskan dari management group ke subscription.",
  ],
  usecase: [
    "Anda baru bergabung dengan **Cloud Center of Excellence (CCoE)** Pertamina. Sebelum menyetujui proyek pertama yang ingin memakai Azure, Anda harus memahami fondasi yang sudah dibangun platform team: aturan apa yang berlaku, di mana jaringan pusat, ke mana log dikirim, dan siapa pemilik platform.",
    "Tugas Anda: jawab 8 pertanyaan di lembar jawaban. Tim yang pertama menjawab semua dengan benar mendapat poin bonus capstone.",
  ],
  prereq: ["Laptop dengan browser modern (Edge/Chrome).", "Akun `userNN` dan password dari kartu peserta.", "Lembar jawaban Lab 1 (lampiran di akhir lab ini)."],
  parts: [
    { title: "Bagian A – Masuk ke portal", prefix: "A", steps: [
      { title: "Login ke Azure portal", items: [
        click("Buka browser dalam mode **InPrivate/Incognito** (Ctrl+Shift+N). Klik kotak alamat di bagian atas browser."),
        type("Kotak alamat browser", ["https://portal.azure.com"]),
        click("Masukkan akun `userNN@<tenant>.onmicrosoft.com`, klik tombol biru **[Next]**, masukkan password, lalu klik tombol biru **[Sign in]**. Jika diminta mengganti password, ikuti instruksi."),
        result("Halaman **Home** Azure portal terbuka dengan kotak pencarian di bar atas."),
        why("Mode InPrivate mencegah browser memakai akun Microsoft lain yang sudah login (misalnya akun kantor). Training memakai tenant terpisah agar tidak menyentuh sistem asli Pertamina."),
      ]},
      { title: "Pastikan Anda berada di training tenant", items: [
        click("Klik ikon **roda gigi (Settings)** di bar atas kanan › tab **Directories + subscriptions**."),
        result("Directory aktif bernama training tenant (contoh “Pertamina Training”). Jika bukan, klik **[Switch]** di samping training tenant."),
        why("Satu akun bisa terdaftar di beberapa tenant. Semua lab hanya berlaku di training tenant."),
      ]},
    ]},
    { title: "Bagian B – Governance: management group dan policy", prefix: "B", steps: [
      { title: "Buka hierarki management group (Pertanyaan 1)", items: [
        click("Klik **kotak pencarian** di bar atas tengah."),
        type("Kotak pencarian portal", ["Management groups"]),
        click("Pilih **Management groups** di bagian **Services**. Klik tanda **▸** di samping setiap management group untuk membuka cabangnya."),
        result("Tree: **Tenant Root Group** › **Pertamina-Training** › Platform (Identity, Management, Connectivity), Landing Zones (Corp, Online), Sandbox, Decommissioned."),
        why("Management group adalah wadah governance di atas subscription. Pemisahannya mengikuti **perbedaan aturan** (platform vs workload, corp vs online), bukan struktur organisasi."),
      ]},
      { title: "Lihat policy yang diwariskan ke Corp (Pertanyaan 2)", items: [
        click("Klik management group **Corp** › menu kiri **Governance › Policies** (pada beberapa versi: **Policy**)."),
        result("Daftar policy assignment. Kolom **Scope** menunjukkan di mana assignment dibuat – banyak yang berasal dari level di atas Corp."),
        click("Cari assignment yang namanya mengandung **Public IP** atau **public endpoints**. Catat nama dan effect-nya."),
        why("Assignment di management group induk **diwariskan** ke semua anak. Pemilik subscription di bawah Corp tidak bisa menghapusnya, sehingga aturan keamanan selalu berlaku."),
      ]},
    ]},
    { title: "Bagian C – Jaringan, logging, akses, dan biaya", prefix: "C", steps: [
      { title: "Hub network (Pertanyaan 3)", items: [
        type("Kotak pencarian portal", ["Virtual networks"]),
        click("Klik **vnet-hub** › **Overview**: lihat **Address space**. Lalu menu kiri **Settings › Subnets**."),
        result("Address space `10.0.0.0/22`. Subnet: **GatewaySubnet**, **AzureFirewallSubnet**, subnet DNS resolver, **AzureBastionSubnet**."),
        why("Subnet dengan nama khusus (GatewaySubnet, AzureFirewallSubnet) wajib untuk layanan tersebut. Hub menampung layanan bersama yang dipakai semua spoke."),
      ]},
      { title: "Central logging (Pertanyaan 4)", items: [
        type("Kotak pencarian portal", ["Log Analytics workspaces"]),
        result("Workspace **law-platform-idc** di subscription Management."),
        why("Semua diagnostic settings diarahkan ke satu workspace oleh policy, sehingga log keamanan dan operasi ada di satu tempat."),
      ]},
      { title: "Pemilik subscription Connectivity (Pertanyaan 5)", items: [
        type("Kotak pencarian portal", ["Subscriptions"]),
        click("Klik subscription **Connectivity** › menu kiri **Access control (IAM)** › tab **Role assignments** › kotak filter **Role**: pilih **Owner**."),
        result("Owner adalah **grup** (contoh `grp-platform-owners`), bukan individu."),
        why("Akses diberikan ke grup Entra ID agar mudah dikelola dan diaudit; anggota grup berubah tanpa mengubah role assignment."),
      ]},
      { title: "Region yang diizinkan dan tag wajib (Pertanyaan 6 dan 7)", items: [
        type("Kotak pencarian portal", ["Policy"]),
        click("Menu kiri **Authoring › Assignments**. Klik assignment **Allowed locations** › tab/bagian **Parameters**. Ulangi untuk assignment yang namanya mengandung **tag**."),
        result("Region yang diizinkan: **Indonesia Central** (dan mungkin region DR yang disetujui). Tag wajib, contoh `CostCenter`, `Owner`, `Environment`."),
        why("Allowed locations adalah kontrol residensi data. Tag menjadi dasar alokasi biaya dan kepemilikan."),
      ]},
      { title: "Budget aktif (Pertanyaan 8)", items: [
        type("Kotak pencarian portal", ["Cost Management"]),
        click("Menu kiri **Budgets**. Jika diminta scope, klik **Scope** di bagian atas dan pilih management group **Pertamina-Training**."),
        result("Minimal satu budget dengan ambang alert (contoh 80% dan 100%)."),
        why("Budget dibuat sejak awal agar lonjakan biaya terdeteksi sebelum menjadi masalah."),
      ]},
    ]},
    { title: "Bagian D – Tugas tambahan Build (TECH)", prefix: "D", steps: [
      { title: "IP privat Azure Firewall dan route table", items: [
        click("Klik ikon **>_** (Cloud Shell) di bar atas. Jika diminta, pilih **Bash** dan **No storage account required** › **[Apply]**."),
        type("Cloud Shell (Bash)", [
          "az network firewall list --query \"[].{Nama:name, IP:ipConfigurations[0].privateIPAddress}\" -o table",
          "az network route-table list --query \"[].{Nama:name, RG:resourceGroup}\" -o table",
          "az account management-group list -o table",
        ]),
        result("Firewall **fw-hub** dengan IP `10.0.1.4`; daftar route table; daftar management group sama dengan yang terlihat di portal."),
        why("Portal dan CLI membaca data yang sama dari Azure Resource Manager. CLI berguna untuk otomatisasi dan untuk memeriksa banyak resource sekaligus."),
      ]},
    ]},
  ],
  validate: ["Login ke training tenant berhasil.", "8 pertanyaan terjawab di lembar jawaban.", "(Build) IP firewall dan daftar route table ditemukan lewat Cloud Shell."],
  issues: [
    ["Management group tidak terlihat", "Role Reader belum aktif di sesi Anda. Sign out, tutup browser, sign in ulang."],
    ["Portal menampilkan tenant lain", "Gunakan Settings › Directories + subscriptions › **[Switch]** ke training tenant."],
    ["Cloud Shell meminta storage", "Pilih **No storage account required**. File tidak disimpan permanen, dan itu tidak masalah untuk lab."],
  ],
}));
c.push(H2("Lampiran Lab 1 – Lembar jawaban"),
  table([0.4, 2.4, 2], [
    ["#", "Pertanyaan", "Jawaban tim"],
    ["1", "Berapa jumlah management group di bawah Pertamina-Training (semua level)?", ""],
    ["2", "Apa nama policy yang melarang public IP di Corp, dan apa effect-nya?", ""],
    ["3", "Berapa address space hub VNet?", ""],
    ["4", "Apa nama Log Analytics workspace pusat?", ""],
    ["5", "Siapa (grup apa) Owner subscription Connectivity?", ""],
    ["6", "Region apa saja yang diizinkan?", ""],
    ["7", "Tag apa saja yang wajib?", ""],
    ["8", "Budget apa yang aktif dan berapa ambang alert-nya?", ""],
  ]),
);

// ================================================================ LAB 2A
c.push(...lab({
  id: "2A", title: "Governance in Practice",
  when: "Hari 2 · 10:45–12:00", duration: "75 menit", level: "Operate (semua) + Build (TECH)", env: "Azure portal, Cloud Shell",
  goals: [
    "Membaca compliance dashboard Azure Policy dan menemukan resource yang tidak patuh.",
    "Menelusuri pemilik resource melalui Access control (IAM) dan Activity log.",
    "(Build) Membuat dan meng-assign custom policy dengan effect Audit.",
  ],
  usecase: [
    "Tim audit internal Pertamina meminta laporan: **berapa persen resource cloud yang patuh terhadap aturan**, resource mana yang tidak patuh, siapa pemiliknya, dan apa rencana perbaikannya.",
    "Bersamaan dengan itu, tim keuangan meminta agar **setiap resource group memiliki tag `CostCenter`** supaya biaya bisa dialokasikan. Engineer diminta membuat aturan untuk mendeteksinya.",
  ],
  prereq: ["Lab 1 selesai.", "Resource non-compliant contoh sudah disiapkan trainer di rg-spoke-teamN.", "Lembar laporan compliance tim."],
  parts: [
    { title: "Bagian A – Membaca compliance (Operate)", prefix: "A", steps: [
      { title: "Buka dashboard compliance", items: [
        type("Kotak pencarian portal", ["Policy"]),
        click("Menu kiri **Compliance**. Klik **Scope** (tombol **…** di bagian atas) › pilih management group **Landing Zones** › tombol biru **[Select]**."),
        result("Kartu **Overall resource compliance** dalam persen, jumlah resource non-compliant, dan daftar assignment dengan status compliance masing-masing."),
        why("Azure Policy mengevaluasi resource saat dibuat/diubah, saat assignment baru, dan setiap 24 jam. Dashboard merangkum hasil evaluasi terakhir untuk scope yang dipilih."),
      ]},
      { title: "Telusuri resource yang tidak patuh", items: [
        click("Klik salah satu assignment berstatus **Non-compliant** › tab **Resource compliance**. Filter **Resource group**: `rg-spoke-teamN`."),
        click("Klik nama resource › **[Compliance details]** (atau ikon detail di ujung baris)."),
        result("Panel detail menampilkan **Reason for non-compliance**, contoh “Current value: null – Target value: exists” untuk tag yang hilang."),
        why("Setiap policy membandingkan properti resource dengan aturan JSON. Panel ini menunjukkan properti mana yang tidak sesuai, sehingga perbaikannya jelas."),
      ]},
      { title: "Cari pemilik resource", items: [
        click("Buka resource tersebut › menu kiri **Activity log**. Atur **Timespan** ke **Last 7 days**. Cari operasi **Create or Update**."),
        result("Kolom **Event initiated by** menunjukkan akun yang membuat resource."),
        click("Menu kiri **Access control (IAM)** › tab **Role assignments**."),
        result("Daftar grup/akun yang memiliki akses ke resource (termasuk yang diwariskan dari resource group atau subscription)."),
        why("Activity log mencatat siapa melakukan apa di level Azure Resource Manager (disimpan 90 hari). IAM menunjukkan siapa yang **bisa** mengubah resource. Keduanya dipakai untuk menentukan pemilik perbaikan."),
      ]},
      { title: "Isi laporan compliance", items: [
        click("Isi lembar laporan: (1) % compliance, (2) 3 resource non-compliant, (3) alasannya, (4) pemilik, (5) keputusan: **perbaiki** atau **exemption** (dengan alasan dan tanggal kedaluwarsa)."),
        why("Compliance adalah proses berkelanjutan: temukan → tentukan pemilik → perbaiki atau buat pengecualian resmi. Exemption tanpa pemilik dan tanggal akan menumpuk seperti pengecualian lama di on-prem."),
      ]},
    ]},
    { title: "Bagian B – Custom policy “resource group wajib tag CostCenter” (Build)", prefix: "B", steps: [
      { title: "Buka Cloud Shell dan buat file aturan", items: [
        click("Klik ikon **>_** di bar atas › pastikan mode **Bash** (pilihan di kiri atas jendela Cloud Shell)."),
        type("Cloud Shell (Bash)", [
          "cat > rule.json <<'EOF'",
          "{",
          "  \"if\": {",
          "    \"allOf\": [",
          "      { \"field\": \"type\", \"equals\": \"Microsoft.Resources/subscriptions/resourceGroups\" },",
          "      { \"field\": \"tags['CostCenter']\", \"exists\": \"false\" }",
          "    ]",
          "  },",
          "  \"then\": { \"effect\": \"audit\" }",
          "}",
          "EOF",
          "cat rule.json",
        ]),
        result("Isi file `rule.json` tampil di layar sama persis dengan yang diketik."),
        why("File ini hanya berisi bagian **policyRule**: *jika* resource adalah resource group *dan* tag CostCenter tidak ada, *maka* catat sebagai non-compliant (audit)."),
      ]},
      { title: "Buat definition dan assignment", items: [
        type("Cloud Shell (Bash) – ganti N dengan nomor tim", [
          "N=1",
          "SUB=$(az account show --query id -o tsv)",
          "az policy definition create --name rg-require-costcenter-team$N \\",
          "  --display-name \"RG wajib tag CostCenter (team$N)\" --mode All --rules rule.json",
          "az policy assignment create --name rg-costcenter-audit-team$N \\",
          "  --policy rg-require-costcenter-team$N --scope /subscriptions/$SUB/resourceGroups/rg-spoke-team$N",
        ]),
        result("Kedua perintah mengembalikan JSON tanpa error. Di portal: **Policy › Assignments** menampilkan `rg-costcenter-audit-teamN`."),
        why("`--mode All` wajib karena target adalah resource group (mode **Indexed** hanya mengevaluasi resource yang mendukung tag dan lokasi). Assignment di level resource group membatasi dampak hanya ke tim Anda."),
        warn("Assignment ke resource group hanya mengevaluasi resource group itu sendiri. Untuk mengevaluasi **semua** resource group, assignment harus di level subscription atau management group – di lingkungan nyata, lakukan melalui pull request (Lab 5A)."),
      ]},
      { title: "Paksa evaluasi dan lihat hasil", items: [
        type("Cloud Shell (Bash)", [
          "az policy state trigger-scan --resource-group rg-spoke-team$N",
          "az policy state summarize --resource-group rg-spoke-team$N \\",
          "  --query \"policyAssignments[].{Assignment:policyAssignmentId, NonCompliant:results.nonCompliantResources}\" -o table",
        ]),
        result("Setelah beberapa menit, assignment `rg-costcenter-audit-teamN` menunjukkan **1** resource non-compliant jika rg-spoke-teamN belum memiliki tag CostCenter, atau **0** jika sudah."),
        why("Assignment baru butuh sekitar 5 menit untuk berlaku dan evaluasi berjalan asinkron. `trigger-scan` mempercepat evaluasi untuk lab; di produksi, siklus otomatis 24 jam juga berjalan."),
      ]},
    ]},
  ],
  validate: ["Lembar laporan compliance terisi lengkap.", "Pemilik minimal satu resource non-compliant teridentifikasi.", "(Build) Assignment `rg-costcenter-audit-teamN` ada dan menampilkan hasil evaluasi."],
  issues: [
    ["Compliance “Not started”", "Evaluasi belum berjalan. Gunakan resource contoh dari trainer atau jalankan `trigger-scan`."],
    ["Error “InvalidPolicyRule”", "JSON salah ketik (tanda kutip/kurung). Jalankan `cat rule.json` dan bandingkan."],
    ["Policy tidak mendeteksi resource group", "Mode bukan **All**. Hapus definition, buat ulang dengan `--mode All`."],
    ["AuthorizationFailed saat assignment", "Scope di luar akses Anda. Pastikan scope adalah rg-spoke-teamN."],
  ],
  cleanup: "Biarkan assignment tetap ada sampai hari 5 (dipakai di Lab 2B). Trainer menghapus semua assignment lab setelah training.",
}));

// ================================================================ LAB 2B
c.push(...lab({
  id: "2B", title: "Cost and Security Posture + Workshop RACI",
  when: "Hari 2 · 14:00–15:00", duration: "40 menit lab + 20 menit RACI", level: "Operate (semua) + Build (TECH)", env: "Azure portal",
  goals: [
    "Menganalisis biaya per tag dan menemukan biaya tanpa pemilik (untagged).",
    "Membuat budget dengan alert.",
    "Membaca secure score dan recommendation Defender for Cloud.",
    "(Build) Memperbaiki tag yang hilang secara otomatis dengan policy Modify dan remediation task.",
    "Menyusun RACI platform.",
  ],
  usecase: [
    "Direktur keuangan Pertamina bertanya: “Berapa biaya cloud per unit bisnis bulan ini, dan berapa yang tidak jelas pemiliknya?” Kepala SOC bertanya: “Seberapa aman lingkungan cloud kita, dan apa tiga perbaikan terpenting?”",
    "Tim Anda harus menjawab keduanya dan menetapkan **siapa** yang bertanggung jawab atas setiap aktivitas platform.",
  ],
  prereq: ["Subscription demo yang sudah berjalan beberapa hari (disiapkan trainer) untuk data biaya.", "Template RACI."],
  parts: [
    { title: "Bagian A – Biaya (Operate)", prefix: "A", steps: [
      { title: "Analisis biaya per tag", items: [
        type("Kotak pencarian portal", ["Cost Management"]),
        click("Menu kiri **Cost analysis**. Klik **Scope** di bagian atas › pilih subscription **demo** › **[Select]**."),
        click("Klik **Group by** (dropdown di atas grafik) › **Tag** › `CostCenter`. Ubah tampilan grafik menjadi **Column (stacked)**."),
        result("Grafik biaya per nilai CostCenter, termasuk segmen **Untagged** (biasanya di urutan terakhir)."),
        why("Cost Management membaca tag dari data pemakaian. Tag **tidak berlaku mundur**: biaya sebelum tag dipasang tetap tercatat sebagai Untagged. Data biaya juga baru muncul beberapa jam setelah pemakaian."),
      ]},
      { title: "Buat budget untuk resource group tim", items: [
        click("Menu kiri **Budgets** › **Scope** › pilih **rg-spoke-teamN** › tombol **[+ Add]** di command bar."),
        type("Formulir Create budget – isian", [
          "Name            : budget-teamN",
          "Reset period    : Monthly",
          "Amount          : 100",
        ]),
        click("Klik tombol biru **[Next]**. Di **Alert conditions** tambahkan dua baris: Type **Actual**, % of budget **80**; Type **Actual**, % of budget **100**. Isi **Alert recipients (email)** dengan email Anda. Klik tombol biru **[Create]**."),
        result("Budget `budget-teamN` muncul di daftar Budgets dengan status penggunaan saat ini."),
        why("Budget tidak menghentikan resource; budget **memberi peringatan**. Alert di 80% memberi waktu bertindak sebelum anggaran terlewati."),
      ]},
      { title: "Cari resource tanpa tag dengan Resource Graph", items: [
        type("Kotak pencarian portal", ["Resource Graph Explorer"]),
        type("Editor query Resource Graph Explorer", [
          "resources",
          "| where isnull(tags['CostCenter'])",
          "| project name, type, resourceGroup, subscriptionId",
          "| order by resourceGroup asc",
        ]),
        click("Klik tombol **[Run query]** di atas editor."),
        result("Tabel resource yang belum memiliki tag CostCenter di seluruh subscription yang bisa Anda baca."),
        why("Resource Graph membaca inventaris resource lintas subscription dalam hitungan detik. Analyst dapat memakainya untuk laporan rutin tanpa menunggu data biaya."),
      ]},
    ]},
    { title: "Bagian B – Postur keamanan (Operate)", prefix: "B", steps: [
      { title: "Baca secure score", items: [
        type("Kotak pencarian portal", ["Microsoft Defender for Cloud"]),
        click("Menu kiri **Overview**. Lihat kartu **Secure score**."),
        result("Secure score dalam persen beserta jumlah resource yang dinilai."),
        why("Secure score dihitung dari security control (Microsoft cloud security benchmark). Semakin banyak recommendation yang diperbaiki, semakin tinggi skornya. Angka ini adalah KPI keamanan yang mudah dipahami manajemen."),
      ]},
      { title: "Tiga recommendation teratas", items: [
        click("Menu kiri **Recommendations**. Urutkan berdasarkan **Risk level** atau **Potential score increase**. Klik recommendation teratas."),
        click("Pada halaman recommendation, klik **[Take action]** dan baca bagian **Remediate**."),
        result("Daftar resource terdampak dan langkah perbaikan."),
        click("Catat 3 recommendation teratas, resource terdampak, dan usulan pemilik perbaikan di lembar tim."),
        why("Recommendation diprioritaskan berdasarkan risiko, sehingga tim fokus pada perbaikan yang paling menurunkan risiko."),
      ]},
    ]},
    { title: "Bagian C – Perbaiki tag otomatis (Build)", prefix: "C", steps: [
      { title: "Assign policy Modify “Inherit a tag from the resource group if missing”", items: [
        type("Kotak pencarian portal", ["Policy"]),
        click("Menu kiri **Authoring › Definitions**. Pada kotak **Search** ketik nama di bawah ini, lalu klik definition yang muncul."),
        type("Kotak Search di halaman Definitions", ["Inherit a tag from the resource group if missing"]),
        click("Klik tombol **[Assign]** (Assign policy) di bagian atas. Tab **Basics**: **Scope** › pilih resource group `rg-spoke-teamN`."),
        click("Tab **Parameters**: hilangkan centang **Only show parameters that need input or review** bila perlu, isi **Tag Name** = `CostCenter`."),
        click("Tab **Remediation**: centang **Create a remediation task**. Managed identity: **System assigned**, lokasi **Indonesia Central**. Klik tombol biru **[Review + create]** lalu **[Create]**."),
        result("Notifikasi “Creating policy assignment… succeeded”. Di **Policy › Remediation** muncul remediation task berstatus **Evaluating/In progress**, lalu **Complete**."),
        why("Effect **Modify** mengubah resource agar patuh. Untuk resource yang **sudah ada**, perubahan hanya terjadi lewat **remediation task**, yang berjalan dengan managed identity milik assignment – karena itu identitas harus dibuat."),
        warn("Pastikan resource group `rg-spoke-teamN` sudah memiliki tag CostCenter (tambahkan lewat **Tags** di halaman resource group bila belum). Policy ini menyalin tag dari resource group ke resource di dalamnya."),
      ]},
    ]},
    { title: "Bagian D – Workshop RACI (semua, 20 menit)", prefix: "D", steps: [
      { title: "Isi template RACI", items: [
        click("Isi tabel di bawah dengan R (Responsible), A (Accountable), C (Consulted), I (Informed). Setiap baris hanya boleh punya **satu A**."),
        why("RACI menjawab pertanyaan “siapa yang dibangunkan jam 2 pagi?” sebelum insiden terjadi. Tanpa A yang jelas, keputusan tertunda saat dibutuhkan."),
      ]},
    ]},
  ],
  validate: ["Grafik biaya per CostCenter dan nilai Untagged dicatat.", "Budget `budget-teamN` aktif dengan alert 80% dan 100%.", "Secure score dan 3 recommendation teratas dicatat beserta pemiliknya.", "(Build) Remediation task selesai; resource di rg-spoke-teamN mewarisi tag CostCenter.", "Tabel RACI terisi."],
  issues: [
    ["Cost analysis kosong", "Data biaya belum tersedia. Gunakan subscription demo atau screenshot dari trainer."],
    ["Tidak bisa membuat budget", "Scope di luar akses Anda. Pilih rg-spoke-teamN."],
    ["Remediation task gagal", "Managed identity belum mendapat role (otomatis dibuat saat assignment). Tunggu 2–3 menit lalu **[Re-remediate]**, atau pastikan RG punya tag sumber."],
  ],
}));
c.push(H2("Lampiran Lab 2B – Template RACI"),
  table([2.2, 0.7, 0.8, 0.8, 0.6, 0.8], [
    ["Aktivitas", "CCoE", "Platform team", "Workload team", "SOC", "Keuangan"],
    ["Mengubah management group dan policy baseline", "", "", "", "", ""],
    ["Mengelola hub network dan firewall", "", "", "", "", ""],
    ["VPN / ExpressRoute dan hubungan dengan provider", "", "", "", "", ""],
    ["DNS (private zone, forwarder, ruleset)", "", "", "", "", ""],
    ["Identity sync dan akses admin (PIM)", "", "", "", "", ""],
    ["Central logging dan alert routing", "", "", "", "", ""],
    ["Backup dan uji restore", "", "", "", "", ""],
    ["Patching dan vulnerability scanning", "", "", "", "", ""],
    ["Incident response", "", "", "", "", ""],
    ["Budget, laporan biaya, chargeback", "", "", "", "", ""],
  ]),
);

// ================================================================ LAB 3A
c.push(...lab({
  id: "3A", title: "Identity and Privileged Access",
  when: "Hari 3 · 10:45–11:20", duration: "35 menit", level: "Build (engineer, team lead) + Operate (manager)", env: "Microsoft Entra admin center, Azure portal",
  goals: [
    "Mengaktifkan hak admin secara just-in-time melalui Privileged Identity Management (PIM) dengan approval.",
    "Memberikan akses Azure ke **grup**, bukan individu.",
    "Membuat Conditional Access policy dalam mode **report-only**.",
    "Menyiapkan role Hybrid Identity Administrator untuk Lab 3C.",
  ],
  usecase: [
    "Auditor menemukan bahwa banyak admin Pertamina memiliki hak permanen. Kebijakan baru: **tidak ada admin permanen** – hak diaktifkan saat dibutuhkan, dengan alasan dan persetujuan manager. Tim audit juga meminta akses **read-only** ke spoke aplikasi.",
    "Tim keamanan ingin mewajibkan MFA untuk akses ke portal admin, tetapi harus diuji dulu tanpa mengganggu pengguna.",
  ],
  prereq: ["Role eligible sudah disiapkan trainer (lihat bagian 2.2).", "Grup `grp-teamN-auditors` dan `grp-teamN-users` sudah ada.", "Manager tim siap sebagai approver."],
  parts: [
    { title: "Bagian A – Aktivasi role melalui PIM dengan approval", prefix: "A", steps: [
      { title: "Engineer meminta aktivasi role", items: [
        click("Buka tab baru. Kunjungi Entra admin center."),
        type("Kotak alamat browser", ["https://entra.microsoft.com"]),
        click("Menu kiri **ID Governance › Privileged Identity Management** › **My roles** › tab/menu **Azure resources**. Pada baris **Role Based Access Control Administrator** (scope `rg-spoke-teamN`), klik tautan biru **Activate**."),
        type("Panel Activate – kotak Reason", ["Lab 3A: memberi akses Reader ke tim auditor teamN"]),
        click("Atur durasi **1 jam**, lalu klik tombol biru **[Activate]** di bawah panel."),
        result("Notifikasi di kanan atas: permintaan **menunggu approval** (pending approval)."),
        why("Role eligible bukan hak aktif. Aktivasi membutuhkan alasan dan approval, sehingga setiap pemakaian hak admin tercatat dan disetujui."),
      ]},
      { title: "Manager menyetujui (Operate)", items: [
        click("Manager: Entra admin center › **ID Governance › Privileged Identity Management** › **Approve requests** › bagian **Azure resources**. Centang permintaan engineer tim Anda."),
        click("Klik **[Approve]**, isi justification, lalu klik tombol biru **[Confirm]**."),
        result("Status permintaan berubah menjadi **Approved**. Engineer melihat role di tab **Active assignments** dengan waktu kedaluwarsa."),
        why("Prinsip **least privilege** dan **separation of duties**: yang meminta dan yang menyetujui adalah orang berbeda. PIM mencatat keduanya di audit history."),
        warn("Role baru berlaku setelah token diperbarui. Engineer: sign out dari Azure portal, tutup tab, lalu sign in ulang."),
      ]},
    ]},
    { title: "Bagian B – Akses berbasis grup", prefix: "B", steps: [
      { title: "Berikan Reader kepada grup auditor", items: [
        click("Azure portal › **Resource groups** › **rg-spoke-teamN** › menu kiri **Access control (IAM)** › tombol **[+ Add]** › **Add role assignment**."),
        click("Tab **Role**: cari dan pilih **Reader** › **[Next]**. Tab **Members**: **Assign access to: User, group, or service principal** › klik **+ Select members** › cari `grp-teamN-auditors` › **[Select]**."),
        click("Klik tombol biru **[Review + assign]** dua kali."),
        result("Tab **Role assignments** menampilkan grup `grp-teamN-auditors` dengan role **Reader** pada scope resource group ini."),
        why("Akses diberikan ke **grup**: ketika auditor berganti, cukup ubah keanggotaan grup tanpa mengubah role assignment. Role Based Access Control Administrator hanya boleh memberi akses, bukan mengubah resource."),
      ]},
      { title: "Verifikasi dengan CLI", items: [
        type("Cloud Shell (Bash)", [
          "az role assignment list --resource-group rg-spoke-team$N \\",
          "  --query \"[].{Principal:principalName, Role:roleDefinitionName}\" -o table",
        ]),
        result("Baris `grp-teamN-auditors` dengan role `Reader`."),
        why("Role assignment adalah resource Azure biasa: bisa dibaca, diaudit, dan dikelola sebagai kode."),
      ]},
    ]},
    { title: "Bagian C – Conditional Access report-only (team lead)", prefix: "C", steps: [
      { title: "Aktifkan role Entra untuk team lead", items: [
        click("Team lead: Entra admin center › **ID Governance › Privileged Identity Management › My roles** › **Microsoft Entra roles**. Aktifkan **Conditional Access Administrator** dan **Hybrid Identity Administrator** (tautan biru **Activate**), alasan: `Lab 3A dan 3C`, durasi 2 jam."),
        result("Kedua role berada di tab **Active assignments**."),
        why("Hybrid Identity Administrator dibutuhkan di Lab 3C untuk memasang agent Cloud Sync. Mengaktifkannya sekarang menghemat waktu."),
      ]},
      { title: "Buat policy report-only", items: [
        click("Entra admin center › **Entra ID › Conditional Access** › **Policies** › **[+ New policy]**."),
        type("Kotak Name", ["CA-teamN-MFA-admin-portals"]),
        click("**Users** › **Include** › **Select users and groups** › centang **Users and groups** › pilih `grp-teamN-users`."),
        click("**Target resources** › **Include** › **Select resources** › pilih **Microsoft Admin Portals**."),
        click("**Grant** › **Grant access** › centang **Require multifactor authentication** › **[Select]**."),
        click("Di bagian bawah, **Enable policy**: pilih **Report-only**. Klik tombol biru **[Create]**."),
        result("Policy `CA-teamN-MFA-admin-portals` muncul dengan State **Report-only**."),
        why("Report-only mengevaluasi policy pada setiap sign-in dan mencatat hasilnya **tanpa** memaksakan. Tim bisa melihat dampaknya sebelum mengaktifkan, sehingga tidak ada pengguna yang terkunci."),
        warn("Jangan pilih **On**. Policy aktif yang salah konfigurasi dapat mengunci peserta lain dari tenant training."),
      ]},
    ]},
    { title: "Bagian D – Sign-in logs (Operate)", prefix: "D", steps: [
      { title: "Lihat hasil report-only", items: [
        click("Entra admin center › **Entra ID › Monitoring & health › Sign-in logs**. Filter **User**: anggota `grp-teamN-users` yang baru login."),
        click("Klik satu baris sign-in › tab **Report-only**."),
        result("Policy `CA-teamN-MFA-admin-portals` tercatat dengan hasil seperti **Report-only: Success** atau **Report-only: Failure** (MFA akan diminta jika policy aktif)."),
        why("Inilah bukti yang dibutuhkan sebelum mengaktifkan policy: berapa pengguna yang terdampak dan apakah ada pengecualian yang terlewat (misalnya akun break-glass)."),
      ]},
    ]},
  ],
  validate: ["Role engineer diaktifkan melalui PIM dengan approval manager.", "`grp-teamN-auditors` memiliki Reader di rg-spoke-teamN.", "Policy Conditional Access berstatus Report-only.", "Team lead aktif sebagai **Hybrid Identity Administrator** (wajib untuk Lab 3C)."],
  issues: [
    ["Role aktif tetapi akses ditolak", "Token lama. Sign out, tutup browser, sign in ulang."],
    ["Permintaan approval tidak terlihat", "Approver salah atau notifikasi tertunda. Buka **Approve requests** secara manual dan pilih kategori yang benar (Azure resources / Microsoft Entra roles)."],
    ["Tidak ada menu Conditional Access", "Role Conditional Access Administrator belum aktif."],
  ],
}));

// ================================================================ LAB 3C
c.push(...lab({
  id: "3C", title: "Hybrid Identity Sync (On-Prem + Azure)",
  when: "Hari 3 · 11:20–12:00", duration: "40 menit", level: "Build (team lead + engineer) + Operate", env: "DC01 (data center simulasi) + Microsoft Entra admin center",
  goals: [
    "Memasang agent Microsoft Entra Cloud Sync di domain controller on-prem.",
    "Menyinkronkan user dari satu OU ke Entra ID dan login dengan akun tersebut.",
    "Membuktikan bahwa sinkronisasi identitas hanya memerlukan outbound HTTPS, tanpa VPN.",
  ],
  usecase: [
    "Karyawan Pertamina login ke komputer kantor dengan akun Active Directory. Saat aplikasi pindah ke Azure, mereka harus bisa login dengan **akun yang sama**. Anak perusahaan juga memiliki forest AD sendiri yang tidak terhubung dengan forest induk.",
    "Tim Anda diminta melakukan pilot sinkronisasi untuk satu OU percontohan memakai **Cloud Sync**, yang mendukung beberapa forest terpisah ke satu tenant.",
  ],
  prereq: ["Lab 3A selesai: team lead **aktif** sebagai Hybrid Identity Administrator.", "Kredensial `teamN\\labadmin` dan password user Sync-Users dari kartu tim.", "Installer agent sudah ada di `C:\\LabFiles` di DC01."],
  parts: [
    { title: "Bagian A – Masuk ke DC01 dan periksa kesiapan", prefix: "A", steps: [
      { title: "Hubungkan ke DC01 melalui Bastion", items: [
        click("Azure portal › **Virtual machines** › **dc01-teamN** › tombol **[Connect]** di bagian atas › **Connect via Bastion** (atau **Bastion**)."),
        type("Formulir Bastion", ["Username : labadmin@teamN.corp.local", "Password : <dari kartu tim>"]),
        click("Klik tombol biru **[Connect]**. Sesi desktop DC01 terbuka di tab browser baru (izinkan pop-up bila diminta)."),
        result("Desktop Windows Server DC01 dengan Server Manager terbuka."),
        why("DC01 adalah domain controller di data center simulasi. Bastion memberi akses RDP lewat browser tanpa membuka port RDP ke internet."),
      ]},
      { title: "Periksa prasyarat dengan PowerShell", items: [
        click("Di DC01: klik kanan tombol **Start** › **Windows PowerShell (Admin)** / **Terminal (Admin)** › **Yes**."),
        type("PowerShell (Admin) di DC01", [
          "Get-KdsRootKey | Select-Object KeyId, EffectiveTime",
          "Test-NetConnection login.microsoftonline.com -Port 443",
          "Get-ADUser -Filter * -SearchBase \"OU=Sync-Users,DC=teamN,DC=corp,DC=local\" |",
          "  Select-Object Name, UserPrincipalName, DistinguishedName",
        ]),
        result("(1) Satu KDS root key tampil. (2) `TcpTestSucceeded : True`. (3) Daftar user, contoh `CN=Budi Santoso,OU=Sync-Users,DC=teamN,DC=corp,DC=local`. Salin satu DistinguishedName ke Notepad."),
        why("KDS root key diperlukan agar installer bisa membuat **gMSA** (akun layanan agent). Uji port 443 membuktikan DC01 bisa keluar ke Entra ID melalui RTR01 (internet edge on-prem) – **tanpa VPN**."),
        warn("Ganti `teamN` dengan nomor tim di **kedua** tempat dalam perintah, contoh `DC=team2`."),
      ]},
    ]},
    { title: "Bagian B – Pasang agent Cloud Sync", prefix: "B", steps: [
      { title: "Jalankan installer", items: [
        type("PowerShell (Admin) di DC01", ["Start-Process \"C:\\LabFiles\\AADConnectProvisioningAgentSetup.exe\""]),
        click("Centang **I agree to the license terms** › **[Install]**. Setelah selesai, wizard konfigurasi terbuka."),
        click("Pilih ekstensi **Microsoft Entra Connect cloud sync** (bukan HR-driven provisioning) › **[Next]**. Login dengan akun **team lead** yang aktif sebagai Hybrid Identity Administrator."),
        click("Halaman **Configure Service Account**: pilih **Create gMSA**, masukkan kredensial `teamN\\labadmin` › **[Next]**."),
        click("Halaman **Connect Active Directory**: pastikan domain `teamN.corp.local` tercantum › **[Next]** › **[Confirm]** › tunggu hingga **Agent installation is complete** › **[Exit]**."),
        result("Wizard selesai tanpa error."),
        why("Agent berjalan sebagai gMSA dengan hak minimum untuk membaca AD, dan berkomunikasi ke Entra ID hanya melalui koneksi keluar (outbound). Tidak ada port masuk yang perlu dibuka."),
        info("Nama halaman wizard dapat sedikit berbeda antar versi agent; urutannya tetap: ekstensi → login Entra → service account → domain → konfirmasi."),
      ]},
    ]},
    { title: "Bagian C – Konfigurasi sinkronisasi di Entra admin center", prefix: "C", steps: [
      { title: "Pastikan agent aktif", items: [
        click("Di laptop Anda: Entra admin center › **Entra ID › Entra Connect › Cloud sync** › tab **Agents**."),
        result("Agent `dc01-teamN` berstatus **Active**."),
        why("Agent melapor ke cloud setiap beberapa menit. Status Active berarti jalur outbound dari DC01 berfungsi."),
      ]},
      { title: "Buat configuration", items: [
        click("Tab **Configurations** › **[+ New configuration]** › **AD to Microsoft Entra ID sync**. Pilih domain `teamN.corp.local`, pastikan **Enable password hash sync** tercentang › tombol biru **[Create]**."),
        click("Pada configuration yang terbuka: **Scoping filters** › **Selected organizational units** › tambahkan OU berikut › **[Save]**."),
        type("Kotak OU (distinguished name)", ["OU=Sync-Users,DC=teamN,DC=corp,DC=local"]),
        click("Kembali ke **Overview** configuration › **[Review and enable]** › tombol biru **[Enable configuration]**."),
        result("Configuration berstatus **Healthy** (dapat butuh beberapa menit)."),
        why("Scoping filter membatasi sinkronisasi hanya ke OU pilot. Password hash sync memungkinkan user login ke cloud dengan password yang sama, dan tetap bisa login walaupun on-prem sedang gangguan."),
      ]},
      { title: "Provision on demand", items: [
        click("Menu kiri configuration › **Provision on demand**. Tempel DistinguishedName dari Notepad."),
        type("Kotak Distinguished name (contoh)", ["CN=Budi Santoso,OU=Sync-Users,DC=teamN,DC=corp,DC=local"]),
        click("Klik tombol biru **[Provision]**."),
        result("Empat langkah dengan **centang hijau**: Import user · Determine if user is in scope · Match user between source and target · Perform action."),
        why("Provision on demand menguji satu objek tanpa menunggu siklus sinkronisasi (sekitar 2 menit sekali). Catatan: fitur ini **mengabaikan scoping filter**, sehingga cocok untuk tes, tetapi bukan bukti bahwa scoping sudah benar."),
      ]},
    ]},
    { title: "Bagian D – Uji login dan monitoring", prefix: "D", steps: [
      { title: "Periksa user di Entra ID", items: [
        click("Entra admin center › **Entra ID › Users** › cari `Budi`."),
        result("User **Budi Santoso** dengan **On-premises sync enabled: Yes** dan UPN `budi.santoso@<tenant>.onmicrosoft.com` (bukan `@teamN.corp.local`)."),
        why("Domain `.local` tidak bisa diverifikasi di Entra ID, sehingga UPN diganti otomatis dengan domain onmicrosoft.com. Di Pertamina: tambahkan **UPN suffix routable dan terverifikasi** (contoh domain email perusahaan) di AD **sebelum** sinkronisasi produksi."),
      ]},
      { title: "Login sebagai user tersinkron", items: [
        click("Buka jendela **InPrivate** baru › `https://portal.azure.com` › login dengan UPN di atas dan password user dari kartu tim."),
        result("Login berhasil. Portal menampilkan Home tanpa subscription (user belum diberi akses Azure)."),
        why("Identitas tersinkron hanya membuktikan **siapa** user tersebut. Hak akses tetap diberikan terpisah melalui RBAC – identitas dan otorisasi adalah dua hal berbeda."),
      ]},
      { title: "Monitoring sinkronisasi (Operate)", items: [
        click("Entra admin center › **Cloud sync** › configuration tim › **Provisioning logs**. Filter **Status**: Success / Failure."),
        result("Entri provisioning untuk user di OU Sync-Users beserta waktu dan statusnya."),
        click("Catat: jumlah user tersinkron, error (jika ada), status agent."),
        why("Semua tim memakai **satu tenant** dengan **forest berbeda** – contoh nyata *disconnected forests*, skenario umum untuk anak perusahaan atau akuisisi."),
      ]},
    ]},
  ],
  validate: ["Agent `dc01-teamN` Active.", "Configuration Healthy dengan scoping OU Sync-Users.", "Provision on demand: empat centang hijau.", "Login dengan user tersinkron berhasil."],
  issues: [
    ["Installer gagal membuat gMSA (KDS)", "KDS root key belum ada atau belum efektif. Jalankan `Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10))` lalu ulangi wizard."],
    ["Wizard menolak akun saat login", "Hybrid Identity Administrator belum aktif (ulangi aktivasi PIM di Lab 3A) atau akun adalah guest."],
    ["Agent tidak muncul / Inactive", "Outbound 443 dari DC01 terblokir. Ulangi `Test-NetConnection`; lapor ke lab assistant untuk cek RTR01."],
    ["Provision on demand gagal di langkah Import", "DistinguishedName salah ketik. Salin ulang dari hasil `Get-ADUser`."],
    ["User tersinkron tetapi password salah", "Password hash belum tersinkron. Tunggu 2–5 menit atau reset password user di AD, lalu provision on demand lagi."],
  ],
}));

// ================================================================ LAB 3B
c.push(...lab({
  id: "3B", title: "Hub-and-Spoke",
  when: "Hari 3 · 14:00–15:00", duration: "60 menit", level: "Build (TECH) + Operate", env: "Azure portal, Cloud Shell",
  goals: [
    "Menghubungkan spoke tim ke hub dengan virtual network peering.",
    "Mengarahkan trafik internet spoke melalui Azure Firewall dengan user-defined route (UDR).",
    "Memverifikasi routing dengan Effective routes dan Next hop.",
  ],
  usecase: [
    "Aplikasi baru Pertamina (spoke tim Anda) harus memakai layanan bersama di hub: firewall untuk inspeksi internet, dan nanti VPN ke data center. Kebijakan keamanan: **semua trafik internet dari spoke wajib melalui Azure Firewall**.",
  ],
  prereq: ["Network Contributor di **rg-conn** aktif melalui PIM (minta approval manager seperti Lab 3A).", "VM `vm-app-teamN` berjalan di `snet-app`."],
  parts: [
    { title: "Bagian A – Peering spoke ↔ hub", prefix: "A", steps: [
      { title: "Buat peering dua arah", items: [
        click("Azure portal › **Virtual networks** › **vnet-spoke-teamN** › menu kiri **Settings › Peerings** › tombol **[+ Add]**."),
        type("Bagian “Remote virtual network summary”", [
          "Peering link name : hub-to-spoke-teamN",
          "Virtual network   : vnet-hub  (subscription Connectivity)",
          "[x] Allow 'vnet-hub' to access 'vnet-spoke-teamN'",
          "[x] Allow 'vnet-hub' to receive forwarded traffic from 'vnet-spoke-teamN'",
          "[x] Allow gateway or route server in 'vnet-hub' to forward traffic to 'vnet-spoke-teamN'",
        ]),
        type("Bagian “Local virtual network summary”", [
          "Peering link name : spoke-teamN-to-hub",
          "[x] Allow 'vnet-spoke-teamN' to access 'vnet-hub'",
          "[x] Allow 'vnet-spoke-teamN' to receive forwarded traffic from 'vnet-hub'",
          "[x] Enable 'vnet-spoke-teamN' to use 'vnet-hub's' remote virtual network gateway or route server",
        ]),
        click("Klik tombol biru **[Add]** di kiri bawah. Tunggu notifikasi selesai, lalu klik **[Refresh]**."),
        result("Peering `spoke-teamN-to-hub` berstatus **Connected** (Peering sync status: Fully Synchronized)."),
        why("Peering menghubungkan dua VNet lewat backbone Microsoft. **Gateway transit** (sisi hub) dan **use remote gateway** (sisi spoke) memungkinkan spoke memakai VPN gateway hub untuk mencapai on-prem di Lab 4A, tanpa gateway sendiri di setiap spoke."),
        info("Nama kotak centang dapat sedikit berbeda antar versi portal. Alternatif CLI ada di langkah berikut."),
      ]},
      { title: "(Alternatif) Peering dengan CLI", items: [
        type("Cloud Shell (Bash)", [
          "N=1",
          "HUB_ID=$(az network vnet show -g rg-conn -n vnet-hub --subscription <sub-connectivity> --query id -o tsv)",
          "SPOKE_ID=$(az network vnet show -g rg-spoke-team$N -n vnet-spoke-team$N --query id -o tsv)",
          "az network vnet peering create -g rg-conn -n hub-to-spoke-team$N --vnet-name vnet-hub \\",
          "  --subscription <sub-connectivity> --remote-vnet $SPOKE_ID \\",
          "  --allow-vnet-access --allow-forwarded-traffic --allow-gateway-transit",
          "az network vnet peering create -g rg-spoke-team$N -n spoke-team$N-to-hub \\",
          "  --vnet-name vnet-spoke-team$N --remote-vnet $HUB_ID \\",
          "  --allow-vnet-access --allow-forwarded-traffic --use-remote-gateways",
        ]),
        result("Kedua perintah sukses; `peeringState` = `Connected`."),
        why("Sisi hub dibuat lebih dulu dengan `--allow-gateway-transit`; jika tidak, `--use-remote-gateways` di sisi spoke akan ditolak."),
      ]},
    ]},
    { title: "Bagian B – Route table ke Azure Firewall", prefix: "B", steps: [
      { title: "Buat route table", items: [
        type("Kotak pencarian portal", ["Route tables"]),
        click("Tombol **[+ Create]**. Isi: Resource group `rg-spoke-teamN`, Region **Indonesia Central**, Name `rt-spoke-teamN`, **Propagate gateway routes: Yes**. Klik tombol biru **[Review + create]** › **[Create]**."),
        result("Deployment succeeded."),
        why("**Propagate gateway routes = Yes** agar route ke on-prem yang dipelajari VPN gateway (Lab 4A) tetap masuk ke subnet ini."),
      ]},
      { title: "Tambahkan route default", items: [
        click("Buka **rt-spoke-teamN** › menu kiri **Settings › Routes** › **[+ Add]**."),
        type("Formulir Add route", [
          "Route name             : default-to-fw",
          "Destination type       : IP Addresses",
          "Destination IP address : 0.0.0.0/0",
          "Next hop type          : Virtual appliance",
          "Next hop address       : 10.0.1.4",
        ]),
        click("Klik tombol biru **[Add]**."),
        click("Menu kiri **Settings › Subnets** › **[+ Associate]** › Virtual network `vnet-spoke-teamN`, Subnet `snet-app` › **[OK]**."),
        result("Route `default-to-fw` tampil; subnet `snet-app` ter-associate."),
        why("UDR menimpa route sistem default (0.0.0.0/0 → Internet). Dengan next hop **Virtual appliance 10.0.1.4**, semua trafik internet dari snet-app dipaksa melewati Azure Firewall untuk diinspeksi dan dicatat."),
      ]},
    ]},
    { title: "Bagian C – Verifikasi routing", prefix: "C", steps: [
      { title: "Effective routes", items: [
        type("Cloud Shell (Bash)", [
          "NIC=$(az vm show -g rg-spoke-team$N -n vm-app-team$N --query \"networkProfile.networkInterfaces[0].id\" -o tsv)",
          "az network nic show-effective-route-table --ids $NIC -o table",
        ]),
        result("Baris **Source: User · 0.0.0.0/0 · VirtualAppliance · 10.0.1.4** dan baris **VNetPeering** untuk `10.0.0.0/22`. Baris Default 0.0.0.0/0 → Internet berstatus **Invalid**."),
        why("Effective routes menunjukkan route yang **benar-benar berlaku** di NIC. Route User lebih diutamakan daripada Default untuk prefix yang sama, sehingga route default internet menjadi tidak aktif."),
      ]},
      { title: "Next hop dan uji internet", items: [
        type("Cloud Shell (Bash) – ganti 10.0.1N.4 dengan IP VM tim", [
          "az network watcher show-next-hop -g rg-spoke-team$N --vm vm-app-team$N \\",
          "  --source-ip 10.0.1N.4 --dest-ip 8.8.8.8 -o table",
          "az vm run-command invoke -g rg-spoke-team$N -n vm-app-team$N --command-id RunShellScript \\",
          "  --scripts \"curl -s -o /dev/null -w '%{http_code}' https://www.microsoft.com\"",
        ]),
        result("Next hop: **VirtualAppliance 10.0.1.4**. Run command mengembalikan `200` (diizinkan rule firewall lab)."),
        why("Next hop membuktikan jalur tanpa traceroute. HTTP 200 berarti firewall mengizinkan tujuan tersebut; jika diblokir, hasilnya timeout dan tercatat di log firewall sebagai **Deny**."),
      ]},
    ]},
    { title: "Bagian D – Operate: topologi dan log firewall", prefix: "D", steps: [
      { title: "Lihat topologi", items: [
        type("Kotak pencarian portal", ["Network Watcher"]),
        click("Menu kiri **Monitoring › Topology**. Pilih subscription dan resource group `rg-spoke-teamN`."),
        result("Diagram VNet spoke, subnet, NIC VM, dan hubungan peering ke hub."),
        why("Topologi membantu manager memahami “siapa terhubung ke siapa” tanpa membaca konfigurasi satu per satu."),
      ]},
      { title: "Baca log firewall", items: [
        click("**Log Analytics workspaces** › **law-platform-idc** › menu kiri **Logs** › tutup jendela Queries › pilih mode **KQL**."),
        type("Editor query Log Analytics", [
          "AZFWApplicationRule",
          "| where TimeGenerated > ago(1h)",
          "| where SourceIp startswith \"10.0.1N.\"",
          "| project TimeGenerated, SourceIp, Fqdn, Action, Rule",
          "| order by TimeGenerated desc",
        ]),
        click("Klik tombol biru **[Run]**."),
        result("Baris permintaan dari VM tim ke `www.microsoft.com` dengan Action **Allow**."),
        why("Karena semua trafik internet lewat firewall, setiap akses tercatat terpusat – bukti audit dan bahan investigasi SOC."),
        info("Jika tabel AZFWApplicationRule kosong, lingkungan memakai mode log lama: ganti baris pertama dengan `AzureDiagnostics | where Category == \"AzureFirewallApplicationRule\"`."),
      ]},
    ]},
  ],
  validate: ["Peering spoke ↔ hub **Connected** dengan gateway transit / use remote gateway.", "Route table ter-associate ke snet-app.", "Next hop ke 8.8.8.8 = VirtualAppliance 10.0.1.4.", "Log firewall menampilkan trafik VM tim."],
  issues: [
    ["Peering “Initiated”, bukan Connected", "Hanya satu sisi yang dibuat. Buat sisi hub (lihat langkah CLI)."],
    ["Error terkait remote gateway", "Sisi hub belum **allow gateway transit**, atau VPN gateway belum ada."],
    ["AuthorizationFailed pada vnet-hub", "Network Contributor di rg-conn belum aktif via PIM, atau token lama (sign in ulang)."],
    ["Next hop masih Internet", "Route table belum di-associate ke snet-app."],
    ["curl timeout", "Rule firewall belum mengizinkan; lapor lab assistant (rule collection lab)."],
  ],
}));

// ================================================================ LAB 4A
c.push(...lab({
  id: "4A", title: "Site-to-Site VPN dan Hybrid DNS (On-Prem + Azure)",
  when: "Hari 4 · 10:45–12:00", duration: "75 menit", level: "Build (TECH) + Operate", env: "RTR01 dan DC01 (data center simulasi) + Azure hub",
  goals: [
    "Membangun tunnel IPsec site-to-site dari data center tim ke VPN gateway hub, mengonfigurasi kedua sisinya.",
    "Membuktikan konektivitas dua arah antara on-prem dan spoke.",
    "Membuat hybrid DNS: on-prem me-resolve private endpoint, dan Azure me-resolve domain on-prem.",
  ],
  usecase: [
    "Pertamina sudah memesan ExpressRoute ke provider di Jakarta, tetapi provisioning butuh beberapa minggu. Aplikasi pertama harus bisa diakses dari data center **sekarang**. Keputusan: pasang **site-to-site VPN** yang nantinya menjadi jalur failover ExpressRoute.",
    "Aplikasi on-prem harus mengakses storage Azure melalui **private endpoint** (bukan internet), dan server Azure harus bisa me-resolve nama server di domain on-prem.",
  ],
  prereq: [
    "Lab 3B selesai (peering dengan use remote gateway).",
    "Network Contributor di rg-conn aktif (PIM).",
    "Dari papan kelas/kartu tim: IP publik **vgw-hub**, IP publik **RTR01**, **pre-shared key (PSK)**, nama storage account tim.",
  ],
  parts: [
    { title: "Bagian A – Sisi Azure", prefix: "A", steps: [
      { title: "Buat Local Network Gateway (mewakili data center tim)", items: [
        type("Kotak pencarian portal", ["Local network gateways"]),
        click("Tombol **[+ Create]**. Isi formulir di bawah, lalu tombol biru **[Review + create]** › **[Create]**."),
        type("Formulir Create local network gateway", [
          "Resource group : rg-conn",
          "Region         : Indonesia Central",
          "Name           : lng-teamN",
          "Endpoint       : IP address",
          "IP address     : <RTR01_PUBLIC_IP>",
          "Address space  : 172.16.N.0/24",
        ]),
        result("Deployment succeeded."),
        why("Local network gateway memberi tahu Azure **di mana** perangkat VPN on-prem (IP publik) dan **jaringan apa** di belakangnya (172.16.N.0/24). Address space ini tidak boleh tumpang tindih dengan Azure (10.0.0.0/16)."),
      ]},
      { title: "Buat Connection", items: [
        click("**Virtual network gateways** › **vgw-hub** › menu kiri **Settings › Connections** › **[+ Add]**."),
        type("Formulir Add connection", [
          "Name                     : cn-teamN",
          "Connection type          : Site-to-site (IPsec)",
          "Virtual network gateway  : vgw-hub",
          "Local network gateway    : lng-teamN",
          "Shared key (PSK)         : <PSK dari kartu tim>",
          "IKE Protocol             : IKEv2",
        ]),
        click("Klik tombol biru **[Review + create]** › **[Create]** (atau **[OK]**, tergantung versi)."),
        result("Connection `cn-teamN` muncul dengan status **Unknown** atau **Not connected** (sisi on-prem belum dikonfigurasi)."),
        why("Tunnel IPsec baru terbentuk jika **kedua sisi** dikonfigurasi dengan PSK dan parameter yang sama."),
      ]},
      { title: "Atur custom IPsec/IKE policy", items: [
        click("Buka **cn-teamN** › menu kiri **Settings › Configuration** › **IPsec / IKE policy: Custom**."),
        type("Isian IPsec/IKE policy", [
          "IKE Phase 1  Encryption: AES256   Integrity/PRF: SHA256   DH Group: DHGroup14",
          "IKE Phase 2  IPsec Encryption: AES256   IPsec Integrity: SHA256   PFS Group: None",
          "IPsec SA lifetime in KiloBytes: 102400000   IPsec SA lifetime in seconds: 27000",
        ]),
        click("Klik **[Save]** di bagian atas."),
        result("Notifikasi “Successfully updated connection”."),
        why("Policy eksplisit memastikan proposal kriptografi Azure **sama persis** dengan perangkat on-prem. Ketidakcocokan proposal adalah penyebab paling umum tunnel gagal (NO_PROPOSAL_CHOSEN)."),
      ]},
      { title: "(Alternatif) Semua langkah sisi Azure dengan CLI", items: [
        type("Cloud Shell (Bash)", [
          "N=1",
          "az network local-gateway create -g rg-conn -n lng-team$N -l indonesiacentral \\",
          "  --gateway-ip-address <RTR01_PUBLIC_IP> --local-address-prefixes 172.16.$N.0/24",
          "az network vpn-connection create -g rg-conn -n cn-team$N \\",
          "  --vnet-gateway1 vgw-hub --local-gateway2 lng-team$N --shared-key \"<PSK>\"",
          "az network vpn-connection ipsec-policy add -g rg-conn --connection-name cn-team$N \\",
          "  --ike-encryption AES256 --ike-integrity SHA256 --dh-group DHGroup14 \\",
          "  --ipsec-encryption AES256 --ipsec-integrity SHA256 --pfs-group None \\",
          "  --sa-lifetime 27000 --sa-max-size 102400000",
        ]),
        result("Ketiga perintah sukses tanpa error."),
        why("Hasilnya identik dengan langkah portal. Di produksi, konfigurasi ini sebaiknya dikelola sebagai kode (Lab 5A)."),
      ]},
    ]},
    { title: "Bagian B – Sisi on-prem (RTR01, strongSwan)", prefix: "B", steps: [
      { title: "Hubungkan ke RTR01", items: [
        click("Azure portal › **Virtual machines** › **rtr01-teamN** › **[Connect]** › **Connect via Bastion**. Authentication type **Password**, username `labadmin`, password dari kartu tim › **[Connect]**."),
        result("Terminal Linux RTR01 terbuka di tab baru."),
        why("RTR01 berperan sebagai **firewall/router on-prem** dengan IP publik – setara perangkat VPN di data center Pertamina."),
      ]},
      { title: "Isi konfigurasi IPsec", items: [
        type("Terminal RTR01 (bash) – ganti nilai di dalam tanda kutip", [
          "HUB_GW=\"<HUB_VPN_GATEWAY_PUBLIC_IP>\"",
          "RTR_PIP=\"<RTR01_PUBLIC_IP>\"",
          "PSK=\"<PSK dari kartu tim>\"",
          "sudo sed -i \"s/<HUB_VPN_GATEWAY_PUBLIC_IP>/$HUB_GW/; s/<RTR01_PUBLIC_IP>/$RTR_PIP/\" /etc/ipsec.conf",
          "echo \"$RTR_PIP $HUB_GW : PSK \\\"$PSK\\\"\" | sudo tee /etc/ipsec.secrets > /dev/null",
          "sudo cat /etc/ipsec.conf",
        ]),
        result("File `/etc/ipsec.conf` berisi `leftid=<IP publik RTR01>`, `right=<IP publik vgw-hub>`, `leftsubnet=172.16.N.0/24`, `rightsubnet=10.0.0.0/16`, `ike=aes256-sha256-modp2048!`, `esp=aes256-sha256!`."),
        why("`ike` dan `esp` harus cocok dengan custom policy Azure (AES256, SHA256, DH Group 14 = modp2048, PFS None). RTR01 berada di belakang NAT 1:1, sehingga `left` memakai IP privat dan `leftid` memakai IP publik."),
      ]},
      { title: "Jalankan tunnel", items: [
        type("Terminal RTR01 (bash)", [
          "sudo ipsec restart",
          "sleep 15",
          "sudo ipsec statusall | grep -E \"ESTABLISHED|INSTALLED|===\"",
        ]),
        result("Baris `azure-hub[1]: ESTABLISHED …`, `azure-hub{1}: INSTALLED, TUNNEL …`, dan `172.16.N.0/24 === 10.0.0.0/16`."),
        click("Di Azure portal: **cn-teamN** › **Overview** › **[Refresh]**."),
        result("Status **Connected**; **Data in/Data out** mulai bertambah."),
        why("ESTABLISHED berarti negosiasi IKE (fase 1) berhasil; INSTALLED berarti SA IPsec (fase 2) untuk pasangan subnet tersebut aktif. Azure menampilkan Connected setelah tunnel terbentuk."),
        warn("**Checkpoint menit ke-35:** jika belum Connected, minta konfigurasi “jalur cepat” dari lab assistant agar Anda tetap bisa mengerjakan Bagian C dan D."),
      ]},
    ]},
    { title: "Bagian C – Uji konektivitas", prefix: "C", steps: [
      { title: "Dari DC01 ke VM spoke", items: [
        click("Buka sesi Bastion DC01 (seperti Lab 3C) › PowerShell (Admin)."),
        type("PowerShell (Admin) di DC01 – ganti 10.0.1N.4 dengan IP VM tim", ["Test-NetConnection 10.0.1N.4 -Port 22"]),
        result("`TcpTestSucceeded : True`."),
        why("Paket dari 172.16.N.4 diarahkan oleh route table on-prem ke RTR01, masuk tunnel IPsec, keluar di vgw-hub, lalu ke spoke melalui peering (gateway transit). Jalur balik mengikuti route yang dipelajari spoke dari gateway (propagate gateway routes = Yes)."),
      ]},
    ]},
    { title: "Bagian D – Hybrid DNS", prefix: "D", steps: [
      { title: "Sebelum: on-prem me-resolve IP publik", items: [
        type("PowerShell (Admin) di DC01 – ganti nama storage dari kartu tim", ["Resolve-DnsName <stteamNlab...>.blob.core.windows.net"]),
        result("Jawaban berupa **IP publik** (contoh 20.x.x.x)."),
        why("DC01 belum tahu tentang zona privat Azure, sehingga memakai DNS publik. Aplikasi akan mencoba lewat internet – dan ditolak karena storage hanya menerima akses lewat private endpoint."),
      ]},
      { title: "Buat conditional forwarder ke inbound endpoint", items: [
        type("PowerShell (Admin) di DC01", [
          "Add-DnsServerConditionalForwarderZone -Name \"blob.core.windows.net\" `",
          "  -MasterServers 10.0.2.4 -ReplicationScope Forest",
          "Clear-DnsServerCache -Force",
          "Resolve-DnsName <stteamNlab...>.blob.core.windows.net",
        ]),
        result("Jawaban **CNAME** ke `<stteamNlab...>.privatelink.blob.core.windows.net` lalu **A 10.0.1N.x** (IP private endpoint)."),
        why("DC01 meneruskan pertanyaan untuk zona **publik** `blob.core.windows.net` ke inbound endpoint DNS Private Resolver (10.0.2.4) melalui VPN. Azure DNS mengikuti CNAME ke zona privat `privatelink.blob.core.windows.net` yang ter-link ke hub dan mengembalikan IP privat."),
        warn("Jangan meneruskan ke `168.63.129.16` (tidak bisa dijangkau dari luar VNet) dan jangan membuat forwarder untuk zona `privatelink.` – keduanya kesalahan klasik."),
      ]},
      { title: "Azure me-resolve domain on-prem (forwarding rule)", items: [
        click("Azure portal › **DNS forwarding rulesets** › **frs-hub** › menu kiri **Settings › Forwarding rules** › **[+ Add]**."),
        type("Formulir Add forwarding rule", [
          "Rule name     : teamN-corp-local",
          "Domain name   : teamN.corp.local.",
          "Rule state    : Enabled",
          "Destination   : IP 172.16.N.4   Port 53",
        ]),
        click("Klik tombol biru **[Add]**. Lalu buka **Settings › Virtual network links** dan pastikan `vnet-spoke-teamN` tercantum."),
        result("Rule `teamN-corp-local` berstatus Enabled; spoke tim ter-link ke ruleset."),
        why("Ruleset memberi tahu Azure DNS: pertanyaan untuk `teamN.corp.local` diteruskan lewat **outbound endpoint** ke DC01. Domain diakhiri titik (FQDN). Ruleset hanya berlaku untuk VNet yang ter-link – link ini terpisah dari peering."),
      ]},
      { title: "Uji dari VM Azure", items: [
        type("Cloud Shell (Bash)", [
          "az vm run-command invoke -g rg-spoke-team$N -n vm-app-team$N --command-id RunShellScript \\",
          "  --scripts \"nslookup dc01.team$N.corp.local\"",
        ]),
        result("Jawaban `Address: 172.16.N.4`."),
        why("VM memakai Azure DNS (168.63.129.16 di dalam VNet). Karena ruleset ter-link ke spoke, pertanyaan untuk domain on-prem diteruskan ke DC01 melalui VPN."),
      ]},
    ]},
    { title: "Bagian E – Operate: status dan keputusan", prefix: "E", steps: [
      { title: "Pantau koneksi dan bandingkan opsi", items: [
        click("**cn-teamN** › **Overview**: catat Status, Data in, Data out. Menu **Help › VPN troubleshoot** (bila tersedia) untuk melihat diagnosis."),
        click("Isi tabel perbandingan VPN vs ExpressRoute di lampiran (biaya relatif, bandwidth, SLA, lead time, risiko)."),
        why("Manager memutuskan jalur konektivitas berdasarkan throughput, latensi, compliance, dan waktu – bukan sekadar teknologi. Microsoft menyarankan VPN tetap dipertahankan sebagai failover setelah ExpressRoute aktif."),
      ]},
    ]},
  ],
  validate: ["Connection `cn-teamN` **Connected**.", "`Test-NetConnection` dari DC01 ke VM spoke berhasil.", "DC01 me-resolve storage ke **IP privat**.", "VM spoke me-resolve `dc01.teamN.corp.local` ke 172.16.N.4.", "Tabel VPN vs ExpressRoute terisi."],
  issues: [
    ["Log: NO_PROPOSAL_CHOSEN", "Proposal tidak cocok. Samakan custom IPsec/IKE policy dengan `ike=`/`esp=` di ipsec.conf."],
    ["Log: AUTHENTICATION_FAILED", "PSK berbeda di dua sisi, atau `leftid` bukan IP publik RTR01."],
    ["Tunnel tidak pernah mencoba tersambung", "`right=` salah, atau NSG RTR01 belum mengizinkan UDP 500/4500 dari vgw-hub. Cek `sudo journalctl -u strongswan-starter -n 50`."],
    ["Connected tetapi Test-NetConnection gagal", "Cek: `sysctl net.ipv4.ip_forward` = 1 di RTR01; route table on-prem 10.0.0.0/16 → RTR01; NSG spoke mengizinkan 172.16.0.0/16; rule Azure Firewall."],
    ["DC01 tetap mendapat IP publik", "Forwarder dibuat untuk zona privatelink atau ke IP salah. Hapus dan buat ulang untuk `blob.core.windows.net` → 10.0.2.4; jalankan `Clear-DnsServerCache`."],
    ["VM tidak bisa resolve domain on-prem", "Domain rule tanpa titik akhir, ruleset belum ter-link ke spoke, atau VPN belum Connected."],
  ],
  cleanup: "Biarkan semua konfigurasi aktif – dipakai di Lab 4B dan game day. Trainer menghapus connection, local network gateway, dan forwarding rule setelah training.",
}));
c.push(H2("Lampiran Lab 4A – Perbandingan VPN vs ExpressRoute"),
  table([1.5, 2, 2], [
    ["Kriteria", "Site-to-site VPN", "ExpressRoute (Jakarta/Jakarta2)"],
    ["Jalur", "Internet, terenkripsi IPsec", ""],
    ["Bandwidth dan latensi", "", ""],
    ["Lead time", "Hari (gateway 45+ menit)", ""],
    ["Biaya relatif", "", ""],
    ["Risiko utama", "", ""],
    ["Rekomendasi tim untuk Pertamina", "", ""],
  ]),
);

// ================================================================ LAB 4B
c.push(...lab({
  id: "4B", title: "Azure Arc dan Monitoring (On-Prem + Azure)",
  when: "Hari 4 · 14:00–15:00", duration: "60 menit", level: "Build (TECH) + Operate", env: "APP01 (data center simulasi) + Azure Arc, Azure Monitor",
  goals: [
    "Menghubungkan server on-prem ke Azure Arc.",
    "Mengaktifkan monitoring (Azure Monitor Agent) pada server Arc dan membaca datanya di Log Analytics.",
    "Membuat alert yang sampai ke action group.",
    "(Operate) Menyusun dashboard dan KPI operasional.",
  ],
  usecase: [
    "Ratusan server Pertamina akan tetap di data center selama bertahun-tahun, tetapi tim operasi ingin **satu cara** memantau, menerapkan policy, dan mengelola patch untuk server on-prem maupun Azure. Pilot: hubungkan satu server aplikasi (APP01) ke Azure Arc dan pastikan alert CPU sampai ke tim yang tepat.",
  ],
  prereq: [
    "APP01 sudah disiapkan trainer untuk evaluasi Arc (extension dihapus, Azure guest agent dimatikan, akses IMDS diblokir, `MSFT_ARC_TEST=true`).",
    "Action group `ag-training-teamN` (email tim) sudah ada.",
    "Contributor di rg-arc-teamN.",
  ],
  parts: [
    { title: "Bagian A – Onboarding APP01 ke Azure Arc", prefix: "A", steps: [
      { title: "Generate script onboarding di portal", items: [
        type("Kotak pencarian portal", ["Azure Arc"]),
        click("Menu kiri **Azure Arc resources › Machines** › tombol **[+ Add/Create]** › **Add a machine** › kartu **Add a single server** › tombol biru **[Generate script]**."),
        type("Tab Basics", [
          "Subscription      : <subscription tim>",
          "Resource group    : rg-arc-teamN",
          "Region            : Indonesia Central",
          "Operating system  : Windows",
          "Connectivity      : Public endpoint",
        ]),
        click("**[Next]** › tab **Tags**: isi `CostCenter`, `Owner`, `Environment` › **[Next]** › tab **Download and run script**: klik **[Download]** (atau salin isi script)."),
        result("File `OnboardingScript.ps1` terunduh ke laptop."),
        why("Script berisi perintah untuk mengunduh Azure Connected Machine agent dan mendaftarkannya ke subscription, resource group, dan region yang Anda pilih. Tag ikut dipasang sehingga server Arc langsung patuh policy tag."),
      ]},
      { title: "Periksa kesiapan APP01", items: [
        click("Azure portal › **Virtual machines** › **app01-teamN** › **[Connect]** › **Connect via Bastion**, username `labadmin`, password dari kartu tim › **[Connect]**. Buka **PowerShell (Admin)**."),
        type("PowerShell (Admin) di APP01", [
          "[Environment]::GetEnvironmentVariable(\"MSFT_ARC_TEST\", \"Machine\")",
          "Get-Service WindowsAzureGuestAgent | Select-Object Status, StartType",
          "Get-NetFirewallRule -Name BlockAzureIMDS | Select-Object Name, Enabled, Action",
        ]),
        result("`true` · `Stopped  Disabled` · `BlockAzureIMDS  True  Block`."),
        why("APP01 sebenarnya Azure VM. Microsoft hanya mengizinkan Arc pada Azure VM untuk **evaluasi/training**, dengan syarat guest agent dimatikan dan IMDS diblokir, agar VM berperilaku seperti server di luar Azure. Tanpa ini, installer Arc akan berhenti dengan error."),
      ]},
      { title: "Jalankan script di APP01", items: [
        click("Buka `OnboardingScript.ps1` di Notepad laptop › **Ctrl+A**, **Ctrl+C**. Di APP01: Start › ketik `PowerShell ISE` › klik kanan › **Run as administrator** › **File › New** › **Ctrl+V** (clipboard Bastion) › tekan **F5**."),
        result("Script mengunduh dan memasang agent, lalu menampilkan instruksi login: buka `https://microsoft.com/devicelogin` dan masukkan kode."),
        click("Di laptop: buka `https://microsoft.com/devicelogin`, ketik kode yang tampil, login dengan akun `userNN` Anda."),
        result("Script di APP01 menampilkan **Connected machine to Azure** dan tautan ke resource."),
        why("Device code login memungkinkan server tanpa browser terautentikasi memakai identitas Anda. Setelah terdaftar, agent memakai **managed identity**-nya sendiri; kredensial Anda tidak disimpan di server."),
      ]},
      { title: "Verifikasi agent", items: [
        type("PowerShell di APP01", ["azcmagent show"]),
        result("`Agent Status : Connected`, Resource Name APP01, region `indonesiacentral`."),
        click("Azure portal › **Azure Arc › Machines** › **[Refresh]**."),
        result("**APP01** berstatus **Connected**."),
        why("Agent mengirim heartbeat setiap 5 menit melalui **outbound HTTPS 443** (lewat RTR01). Tidak memerlukan VPN. Perhatikan sekarang ada **dua resource**: Azure VM (virtual hardware) dan Arc machine (sistem operasi yang dikelola)."),
      ]},
    ]},
    { title: "Bagian B – Monitoring dan alert", prefix: "B", steps: [
      { title: "Aktifkan VM insights", items: [
        click("**Azure Arc › Machines** › **APP01** › menu kiri **Monitoring › Insights** › tombol biru **[Enable]**."),
        click("Pilih **Data collection rule**: **[Create new]** › Name `dcr-arc-teamN`, Log Analytics workspace `law-platform-idc` › **[Create]** › **[Configure]**."),
        result("Notifikasi deployment; setelah beberapa menit, **Extensions** APP01 menampilkan **AzureMonitorWindowsAgent** (Provisioning succeeded)."),
        why("Azure Monitor Agent (AMA) dipasang sebagai extension melalui agent Arc. Data collection rule (DCR) menentukan **data apa** yang dikumpulkan dan **ke mana** dikirim."),
      ]},
      { title: "Lihat data di Log Analytics", items: [
        click("**Log Analytics workspaces** › **law-platform-idc** › **Logs** (mode KQL). Tunggu 5–10 menit setelah langkah sebelumnya."),
        type("Editor query Log Analytics", [
          "Heartbeat",
          "| where Computer startswith \"APP01\"",
          "| summarize TerakhirTerlihat = max(TimeGenerated) by Computer, Category",
          "",
          "InsightsMetrics",
          "| where Computer startswith \"APP01\" and Namespace == \"Processor\" and Name == \"UtilizationPercentage\"",
          "| summarize CPU = avg(Val) by bin(TimeGenerated, 5m)",
        ]),
        click("Blok satu query (seleksi teks) lalu klik tombol biru **[Run]**. Ulangi untuk query kedua."),
        result("Heartbeat dengan `TerakhirTerlihat` kurang dari 5 menit lalu; nilai CPU rata-rata per 5 menit."),
        why("Data server on-prem kini berada di workspace yang sama dengan resource Azure – satu tempat untuk query, dashboard, dan alert."),
      ]},
      { title: "Buat alert CPU", items: [
        click("Dengan query **InsightsMetrics** terpilih, klik **[+ New alert rule]** di toolbar Logs."),
        type("Tab Condition", ["Measure: CPU   Aggregation type: Average   Aggregation granularity: 5 minutes", "Operator: Greater than   Threshold value: 80   Frequency of evaluation: 5 minutes"]),
        click("Tab **Actions** › **Select action groups** › centang `ag-training-teamN` › **[Select]**."),
        type("Tab Details", ["Severity: 2 - Warning", "Alert rule name: alert-app01-cpu-teamN", "Region: Indonesia Central"]),
        click("Tombol biru **[Review + create]** › **[Create]**."),
        result("Alert rule `alert-app01-cpu-teamN` muncul di **Monitor › Alerts › Alert rules**."),
        why("Alert rule = resource + sinyal + kondisi. Action group menentukan **siapa diberi tahu** dan **apa yang dijalankan** (email, Teams, ITSM, runbook)."),
      ]},
      { title: "Uji alert dengan beban CPU", items: [
        type("PowerShell (Admin) di APP01", [
          "1..4 | ForEach-Object { Start-Job { $end=(Get-Date).AddMinutes(10); while((Get-Date) -lt $end){} } }",
          "Get-Job",
        ]),
        result("Empat job berstatus **Running**. Dalam 10–15 menit: **Monitor › Alerts** menampilkan alert **Fired**, dan email dari action group masuk."),
        why("Alert log dievaluasi berkala dan data metrik butuh beberapa menit untuk masuk, sehingga ada jeda. Itulah alasan uji alert dilakukan **sebelum** go-live: membuktikan jalur notifikasi benar-benar sampai."),
        type("PowerShell (Admin) di APP01 – setelah alert terpicu", ["Get-Job | Stop-Job; Get-Job | Remove-Job"]),
      ]},
    ]},
    { title: "Bagian C – Operate: dashboard dan KPI", prefix: "C", steps: [
      { title: "Buat workbook sederhana", items: [
        click("Azure portal › **Monitor** › **Workbooks** › **[+ New]** › **[+ Add]** › **Add query**. Pilih workspace `law-platform-idc`, tempel query InsightsMetrics, Visualization **Line chart** › **[Run Query]** › **[Done Editing]** › ikon **Save** (disket) › nama `wb-ops-teamN`."),
        result("Workbook dengan grafik CPU server Arc."),
        why("Workbook menggabungkan data Azure dan on-prem dalam satu tampilan untuk rapat operasional."),
      ]},
      { title: "Definisikan KPI", items: [
        click("Isi tabel KPI di lampiran: nama KPI, sumber data, target, pemilik."),
        why("KPI yang disepakati mengubah monitoring dari “melihat grafik” menjadi “mengelola layanan”."),
      ]},
    ]},
  ],
  validate: ["APP01 **Connected** di Azure Arc.", "Extension AzureMonitorWindowsAgent terpasang.", "Heartbeat dan InsightsMetrics APP01 muncul di Log Analytics.", "Alert terpicu dan email action group diterima.", "Workbook dan tabel KPI dibuat."],
  issues: [
    ["Script berhenti: “running on an Azure VM”", "Arc prep belum lengkap. Lapor ke lab assistant; setelah diperbaiki, buka sesi PowerShell **baru** dan jalankan ulang."],
    ["Gagal register / Disconnected", "Outbound 443 terblokir (cek RTR01) atau resource provider `Microsoft.HybridCompute` belum terdaftar."],
    ["Extension AMA gagal", "Resource provider `Microsoft.GuestConfiguration` / `Microsoft.HybridConnectivity` belum terdaftar, atau DCR belum terasosiasi."],
    ["Query kosong", "Tunggu 5–10 menit; pastikan DCR mengirim ke `law-platform-idc`."],
    ["Alert tidak terpicu", "Beban CPU belum melewati 80% selama periode evaluasi; jalankan lebih banyak job atau turunkan threshold sementara."],
  ],
  cleanup: "Hentikan semua job beban CPU. Biarkan APP01 tetap terhubung untuk game day. Trainer menghapus resource Arc dan DCR setelah training.",
}));
c.push(H2("Lampiran Lab 4B – Tabel KPI operasional"),
  table([1.6, 1.6, 0.9, 1], [
    ["KPI", "Sumber data", "Target", "Pemilik"],
    ["% server compliant terhadap policy", "Azure Policy", "", ""],
    ["Patch kritikal tertunda", "Update Manager", "", ""],
    ["Alert terbuka > 24 jam", "Azure Monitor Alerts / ITSM", "", ""],
    ["Waktu respons alert P1", "ITSM", "", ""],
    ["Secure score", "Defender for Cloud", "", ""],
  ]),
);

// ================================================================ LAB 5A
c.push(...lab({
  id: "5A", title: "Platform Automation",
  when: "Hari 5 · 09:45–10:30", duration: "30 menit", level: "Build (engineer mengusulkan) + Operate (manager menyetujui)", env: "Repository Git training (GitHub atau Azure DevOps) + pipeline",
  goals: [
    "Mengusulkan perubahan platform melalui pull request, bukan klik manual di portal.",
    "Membaca hasil plan/what-if sebelum perubahan diterapkan.",
    "Menyetujui atau menolak perubahan berdasarkan dampaknya.",
  ],
  usecase: [
    "Tim HSE Pertamina meminta **workload landing zone kedua** untuk aplikasi baru. Kebijakan platform team: semua perubahan platform harus melalui pull request yang direview dan disetujui, sehingga ada jejak audit untuk pemeriksaan BUMN.",
  ],
  prereq: ["URL repository dan akun Git dari kartu tim.", "Folder `teams/teamN` di repository.", "Pipeline what-if dan deploy sudah dikonfigurasi trainer."],
  parts: [
    { title: "Bagian A – Engineer mengusulkan perubahan (Build)", prefix: "A", steps: [
      { title: "Buka file parameter tim", items: [
        click("Buka URL repository dari kartu tim › masuk ke folder `teams/teamN/` › klik file `spoke2.bicepparam` › klik ikon **pensil (Edit this file)** di kanan atas area file."),
        result("Editor file terbuka di browser."),
        why("Platform landing zone disimpan sebagai kode (Bicep, Azure Verified Modules). Setiap tim hanya boleh mengubah folder miliknya."),
      ]},
      { title: "Isi parameter workload landing zone kedua", items: [
        type("Editor file teams/teamN/spoke2.bicepparam – ganti N dan email", [
          "using '../../modules/spoke/main.bicep'",
          "",
          "param teamName      = 'teamN'",
          "param spokeName     = 'spoke2'",
          "param location      = 'indonesiacentral'",
          "param addressPrefix = '10.0.2N.0/24'",
          "param tags = {",
          "  CostCenter: 'CC-HSE-01'",
          "  Owner: 'userNN@<tenant>.onmicrosoft.com'",
          "  Environment: 'training'",
          "}",
        ]),
        why("Nilai dipilih agar patuh terhadap aturan platform: region yang diizinkan, address space yang tidak bentrok (tim 1 = 10.0.21.0/24, berbeda dari spoke pertama 10.0.11.0/24), dan tag wajib lengkap."),
      ]},
      { title: "Commit ke branch baru dan buka pull request", items: [
        click("Klik tombol hijau **[Commit changes…]** (GitHub) di kanan atas. Pilih **Create a new branch for this commit and start a pull request**, nama branch `teamN/add-spoke2`, pesan commit: `Tambah spoke2 untuk aplikasi HSE` › tombol hijau **[Propose changes]**."),
        click("Halaman **Open a pull request**: judul `teamN: workload landing zone spoke2` › tombol hijau **[Create pull request]**."),
        result("Pull request terbuka. Di bagian **Checks**, job **what-if** berjalan (ikon kuning) lalu selesai (centang hijau)."),
        why("Membuat branch memisahkan usulan dari kode produksi. Pipeline otomatis menjalankan **what-if** untuk menunjukkan dampak tanpa mengubah apa pun."),
        info("Azure DevOps: **Repos › Files** › Edit › **Commit** dengan opsi *Create a pull request*; job pipeline tampil di bagian **Checks/Status** pull request."),
      ]},
      { title: "Baca hasil what-if", items: [
        click("Di pull request, bagian **Checks** › klik **Details** pada job what-if."),
        result("Ringkasan seperti: `+ Create: Microsoft.Network/virtualNetworks vnet-spoke2-teamN`, peering ke hub, route table – **tanpa** resource yang dihapus (`- Delete` = 0)."),
        why("What-if membandingkan kode dengan kondisi Azure saat ini. Reviewer harus mewaspadai baris **Delete** atau **Modify** yang tidak diharapkan – di sanalah risiko perubahan platform."),
      ]},
    ]},
    { title: "Bagian B – Manager meninjau dan memutuskan (Operate)", prefix: "B", steps: [
      { title: "Review dengan checklist", items: [
        click("Manager: buka pull request › tab **Files changed**. Periksa dengan checklist: (1) region sesuai allowed locations, (2) address space tidak bentrok, (3) tag wajib lengkap, (4) tidak ada Delete, (5) dampak biaya."),
        click("Tombol hijau **[Review changes]** (kanan atas) › pilih **Approve** atau **Request changes** › tulis alasan › **[Submit review]**."),
        result("Status review tercatat dengan nama dan waktu."),
        why("Pemisahan peran: engineer mengusulkan, manager memutuskan. Komentar dan persetujuan tersimpan permanen sebagai **jejak audit**."),
      ]},
      { title: "Merge dan verifikasi", items: [
        click("Setelah disetujui: tombol hijau **[Merge pull request]** › **[Confirm merge]** (dilakukan team lead atau trainer sesuai aturan repository)."),
        result("Pipeline **deploy** berjalan dan selesai sukses."),
        type("Cloud Shell (Bash)", ["az network vnet list --query \"[?contains(name,'spoke2')].{Nama:name, Prefix:addressSpace.addressPrefixes[0], Tags:tags}\" -o json"]),
        result("`vnet-spoke2-teamN` dengan prefix `10.0.2N.0/24` dan tag yang diisi."),
        why("Perubahan hanya diterapkan oleh pipeline setelah merge. Tidak ada yang mengklik portal untuk mengubah platform, sehingga kondisi Azure selalu sama dengan kode."),
      ]},
    ]},
  ],
  validate: ["Pull request dibuat dengan what-if sukses.", "Manager mengisi review (Approve/Request changes) dengan alasan.", "Setelah merge, `vnet-spoke2-teamN` ada di Azure dengan tag lengkap."],
  issues: [
    ["What-if gagal: address prefix overlap", "Prefix bentrok dengan spoke lain. Gunakan `10.0.2N.0/24` sesuai nomor tim."],
    ["What-if gagal: policy violation", "Region atau tag tidak sesuai policy. Perbaiki parameter, commit ulang ke branch yang sama."],
    ["Tidak bisa mengedit file", "Akun tidak punya akses ke folder tim; hubungi trainer."],
  ],
  cleanup: "Trainer menghapus spoke2 dan branch lab setelah training.",
}));

// ---------------------------------------------------------------- closing
c.push(BREAK(), H1("Penutup"),
  P("Setelah menyelesaikan semua lab, tim Anda telah membangun dan mengoperasikan landing zone hybrid sederhana:"),
  B("Governance: policy, tag, budget, dan RACI (Lab 1, 2A, 2B)."),
  B("Identitas: akses just-in-time, Conditional Access, dan sinkronisasi AD (Lab 3A, 3C)."),
  B("Jaringan: hub-and-spoke, firewall, VPN, dan hybrid DNS (Lab 3B, 4A)."),
  B("Operasi: Azure Arc, monitoring, dan alert (Lab 4B)."),
  B("Automation: perubahan platform melalui pull request (Lab 5A)."),
  P("Catat temuan dan keputusan Anda di **Landing Zone Design Pack** untuk dipresentasikan di capstone hari 5."),
  SP(),
  callout("Catatan untuk trainer", [
    "Nama menu portal, langkah wizard agent, dan sintaks CLI mengikuti dokumentasi Microsoft Learn per November 2026, tetapi **belum diuji di lingkungan Azure**. Jalankan seluruh lab end-to-end saat dry run T-7 dan perbarui dokumen ini jika ada perbedaan.",
    "Nilai IP, nama resource, dan role mengikuti desain lingkungan di Syllabus bagian 10.1 dan Panduan Trainer bagian 3.3.",
  ]),
);

// ---------------------------------------------------------------- build
const doc = new Document({
  creator: "Azure Landing Zone Training",
  title: "Lab Guide – Azure Landing Zone (Pertamina)",
  features: { updateFields: true },
  styles, numbering,
  sections: [{ properties: pageProps, footers: footer("Lab Guide – Azure Landing Zone – Pertamina"), children: c }],
});
const out = path.join(__dirname, "..", "docs", "lab_guide_azure-landing-zone-pertamina.docx");
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(out, buf); console.log("Wrote", out); });
