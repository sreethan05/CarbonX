"""Application-layer parser for Telangana Pahani (Adangal) land records.

Built against the sample layout (``pahani_layout.jpeg``): 7 numbered sections
(village / survey / pattadar / cultivation / sketch / remarks / additional info)
plus Dharani header block.

Pipeline: Azure OCR result -> :func:`filter_english_lines` (drops Telugu-script
and garbage lines) -> table-driven field extraction.

Every extractor is tolerant to missing data: absent sections/patterns yield
``None`` and are reported in ``missing_fields`` so future images that lack a
few fields still parse instead of failing.
"""
import re

TELUGU_BLOCK = re.compile(r"[\u0c00-\u0c7f]")
ASCII_ALNUM = re.compile(r"[A-Za-z0-9]")


def latin_ratio(text: str) -> float:
    """Fraction of characters that are plain ASCII letters/digits/punctuation."""
    if not text:
        return 0.0
    ok = sum(1 for ch in text if ch.isascii() and (ch.isalnum() or ch.isspace() or ch in ".,:;/()\\-_\u2013\u2014+%\u00b0\u00b7'\"\u20b9"))
    return ok / len(text)


def _has_foreign_letters(token: str) -> bool:
    """True if the token contains non-ASCII letters (Telugu remnants, diacritic junk)."""
    import unicodedata

    return any(
        unicodedata.category(ch).startswith("L") and not ch.isascii() for ch in token
    )


def clean_line(text: str) -> str:
    """Strip Telugu codepoints and drop tokens with foreign letters or no ASCII content."""
    text = TELUGU_BLOCK.sub("", text or "")
    tokens = [t for t in text.split() if ASCII_ALNUM.search(t) and not _has_foreign_letters(t)]
    return re.sub(r"\s+", " ", " ".join(tokens)).strip()


def filter_english_lines(lines: list[str]) -> list[str]:
    """Keep lines carrying English/Latin content; drop Telugu-script and junk lines.

    A line is dropped when it has no ASCII alphanumeric characters at all, or
    when it contains Telugu script and less than half its characters are Latin.
    """
    kept = []
    for raw in lines or []:
        if not raw or not ASCII_ALNUM.search(raw):
            continue
        if TELUGU_BLOCK.search(raw) and latin_ratio(raw) < 0.5:
            continue
        cleaned = clean_line(raw)
        if cleaned:
            kept.append(cleaned)
    return kept


def _all_lines(azure_result: dict) -> list[str]:
    out = []
    for page in azure_result.get("pages") or []:
        for line in page.get("lines") or []:
            if line.get("content"):
                out.append(line["content"])
    return out


def _grid(table: dict) -> list[list[str]]:
    """Rebuild row grid from Azure's flat cell list ({row_index, column_index, content})."""
    rows: dict[int, dict[int, str]] = {}
    for cell in table.get("cells") or []:
        rows.setdefault(cell.get("row_index", 0), {})[cell.get("column_index", 0)] = cell.get("content") or ""
    return [[rows[r][c] for c in sorted(rows[r])] for r in sorted(rows)]


def _find_table(tables: list[dict], *keywords) -> list[list[str]] | None:
    """Return the row grid of the first table containing all keywords anywhere.

    Matches across the whole grid (not just the first row) because title rows
    or multi-row headers can push labels down.
    """
    for table in tables or []:
        grid = _grid(table)
        if not grid:
            continue
        text = " ".join(cell for row in grid for cell in row).lower()
        if all(k in text for k in keywords):
            return grid
    return None


def _col_value(grid: list[list[str]] | None, keyword: str) -> str | None:
    """Value under the header cell containing keyword (first non-empty data cell)."""
    if not grid or len(grid) < 2:
        return None
    for i, head in enumerate(grid[0]):
        if keyword in head.lower():
            for row in grid[1:]:
                if i < len(row) and row[i].strip():
                    return clean_line(row[i]) or None
    return None


def _first_float(text: str | None) -> float | None:
    m = re.search(r"\d+(?:\.\d+)?", text or "")
    return float(m.group()) if m else None


def _first_word(text: str | None) -> str | None:
    m = re.match(r"[A-Za-z]+(?:-[A-Za-z]+)?", (text or "").strip())
    return m.group() if m else None


def _extract_label_value(lines: list[str], *labels: str) -> str | None:
    """Find the first line containing a label and return the value after it."""
    for line in lines or []:
        low = line.lower()
        for label in labels:
            idx = low.find(label)
            if idx == -1:
                continue
            value = line[idx + len(label) :]
            value = re.sub(r"^[^A-Za-z0-9/\-]*", "", value)
            value = clean_line(value)
            if value:
                return value
    return None


def _section_lines(english_lines: list[str], start_kw: str, end_kw: str | None = None) -> list[str]:
    """Lines between the line containing start_kw and the line containing end_kw."""
    capturing, out = False, []
    for line in english_lines:
        low = line.lower()
        if not capturing and start_kw in low:
            capturing = True
            continue
        if capturing and end_kw and end_kw in low:
            break
        if capturing:
            out.append(line)
    return out


def parse_pahani(azure_result: dict) -> dict:
    """Parse an Azure analyze result into the minimal Pahani fields needed by CarbonX.

    Returns only the fields used by the verification flow:
    survey, owner, location, extents, crop/irrigation, and optional boundary coords/remarks.
    """
    tables = azure_result.get("tables") or []
    content = azure_result.get("content") or ""
    english_lines = filter_english_lines(_all_lines(azure_result))
    fields: dict = {}

    # Header block
    m = re.search(r"Document No\s*:?\s*([A-Z0-9][A-Z0-9\-]+)", content)
    fields["document_no"] = m.group(1) if m else None
    m = re.search(r"Date of Issue\s*:?\s*([\d\-/]+)", content)
    fields["date_of_issue"] = m.group(1) if m else None

    # Village / Mandal / District
    village_tbl = _find_table(tables, "district", "mandal", "village")
    fields["district"] = _col_value(village_tbl, "district")
    fields["mandal"] = _col_value(village_tbl, "mandal")
    fields["village"] = _col_value(village_tbl, "village")

    # Survey / extents
    survey_tbl = _find_table(tables, "survey no")
    survey_raw = _col_value(survey_tbl, "survey no")
    m = re.search(r"\d+/\w+", survey_raw or "")
    fields["survey_no"] = m.group() if m else None
    fields["extent_acres"] = _first_float(_col_value(survey_tbl, "acres"))
    fields["extent_hectares"] = _first_float(_col_value(survey_tbl, "hectares"))

    # Pattadar / Aadhaar
    owner_tbl = _find_table(tables, "pattadar name")
    fields["pattadar_name"] = _col_value(owner_tbl, "pattadar name")
    aadhaar_raw = _col_value(owner_tbl, "aadhaar")
    m = re.search(r"(?:X{4}-){2}\d{4}|\d{4}-\d{4}-\d{4}", aadhaar_raw or "")
    fields["aadhaar"] = m.group() if m else None

    # Cultivation / irrigation
    crop_tbl = _find_table(tables, "crop season")
    fields["crop_name"] = _first_word(_col_value(crop_tbl, "crop name"))
    fields["irrigation_source"] = _first_word(_col_value(crop_tbl, "irrigation"))

    # Fallbacks from OCR line content when Azure tables are weak or missing
    if not fields["district"]:
        fields["district"] = _extract_label_value(english_lines, "district")
    if not fields["mandal"]:
        fields["mandal"] = _extract_label_value(english_lines, "mandal")
    if not fields["village"]:
        fields["village"] = _extract_label_value(english_lines, "village")
    if not fields["survey_no"]:
        fields["survey_no"] = _extract_label_value(english_lines, "survey no", "survey number")
    if not fields["extent_acres"]:
        extent_text = _extract_label_value(english_lines, "extent", "acres")
        fields["extent_acres"] = _first_float(extent_text)
    if not fields["extent_hectares"]:
        extent_ha_text = _extract_label_value(english_lines, "hectares", "ha")
        fields["extent_hectares"] = _first_float(extent_ha_text)
    if not fields["pattadar_name"]:
        fields["pattadar_name"] = _extract_label_value(english_lines, "pattadar name", "pattadar")
    if not fields["aadhaar"]:
        aadhaar_text = "\n".join(english_lines)
        m = re.search(r"(?:X{4}-){2}\d{4}|\d{4}-\d{4}-\d{4}", aadhaar_text)
        fields["aadhaar"] = m.group() if m else None
    if not fields["crop_name"]:
        fields["crop_name"] = _extract_label_value(english_lines, "crop name", "crop")
    if not fields["irrigation_source"]:
        fields["irrigation_source"] = _extract_label_value(english_lines, "irrigation")

    # Boundary geometry / remarks
    coords = []
    sketch_grid = _find_table(tables, "latitude", "longitude")
    if sketch_grid:
        for row in sketch_grid[1:]:
            if len(row) >= 3:
                try:
                    coords.append(
                        {
                            "point": row[0].strip(),
                            "latitude": float(row[1]),
                            "longitude": float(row[2]),
                        }
                    )
                except (ValueError, TypeError):
                    continue
    fields["boundary_coords"] = coords or None

    remarks = _section_lines(english_lines, "remarks", "additional information")
    fields["remarks"] = " ".join(remarks).strip() or None

    missing = [k for k, v in fields.items() if v is None]
    return {
        "fields": fields,
        "missing_fields": missing,
        "english_text": "\n".join(english_lines),
    }
