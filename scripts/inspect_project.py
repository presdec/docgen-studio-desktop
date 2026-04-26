import json
import html
import re
import string
import sys
import unicodedata
from pathlib import Path
from zipfile import ZipFile

from openpyxl import load_workbook


PLACEHOLDER_RE = re.compile(r"\{\{([A-Z0-9_]+)\}\}")
XML_PART_PREFIXES = (
    "word/document.xml",
    "word/header",
    "word/footer",
    "word/footnotes.xml",
    "word/endnotes.xml",
)

VARIABLE_ALIASES = {
    "APPLICATION_CODE": [
        "#",
        "application",
        "application code",
        "application id",
        "code",
        "id",
        "project id",
        "reference",
        "reference number",
        "serial",
        "αα",
        "α  α",
        "αριθμος",
        "αριθμος αιτησης",
        "κωδικος",
        "κωδικος αιτησης",
    ],
    "TITLE": [
        "book title",
        "title",
        "τιτλος",
    ],
    "AUTHOR": [
        "author",
        "name of author",
        "συγγραφεας",
        "συγγραφεως",
    ],
    "LANGUAGE": [
        "language",
        "γλωσσα",
    ],
    "EMAIL_TO": [
        "email",
        "email to",
        "main email",
        "recipient email",
        "to",
        "e mail",
        "email εκδοτη",
        "ηλεκτρονικη διευθυνση",
    ],
    "EMAIL_CC": [
        "cc",
        "copy email",
        "email cc",
        "secondary email",
        "κοινοποιηση",
    ],
    "PUBLISHER": [
        "publisher",
        "publishing house",
        "εκδοτης",
        "εκδοτικος οικος",
    ],
    "AMOUNT": [
        "amount",
        "approved amount",
        "grant amount",
        "ποσο",
        "εγκεκριμενο ποσο",
    ],
    "FIRST_INSTALLMENT": [
        "first installment",
        "first instalment",
        "installment 1",
        "instalment 1",
        "πρωτη δοση",
    ],
    "ID": [
        "#",
        "id",
        "identifier",
    ],
}


def normalize_cell_value(value):
    if value is None:
        return ""
    return str(value).strip()


def normalize_header_to_variable(header):
    normalized = normalize_header_for_matching(header)

    for variable, aliases in VARIABLE_ALIASES.items():
        if normalized == variable.lower():
            return variable
        if normalized in aliases:
            return variable
        if any(alias in normalized for alias in aliases if len(alias) > 2):
            return variable

    token = re.sub(r"[^A-Z0-9]+", "_", header.upper()).strip("_")
    return token or None


def normalize_header_for_matching(value):
    normalized = unicodedata.normalize("NFKD", value)
    normalized = "".join(character for character in normalized if not unicodedata.combining(character))
    normalized = normalized.lower()
    normalized = normalized.replace("/", " ").replace("-", " ")
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def get_column_letter(index):
    letters = []
    while index > 0:
        index, remainder = divmod(index - 1, 26)
        letters.append(string.ascii_uppercase[remainder])
    return "".join(reversed(letters))


def extract_contract_tokens(path_value):
    if not path_value:
        return {"contexts": {}, "tokens": []}

    path = Path(path_value)
    if not path.exists() or path.suffix.lower() != ".docx":
        return {"contexts": {}, "tokens": []}

    tokens = set()
    token_contexts = {}

    def extract_paragraph_texts(content):
        paragraphs = re.findall(r"<w:p(?:\s[^>]*)?>(.*?)</w:p>", content, flags=re.DOTALL)
        paragraph_texts = []

        for paragraph in paragraphs:
            text_nodes = re.findall(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>", paragraph, flags=re.DOTALL)
            if not text_nodes:
                continue
            text = "".join(html.unescape(node) for node in text_nodes)
            text = re.sub(r"\s+", " ", text).strip()
            if text:
                paragraph_texts.append(text)

        return paragraph_texts

    with ZipFile(path, "r") as archive:
        for name in archive.namelist():
            if not any(name == prefix or name.startswith(prefix) for prefix in XML_PART_PREFIXES):
                continue
            content = archive.read(name).decode("utf-8", errors="ignore")

            for paragraph_text in extract_paragraph_texts(content):
                paragraph_tokens = PLACEHOLDER_RE.findall(paragraph_text)
                if not paragraph_tokens:
                    continue

                for token in paragraph_tokens:
                    tokens.add(token)
                    token_contexts.setdefault(token, paragraph_text)

            tokens.update(PLACEHOLDER_RE.findall(content))

    sorted_tokens = sorted(tokens)
    filtered_contexts = {
        token: token_contexts[token]
        for token in sorted_tokens
        if token in token_contexts
    }
    return {
        "contexts": filtered_contexts,
        "tokens": sorted_tokens,
    }


def inspect_workbook(payload):
    workbook = load_workbook(payload["workbook_path"], data_only=True, read_only=True)
    worksheet_name = (payload.get("worksheet_name") or "").strip()
    if worksheet_name and worksheet_name in workbook.sheetnames:
        worksheet = workbook[worksheet_name]
    else:
        worksheet = workbook[workbook.sheetnames[0]]
    header_row = int(payload["header_row"])
    data_start_row = int(payload["data_start_row"])

    columns = []
    for cell in worksheet[header_row]:
        if cell.value is None:
            continue
        header = normalize_cell_value(cell.value)
        if not header:
            continue
        sample_value = normalize_cell_value(
            worksheet[f"{get_column_letter(cell.column)}{data_start_row}"].value
        )
        columns.append(
            {
                "columnLetter": get_column_letter(cell.column),
                "header": header,
                "sampleValue": sample_value,
                "suggestedVariable": normalize_header_to_variable(header),
            }
        )

    sample_rows = []
    for row_number in range(data_start_row, data_start_row + 3):
        row_values = {}
        for column in columns[:6]:
            row_values[column["header"]] = normalize_cell_value(
                worksheet[f'{column["columnLetter"]}{row_number}'].value
            )
        sample_rows.append(
            {
                "rowNumber": row_number,
                "values": row_values,
            }
        )

    workbook.close()
    contract_info = extract_contract_tokens(payload.get("contractTemplatePath"))

    return {
        "columns": columns,
        "contractTokenContexts": contract_info["contexts"],
        "contractTokens": contract_info["tokens"],
        "dataStartRow": data_start_row,
        "headerRow": header_row,
        "sampleRows": sample_rows,
        "totalRows": max(0, worksheet.max_row - data_start_row + 1),
        "worksheetName": worksheet.title,
    }


if __name__ == "__main__":
    raw_payload = json.loads(sys.argv[1])
    payload = {
        "contractTemplatePath": raw_payload.get("contractTemplatePath"),
        "data_start_row": raw_payload["dataStartRow"],
        "header_row": raw_payload["headerRow"],
        "workbook_path": raw_payload["workbookPath"],
        "worksheet_name": raw_payload.get("worksheetName"),
    }
    print(json.dumps(inspect_workbook(payload)))
