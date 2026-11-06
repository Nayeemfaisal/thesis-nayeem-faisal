from __future__ import annotations

from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "output/pdf/Nayeem-Faisal-Thesis-Supervisor-Review-Edition.pdf"
OUTPUT = ROOT / "output/pdf/Nayeem-Faisal-Thesis-THA-Final-Candidate.pdf"
LOGO = ROOT / "academic-source/tha-template/img/Logo.png"
DIESEL = ROOT / "academic-source/tha-template/img/diesel.png"

TITLE = (
    "Development and Evaluation of Machine Learning Models for "
    "Lithium-Ion Battery Remaining Useful Life Prediction"
)
AUTHOR = "Nayeem Faisal"
ENROLMENT = "2224981"
PROGRAM = "International Information Systems"
DEGREE = "Bachelor of Science (B.Sc.)"
FACULTY = "Faculty of Computer Science"
FIRST_SUPERVISOR = "Prof. Dr. rer. nat. Jana Görmer-Redding"
SECOND_SUPERVISOR = "Prof. Dr. Fiorentino Valerio Conte"
SUBMISSION_DATE = "27 October 2026"

THA_PINK = colors.HexColor("#FF0350")
THA_BLACK = colors.HexColor("#000000")
THA_GREY_4 = colors.HexColor("#595959")
THA_GREY_3 = colors.HexColor("#818181")
THA_GREY_2 = colors.HexColor("#CCCCCC")
THA_GREY_1 = colors.HexColor("#F2F2F2")
THA_BLUE = colors.HexColor("#3A91AA")
THA_OLIVE = colors.HexColor("#AAA23A")
THA_BURGUNDY = colors.HexColor("#804154")
THA_SLATE = colors.HexColor("#3A4F55")
THA_GREEN = colors.HexColor("#009B52")
PAGE_W, PAGE_H = A4

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("THASans", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("THASansBold", str(FONT_DIR / "Arial Bold.ttf")))
pdfmetrics.registerFont(TTFont("THASerif", str(FONT_DIR / "Times New Roman.ttf")))


def wrap_lines(c: canvas.Canvas, text: str, font: str, size: float, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join(current + [word])
        if current and c.stringWidth(candidate, font, size) > max_width:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font: str,
    size: float,
    leading: float,
    color=THA_BLACK,
) -> float:
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap_lines(c, text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def single_page(draw_fn) -> PdfReader:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4, pageCompression=1)
    draw_fn(c)
    c.save()
    buf.seek(0)
    return PdfReader(buf)


def cover_pdf() -> PdfReader:
    def draw(c: canvas.Canvas) -> None:
        c.setFillColor(colors.white)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        left = 27 * mm
        right_column_x = 150 * mm
        left_width = 120 * mm

        logo = ImageReader(str(LOGO))
        logo_w = 60 * mm
        logo_h = logo_w * 200 / 975
        c.drawImage(logo, left, PAGE_H - 20 * mm - logo_h, width=logo_w, height=logo_h, mask="auto")

        y = PAGE_H - 25 * mm
        y = draw_wrapped(c, FACULTY, right_column_x, y, 42 * mm, "THASansBold", 11.2, 13.4, THA_PINK)

        y = PAGE_H - 66 * mm
        c.setFont("THASansBold", 18)
        c.setFillColor(THA_PINK)
        c.drawString(left, y, "Bachelor's Thesis")
        y -= 17
        c.setFont("THASans", 9.5)
        c.setFillColor(THA_BLACK)
        c.drawString(left, y, "to obtain the degree")
        y -= 15
        c.setFont("THASans", 11.5)
        c.drawString(left, y, f"{DEGREE} in {PROGRAM}")

        y -= 39
        y = draw_wrapped(c, TITLE, left, y, left_width, "THASansBold", 20, 27, THA_PINK)

        y -= 24
        c.setFont("THASans", 9.5)
        c.setFillColor(THA_GREY_4)
        c.drawString(left, y, "created by")
        y -= 22
        c.setFont("THASans", 15)
        c.setFillColor(THA_BLACK)
        c.drawString(left, y, AUTHOR)

        table_top = 190
        c.setStrokeColor(THA_GREY_2)
        c.setLineWidth(0.7)
        c.line(left, table_top + 57, left + left_width, table_top + 57)
        c.line(left, table_top - 18, left + left_width, table_top - 18)
        rows = [
            ("First Supervisor", FIRST_SUPERVISOR),
            ("Second Supervisor", SECOND_SUPERVISOR),
            ("Submitted on", SUBMISSION_DATE),
            ("Non-Disclosure Agreement", "No"),
        ]
        row_y = table_top + 42
        for label, value in rows:
            c.setFont("THASansBold", 8.3)
            c.setFillColor(THA_GREY_4)
            c.drawString(left, row_y, label)
            c.setFont("THASans", 8.8)
            c.setFillColor(THA_BLACK)
            c.drawString(left + 43 * mm, row_y, value)
            row_y -= 18

        sidebar_y = 330
        c.setFont("THASansBold", 7.3)
        c.setFillColor(THA_BLACK)
        c.drawString(right_column_x, sidebar_y, AUTHOR)
        c.setFont("THASans", 6.7)
        c.setFillColor(THA_GREY_4)
        c.drawString(right_column_x, sidebar_y - 15, f"Enrolment Number: {ENROLMENT}")
        c.drawString(right_column_x, sidebar_y - 30, PROGRAM)

        c.setFillColor(THA_PINK)
        c.setFont("THASansBold", 7.3)
        c.drawString(right_column_x, sidebar_y - 68, "Technische Hochschule Augsburg")
        c.setFont("THASans", 6.7)
        c.setFillColor(THA_GREY_4)
        c.drawString(right_column_x, sidebar_y - 83, "An der Hochschule 1")
        c.drawString(right_column_x, sidebar_y - 96, "D-86161 Augsburg")
        c.drawString(right_column_x, sidebar_y - 109, "www.tha.de")

        # The official THA template places the Diesel emblem in the lower
        # right title-page column when showDiesel=true. Keep its 3 cm width.
        diesel = ImageReader(str(DIESEL))
        diesel_w = 30 * mm
        diesel_h = diesel_w * 487 / 334
        c.drawImage(
            diesel,
            right_column_x - 2 * mm,
            24 * mm,
            width=diesel_w,
            height=diesel_h,
            preserveAspectRatio=True,
            mask="auto",
        )

        c.setFillColor(THA_GREY_3)
        c.setFont("THASans", 6.5)
        c.drawString(left, 21 * mm, "FINAL CANDIDATE - AUTHOR AND SUPERVISOR APPROVAL REQUIRED BEFORE SUBMISSION")

    return single_page(draw)


LITERATURE_ROWS = [
    ("Zhou et al. (2020a)", "K-nearest-neighbor regression with differential optimization", "RUL estimation from experimental lithium-ion cell data", "Reported accurate RUL estimates across internally connected cells."),
    ("Lin et al. (2020a)", "Time-convolutional network", "Battery health-state monitoring", "Reported robust RUL prediction."),
    ("Wang et al. (2020a,b,c)", "Enhanced unscented Kalman filtering", "Battery health-state monitoring", "Reported robust RUL estimation under uncertain measurements."),
    ("Zhu et al. (2019)", "Comparative RUL prediction methods", "Lithium-ion batteries with multiple uncertainties", "Compared prediction behavior and evaluation criteria under uncertainty."),
    ("Zhao et al. (2019a); Zhang et al. (2019b)", "Nonlinear prediction with recovery-effect modeling", "RUL prediction with capacity-recovery effects", "Estimated RUL while accounting for recovery phenomena."),
    ("Liu et al. (2021)", "F-distributed particle filter with kernel smoothing", "Aircraft lithium-ion batteries", "Combined particle filtering and kernel smoothing for RUL estimation."),
    ("Zhang et al. (2019a-e)", "Nonlinear-drift fractional Brownian motion with hidden variables", "RUL under nonlinear degradation", "Modeled nonlinear drift by incorporating multiple latent variables."),
    ("Zheng et al. (2020)", "Optimal time-series health index", "RUL prediction", "Used an optimized time-series health index for RUL estimation."),
    ("Li et al. (2021a-c)", "Adaptive UKF with optimized support-vector regression", "RUL prediction", "Combined adaptive state estimation with SVR-based prediction."),
    ("Xiong et al. (2020a,b)", "Improved particle filter, Wiener process, and unscented particle filtering", "RUL prediction", "Combined improved filtering with stochastic degradation modeling."),
    ("Tian et al. (2020)", "Fractional Brownian-motion model", "RUL prediction", "Modeled RUL using fractional Brownian-motion degradation behavior."),
    ("Yin et al. (2019)", "User-specific driving patterns and capacity-recovery effects", "Capacity-degradation dynamics", "Combined driving behavior and recovery effects to predict degradation."),
    ("Qiu et al. (2020a)", "Improved cuckoo-search particle filter", "RUL prediction", "Fused failure-time and field-degradation information through random effects."),
    ("Yang et al. (2019)", "Adaptive data-driven feature-enhancement optimization", "Accurate RUL prediction", "Proposed an optimized feature-enhancement method for RUL estimation."),
    ("Farmann and Sauer (2018)", "Electrochemical model", "Model-based RUL prediction", "Used an electrochemical model as the battery-degradation framework."),
    ("Liu et al. (2020a)", "Mutated LSTM and neural-network models", "RUL prediction", "Reported high-accuracy RUL estimation using neural-network approaches."),
    ("Zhao et al. (2019b)", "Takagi-Sugeno observer", "Fault-tolerant lithium-ion battery systems", "Designed an observer that adapts to fault conditions."),
    ("Pan et al. (2020); Hu et al. (2020)", "Gaussian-process regression with indirect health indicators", "Battery-life prediction", "Combined indirect health indicators with Gaussian-process regression."),
    ("Sun et al. (2021)", "Rank-correlation-coefficient prediction method", "RUL prediction", "Constructed an RUL model using ranked feature relationships."),
    ("Cui et al. (2020)", "Rest-time characteristic", "RUL prediction", "Included resting-time behavior in the RUL model."),
    ("Jiang et al. (2019)", "Copula-based battery-pack consistency model", "Pack consistency and energy-utilization efficiency", "Modeled battery-pack consistency for energy-utilization-efficiency estimation."),
    ("Li et al. (2018)", "Second-order central particle-filter algorithm", "RUL prediction", "Reported RUL estimation using a second-order central particle filter."),
    ("Tian et al. (2019)", "Gray model with a score-processed indicator", "RUL prediction", "Constructed a prediction framework around a processed health indicator."),
    ("Tang et al. (2019a)", "Gaussian-process regression with a weighted-average operator", "RUL prediction", "Introduced a fusion-based selection and aggregation method."),
    ("Severson et al. (2019)", "Early-cycle data-driven features", "Cycle-life prediction before capacity degradation", "Predicted battery cycle life before pronounced capacity degradation."),
    ("Liu et al. (2019)", "Modified Gaussian-process regression", "Cycle-capacity prediction", "Analyzed cycle-capacity prediction using modified GPR models."),
    ("Cong et al. (2020)", "Health indicators with Gaussian-process regression", "Cycle-capacity prediction", "Predicted cycle capacity from health indicators."),
    ("Xiong et al. (2018)", "LSTM and Elman neural-network models", "Cycle-life prediction", "Used hybrid neural modeling for cycle-life prediction."),
    ("Jiang et al. (2018)", "Low-temperature internal-heating strategy", "Battery-pack thermal operation and lifetime preservation", "Proposed internal heating without reducing battery lifetime."),
    ("Eleftheroglou et al. (2019)", "Intelligent data-driven prognostic methods", "Real-time RUL to end-of-discharge for UAV lithium-polymer batteries", "Estimated end-of-discharge RUL with uncertainty quantification."),
]


BODY_STYLE = ParagraphStyle(
    "reader-body",
    fontName="THASerif",
    fontSize=8.4,
    leading=11.5,
    textColor=THA_BLACK,
    alignment=TA_LEFT,
)
SMALL_STYLE = ParagraphStyle(
    "reader-small",
    parent=BODY_STYLE,
    fontName="THASans",
    fontSize=7.1,
    leading=9.3,
    textColor=THA_GREY_4,
)


def draw_flowable(c: canvas.Canvas, flowable, x: float, y: float, width: float, *, after: float = 0) -> float:
    _, height = flowable.wrap(width, y - 30 * mm)
    if height > y - 30 * mm:
        raise RuntimeError(f"Literature page overflow: required {height:.1f} pt at y={y:.1f}")
    flowable.drawOn(c, x, y - height)
    return y - height - after


def literature_table(rows: list[tuple[str, str, str, str]]) -> Table:
    headers = ["Study", "Method / model", "Research focus", "Principal reported finding"]
    header_colors = [THA_PINK, THA_BLUE, THA_OLIVE, THA_BURGUNDY]
    cell_tints = [
        colors.HexColor("#FFF0F5"),
        colors.HexColor("#EEF7F9"),
        colors.HexColor("#FAF8E9"),
        colors.HexColor("#F6F0F2"),
    ]
    header_style = ParagraphStyle("lit-head", fontName="THASansBold", fontSize=6.8, leading=8.2, textColor=colors.white)
    study_style = ParagraphStyle("lit-study", fontName="THASansBold", fontSize=6.35, leading=7.6, textColor=THA_SLATE)
    cell_style = ParagraphStyle("lit-cell", fontName="THASans", fontSize=6.25, leading=7.55, textColor=THA_BLACK)
    data = [[Paragraph(value, header_style) for value in headers]]
    for row in rows:
        data.append([
            Paragraph(row[0], study_style),
            Paragraph(row[1], cell_style),
            Paragraph(row[2], cell_style),
            Paragraph(row[3], cell_style),
        ])
    table = Table(data, colWidths=[86, 145, 103, 136], repeatRows=1, hAlign="LEFT")
    styling = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.35, THA_GREY_2),
        ("LEFTPADDING", (0, 0), (-1, -1), 4.5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4.5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for col, color in enumerate(header_colors):
        styling.append(("BACKGROUND", (col, 0), (col, 0), color))
    for row_index in range(1, len(data)):
        for col, tint in enumerate(cell_tints):
            background = tint if row_index % 2 else colors.white
            styling.append(("BACKGROUND", (col, row_index), (col, row_index), background))
    table.setStyle(TableStyle(styling))
    return table


def literature_page(page_number: int, rows: list[tuple[str, str, str, str]], *, first: bool = False, last: bool = False) -> PdfReader:
    def draw(c: canvas.Canvas) -> None:
        c.setFillColor(colors.white)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        x = 25 * mm
        width = PAGE_W - 25 * mm - 23 * mm
        y = PAGE_H - 31 * mm

        c.setFillColor(THA_BLUE)
        c.setFont("THASansBold", 8)
        c.drawString(x, y, "EVIDENCE MAP")
        y -= 21
        c.setFillColor(THA_BLACK)
        c.setFont("THASansBold", 17)
        title = "Table 1. Prediction-method literature comparison"
        if not first:
            title += " (continued)"
        c.drawString(x, y, title)
        y -= 18

        if first:
            intro = Paragraph(
                "The reviewed studies use statistical filtering, state observers, Gaussian-process methods, "
                "physics-based models, and neural networks to estimate battery health, remaining useful life "
                "(RUL), or cycle life. The table standardizes the wording so that each row states the cited study, "
                "its principal method, its research focus, and the reported contribution without implying that "
                "results from different datasets are directly comparable.",
                BODY_STYLE,
            )
            y = draw_flowable(c, intro, x, y, width, after=10)
        else:
            c.setFillColor(THA_GREY_4)
            c.setFont("THASans", 7.1)
            c.drawString(x, y, "Standardized terminology; study-specific meaning retained from the cited source and bibliography.")
            y -= 13

        y = draw_flowable(c, literature_table(rows), x, y, width, after=9)

        if last:
            note = Paragraph(
                "<b>Editorial corrections.</b> The Jiang et al. (2018) and Jiang et al. (2019) rows now follow "
                "the titles listed in the thesis bibliography. The Severson et al. (2019) row describes its "
                "early-cycle data-driven prediction contribution, and the Eleftheroglou et al. (2019) row now "
                "uses the correct term <i>end-of-discharge</i> rather than 'UAV emission'.",
                ParagraphStyle("correction", parent=SMALL_STYLE, textColor=THA_SLATE, backColor=colors.HexColor("#EEF7F9"), borderColor=THA_BLUE, borderWidth=0.6, borderPadding=6),
            )
            y = draw_flowable(c, note, x, y, width, after=28)

            c.setFillColor(THA_BURGUNDY)
            c.setFont("THASansBold", 13)
            c.drawString(x, y, "2.2  Deep learning for RUL prediction")
            y -= 19
            outro = Paragraph(
                "Deep-learning methods can learn nonlinear relationships between operating measurements, "
                "degradation indicators, and battery life. Feedforward networks, extreme-learning machines, "
                "recurrent networks, and LSTM models differ in how they represent temporal information. "
                "Figure 1 positions deep learning within the wider family of reviewed RUL methods; the following "
                "sections discuss the architectures and their reported battery-prognostic applications.",
                BODY_STYLE,
            )
            draw_flowable(c, outro, x, y, width)

    return single_page(draw)


def roman(value: int) -> str:
    numerals = [
        (1000, "m"), (900, "cm"), (500, "d"), (400, "cd"),
        (100, "c"), (90, "xc"), (50, "l"), (40, "xl"),
        (10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i"),
    ]
    out = []
    for amount, symbol in numerals:
        while value >= amount:
            out.append(symbol)
            value -= amount
    return "".join(out)


def page_label(page_number: int) -> str:
    if page_number == 1:
        return ""
    if page_number == 2:
        return "ii"
    if 3 <= page_number <= 6:
        return f"S{page_number - 2}"
    if 7 <= page_number <= 12:
        return roman(page_number - 4)
    if 13 <= page_number <= 89:
        return str(page_number - 12)
    if 90 <= page_number <= 99:
        return f"A{page_number - 89}"
    return "DECL"


def section_name(page_number: int) -> str:
    if page_number == 2:
        return "ABSTRACT"
    if 3 <= page_number <= 6:
        return "STRUCTURED RESEARCH OVERVIEW"
    if 7 <= page_number <= 12:
        return "FRONT MATTER"
    if 13 <= page_number <= 16:
        return "INTRODUCTION"
    if 17 <= page_number <= 50:
        return "LITERATURE REVIEW"
    if 51 <= page_number <= 63:
        return "DATA AND SYNTHETIC GENERATION"
    if 64 <= page_number <= 69:
        return "EXPLORATORY DATA ANALYSIS"
    if 70 <= page_number <= 76:
        return "MODELING, EVALUATION, AND CONCLUSION"
    if 77 <= page_number <= 89:
        return "REFERENCES"
    if 90 <= page_number <= 99:
        return "ANNEXES AND REPRODUCIBILITY EVIDENCE"
    return "AUTHOR'S DECLARATION"


CHAPTER_OPENERS = {13, 17, 51, 64, 70, 77, 90, 100}


def accent_for_page(page_number: int):
    if 17 <= page_number <= 50:
        return THA_BLUE
    if 51 <= page_number <= 63:
        return THA_OLIVE
    if 64 <= page_number <= 69:
        return THA_GREEN
    if 70 <= page_number <= 76:
        return THA_BURGUNDY
    if 77 <= page_number <= 89:
        return THA_SLATE
    if 90 <= page_number <= 99:
        return THA_BLUE
    return THA_PINK


def overlay_pdf(page_number: int) -> PdfReader:
    def draw(c: canvas.Canvas) -> None:
        accent = accent_for_page(page_number)
        # Remove the mixed legacy headers and supplement footers visually.
        c.setFillColor(colors.white)
        c.rect(0, PAGE_H - 19 * mm, PAGE_W, 19 * mm, fill=1, stroke=0)
        c.rect(0, 0, PAGE_W, 12 * mm, fill=1, stroke=0)

        logo = ImageReader(str(LOGO))
        logo_w = 31 * mm
        logo_h = logo_w * 200 / 975
        logo_y = PAGE_H - 11.5 * mm
        c.drawImage(logo, 25 * mm, logo_y, width=logo_w, height=logo_h, mask="auto")

        c.setFont("THASans", 6.5)
        c.setFillColor(accent)
        c.drawRightString(PAGE_W - 23 * mm, PAGE_H - 8.3 * mm, section_name(page_number))
        c.setStrokeColor(accent)
        c.setLineWidth(1.1)
        c.line(25 * mm, PAGE_H - 17 * mm, PAGE_W - 23 * mm, PAGE_H - 17 * mm)

        c.setFont("THASansBold", 6.4)
        c.setFillColor(THA_GREY_4)
        c.drawString(25 * mm, 7 * mm, "NAYEEM FAISAL")
        c.setFont("THASans", 6.4)
        c.drawRightString(PAGE_W - 23 * mm, 7 * mm, page_label(page_number))

        if page_number in CHAPTER_OPENERS:
            c.setFillColor(accent)
            c.rect(0, PAGE_H - 55 * mm, 2.2 * mm, 28 * mm, fill=1, stroke=0)

    return single_page(draw)


def replace_page_content(target_page, replacement_page) -> None:
    empty = DecodedStreamObject()
    empty.set_data(b"")
    target_page[NameObject("/Contents")] = empty
    target_page[NameObject("/Resources")] = DictionaryObject()
    target_page.merge_page(replacement_page)


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    if not LOGO.exists():
        raise FileNotFoundError(LOGO)
    if not DIESEL.exists():
        raise FileNotFoundError(DIESEL)

    reader = PdfReader(str(SOURCE))
    if len(reader.pages) != 100:
        raise ValueError(f"Expected 100 pages, found {len(reader.pages)}")

    writer = PdfWriter()
    writer.clone_document_from_reader(reader)

    cover = cover_pdf()
    replace_page_content(writer.pages[0], cover.pages[0])

    literature_readers = [
        literature_page(20, LITERATURE_ROWS[:10], first=True),
        literature_page(21, LITERATURE_ROWS[10:20]),
        literature_page(22, LITERATURE_ROWS[20:], last=True),
    ]
    for physical_page, replacement in zip((20, 21, 22), literature_readers):
        replace_page_content(writer.pages[physical_page - 1], replacement.pages[0])

    overlay_readers = []
    for page_number in range(2, len(writer.pages) + 1):
        overlay = overlay_pdf(page_number)
        overlay_readers.append(overlay)
        writer.pages[page_number - 1].merge_page(overlay.pages[0])

    writer.add_metadata({
        "/Title": TITLE,
        "/Author": AUTHOR,
        "/Subject": "THA final-review candidate with two supervisors, official title-page assets, colour hierarchy, polished literature table, and verified figure layout",
        "/Keywords": "lithium-ion battery, RUL, LSTM, XGBoost, THA, thesis, annex",
        "/Creator": "THA print layout assembly",
    })
    writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("wb") as stream:
        writer.write(stream)

    check = PdfReader(str(OUTPUT))
    if len(check.pages) != 100 or check.is_encrypted:
        raise RuntimeError("Written PDF did not reopen cleanly")
    print(f"Wrote {OUTPUT}")
    print(f"Pages: {len(check.pages)}")
    print(f"Size: {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
