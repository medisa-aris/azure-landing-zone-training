"""Visual primitives that reproduce the training template (SQL Server Admin on Linux deck):
glass content card, white option cards, ovals, pills, terminal window, icons, text fitting.
All measurements are inches on a 13.333 x 7.5 canvas.
"""
from __future__ import annotations

import math
import re
from pathlib import Path

from lxml import etree
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_DIR = ROOT / "slides" / "template"
ICON_DIR = TEMPLATE_DIR / "icons"
ASSET_DIR = TEMPLATE_DIR / "assets"
MSLEARN_DIR = TEMPLATE_DIR / "mslearn"

# ---- palette (from template theme and slides)
BLUE = "0078D4"        # accent1
NAVY = "243A5E"        # dk2 / accent2
CYAN = "50E6FF"        # accent3 (demo pill)
NUM = "3579CF"         # numbered circles / option letters
GRAY = "737373"        # captions
LGRAY = "8A8A8A"
BLACK = "000000"
WHITE = "FFFFFF"
LINE = "E6E6E6"
TINT = "DEECF9"        # purpose bar / lab panel
RESULT = "F4F6FA"      # result panel
NOTE = "E9EDF3"        # "what this shows" panel
TERM = "1B2A41"        # terminal body
TERM_BAR = "2B3E5C"
TERM_TXT = "F2F2F2"
TERM_LBL = "C8D3E6"
ORANGE = "E36C09"
RED = "C00000"
GREEN = "107C10"

FONT = "Segoe UI"
FONT_SB = "Segoe UI Semibold"
MONO = "Consolas"

SLIDE_W, SLIDE_H = 13.333, 7.5
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def rgb(h):
    return RGBColor.from_string(h)


# ------------------------------------------------------------------ inline markdown
def humanize(t: str) -> str:
    """Natural Indonesian punctuation for prose (never applied to code)."""
    t = re.sub(r"\b([01]\d|2[0-3]):([0-5]\d)\b", r"\1.\2", t)          # 09:00 -> 09.00 (PUEBI)
    t = t.replace(" · ", ", ")
    t = re.sub(r"\s+[—–]\s+", ", ", t)
    arrows = t.count(" → ")
    if arrows >= 2:
        t = t.replace(" → ", " › ")
    elif arrows == 1:
        t = t.replace(" → ", ", lalu " if ":" in t else ": ")
    t = re.sub(r"(?<=\w) = (?=\w)", " adalah ", t)
    t = re.sub(r"(?<=\w) \+ (?=\w)", " dan ", t)
    t = re.sub(r"[ \t]{2,}", " ", t)
    t = re.sub(r"[ \t]+([,.;:])", r"\1", t)
    t = re.sub(r",\s*,", ",", t)
    return t


def humanize_md(text: str) -> str:
    """Humanize prose parts of a markdown string, keep `code` parts untouched, return plain text."""
    return "".join(t if k == "c" else humanize(t) for t, k in md_runs(text, raw=True))


def md_runs(text: str, raw: bool = False):
    """Split '**bold**' and '`code`' into (text, kind) runs; strip other markdown."""
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    out = []
    for part in re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            out.append((part[2:-2], "b"))
        elif part.startswith("`") and part.endswith("`"):
            out.append((part[1:-1], "c"))
        else:
            out.append((part.replace("*", ""), "n"))
    if not raw:
        out = [(t if k == "c" else humanize(t), k) for t, k in out]
    return out


def plain(text: str) -> str:
    return "".join(t for t, _ in md_runs(text))


def raw_plain(text: str) -> str:
    return "".join(t for t, _ in md_runs(text, raw=True))


# ------------------------------------------------------------------ text fitting
CHAR_W = 0.56   # average glyph width in em (conservative for Segoe UI substitutes)


def est_lines(text: str, width_in: float, size: float, mono=False) -> int:
    cw = 0.6 if mono else CHAR_W
    cpl = max(1, int(width_in * 72 / (size * cw)))
    return max(1, math.ceil(len(text) / cpl))


def fit_size(paras, width_in, height_in, max_size=18, min_size=12, spacing=1.18, gap_pt=6, mono=False):
    """Largest font size (step 0.5) at which the paragraphs fit the box."""
    size = max_size
    while size > min_size:
        lines = sum(est_lines(p, width_in, size, mono) for p in paras)
        h = (lines * size * spacing + gap_pt * max(0, len(paras) - 1)) / 72
        if h <= height_in:
            return size
        size -= 0.5
    return min_size


# ------------------------------------------------------------------ shape helpers
def _effect_shadow(blur=214029, dist=43797, color=None, alpha=14880):
    clr = (f'<a:srgbClr val="{color}"><a:alpha val="{alpha}"/></a:srgbClr>' if color
           else f'<a:prstClr val="black"><a:alpha val="{alpha}"/></a:prstClr>')
    return etree.fromstring(
        f'<a:effectLst xmlns:a="{A}"><a:outerShdw blurRad="{blur}" dist="{dist}" dir="2700000" '
        f'algn="tl" rotWithShape="0">{clr}</a:outerShdw></a:effectLst>')


def _no_effect():
    return etree.fromstring(f'<a:effectLst xmlns:a="{A}"/>')


def box(slide, x, y, w, h, fill=None, line=None, line_w=0.75, shape=MSO_SHAPE.ROUNDED_RECTANGLE,
        radius=0.1, shadow=False, name=None, dash=False):
    shp = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if name:
        shp.name = name
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        shp.adjustments[0] = radius
    if fill:
        shp.fill.solid()
        shp.fill.fore_color.rgb = rgb(fill)
    else:
        shp.fill.background()
    if line:
        shp.line.color.rgb = rgb(line)
        shp.line.width = Pt(line_w)
        if dash:
            ln = shp._element.spPr.find(qn("a:ln"))
            ln.append(etree.fromstring(f'<a:prstDash xmlns:a="{A}" val="dash"/>'))
    else:
        shp.line.fill.background()
    shp._element.spPr.append(_effect_shadow() if shadow else _no_effect())
    shp.text_frame.text = ""
    return shp


def content_card(slide, x=0.49, y=1.36, w=12.35, h=5.55):
    """The template's frosted 'Content card': texture fill, white outline, soft pink shadow."""
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    shp.name = "Content card"
    shp.adjustments[0] = 0.04127
    _, rid = slide.part.get_or_add_image_part(str(ASSET_DIR / "card-texture.png"))
    spPr = shp._element.spPr
    fill = etree.fromstring(
        f'<a:blipFill xmlns:a="{A}" xmlns:r="{R}" dpi="0" rotWithShape="0"><a:blip r:embed="{rid}"/>'
        f'<a:srcRect/><a:stretch><a:fillRect l="-3115" t="-26084" r="-3115" b="-15234"/></a:stretch></a:blipFill>')
    ln = etree.fromstring(f'<a:ln xmlns:a="{A}"><a:solidFill><a:schemeClr val="bg1"/></a:solidFill></a:ln>')
    spPr.append(fill)
    spPr.append(ln)
    spPr.append(_effect_shadow(blur=343645, dist=295501, color="F3484C", alpha=15816))
    return shp


def white_card(slide, x, y, w, h, radius=0.1, fill=WHITE):
    return box(slide, x, y, w, h, fill=fill, line=LINE, line_w=0.75, radius=radius, shadow=True)


def oval(slide, x, y, d, fill, text=None, size=14, color=WHITE):
    shp = box(slide, x, y, d, d, fill=fill, shape=MSO_SHAPE.OVAL)
    if text is not None:
        tf = shp.text_frame
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = text
        _font(r, size, color, semibold=True)
    return shp


def pill(slide, x, y, w, h, text, fill, color=WHITE, size=14):
    shp = box(slide, x, y, w, h, fill=fill, radius=0.5)
    tf = shp.text_frame
    tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = humanize(text)
    _font(r, size, color, semibold=True)
    return shp


def icon(slide, name, x, y, size, white=False):
    path = ICON_DIR / f"{name}_{'white' if white else 'blue'}.png"
    if not path.exists():
        path = ICON_DIR / f"cloud_{'white' if white else 'blue'}.png"
    pic = slide.shapes.add_picture(str(path), Inches(x), Inches(y), Inches(size), Inches(size))
    pic.name = f"Icon {name}"
    return pic


def icon_oval(slide, name, x, y, d, fill=BLUE, ratio=0.55):
    oval(slide, x, y, d, fill)
    s = d * ratio
    icon(slide, name, x + (d - s) / 2, y + (d - s) / 2, s, white=True)


def line(slide, x1, y1, x2, y2, color=LGRAY, width=1.0, arrow=False, dash=False):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = rgb(color)
    c.line.width = Pt(width)
    ln = c.line._get_or_add_ln()
    if dash:
        ln.append(etree.fromstring(f'<a:prstDash xmlns:a="{A}" val="dash"/>'))
    if arrow:
        ln.append(etree.fromstring(f'<a:tailEnd xmlns:a="{A}" type="triangle" w="med" len="med"/>'))
    return c


# ------------------------------------------------------------------ text helpers
def _font(run, size, color=BLACK, semibold=False, mono=False, italic=False):
    f = run.font
    f.name = MONO if mono else (FONT_SB if semibold else FONT)
    f.size = Pt(size)
    f.color.rgb = rgb(color)
    f.bold = False
    f.italic = italic
    rPr = run._r.get_or_add_rPr()
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            el = etree.SubElement(rPr, qn(tag))
        el.set("typeface", f.name)


def add_runs(p, text, size, color=BLACK, semibold=False, mono=False, code_color=None):
    for t, kind in md_runs(text):
        r = p.add_run()
        r.text = t
        if kind == "c":
            _font(r, size * 0.95, code_color or color, mono=True)
        else:
            _font(r, size, color, semibold=semibold or kind == "b", mono=mono)


def bullet(p, color=BLUE, level=0):
    pPr = p._p.get_or_add_pPr()
    mar = 0.28 + level * 0.3
    pPr.set("marL", str(Inches(mar)))
    pPr.set("indent", str(-Inches(0.24)))
    pPr.append(etree.fromstring(f'<a:buClr xmlns:a="{A}"><a:srgbClr val="{color}"/></a:buClr>'))
    pPr.append(etree.fromstring(f'<a:buFont xmlns:a="{A}" typeface="Arial"/>'))
    pPr.append(etree.fromstring(f'<a:buChar xmlns:a="{A}" char="{"•" if level == 0 else "–"}"/>'))


def text(slide, x, y, w, h, paras, size=18, color=BLACK, semibold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, bullets=False, gap=6, mono=False, margin=0.05, name=None, line_spacing=None):
    """paras: str or list[str]. Returns the textbox."""
    if isinstance(paras, str):
        paras = [paras]
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if name:
        tb.name = name
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(margin)
    tf.margin_top = tf.margin_bottom = Inches(0.03)
    for i, ptxt in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if i < len(paras) - 1:
            p.space_after = Pt(gap)
        if line_spacing:
            p.line_spacing = line_spacing
        sub = ptxt.startswith("– ")
        if bullets:
            bullet(p, level=1 if sub else 0)
            if sub:
                ptxt = ptxt[2:]
        add_runs(p, ptxt, size * (0.9 if sub else 1), color, semibold, mono)
    return tb


def set_title(slide, title, max_size=36):
    ph = slide.shapes.title
    size = max_size
    while size > 26 and est_lines(title, 12.0, size) > 1:
        size -= 2
    ph.text_frame.text = ""
    p = ph.text_frame.paragraphs[0]
    r = p.add_run()
    r.text = plain(title)
    _font(r, size, BLACK, semibold=True)
    return ph


def remove_title(slide):
    ph = slide.shapes.title
    if ph is not None:
        ph._element.getparent().remove(ph._element)


def page_number(slide, n):
    text(slide, 12.15, 7.05, 0.75, 0.3, str(n), size=10, color=GRAY, align=PP_ALIGN.RIGHT, name="Page number")


def terminal(slide, x, y, w, h, label, blocks, max_size=16, min_size=10):
    """Dark terminal window (template 'Terminal'): blocks = [(lang, lines)]."""
    box(slide, x, y, w, h, fill=TERM, radius=0.04, name="Terminal")
    box(slide, x + 0.02, y + 0.02, w - 0.04, 0.3, fill=TERM_BAR, shape=MSO_SHAPE.RECTANGLE)
    for i, c in enumerate(("FF5F57", "FEBC2E", "28C840")):
        oval(slide, x + 0.12 + i * 0.2, y + 0.1, 0.12, c)
    text(slide, x + 0.8, y + 0.02, w - 1.0, 0.3, label, size=10, color=TERM_LBL, anchor=MSO_ANCHOR.MIDDLE)
    lines = []
    for bi, (_lang, blk) in enumerate(blocks):
        if bi:
            lines.append("")
        lines.extend(blk)
    lines = [l.rstrip() for l in lines] or [" "]
    size = fit_size(lines, w - 0.3, h - 0.5, max_size=max_size, min_size=min_size, spacing=1.15, gap_pt=0, mono=True)
    tb = slide.shapes.add_textbox(Inches(x + 0.12), Inches(y + 0.4), Inches(w - 0.24), Inches(h - 0.48))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.03)
    for i, l in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        r = p.add_run()
        r.text = l if l else " "
        is_comment = l.lstrip().startswith(("#", "//"))
        _font(r, size, CYAN if is_comment else TERM_TXT, mono=True)
    return size


def notes(slide, body):
    slide.notes_slide.notes_text_frame.text = humanize_md(body.strip())
