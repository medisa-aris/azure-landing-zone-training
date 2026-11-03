"""Build one .pptx per training day from slides/outline/hari-N.md on top of the training template.

Usage:
    python3 scripts/slides/build_deck.py            # all days
    python3 scripts/slides/build_deck.py 1 3        # selected days

Output: slides/pptx/slide_dayNN_<slug>.pptx
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from lxml import etree
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

sys.path.insert(0, str(Path(__file__).resolve().parent))
from parse_outline import Day, Slide, Topic, parse  # noqa: E402
import style as S  # noqa: E402

OUTLINE_DIR = S.ROOT / "slides" / "outline"
OUT_DIR = S.ROOT / "slides" / "pptx"
BASE = S.TEMPLATE_DIR / "base-template.pptx"

DAY_SHORT = {1: "Why & What", 2: "Govern", 3: "Identity & Network", 4: "Hybrid & Operate", 5: "Automate & Capstone"}
DAY_SLUG = {1: "why-and-what", 2: "govern-before-you-build", 3: "identity-and-network",
            4: "hybrid-connectivity-operations", 5: "automate-onboard-operate"}
LAB_GUIDE = "docs/lab_guide_azure-landing-zone-pertamina.docx"

ICON_RULES = [
    (r"quiz|kuis|pertanyaan", "help"), (r"pre-test|post-test", "checklist"),
    (r"identity|identitas|entra|pim|sync|sign-in|break-glass|conditional", "id"),
    (r"dns|resolver", "dns"), (r"vpn|expressroute|konektivitas|koneksi|on-prem", "link"),
    (r"firewall|nsg|udr", "firewall"), (r"network|jaringan|hub|spoke|vnet|peering|ip plan|topolog", "network"),
    (r"security|keamanan|zero trust|defender|sentinel|sovereign", "shield"),
    (r"policy|governance|compliance|exemption", "policy"), (r"tag", "tag"),
    (r"cost|biaya|finops|budget", "coin"), (r"monitor|alert|log|kpi|workbook", "monitor"),
    (r"arc|server|patch|backup|dr\b|recovery", "server"), (r"automation|iac|pipeline|pull request|accelerator|git", "git"),
    (r"migrat|onboard|workload", "migrate"), (r"game day|insiden|inject", "siren"), (r"capstone|rubric", "trophy"),
    (r"region|zone|indonesia|peta", "world"), (r"management group|hierarki|archetype|subscription", "sitemap"),
    (r"rbac|akses|role|raci|tim|peran", "users"), (r"roadmap|sertifikasi", "route"),
    (r"caf|adoption|strategi|cloud", "cloud"), (r"workshop|design pack|checkpoint", "presentation"),
    (r"aturan|tujuan", "target"),
]


def pick_icon(*texts) -> str:
    t = " ".join(texts).lower()
    for pat, name in ICON_RULES:
        if re.search(pat, t):
            return name
    return "cloud"


# =================================================================== deck
class Deck:
    def __init__(self, day: Day):
        self.day = day
        self.prs = Presentation(str(BASE))
        self.layouts = {l.name: l for m in self.prs.slide_masters for l in m.slide_layouts}
        self.count = 0
        self.sections = []          # (name, [slide ids])

    def section(self, name):
        self.sections.append((name, []))

    def new(self, layout="3_Title Only", number=True):
        slide = self.prs.slides.add_slide(self.layouts[layout])
        self.count += 1
        if number:
            S.page_number(slide, self.count)
        self.sections[-1][1].append(slide.slide_id)
        return slide

    def save(self, path: Path):
        self._write_sections()
        path.parent.mkdir(parents=True, exist_ok=True)
        self.prs.save(str(path))

    def _write_sections(self):
        P = "http://schemas.openxmlformats.org/presentationml/2006/main"
        P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main"
        pres = self.prs.part._element
        ext_lst = pres.find(f"{{{P}}}extLst")
        if ext_lst is None:
            ext_lst = etree.SubElement(pres, f"{{{P}}}extLst")
        ext = etree.SubElement(ext_lst, f"{{{P}}}ext")
        ext.set("uri", "{521415D9-36F7-43E2-AB2F-B90AF26B5E84}")
        sl = etree.SubElement(ext, f"{{{P14}}}sectionLst", nsmap={"p14": P14})
        import uuid
        for name, ids in self.sections:
            sec = etree.SubElement(sl, f"{{{P14}}}section")
            sec.set("name", name)
            sec.set("id", "{" + str(uuid.uuid4()).upper() + "}")
            lst = etree.SubElement(sec, f"{{{P14}}}sldIdLst")
            for sid in ids:
                etree.SubElement(lst, f"{{{P14}}}sldId").set("id", str(sid))


# =================================================================== helpers
def items_of(s: Slide, *names):
    fld = s.f(*names) if names else s.f("pointers")
    items = list(fld.items)
    t = fld.text
    if t and t not in ("(tabel)", "(diisi live)"):
        if not items:
            items = [x.strip() for x in t.split(" · ")] if " · " in t else [t]
        elif " · " in t:
            items = [x.strip() for x in t.split(" · ")] + items
    return [i for i in items if i and i != "(tabel)"]


def notes_text(s: Slide):
    n = s.f("speaker notes").text
    return "" if n in ("–", "-") else n


def illustration(s: Slide):
    il = s.f("ilustrasi")
    return il.text, il.items


def base_notes(s: Slide, extra=""):
    parts = [f"[{s.id}] {S.plain(s.title)}"]
    if s.waktu and s.waktu != "–":
        parts.append(f"Waktu: {s.waktu}")
    n = notes_text(s)
    if n:
        parts.append(S.plain(n))
    il, il_items = illustration(s)
    if il and not il.startswith("[Tabel]"):
        parts.append("Ilustrasi (outline): " + S.plain(il) + ("\n" + "\n".join(il_items) if il_items else ""))
    if extra:
        parts.append(extra)
    return "\n\n".join(parts)


def mslearn_url(txt: str):
    m = re.search(r"`(https://learn\.microsoft\.com/[^`]+)`", txt)
    return m.group(1) if m else None


def mslearn_local(url: str):
    if not url:
        return None
    stem = Path(url).stem
    for ext in (".png", ".jpg", ".jpeg"):
        p = S.MSLEARN_DIR / (stem + ext)
        if p.exists():
            return p
    return None


def table_from_illustration(s: Slide):
    """Return (header, rows) if the illustration is a parseable [Tabel] with row items."""
    il, il_items = illustration(s)
    if not il.startswith("[Tabel]") or not il_items:
        return None
    head = il[len("[Tabel]"):].strip()
    head = re.sub(r"^\d+ kolom:\s*", "", head)
    header = [h.strip() for h in head.split(" · ")] if " · " in head else []
    rows = []
    for it in il_items:
        cells = [c.strip() for c in re.split(r" · | — ", it)]
        rows.append(cells)
    ncol = max(len(header), max(len(r) for r in rows))
    if not header or len(header) != ncol:
        header = [""] * ncol if not header else (header + [""] * (ncol - len(header)))[:ncol]
    rows = [(r + [""] * ncol)[:ncol] for r in rows]
    return header, rows


# =================================================================== renderers
def r_cover(deck: Deck):
    d = deck.day
    slide = deck.new("Title Slide 5", number=False)
    bg = slide.shapes.add_picture(str(S.ASSET_DIR / "cover-background.png"), 0, 0, Inches(S.SLIDE_W), Inches(S.SLIDE_H))
    bg.name = "Background"
    tree = slide.shapes._spTree
    tree.remove(bg._element)
    tree.insert(2, bg._element)
    for ph in slide.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text_frame.text = ""
            r = ph.text_frame.paragraphs[0].add_run()
            r.text = "Azure Landing Zone: Design, Operate, and Connect"
            S._font(r, 36, S.BLACK, semibold=True)
        elif ph.placeholder_format.idx == 12:
            ph.text_frame.text = ""
            r = ph.text_frame.paragraphs[0].add_run()
            r.text = f"Hari {d.number} · {d.title}"
            S._font(r, 20, S.NAVY)
    S.pill(slide, 0.64, 2.55, 2.1, 0.42, f"Hari {d.number} dari 5", S.NAVY)
    S.text(slide, 0.64, 5.05, 10.5, 0.7,
           "Training 5 hari untuk PT Pertamina (Persero) · 09:00–16:00 WIB · Azure landing zone, hybrid connectivity, dan operasi",
           size=14, color=S.GRAY)
    S.notes(slide, f"Azure Landing Zone: Design, Operate, and Connect — Hari {d.number}: {d.title}.\n\n"
                   f"Tujuan hari ini: {S.plain(d.goal)}\n\nAudiens: {S.plain(d.audience)}")


def r_glance(deck: Deck):
    d = deck.day
    slide = deck.new()
    S.set_title(slide, f"Hari {d.number} sekilas")
    S.text(slide, 0.64, 1.15, 12.05, 0.4, d.title, size=18, color=S.NAVY)
    S.content_card(slide, 0.49, 1.62, 12.35, 5.33)
    # day pills
    for i in range(1, 6):
        cur = i == d.number
        p = S.pill(slide, 0.85 + (i - 1) * 2.35, 1.85, 2.2, 0.42, f"Hari {i} · {DAY_SHORT[i]}",
                   S.BLUE if cur else S.WHITE, S.WHITE if cur else S.GRAY, size=11)
        if not cur:
            p.line.color.rgb = S.rgb(S.LINE)
    # timeline 09:00–16:00
    x0, x1 = 0.86, 12.49
    def tx(hm):
        h, m = map(int, hm.split(":"))
        return x0 + (h + m / 60 - 9) / 7 * (x1 - x0)
    blocks = [(t.time.split("–")[0], t.time.split("–")[1], t.id) for t in d.topics if t.time]
    prev_end = "09:00"
    for i, (a, b, tid) in enumerate(blocks):
        if a > prev_end:
            gap_long = (int(a[:2]) * 60 + int(a[3:])) - (int(prev_end[:2]) * 60 + int(prev_end[3:])) >= 45
            g = S.box(slide, tx(prev_end), 2.55, tx(a) - tx(prev_end) - 0.02, 0.42,
                      fill=S.LGRAY if gap_long else S.GRAY, shape=MSO_SHAPE.RECTANGLE)
            if gap_long:
                S.text(slide, tx(prev_end), 2.55, tx(a) - tx(prev_end), 0.42, "Istirahat", size=11,
                       color=S.WHITE, semibold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        w = tx(b) - tx(a) - 0.02
        S.box(slide, tx(a), 2.55, w, 0.42, fill=S.BLUE if i % 2 == 0 else S.NAVY, shape=MSO_SHAPE.RECTANGLE)
        if w > 0.35:
            S.text(slide, tx(a), 2.55, w, 0.42, tid, size=12, color=S.WHITE, semibold=True,
                   align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        prev_end = b
    for h in range(9, 17):
        S.text(slide, tx(f"{h:02d}:00") - 0.35, 3.0, 0.7, 0.28, f"{h:02d}:00", size=10, color=S.GRAY, align=PP_ALIGN.CENTER)
    # session cards
    topics = [t for t in d.topics if not re.search(r"recap", t.title, re.I)]
    n = len(topics)
    gap = 0.2
    cw = (11.65 - gap * (n - 1)) / n
    for i, t in enumerate(topics):
        x = 0.85 + i * (cw + gap)
        S.white_card(slide, x, 3.6, cw, 3.0)
        S.icon(slide, pick_icon(t.title), x + cw / 2 - 0.27, 3.78, 0.55)
        S.text(slide, x + 0.1, 4.45, cw - 0.2, 0.4, f"{t.id} · {t.time}", size=14 if cw > 2.3 else 12,
               color=S.BLUE, semibold=True, align=PP_ALIGN.CENTER)
        size = S.fit_size([t.title], cw - 0.25, 1.55, max_size=16, min_size=11)
        S.text(slide, x + 0.1, 4.9, cw - 0.2, 1.6, t.title, size=size, semibold=True, align=PP_ALIGN.CENTER)
    S.notes(slide, "Jelaskan alur hari ini sebelum mulai.\n\n" + "\n".join(
        f"{t.id} ({t.time}): {t.title}" for t in d.topics) + f"\n\nTujuan hari ini: {S.plain(d.goal)}")


def r_divider(deck: Deck, topic: Topic, index: int, total: int, s: Slide | None):
    slide = deck.new()
    S.remove_title(slide)
    S.icon_oval(slide, pick_icon(topic.title), 5.97, 1.35, 1.4, S.BLUE, ratio=0.5)
    S.pill(slide, 5.47, 2.95, 2.4, 0.42, f"Sesi {index} dari {total}", S.NAVY)
    title = re.sub(r"\s*\+\s*(Lab|Workshop).*$", "", topic.title)
    size = S.fit_size([title], 11.5, 1.2, max_size=40, min_size=28)
    S.text(slide, 0.9, 3.55, 11.53, 1.2, title, size=size, semibold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    aud = S.plain(s.f("pointers").text) if s else ""
    sub = f"Hari {deck.day.number} · Topik {topic.id} · {topic.time}"
    S.text(slide, 0.9, 4.85, 11.53, 0.45, sub, size=18, color=S.NAVY, align=PP_ALIGN.CENTER)
    labs = re.findall(r"(Lab \w+|Workshop[^+]*)", topic.title)
    if labs:
        S.pill(slide, 4.67, 5.5, 4.0, 0.42, " · ".join(l.strip() for l in labs), S.BLUE, size=13)
    S.notes(slide, base_notes(s) if s else f"Topik {topic.id}: {topic.title}")
    if aud and "[" in aud:
        pass


def r_agenda(deck: Deck, topic: Topic, s: Slide):
    slide = deck.new()
    S.set_title(slide, "Agenda" if s.title.lower().startswith("agenda") else s.title)
    S.text(slide, 0.64, 1.15, 12.05, 0.4, re.sub(r"\s*\+.*$", "", topic.title), size=18, color=S.NAVY)
    S.content_card(slide, 0.49, 1.62, 12.35, 5.33)
    items = items_of(s)
    goal = [i for i in items if i.lower().startswith("tujuan")]
    items = [i for i in items if not i.lower().startswith("tujuan")]
    n = len(items)
    if n == 0:
        S.notes(slide, base_notes(s))
        return
    cols = n if n <= 4 else (4 if n in (7, 8) else 3 if n in (5, 6, 9) else 4)
    rows = (n + cols - 1) // cols
    gap = 0.22
    cw = (11.65 - gap * (cols - 1)) / cols
    top = 2.0 if rows > 1 else 2.6
    avail = (6.75 - top) if rows > 1 else 3.2
    ch = (avail - gap * (rows - 1)) / rows
    for i, it in enumerate(items):
        r, c = divmod(i, cols)
        x = 0.85 + c * (cw + gap)
        y = top + r * (ch + gap)
        dur = re.search(r"\((\d+)[’'′]\)\s*$", it)
        label = re.sub(r"\s*\(\d+[’'′]\)\s*$", "", it)
        S.white_card(slide, x, y, cw, ch)
        isz = 0.45 if rows > 1 else 0.55
        S.icon(slide, pick_icon(label), x + 0.2, y + 0.18, isz)
        S.text(slide, x + 0.2 + isz + 0.1, y + 0.15, cw - isz - 0.5, isz + 0.1, f"{i + 1:02d}", size=22 if rows == 1 else 18,
               color=S.BLUE, semibold=True, anchor=MSO_ANCHOR.MIDDLE)
        if dur:
            S.text(slide, x + cw - 1.15, y + 0.18, 1.0, 0.4, f"{dur.group(1)} menit", size=11, color=S.GRAY,
                   align=PP_ALIGN.RIGHT)
        body_h = ch - isz - 0.45
        size = S.fit_size([S.plain(label)], cw - 0.4, body_h, max_size=18 if rows == 1 else 15, min_size=11)
        S.text(slide, x + 0.2, y + isz + 0.35, cw - 0.4, body_h, label, size=size)
    S.notes(slide, base_notes(s, "\n".join(goal)))


def r_objectives(deck: Deck, topic: Topic, s: Slide):
    slide = deck.new()
    S.set_title(slide, "Tujuan Sesi" if "tujuan" in s.title.lower() else s.title)
    fld = s.f("pointers")
    lead = fld.text if fld.items else ""
    items = items_of(s)
    S.text(slide, 0.64, 1.15, 12.05, 0.4, lead or "Di akhir sesi peserta mampu:", size=18, color=S.NAVY)
    S.content_card(slide, 0.49, 1.62, 12.35, 5.33)
    n = max(1, len(items))
    row = min(1.2, 4.9 / n)
    size = S.fit_size([S.plain(i) for i in items], 7.3, row * n - 0.1, max_size=18, min_size=13, gap_pt=row * 72 * 0.3)
    for i, it in enumerate(items):
        y = 1.95 + i * row
        S.oval(slide, 1.0, y + 0.06, 0.32, S.NUM, str(i + 1), size=13)
        S.text(slide, 1.5, y, 7.35, row, it, size=size)
    S.icon_oval(slide, "target", 9.55, 2.35, 2.5, S.BLUE, ratio=0.52)
    S.text(slide, 9.1, 5.05, 3.4, 1.0, f"{n} tujuan · diuji lagi di kuis akhir sesi", size=14, color=S.NAVY,
           align=PP_ALIGN.CENTER)
    S.notes(slide, base_notes(s))


def illustration_panel(slide, s: Slide, x, y, w, h):
    """Right-hand visual: Microsoft Learn image (if downloaded) or a designed placeholder."""
    il, il_items = illustration(s)
    url = mslearn_url(il)
    local = mslearn_local(url)
    if local:
        from PIL import Image
        im = Image.open(local)
        ar = im.width / im.height
        iw, ih = (w, w / ar) if w / ar <= h - 0.3 else ((h - 0.3) * ar, h - 0.3)
        S.white_card(slide, x, y, w, h, radius=0.05)
        slide.shapes.add_picture(str(local), Inches(x + (w - iw) / 2), Inches(y + 0.08), Inches(iw - 0.16), Inches(ih - 0.16))
        S.text(slide, x, y + h - 0.3, w - 0.1, 0.28, "Sumber: Microsoft Learn", size=10, color=S.GRAY, align=PP_ALIGN.RIGHT)
        return
    kind = re.match(r"\[([^\]]+)\]", il)
    kind = kind.group(1) if kind else "Ilustrasi"
    desc = S.plain(re.sub(r"^\[[^\]]+\]\s*", "", il))
    if url:
        desc = re.sub(r"https://learn\.microsoft\.com/\S+", "", desc).strip(" ·")
    S.box(slide, x, y, w, h, fill=S.TINT, radius=0.06)
    S.icon_oval(slide, "image" if url else "sitemap", x + 0.25, y + 0.25, 0.6, S.BLUE)
    head = "Diagram Microsoft Learn" if url else f"Ilustrasi · {kind}"
    S.text(slide, x + 1.0, y + 0.25, w - 1.2, 0.6, head, size=16, color=S.NAVY, semibold=True, anchor=MSO_ANCHOR.MIDDLE)
    body = [desc] if desc else []
    body += [S.plain(i) for i in il_items[:6]]
    if url:
        body.append("Sisipkan gambar dari: " + url.replace("https://", ""))
    size = S.fit_size(body, w - 0.5, h - 1.2, max_size=14, min_size=10)
    S.text(slide, x + 0.25, y + 1.05, w - 0.5, h - 1.2, body, size=size, color=S.NAVY)


def r_table(deck: Deck, s: Slide, header, rows, pill_text=None):
    slide = deck.new()
    S.set_title(slide, s.title)
    if pill_text:
        S.pill(slide, 10.9, 0.16, 1.8, 0.32, pill_text, S.CYAN, S.NAVY, size=11)
    S.content_card(slide)
    n, m = len(rows) + 1, len(header)
    x, y, w = 0.85, 1.7, 11.65
    longest = [max(len(S.plain(r[c])) for r in rows + [header]) + 4 for c in range(m)]
    tot = sum(longest)
    widths = [max(1.4, w * l / tot) for l in longest]
    scale = w / sum(widths)
    widths = [c * scale for c in widths]
    avail = 5.0
    size = 14
    while size > 10:
        hgt = sum(max(S.est_lines(S.plain(r[c]), widths[c] - 0.2, size) for c in range(m)) * size * 1.25 / 72 + 0.14
                  for r in rows + [header])
        if hgt <= avail:
            break
        size -= 0.5
    gt = slide.shapes.add_table(n, m, Inches(x), Inches(y), Inches(w), Inches(0.4 * n))
    tbl = gt.table
    tblPr = tbl._tbl.tblPr
    tblPr.set("bandRow", "0")
    for c in range(m):
        tbl.columns[c].width = Inches(widths[c])
    for ri, row in enumerate([header] + rows):
        for ci in range(m):
            cell = tbl.cell(ri, ci)
            cell.fill.solid()
            cell.fill.fore_color.rgb = S.rgb(S.NAVY if ri == 0 else (S.WHITE if ri % 2 else S.RESULT))
            cell.margin_left = cell.margin_right = Inches(0.1)
            cell.margin_top = cell.margin_bottom = Inches(0.05)
            tf = cell.text_frame
            tf.word_wrap = True
            tf.text = ""
            S.add_runs(tf.paragraphs[0], row[ci], size, S.WHITE if ri == 0 else S.BLACK,
                       semibold=(ri == 0 or ci == 0), code_color=None)
    S.notes(slide, base_notes(s))
    return slide


def r_content(deck: Deck, topic: Topic, s: Slide, pill_text=None):
    tbl = table_from_illustration(s)
    items = items_of(s)
    il, _ = illustration(s)
    if tbl and (not items or s.f("pointers").text.startswith("(tabel)")):
        return r_table(deck, s, *tbl, pill_text=pill_text)
    code = s.f("pointers").code
    slide = deck.new()
    S.set_title(slide, s.title)
    if pill_text:
        S.pill(slide, 10.9, 0.16, 1.8, 0.32, pill_text, S.CYAN, S.NAVY, size=11)
    S.content_card(slide)
    has_visual = bool(re.match(r"\[", il) or mslearn_url(il)) or tbl
    if code:
        lw = 5.4 if items else 0
        if items:
            size = S.fit_size([S.plain(i) for i in items], lw - 0.2, 5.0, max_size=18, min_size=12)
            S.text(slide, 0.85, 1.66, lw, 5.0, items, size=size, bullets=True, gap=8)
        lang = code[0][0]
        S.terminal(slide, 0.85 + lw + (0.3 if lw else 0), 1.75, 11.65 - lw - (0.3 if lw else 0), 4.95,
                   terminal_label(lang), code)
    elif has_visual and items:
        size = S.fit_size([S.plain(i) for i in items], 6.4, 5.0, max_size=18, min_size=12, gap_pt=10)
        S.text(slide, 0.85, 1.66, 6.6, 5.0, items, size=size, bullets=True, gap=10)
        if tbl:
            small_table(slide, *tbl, 7.7, 1.75, 4.8)
        else:
            illustration_panel(slide, s, 7.75, 1.75, 4.75, 4.9)
    elif items:
        icon_grid(slide, items)
    else:
        illustration_panel(slide, s, 0.85, 1.75, 11.65, 4.9)
    S.notes(slide, base_notes(s))
    return slide


def icon_grid(slide, items):
    n = len(items)
    cols = 2 if n > 3 else n
    rows = (n + cols - 1) // cols
    gap = 0.25
    cw = (11.65 - gap * (cols - 1)) / cols
    ch = min(1.6, (4.95 - gap * (rows - 1)) / rows)
    top = 1.75 + (4.95 - (rows * ch + gap * (rows - 1))) / 2
    size = S.fit_size([S.plain(i) for i in items], cw - 1.3, ch - 0.2, max_size=18, min_size=12)
    for i, it in enumerate(items):
        r, c = divmod(i, cols)
        x, y = 0.85 + c * (cw + gap), top + r * (ch + gap)
        S.white_card(slide, x, y, cw, ch)
        S.icon_oval(slide, pick_icon(it), x + 0.25, y + ch / 2 - 0.3, 0.6, S.BLUE)
        S.text(slide, x + 1.05, y + 0.1, cw - 1.25, ch - 0.2, it, size=size, anchor=MSO_ANCHOR.MIDDLE)


def small_table(slide, header, rows, x, y, w):
    m = len(header)
    gt = slide.shapes.add_table(len(rows) + 1, m, Inches(x), Inches(y), Inches(w), Inches(0.3 * (len(rows) + 1)))
    tbl = gt.table
    for ri, row in enumerate([header] + rows):
        for ci in range(m):
            cell = tbl.cell(ri, ci)
            cell.fill.solid()
            cell.fill.fore_color.rgb = S.rgb(S.NAVY if ri == 0 else S.WHITE)
            tf = cell.text_frame
            tf.text = ""
            S.add_runs(tf.paragraphs[0], row[ci], 11, S.WHITE if ri == 0 else S.BLACK, semibold=ri == 0)


def terminal_label(lang):
    return {"bash": "Sintaks · Azure CLI — Cloud Shell (Bash)", "powershell": "Sintaks · PowerShell",
            "kusto": "Sintaks · KQL — Log Analytics", "json": "Sintaks · JSON", "bicep": "Sintaks · Bicep",
            "text": "Konfigurasi"}.get(lang, f"Sintaks · {lang}")


def demo_badge(s: Slide):
    m = re.match(r"(Demo D\d+|Lab \w+)", s.title)
    part = re.search(r"\(([^)]+)\)", s.tipe)
    tag = m.group(1).upper() if m else "DEMO"
    return f"{tag} · {part.group(1).split()[0].capitalize()}" if part else tag


def r_demo_intro(deck: Deck, topic: Topic, s: Slide, steps: list):
    slide = deck.new()
    S.remove_title(slide)
    S.icon_oval(slide, "terminal", 6.02, 0.75, 1.3, S.NAVY, ratio=0.5)
    m = re.match(r"(Demo D\d+)[:\s]*(.*)", s.title)
    tag, title = (m.group(1), m.group(2)) if m else ("Demo", s.title)
    S.pill(slide, 4.67, 2.2, 4.0, 0.42, f"{tag.upper()} · WALKTHROUGH", S.CYAN, S.NAVY)
    size = S.fit_size([title], 11.7, 0.9, max_size=34, min_size=24)
    S.text(slide, 0.8, 2.72, 11.73, 0.9, title, size=size, semibold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    pts = items_of(s)
    tujuan = next((p for p in pts if "tujuan" in p.lower()), "")
    prasyarat = next((p for p in pts if "prasyarat" in p.lower()), "")
    S.box(slide, 0.97, 3.75, 11.4, 0.75, fill=S.TINT, radius=0.2)
    S.icon(slide, "target", 1.12, 3.9, 0.44)
    S.text(slide, 1.7, 3.75, 10.55, 0.75, re.sub(r"\*\*Tujuan:\*\*\s*", "Tujuan: ", tujuan),
           size=S.fit_size([S.plain(tujuan)], 10.5, 0.7, 16, 11), color=S.NAVY, semibold=True, anchor=MSO_ANCHOR.MIDDLE)
    if prasyarat:
        S.text(slide, 1.0, 4.55, 11.35, 0.45, re.sub(r"\*\*Prasyarat:\*\*\s*", "Prasyarat: ", prasyarat),
               size=S.fit_size([S.plain(prasyarat)], 11.3, 0.45, 13, 10), color=S.GRAY)
    steps = steps[:5] or ["Tujuan", "Sintaks", "Tata cara", "Hasil"]
    n = len(steps)
    gap = 0.25
    cw = (11.4 - gap * (n - 1)) / n
    for i, st in enumerate(steps):
        x = 0.97 + i * (cw + gap)
        S.white_card(slide, x, 5.1, cw, 1.2)
        S.oval(slide, x + 0.15, 5.22, 0.38, S.NUM, str(i + 1))
        short = S.plain(re.split(r"[:→(]", st)[0])[:70]
        S.text(slide, x + 0.6, 5.12, cw - 0.7, 1.15, short, size=S.fit_size([short], cw - 0.75, 1.1, 14, 10),
               color=S.NAVY, semibold=True, anchor=MSO_ANCHOR.MIDDLE)
    S.notes(slide, base_notes(s, "Urutan demo: " + "; ".join(f"{i+1}. {S.plain(x)}" for i, x in enumerate(steps))))


def r_steps(deck: Deck, s: Slide, badge: str):
    slide = deck.new()
    S.set_title(slide, s.title)
    S.pill(slide, 10.9, 0.16, 1.8, 0.32, badge, S.CYAN, S.NAVY, size=11)
    S.content_card(slide)
    items = items_of(s)
    code = s.f("pointers").code
    il, _ = illustration(s)
    right = bool(il) and not code
    lw = 6.6 if right else 11.3
    steps_h = 2.6 if code else 4.0
    n = max(1, len(items))
    row = steps_h / n
    size = S.fit_size([S.plain(i) for i in items], lw - 0.7, steps_h - 0.1, 17, 11, gap_pt=6)
    for i, it in enumerate(items):
        y = 1.72 + i * row
        S.oval(slide, 0.9, y + 0.05, 0.36, S.NUM, str(i + 1), size=13)
        S.text(slide, 1.4, y, lw - 0.6, row, it, size=size)
    if code:
        S.terminal(slide, 0.85, 1.75 + steps_h + 0.1, 11.65, 4.85 - steps_h - 0.1, terminal_label(code[0][0]), code, max_size=14)
    elif right:
        illustration_panel(slide, s, 7.75, 1.75, 4.75, 3.95 if key_message(s) else 4.9)
    km = key_message(s)
    if km and not code:
        S.box(slide, 0.85, 5.85, 11.65, 0.85, fill=S.NOTE, radius=0.15)
        S.icon_oval(slide, "bulb", 1.0, 6.02, 0.5, S.NAVY)
        S.text(slide, 1.65, 5.86, 10.7, 0.83, "Pesan kunci: " + km, size=S.fit_size([km], 10.6, 0.8, 15, 10),
               color=S.BLACK, anchor=MSO_ANCHOR.MIDDLE)
    S.notes(slide, base_notes(s))


def key_message(s: Slide):
    n = notes_text(s)
    m = re.search(r"Kalimat inti:\s*(.+)$", n)
    return S.plain(m.group(1)).strip() if m else ""


def r_syntax(deck: Deck, s: Slide, badge: str):
    slide = deck.new()
    S.set_title(slide, s.title)
    S.pill(slide, 10.9, 0.16, 1.8, 0.32, badge, S.CYAN, S.NAVY, size=11)
    code = s.f("pointers").code
    n = notes_text(s)
    show_note = n and len(n) < 260
    th = 4.85 if show_note else 5.85
    blocks_by_lang = {}
    for lang, lines in code:
        blocks_by_lang.setdefault(lang, []).append((lang, lines))
    groups = list(blocks_by_lang.values())
    if len(groups) == 1:
        S.terminal(slide, 0.64, 1.2, 12.05, th, terminal_label(groups[0][0][0]), groups[0])
    else:
        tot = sum(sum(len(b[1]) for b in g) + 2 for g in groups)
        y = 1.2
        for g in groups:
            hh = max(1.0, th * (sum(len(b[1]) for b in g) + 2) / tot - 0.1)
            S.terminal(slide, 0.64, y, 12.05, hh, terminal_label(g[0][0]), g, max_size=15)
            y += hh + 0.1
    if show_note:
        S.box(slide, 0.64, 6.2, 12.05, 0.8, fill=S.NOTE, radius=0.15)
        S.icon_oval(slide, "bulb", 0.79, 6.35, 0.5, S.NAVY)
        S.text(slide, 1.44, 6.2, 11.1, 0.8, "Catatan: " + S.plain(n), size=S.fit_size([n], 11.0, 0.75, 14, 10),
               anchor=MSO_ANCHOR.MIDDLE)
    S.notes(slide, base_notes(s))


def r_result(deck: Deck, s: Slide, badge: str):
    slide = deck.new()
    S.set_title(slide, s.title)
    S.pill(slide, 10.9, 0.16, 1.8, 0.32, badge, S.CYAN, S.NAVY, size=11)
    items = items_of(s)
    il, _ = illustration(s)
    tbl = table_from_illustration(s)
    lw = 6.3 if (il or tbl) else 12.05
    S.box(slide, 0.64, 1.2, lw, 5.7, fill=S.RESULT, radius=0.05)
    S.text(slide, 0.74, 1.22, lw - 0.2, 0.3, "Hasil yang diharapkan", size=10, color="4A4A4A")
    n = max(1, len(items))
    row = 5.1 / n
    size = S.fit_size([S.plain(i) for i in items], lw - 1.1, 5.0, 17, 11, gap_pt=8)
    for i, it in enumerate(items):
        y = 1.6 + i * row
        S.icon(slide, "check", 0.85, y + 0.05, 0.42)
        S.text(slide, 1.4, y, lw - 0.9, row, it, size=size, color=S.NAVY)
    if tbl:
        small_table(slide, *tbl, 7.2, 1.25, 5.5)
    elif il:
        illustration_panel(slide, s, 7.2, 1.2, 5.5, 5.7)
    S.notes(slide, base_notes(s))


def r_fallback(deck: Deck, s: Slide, badge: str):
    """Portal mock-up drawn with shapes, described by the outline."""
    slide = deck.new()
    S.set_title(slide, s.title)
    S.pill(slide, 10.9, 0.16, 1.8, 0.32, badge, S.CYAN, S.NAVY, size=11)
    il, _ = illustration(s)
    desc = S.plain(re.sub(r"^\[[^\]]+\]\s*", "", il))
    x, y, w, h = 0.64, 1.25, 12.05, 5.65
    S.box(slide, x, y, w, h, fill=S.WHITE, line="C8D3E6", radius=0.03, shadow=True)
    S.box(slide, x, y, w, 0.42, fill=S.NAVY, shape=MSO_SHAPE.RECTANGLE)
    S.text(slide, x + 0.2, y, 2.6, 0.42, "Microsoft Azure", size=13, color=S.WHITE, semibold=True, anchor=MSO_ANCHOR.MIDDLE)
    sb = S.box(slide, x + 3.6, y + 0.07, 4.8, 0.28, fill="3B5278", radius=0.3)
    S.text(slide, x + 3.75, y + 0.07, 4.6, 0.28, "Cari resource, layanan, dan dokumentasi", size=10,
           color=S.TERM_LBL, anchor=MSO_ANCHOR.MIDDLE)
    crumb = re.search(r"Breadcrumb\s+`?([^`.]+)`?", il)
    crumb_txt = crumb.group(1) if crumb else "Home"
    S.text(slide, x + 0.2, y + 0.5, w - 0.4, 0.3, crumb_txt.replace(">", "›"), size=11, color=S.BLUE)
    S.box(slide, x + 0.15, y + 0.9, 2.2, h - 1.05, fill="F3F3F3", radius=0.03)
    for i in range(6):
        S.box(slide, x + 0.3, y + 1.1 + i * 0.5, 1.6 - (i % 3) * 0.25, 0.16, fill="D6D6D6", radius=0.5)
    quotes = re.findall(r"“([^”]+)”", il)
    body = re.sub(r"Callout[^“]*“[^”]+”\.?", "", desc).strip()
    cx = x + 2.55
    cw = w - 2.75 - (3.3 if quotes else 0)
    S.text(slide, cx, y + 0.95, cw, h - 1.15, body, size=S.fit_size([body], cw - 0.1, h - 1.25, 14, 10), color="333333")
    for i, q in enumerate(quotes[:3]):
        qy = y + 1.0 + i * 1.5
        S.box(slide, x + w - 3.15, qy, 3.0, 1.2, fill="FDEBDD", line=S.ORANGE, radius=0.12)
        S.text(slide, x + w - 3.05, qy, 2.8, 1.2, q, size=S.fit_size([q], 2.7, 1.1, 13, 9), color="7A3B00",
               semibold=True, anchor=MSO_ANCHOR.MIDDLE)
        S.line(slide, x + w - 3.15, qy + 0.6, x + w - 3.6, qy + 0.6, color=S.ORANGE, width=1.5, arrow=True)
    S.notes(slide, base_notes(s, "Gunakan slide ini jika portal Azure tidak bisa diakses saat demo."))


def parse_answers(notes_txt: str):
    ans = {}
    for m in re.finditer(r"(\d)-([A-D])(?:\s*\(([^)]*)\))?", notes_txt):
        ans[int(m.group(1))] = (m.group(2), m.group(3) or "")
    return ans


def r_quiz(deck: Deck, s: Slide):
    qs = items_of(s)
    ans = parse_answers(notes_text(s))
    parsed = []
    for q in qs:
        parts = re.split(r"\s([A-D])\.\s", " " + q)
        if len(parts) >= 9:
            parsed.append((parts[0].strip(), [parts[i + 1].strip() for i in range(1, 9, 2)]))
    if len(parsed) != len(qs) or not parsed:
        return r_open_quiz(deck, s)
    total = len(parsed)
    for i, (q, opts) in enumerate(parsed, 1):
        slide = deck.new()
        S.set_title(slide, f"Kuis · Pertanyaan {i} dari {total}")
        S.content_card(slide)
        S.icon_oval(slide, "help", 0.9, 1.72, 0.62, S.BLUE)
        S.text(slide, 1.72, 1.62, 10.7, 1.1, q, size=S.fit_size([S.plain(q)], 10.6, 1.05, 22, 15), color=S.NAVY,
               semibold=True, anchor=MSO_ANCHOR.MIDDLE)
        osz = S.fit_size([S.plain(o) for o in opts], 4.45, 1.5, 17, 12)
        for k, (letter, opt) in enumerate(zip("ABCD", opts)):
            r, c = divmod(k, 2)
            x, y = 0.9 + c * 5.93, 2.95 + r * 2.0
            S.white_card(slide, x, y, 5.62, 1.7)
            S.oval(slide, x + 0.2, y + 0.57, 0.56, S.NUM, letter, size=18)
            S.text(slide, x + 0.95, y + 0.08, 4.53, 1.54, opt, size=osz, anchor=MSO_ANCHOR.MIDDLE)
        a = ans.get(i)
        if a:
            letter, why = a
            opt_txt = opts["ABCD".index(letter)]
            body = f"Jawaban: {letter} — {S.plain(opt_txt)}"
            if why:
                body += f"\n\nAlasan: {why}"
            body += "\n\nTips: beri waktu ±30 detik, minta peserta memilih A/B/C/D, lalu ungkapkan jawaban."
        else:
            body = "Jawaban: lihat speaker notes outline – " + S.plain(notes_text(s))
        S.notes(slide, f"[{s.id}] Kuis pertanyaan {i} dari {total}\n\n{body}")


def r_open_quiz(deck: Deck, s: Slide):
    slide = deck.new()
    S.set_title(slide, s.title)
    S.content_card(slide)
    qs = items_of(s)
    n = max(1, len(qs))
    row = min(1.0, 4.9 / n)
    size = S.fit_size([S.plain(q) for q in qs], 10.3, row * n, 20, 13)
    S.icon_oval(slide, "help", 11.2, 1.7, 0.9, S.BLUE)
    for i, q in enumerate(qs):
        y = 1.75 + i * row
        S.oval(slide, 0.95, y + 0.05, 0.4, S.NUM, str(i + 1), size=14)
        S.text(slide, 1.55, y, 9.4, row, q, size=size)
    S.notes(slide, base_notes(s))


def r_lab(deck: Deck, topic: Topic, s: Slide):
    slide = deck.new()
    S.set_title(slide, "Hands-On Lab" if s.tipe.lower().startswith("lab") and "workshop" not in s.tipe.lower() else "Workshop")
    S.text(slide, 0.64, 1.15, 12.05, 0.4, s.title, size=18, color=S.NAVY)
    S.content_card(slide, 0.49, 1.62, 12.35, 5.33)
    items = items_of(s)
    labm = re.search(r"Lab (\w+)", s.title)
    rows = []
    if labm:
        rows.append(("file", "Panduan", f"Lab Guide · Lab {labm.group(1)}"))
    else:
        rows.append(("file", "Format", "Workshop tim · Design Pack"))
    crit = next((i for i in items if "kriteria sukses" in i.lower()), "")
    rows.append(("target", "Kriteria sukses", re.sub(r"\*\*Kriteria sukses:\*\*\s*", "", crit) or "Lihat panel"))
    rows.append(("clock", "Durasi", s.waktu or "–"))
    for i, (ic, label, val) in enumerate(rows):
        y = 1.95 + i * 1.58
        S.icon_oval(slide, ic, 0.85, y + 0.51, 0.56, S.BLUE)
        S.text(slide, 1.6, y, 1.5, 1.58, label, size=17, color=S.NAVY, semibold=True, anchor=MSO_ANCHOR.MIDDLE)
        S.text(slide, 3.2, y, 3.9, 1.58, val, size=S.fit_size([S.plain(val)], 3.8, 1.5, 15, 10), anchor=MSO_ANCHOR.MIDDLE)
        if i < 2:
            S.line(slide, 0.85, y + 1.58, 7.1, y + 1.58, color="D9D9D9", width=0.75)
    S.box(slide, 7.45, 1.95, 5.05, 4.75, fill=S.TINT, radius=0.06)
    S.icon(slide, "flask", 7.67, 2.08, 0.42)
    S.text(slide, 8.2, 2.05, 4.1, 0.48, "Lab sekilas" if labm else "Yang dikerjakan", size=18, color=S.NAVY, semibold=True)
    body = [i for i in items if i != crit]
    size = S.fit_size([S.plain(b) for b in body], 4.4, 3.95, 16, 10, gap_pt=6)
    S.text(slide, 7.7, 2.65, 4.65, 3.95, body, size=size, bullets=True, gap=6)
    S.notes(slide, base_notes(s, f"Panduan langkah demi langkah: {LAB_GUIDE}" if labm else ""))


def r_summary(deck: Deck, topic: Topic, s: Slide, next_text: str):
    slide = deck.new()
    S.set_title(slide, "Summary" if s.title.lower().startswith("summary") else s.title)
    S.content_card(slide)
    items = items_of(s)
    n = max(1, len(items))
    row = 4.95 / n
    size = S.fit_size([S.plain(i) for i in items], 6.9, 4.9, 18, 12, gap_pt=row * 72 * 0.25)
    for i, it in enumerate(items):
        y = 1.7 + i * row
        S.icon(slide, "check", 0.85, y + min(0.35, row / 2 - 0.2), 0.4)
        S.text(slide, 1.4, y, 7.05, row, it, size=size, anchor=MSO_ANCHOR.MIDDLE)
    S.box(slide, 8.8, 2.2, 3.7, 3.6, fill=S.NAVY, radius=0.08)
    S.icon(slide, "arrow", 9.05, 2.45, 0.6, white=True)
    S.text(slide, 9.05, 3.15, 3.2, 0.45, "Berikutnya", size=20, color=S.CYAN, semibold=True)
    S.text(slide, 9.05, 3.65, 3.2, 2.0, next_text, size=S.fit_size([next_text], 3.1, 1.95, 18, 12), color=S.WHITE)
    S.notes(slide, base_notes(s))


def r_closing(deck: Deck):
    d = deck.day
    slide = deck.new("Blank", number=False)
    bg = slide.shapes.add_picture(str(S.ASSET_DIR / "cover-background.png"), 0, 0, Inches(S.SLIDE_W), Inches(S.SLIDE_H))
    bg.name = "Background"
    S.icon_oval(slide, "trophy", 1.55, 2.55, 2.4, S.BLUE, ratio=0.54)
    S.line(slide, 4.52, 2.38, 4.52, 5.08, color=S.LGRAY, width=1.25)
    S.text(slide, 5.12, 2.35, 7.6, 1.2, f"Hari {d.number} selesai!" if d.number < 5 else "Training selesai!",
           size=54, semibold=True, anchor=MSO_ANCHOR.MIDDLE)
    msg = S.plain(d.goal)
    S.text(slide, 5.24, 3.65, 7.3, 1.8, msg, size=S.fit_size([msg], 7.2, 1.75, 20, 14))
    S.notes(slide, f"Penutup hari {d.number}. Ingatkan jadwal besok dan kumpulkan pertanyaan parking lot.")


# =================================================================== orchestration
def classify(s: Slide) -> str:
    t = s.tipe.lower()
    if t.startswith("judul"):
        return "divider"
    if t.startswith("agenda"):
        return "agenda"
    if t.startswith("tujuan"):
        return "objectives"
    if t.startswith("quiz") and "asesmen" not in t:
        return "quiz"
    if t.startswith("summary"):
        return "summary"
    if t.startswith("demo"):
        for key, kind in (("fallback", "fallback"), ("sintaks", "syntax"), ("hasil", "result"),
                          ("langkah", "steps"), ("tujuan", "demo_intro")):
            if key in t and not (key == "hasil" and "langkah" in t):
                return kind
        return "steps"
    if t.startswith("lab"):
        for key, kind in (("sintaks", "syntax"), ("troubleshooting", "content"), ("fallback", "fallback"),
                          ("hasil", "result"), ("langkah", "steps"), ("pendamping", "content")):
            if key in t:
                return kind
        return "lab"
    return "content"


def build(day_no: int) -> Path:
    day = parse(OUTLINE_DIR / f"hari-{day_no}.md")
    deck = Deck(day)
    deck.section("Pembuka")
    r_cover(deck)
    r_glance(deck)
    main_topics = [t for t in day.topics if t.slides and t.slides[0].tipe.lower().startswith("judul")]
    for ti, topic in enumerate(day.topics):
        deck.section(f"{topic.id} {re.sub(r'\s*\+.*$', '', topic.title)}"[:60])
        nxt = day.topics[ti + 1].title if ti + 1 < len(day.topics) else (
            f"Hari {day_no + 1}" if day_no < 5 else "Post-test, roadmap, dan penutupan")
        has_divider = False
        for si, s in enumerate(topic.slides):
            kind = classify(s)
            if day_no == 1 and s.id == "1.0-01":
                continue                                  # replaced by generated cover
            if kind == "divider":
                idx = main_topics.index(topic) + 1 if topic in main_topics else ti + 1
                r_divider(deck, topic, idx, len(main_topics), s)
                has_divider = True
            elif kind == "agenda":
                r_agenda(deck, topic, s)
            elif kind == "objectives":
                r_objectives(deck, topic, s)
            elif kind == "quiz":
                r_quiz(deck, s)
            elif kind == "summary":
                trans = re.search(r"Transisi:\s*(.+)$", notes_text(s))
                r_summary(deck, topic, s, S.plain(trans.group(1)) if trans else f"{nxt}")
            elif kind == "demo_intro":
                steps_slide = next((x for x in topic.slides[si + 1:si + 5] if "langkah" in x.tipe.lower()), None)
                r_demo_intro(deck, topic, s, items_of(steps_slide) if steps_slide else [])
            elif kind == "syntax":
                r_syntax(deck, s, demo_badge(s))
            elif kind == "steps":
                r_steps(deck, s, demo_badge(s))
            elif kind == "result":
                r_result(deck, s, demo_badge(s))
            elif kind == "fallback":
                r_fallback(deck, s, demo_badge(s))
            elif kind == "lab":
                r_lab(deck, topic, s)
            else:
                pill_text = demo_badge(s) if s.tipe.lower().startswith("lab") else None
                r_content(deck, topic, s, pill_text=pill_text)
    deck.section("Penutup")
    r_closing(deck)
    out = OUT_DIR / f"slide_day{day_no:02d}_{DAY_SLUG[day_no]}.pptx"
    deck.save(out)
    return out


if __name__ == "__main__":
    days = [int(a) for a in sys.argv[1:]] or [1, 2, 3, 4, 5]
    for d in days:
        p = build(d)
        print("Wrote", p.relative_to(S.ROOT), Presentation(str(p)).slides.__len__(), "slides")
