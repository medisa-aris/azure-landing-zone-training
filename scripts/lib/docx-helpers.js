// Shared formatting helpers for the course documents (docx library).
const {
  Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  HeadingLevel, AlignmentType, LevelFormat, PageBreak, BorderStyle, ExternalHyperlink,
  Footer, PageNumber,
} = require("docx");

const FONT = "Arial";
const BRAND = "0F4C81";
const LIGHT = "DCE8F5";
const WARN = "FFF4D6";
const PAGE_W = 11906; // A4
const PAGE_H = 16838;
const MARGIN = 1134; // 2 cm
const CONTENT_W = PAGE_W - 2 * MARGIN;

// Inline **bold** and `code` support
function runs(text, opts = {}) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p) => {
    if (p.startsWith("**")) return new TextRun({ text: p.slice(2, -2), bold: true, font: FONT, ...opts });
    if (p.startsWith("`")) return new TextRun({ text: p.slice(1, -1), font: "Consolas", ...opts, color: "8A1538" });
    return new TextRun({ text: p, font: FONT, ...opts });
  });
}

const P = (text, opts = {}) => new Paragraph({ children: runs(text, opts.run), spacing: { after: 100 }, ...opts.para });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t })] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: t })] });
const B = (t, level = 0) => new Paragraph({ numbering: { reference: "bullets", level }, children: runs(t), spacing: { after: 60 } });
const N = (t, ref = "numbers") => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), spacing: { after: 60 } });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });
const SP = () => new Paragraph({ spacing: { after: 120 }, children: [] });
const CODE = (lines) => lines.map((l) => new Paragraph({
  spacing: { after: 0 },
  shading: { fill: "F2F2F2", type: ShadingType.CLEAR, color: "auto" },
  children: [new TextRun({ text: l || " ", font: "Consolas", size: 18 })],
}));
const LINK = (label, url) => new Paragraph({
  numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 },
  children: [new ExternalHyperlink({ link: url, children: [new TextRun({ text: label, style: "Hyperlink", font: FONT })] })],
});

const border = { style: BorderStyle.SINGLE, size: 4, color: "A6A6A6" };
const borders = { top: border, bottom: border, left: border, right: border };

function widthsFrom(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.floor((w / total) * CONTENT_W));
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  return widths;
}

// rows: array of arrays of strings; first row is the header. "\n" starts a new paragraph in a cell.
function table(weights, rows, { header = true } = {}) {
  const widths = widthsFrom(weights);
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, ri) => new TableRow({
      tableHeader: header && ri === 0,
      cantSplit: true,
      children: r.map((c, ci) => new TableCell({
        borders,
        width: { size: widths[ci], type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        shading: header && ri === 0 ? { fill: BRAND, type: ShadingType.CLEAR, color: "auto" } : undefined,
        children: String(c).split("\n").map((line) => new Paragraph({
          spacing: { after: 40 },
          children: runs(line, header && ri === 0 ? { bold: true, color: "FFFFFF", size: 19 } : { size: 19 }),
        })),
      })),
    })),
  });
}

function callout(title, lines, fill = LIGHT) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR, color: "auto" },
      borders: { top: { style: BorderStyle.SINGLE, size: 12, color: BRAND }, bottom: border, left: border, right: border },
      margins: { top: 100, bottom: 100, left: 160, right: 160 },
      children: [
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: title, bold: true, font: FONT, color: BRAND })] }),
        ...lines.map((l) => new Paragraph({ spacing: { after: 50 }, children: runs(l, { size: 19 }) })),
      ],
    })] })],
  });
}

const styles = {
  default: { document: { run: { font: FONT, size: 21 } } },
  paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 32, bold: true, color: BRAND }, paragraph: { spacing: { before: 240, after: 160 }, keepNext: true, outlineLevel: 0 } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 26, bold: true, color: "1F1F1F" }, paragraph: { spacing: { before: 220, after: 100 }, keepNext: true, outlineLevel: 1 } },
    { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 22, bold: true, color: BRAND }, paragraph: { spacing: { before: 180, after: 80 }, keepNext: true, outlineLevel: 2 } },
  ],
};

const numbering = {
  config: [
    { reference: "bullets", levels: [
      { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
      { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 270 } } } },
    ] },
    { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
  ],
};

function footer(text) {
  return { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: `${text}  |  `, font: FONT, size: 16, color: "808080" }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "808080" }),
  ] })] }) };
}

const pageProps = { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } };

module.exports = {
  FONT, BRAND, LIGHT, WARN, CONTENT_W,
  runs, P, H1, H2, H3, B, N, BREAK, SP, CODE, LINK, table, callout, styles, numbering, footer, pageProps,
};
