/**
 * AWAYS scoping-request intake — Google Apps Script
 * ─────────────────────────────────────────────────
 *
 * Receives form submissions from aways.io and appends a row to the
 * Google Sheet this script is bound to. Lives entirely inside your
 * Google Workspace (no email notifications).
 *
 * Setup
 * -----
 * 1. https://sheets.google.com → New → blank spreadsheet
 *    Name it: "AWAYS scoping requests"
 *    Header row (row 1):
 *      Timestamp | Email | Note | BBox (W,S,E,N) | JOSM URL | Map preview
 *
 * 2. In the sheet: Extensions → Apps Script
 *    Replace the default Code.gs with this file's contents.
 *    Save (⌘S). Name the project "AWAYS intake".
 *
 * 3. Deploy → New deployment
 *    - Type:           Web app
 *    - Description:    AWAYS intake
 *    - Execute as:     Me (your Google account)
 *    - Who has access: Anyone
 *    Click Deploy → Authorize → copy the "Web app URL".
 *
 * 4. Paste that URL into components/RegionRequest.tsx as SUBMISSION_URL.
 *    Commit + push. Submissions will start landing in the sheet.
 *
 * Workflow when a prospect books a call
 * -------------------------------------
 *  - You see the new event in Google Calendar (no email needed).
 *  - Open the "AWAYS scoping requests" sheet (bookmark it).
 *  - Find the row matching the booker's email.
 *  - Click the JOSM URL cell → JOSM Remote Control opens with the
 *    bbox loaded (JOSM must be running locally with Remote Control on).
 *  - The Map preview link opens the bbox on aways.io for visual context.
 */

const SHEET_HEADER = [
  "Timestamp",
  "Email",
  "Note",
  "BBox (W,S,E,N)",
  "JOSM URL",
  "Map preview",
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Make sure the header row exists (idempotent).
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(SHEET_HEADER);
    }

    const bbox = data.bbox;
    const bboxStr = bbox
      ? [bbox.west, bbox.south, bbox.east, bbox.north]
          .map(function (n) { return Number(n).toFixed(5); })
          .join(", ")
      : "";

    const previewUrl = bbox
      ? "https://aways.io/?bbox=" +
        encodeURIComponent(
          [bbox.west, bbox.south, bbox.east, bbox.north].join(",")
        )
      : "";

    sheet.appendRow([
      data.submitted_at ? new Date(data.submitted_at) : new Date(),
      data.email || "",
      data.note || "",
      bboxStr,
      data.josm_url || "",
      previewUrl,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    "AWAYS scoping intake — POST only."
  ).setMimeType(ContentService.MimeType.TEXT);
}
