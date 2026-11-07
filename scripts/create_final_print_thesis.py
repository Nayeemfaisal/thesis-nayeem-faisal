from __future__ import annotations

from io import BytesIO
from pathlib import Path
import re

import pymupdf
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "output/pdf/Nayeem-Faisal-Thesis-Book-Edition.pdf"
OUTPUT = ROOT / "output/pdf/Nayeem-Faisal-Thesis-Print-Final.pdf"
TMP = ROOT / "tmp/pdfs/final-print-thesis"
LOGO = ROOT / "academic-source/tha-template/img/Logo.png"
DIESEL = ROOT / "academic-source/tha-template/img/diesel.png"

TITLE = (
    "Development and Evaluation of Machine Learning Models for "
    "Lithium-Ion Battery Remaining Useful Life Prediction"
)
AUTHOR = "Nayeem Faisal"
PROGRAM = "International Information Systems"
DEGREE = "Bachelor of Science (B.Sc.)"
FACULTY = "Faculty of Computer Science"
ENROLMENT = "2224981"
FIRST_SUPERVISOR = "Prof. Dr. rer. nat. Jana Görmer-Redding"
SECOND_SUPERVISOR = "Prof. Dr. Fiorentino Valerio Conte"
SUBMISSION_DATE = "27 October 2026"

PAGE_W, PAGE_H = A4
PINK = colors.HexColor("#FF0350")
BLACK = colors.HexColor("#111111")
GREY = colors.HexColor("#595959")
LIGHT_GREY = colors.HexColor("#D6D6D6")
BLUE = colors.HexColor("#3A91AA")
GREEN = colors.HexColor("#009B52")
BURGUNDY = colors.HexColor("#804154")

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("FinalSans", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("FinalSansBold", str(FONT_DIR / "Arial Bold.ttf")))
pdfmetrics.registerFont(TTFont("FinalSerif", str(FONT_DIR / "Times New Roman.ttf")))
pdfmetrics.registerFont(TTFont("FinalSerifBold", str(FONT_DIR / "Times New Roman Bold.ttf")))


def wrapped_lines(c: canvas.Canvas, text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join(current + [word])
        if current and c.stringWidth(candidate, font, size) > width:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines


def make_cover(path: Path) -> None:
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    left = 27 * mm
    right_x = 150 * mm
    content_width = 118 * mm

    logo = ImageReader(str(LOGO))
    logo_w = 60 * mm
    logo_h = logo_w * 200 / 975
    c.drawImage(logo, left, PAGE_H - 20 * mm - logo_h, width=logo_w, height=logo_h, mask="auto")

    c.setFont("FinalSansBold", 11.2)
    c.setFillColor(PINK)
    c.drawString(right_x, PAGE_H - 25 * mm, FACULTY)

    y = PAGE_H - 66 * mm
    c.setFont("FinalSansBold", 18)
    c.drawString(left, y, "Bachelor's Thesis")
    y -= 17
    c.setFont("FinalSans", 9.5)
    c.setFillColor(BLACK)
    c.drawString(left, y, "to obtain the degree")
    y -= 15
    c.setFont("FinalSans", 11.5)
    c.drawString(left, y, f"{DEGREE} in {PROGRAM}")

    y -= 40
    c.setFont("FinalSansBold", 20)
    c.setFillColor(PINK)
    for line in wrapped_lines(c, TITLE, "FinalSansBold", 20, content_width):
        c.drawString(left, y, line)
        y -= 27

    y -= 17
    c.setFont("FinalSans", 9.5)
    c.setFillColor(GREY)
    c.drawString(left, y, "created by")
    y -= 22
    c.setFont("FinalSans", 15)
    c.setFillColor(BLACK)
    c.drawString(left, y, AUTHOR)

    table_top = 247
    c.setStrokeColor(LIGHT_GREY)
    c.setLineWidth(0.7)
    c.line(left, table_top, left + content_width, table_top)
    rows = [
        ("First Supervisor", FIRST_SUPERVISOR),
        ("Second Supervisor", SECOND_SUPERVISOR),
        ("Submitted on", SUBMISSION_DATE),
        ("Non-Disclosure Agreement", "No"),
    ]
    row_y = table_top - 18
    for label, value in rows:
        c.setFont("FinalSansBold", 8.3)
        c.setFillColor(GREY)
        c.drawString(left, row_y, label)
        c.setFont("FinalSans", 8.8)
        c.setFillColor(BLACK)
        c.drawString(left + 43 * mm, row_y, value)
        row_y -= 18
    c.line(left, row_y + 6, left + content_width, row_y + 6)

    c.setFont("FinalSansBold", 7.3)
    c.setFillColor(BLACK)
    c.drawString(right_x, 330, AUTHOR)
    c.setFont("FinalSans", 6.7)
    c.setFillColor(GREY)
    c.drawString(right_x, 315, f"Enrolment Number: {ENROLMENT}")
    c.drawString(right_x, 300, PROGRAM)

    c.setFont("FinalSansBold", 7.3)
    c.setFillColor(PINK)
    c.drawString(right_x, 262, "Technische Hochschule Augsburg")
    c.setFont("FinalSans", 6.7)
    c.setFillColor(GREY)
    c.drawString(right_x, 247, "An der Hochschule 1")
    c.drawString(right_x, 234, "D-86161 Augsburg")
    c.drawString(right_x, 221, "www.tha.de")

    diesel = ImageReader(str(DIESEL))
    diesel_w = 30 * mm
    diesel_h = diesel_w * 487 / 334
    c.drawImage(diesel, right_x - 2 * mm, 24 * mm, width=diesel_w, height=diesel_h, mask="auto")
    c.save()


def extract_plot_images(source: pymupdf.Document) -> list[Path]:
    # Physical page 63 is printed page 55 in the corrected page-number system.
    page = source[62]
    clips = [
        pymupdf.Rect(150, 94, 475, 228),
        pymupdf.Rect(150, 294, 475, 442),
        pymupdf.Rect(150, 480, 475, 630),
    ]
    paths: list[Path] = []
    for index, clip in enumerate(clips, start=18):
        pix = page.get_pixmap(matrix=pymupdf.Matrix(3.2, 3.2), clip=clip, alpha=False)
        path = TMP / f"figure-{index}.png"
        pix.save(path)
        paths.append(path)
    return paths


def make_figure_page(path: Path, figures: list[Path]) -> None:
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    c.setFillColor(BLACK)
    c.setFont("FinalSansBold", 14)
    c.drawString(27 * mm, PAGE_H - 29 * mm, "Real-data relationships")

    captions = [
        "Figure 18. Discharge time versus cycle index.",
        "Figure 19. Remaining useful life versus cycle index.",
        "Figure 20. Total time versus remaining useful life.",
    ]
    image_x = 45 * mm
    image_w = 120 * mm
    image_h = 52 * mm
    image_bottoms = [PAGE_H - 91 * mm, PAGE_H - 157 * mm, PAGE_H - 223 * mm]
    for image_path, caption, image_y in zip(figures, captions, image_bottoms):
        c.drawImage(
            ImageReader(str(image_path)),
            image_x,
            image_y,
            width=image_w,
            height=image_h,
            preserveAspectRatio=True,
            anchor="c",
            mask="auto",
        )
        c.setFont("FinalSerifBold", 9.4)
        c.setFillColor(BLACK)
        c.drawCentredString(PAGE_W / 2, image_y - 6 * mm, caption)

    note = (
        "Figures 18-20 present the real-data relationships for discharge time, remaining useful "
        "life, cycle index, and total time. The corresponding synthetic-data relationships follow "
        "on the next page."
    )
    c.setFont("FinalSerif", 9.5)
    c.setFillColor(BLACK)
    y = 28 * mm
    for line in wrapped_lines(c, note, "FinalSerif", 9.5, 142 * mm):
        c.drawString(27 * mm, y, line)
        y -= 12
    c.save()


def replace_page(doc: pymupdf.Document, page_number: int, replacement: Path) -> None:
    repl = pymupdf.open(replacement)
    index = page_number - 1
    doc.delete_page(index)
    doc.insert_pdf(repl, from_page=0, to_page=0, start_at=index)
    repl.close()


def shift_chapter_content(doc: pymupdf.Document, source: pymupdf.Document, page_number: int, source_rect: pymupdf.Rect, top: float) -> None:
    page = doc[page_number - 1]
    page.add_redact_annot(source_rect, fill=(1, 1, 1))
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    target = pymupdf.Rect(source_rect.x0, top, source_rect.x1, top + source_rect.height)
    page.show_pdf_page(target, source, page_number - 1, clip=source_rect, keep_proportion=False)


def center_table_regions(doc: pymupdf.Document, source: pymupdf.Document) -> None:
    """Reposition the comparison tables on the physical centre line of each page."""
    regions = [
        (16, pymupdf.Rect(54, 342, 587, 723), -23),
        (17, pymupdf.Rect(54, 60, 587, 744), -23),
        (18, pymupdf.Rect(54, 60, 587, 223), -23),
        (21, pymupdf.Rect(86, 153, 589, 723), -40),
        (22, pymupdf.Rect(86, 60, 589, 405), -40),
        (27, pymupdf.Rect(54, 188, 587, 725), -23),
        (28, pymupdf.Rect(54, 60, 587, 568), -23),
    ]
    for page_number, clip, horizontal_shift in regions:
        page = doc[page_number - 1]
        page.add_redact_annot(clip, fill=(1, 1, 1))
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
        target = pymupdf.Rect(
            clip.x0 + horizontal_shift,
            clip.y0,
            clip.x1 + horizontal_shift,
            clip.y1,
        )
        page.show_pdf_page(
            target,
            source,
            page_number - 1,
            clip=clip,
            keep_proportion=False,
        )


def section_name(page_number: int) -> str:
    if page_number == 2:
        return "ABSTRACT"
    if 3 <= page_number <= 8:
        return "FRONT MATTER"
    if 9 <= page_number <= 12:
        return "INTRODUCTION"
    if 13 <= page_number <= 46:
        return "LITERATURE REVIEW"
    if 47 <= page_number <= 59:
        return "DATA AND SYNTHETIC GENERATION"
    if 60 <= page_number <= 65:
        return "EXPLORATORY DATA ANALYSIS"
    if 66 <= page_number <= 72:
        return "MODELING, EVALUATION, AND CONCLUSION"
    if 73 <= page_number <= 85:
        return "REFERENCES"
    return "AUTHOR'S DECLARATION"


def accent_for(page_number: int) -> tuple[float, float, float]:
    if 13 <= page_number <= 46:
        return (0.227, 0.569, 0.667)
    if 47 <= page_number <= 59:
        return (0.227, 0.310, 0.333)
    if 60 <= page_number <= 65:
        return (0.0, 0.608, 0.322)
    if 66 <= page_number <= 72:
        return (0.502, 0.255, 0.329)
    return (1.0, 0.012, 0.314)


def page_label(page_number: int) -> str:
    roman = {2: "ii", 3: "iii", 4: "iv", 5: "v", 6: "vi", 7: "vii", 8: "viii"}
    if page_number in roman:
        return roman[page_number]
    if 9 <= page_number <= 85:
        return str(page_number - 8)
    return ""


def add_table_guides(doc: pymupdf.Document) -> None:
    page = doc[26]
    x = [29, 132, 294, 406, 564]
    top, bottom = 190, 216
    header_colors = [
        (1.0, 0.012, 0.314),
        (0.227, 0.569, 0.667),
        (0.227, 0.310, 0.333),
        (0.502, 0.255, 0.329),
    ]
    for index in range(4):
        rect = pymupdf.Rect(x[index], top, x[index + 1], bottom)
        page.draw_rect(
            rect,
            color=None,
            fill=header_colors[index],
            fill_opacity=0.16,
            overlay=True,
        )
    for xx in x[1:-1]:
        page.draw_line((xx, bottom), (xx, 760), color=(0.82, 0.82, 0.82), width=0.45, overlay=True)


def add_table_readability_styles(doc: pymupdf.Document) -> None:
    """Add publication-style colour and separators without replacing table text."""
    palettes = [
        ((1.0, 0.76, 0.25), (0.20, 0.70, 1.0)),
        ((0.12, 0.70, 0.50), (1.0, 0.32, 0.54)),
        ((0.55, 0.42, 0.95), (0.15, 0.72, 0.78)),
    ]

    def shade_rows(
        page_number: int,
        x0: float,
        x1: float,
        boundaries: list[float],
        palette_index: int,
    ) -> None:
        page = doc[page_number - 1]
        colours = palettes[palette_index]
        for row_index, (top, bottom) in enumerate(zip(boundaries, boundaries[1:])):
            page.draw_rect(
                pymupdf.Rect(x0, top, x1, bottom),
                color=None,
                fill=colours[row_index % 2],
                fill_opacity=0.085,
                overlay=True,
            )
            page.draw_line(
                (x0, bottom),
                (x1, bottom),
                color=(0.72, 0.72, 0.72),
                width=0.35,
                stroke_opacity=0.45,
                overlay=True,
            )

    # Table 1: prediction-method literature comparison (three pages).
    shade_rows(16, 31, 564, [364, 410, 440, 483, 515, 568, 611, 656, 679, 722], 0)
    shade_rows(17, 31, 564, [60, 116, 161, 206, 249, 294, 325, 370, 414, 458, 489, 534, 564, 609, 653, 684, 714, 744], 0)
    shade_rows(18, 31, 564, [60, 102, 133, 165, 223], 0)

    # Table 2: deep-learning literature comparison (two pages).
    shade_rows(21, 46, 549, [173, 216, 257, 298, 339, 380, 433, 462, 503, 544, 573, 625, 680, 720], 1)
    shade_rows(22, 46, 549, [60, 100, 142, 194, 236, 277, 306, 347, 400], 1)

    # Table 3: parameterisation literature comparison (two pages).
    shade_rows(27, 31, 564, [210, 253, 294, 335, 376, 417, 458, 486, 527, 555, 584, 625, 653, 694, 722], 2)
    shade_rows(28, 31, 564, [62, 115, 156, 184, 225, 266, 295, 335, 364, 405, 446, 486, 527, 568], 2)

    # Light column guides make the dense comparisons easier to scan.
    guide_sets = [
        (16, [136, 279, 387], 346, 722),
        (17, [136, 279, 387], 60, 744),
        (18, [136, 279, 387], 60, 223),
        (21, [179, 303, 406], 156, 720),
        (22, [179, 303, 406], 60, 400),
        (27, [133, 295, 406], 190, 722),
        (28, [133, 295, 406], 62, 568),
    ]
    for page_number, guides, top, bottom in guide_sets:
        page = doc[page_number - 1]
        for x in guides:
            page.draw_line(
                (x, top),
                (x, bottom),
                color=(0.55, 0.55, 0.55),
                width=0.45,
                stroke_opacity=0.42,
                overlay=True,
            )

    # Give the small benchmark table and both correlation matrices a matching frame.
    doc[28].draw_rect(
        pymupdf.Rect(80, 268, 483, 508),
        color=(0.502, 0.255, 0.329),
        width=1.2,
        stroke_opacity=0.72,
        overlay=True,
    )
    shade_rows(56, 86, 523, [468, 491, 514, 537, 560, 583, 606, 629, 652, 675, 698, 721, 742], 1)
    shade_rows(57, 86, 523, [72, 94, 116, 138, 160, 182, 204, 226, 248, 270, 292, 317], 1)
    shade_rows(57, 86, 523, [431, 454, 477, 500, 523, 546, 569, 592, 615, 638, 661, 684, 707, 730, 743], 0)


def colourize_structural_text(doc: pymupdf.Document) -> None:
    """Colour headings and captions while leaving paragraph text dark and searchable."""
    heading_pattern = re.compile(
        r"^(?:\d+(?:\.\d+)+\.?\s+|\d+\.\s+|Chapter\s+\d+|ABSTRACT$|"
        r"LIST OF|TABLE OF CONTENTS|References$|Declaration concerning|Figure\s+\d+|Table\s+\d+)",
        re.IGNORECASE,
    )
    chapter_pattern = re.compile(r"^(?:\d+\.\s+|Chapter\s+\d+|ABSTRACT$|LIST OF|TABLE OF CONTENTS|References$)", re.IGNORECASE)
    caption_pattern = re.compile(r"^(?:Figure|Table)\s+\d+", re.IGNORECASE)
    chapter_colour = (128, 65, 84)
    section_colour = (36, 126, 146)
    caption_colour = (65, 91, 111)

    for page_number, page in enumerate(doc, start=1):
        if page_number == 1:
            continue
        jobs: list[tuple[pymupdf.Rect, tuple[int, int, int], bytes]] = []
        for block in page.get_text("dict").get("blocks", []):
            if "lines" not in block:
                continue
            for line in block["lines"]:
                text = "".join(span.get("text", "") for span in line.get("spans", [])).strip()
                if not text or not heading_pattern.match(text):
                    continue
                rect = pymupdf.Rect(line["bbox"])
                if rect.y0 < 52 or rect.y1 > 805 or rect.width < 10:
                    continue
                rect = pymupdf.Rect(rect.x0 - 1.5, rect.y0 - 1.2, rect.x1 + 1.5, rect.y1 + 1.2)
                colour = caption_colour if caption_pattern.match(text) else chapter_colour if chapter_pattern.match(text) else section_colour
                pix = page.get_pixmap(matrix=pymupdf.Matrix(3, 3), clip=rect, alpha=False)
                image = Image.open(BytesIO(pix.tobytes("png"))).convert("RGBA")
                pixels = image.load()
                for y in range(image.height):
                    for x in range(image.width):
                        red, green, blue, _ = pixels[x, y]
                        darkness = 255 - max(red, green, blue)
                        if darkness < 10:
                            pixels[x, y] = (255, 255, 255, 0)
                        else:
                            alpha = min(255, int(darkness * 1.16))
                            pixels[x, y] = (*colour, alpha)
                stream = BytesIO()
                image.save(stream, format="PNG")
                jobs.append((rect, colour, stream.getvalue()))
        for rect, _colour, png in jobs:
            page.draw_rect(rect, color=None, fill=(1, 1, 1), overlay=True)
            page.insert_image(rect, stream=png, keep_proportion=False, overlay=True)


def repair_figure_24_pagination(doc: pymupdf.Document, source: pymupdf.Document) -> None:
    """Keep the Figure 24 caption with its heatmap and remove the resulting chapter gap."""
    figure_page = doc[64]
    figure_page.insert_textbox(
        pymupdf.Rect(150, 742, 445, 760),
        "Figure 24. Overview of the correlation matrix.",
        fontname="hebo",
        fontsize=8.2,
        color=(0.1, 0.1, 0.1),
        align=pymupdf.TEXT_ALIGN_CENTER,
        overlay=True,
    )

    chapter_page = doc[65]
    chapter_page.draw_rect(
        pymupdf.Rect(70, 54, 540, 370),
        color=(1, 1, 1),
        fill=(1, 1, 1),
        overlay=True,
    )
    shift_chapter_content(
        doc,
        source,
        66,
        pymupdf.Rect(70, 340, 540, 790),
        92,
    )


def add_headers_and_footers(doc: pymupdf.Document) -> None:
    logo_bytes = LOGO.read_bytes()
    for page_number in range(2, len(doc) + 1):
        page = doc[page_number - 1]
        accent = accent_for(page_number)
        page.draw_rect(pymupdf.Rect(0, 0, PAGE_W, 54), color=(1, 1, 1), fill=(1, 1, 1), overlay=True)
        page.draw_rect(pymupdf.Rect(0, 806, PAGE_W, PAGE_H), color=(1, 1, 1), fill=(1, 1, 1), overlay=True)
        page.insert_image(pymupdf.Rect(71, 17, 159, 35), stream=logo_bytes, keep_proportion=True, overlay=True)
        page.insert_textbox(
            pymupdf.Rect(315, 17, PAGE_W - 65, 36),
            section_name(page_number),
            fontname="helv",
            fontsize=6.4,
            color=accent,
            align=pymupdf.TEXT_ALIGN_RIGHT,
            overlay=True,
        )
        page.draw_line((71, 48), (PAGE_W - 65, 48), color=accent, width=1.05, overlay=True)
        page.insert_text((71, 824), "NAYEEM FAISAL", fontname="helv", fontsize=6.3, color=(0.35, 0.35, 0.35), overlay=True)
        label = page_label(page_number)
        if label:
            page.insert_text((PAGE_W - 73, 824), label, fontname="helv", fontsize=6.3, color=(0.35, 0.35, 0.35), overlay=True)


def validate(doc: pymupdf.Document) -> None:
    if len(doc) != 86:
        raise RuntimeError(f"Expected 86 pages, found {len(doc)}")
    forbidden = [
        "STRUCTURED RESEARCH OVERVIEW",
        "SUPERVISOR-REVIEW SUPPLEMENT",
        "Required author review",
        "No fabricated correction",
        "Results provenance and reproducibility audit",
        "Submission manifest and running instructions",
    ]
    text = "\n".join(page.get_text() for page in doc)
    found = [phrase for phrase in forbidden if phrase.lower() in text.lower()]
    if found:
        raise RuntimeError(f"Editorial supplement text remains: {found}")


def main() -> None:
    TMP.mkdir(parents=True, exist_ok=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    source = pymupdf.open(SOURCE)
    if len(source) != 86:
        raise RuntimeError(f"Expected 86 source pages, found {len(source)}")
    toc = source.get_toc(simple=False)
    doc = pymupdf.open()
    doc.insert_pdf(source)

    cover_path = TMP / "official-cover.pdf"
    make_cover(cover_path)
    replace_page(doc, 1, cover_path)

    # Move true chapter-opening content upward while preserving every original word.
    shift_chapter_content(doc, source, 13, pymupdf.Rect(70, 390, 540, 790), 90)
    shift_chapter_content(doc, source, 60, pymupdf.Rect(70, 520, 540, 790), 100)

    figures = extract_plot_images(source)
    figure_page = TMP / "real-data-relationships.pdf"
    make_figure_page(figure_page, figures)
    replace_page(doc, 63, figure_page)

    repair_figure_24_pagination(doc, source)
    center_table_regions(doc, source)

    # Improve every table without changing any study, method, domain, finding, or value.
    add_table_guides(doc)
    add_table_readability_styles(doc)
    colourize_structural_text(doc)
    add_headers_and_footers(doc)
    # Remove the obsolete page number embedded in the original declaration artwork.
    doc[85].draw_rect(pymupdf.Rect(515, 775, 555, 806), color=(1, 1, 1), fill=(1, 1, 1), overlay=True)

    metadata = dict(source.metadata or {})
    metadata.update(
        {
            "title": TITLE,
            "author": AUTHOR,
            "subject": "Bachelor's Thesis - Print Final",
            "keywords": "lithium-ion battery, remaining useful life, LSTM, XGBoost, machine learning",
            "creator": AUTHOR,
            "producer": "Technische Hochschule Augsburg print layout",
        }
    )
    doc.set_metadata(metadata)
    if toc:
        doc.set_toc(toc)
    validate(doc)
    doc.save(OUTPUT, garbage=4, deflate=True, clean=True)
    doc.close()
    source.close()

    check = pymupdf.open(OUTPUT)
    validate(check)
    print(f"Wrote {OUTPUT}")
    print(f"Pages: {len(check)}")
    print(f"Size: {OUTPUT.stat().st_size:,} bytes")
    check.close()


if __name__ == "__main__":
    main()
