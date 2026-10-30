/**
 * EMD request log: a Google Sheet that receives the website's fuel and
 * maintenance / repair requests and feeds Request monitoring and the repair
 * tracker. Setup steps are in google-apps-script/README.md.
 *
 * Anyone can submit a request and read the public list. Adding, changing or
 * deleting requests from the website needs the staff key, which is kept in
 * this script's properties (never in the website's public code).
 * Staff can also edit the sheet directly.
 */

var SHEET_NAME = "Requests";
var TIME_ZONE = "Asia/Manila";

// Shown on the website.
var PUBLIC_FIELDS = ["id", "kind", "date", "requestedBy", "office", "unit", "details", "fuel", "litres",
  "dateFrom", "dateTo", "risNo", "issuedLitres", "maintType", "reading", "status", "updated", "remarks"];
// Kept in the sheet only: the website never shows these.
var PRIVATE_FIELDS = ["contact", "section", "notedBy", "submitted"];
var COLUMNS = PUBLIC_FIELDS.concat(PRIVATE_FIELDS);

var REPAIR_STAGES = ["Request received", "Pre-repair inspection", "Job order issued", "Repair in progress",
  "Post-repair inspection", "Released"];
var FUEL_STATUSES = ["Pending", "Approved", "Issued", "Disapproved"];

// Fields staff may change on an existing request.
var EDITABLE = ["date", "requestedBy", "office", "unit", "details", "fuel", "litres", "dateFrom", "dateTo",
  "risNo", "issuedLitres", "maintType", "reading", "status", "remarks"];
// Fields a public submission may set.
var SUBMITTABLE = ["requestedBy", "office", "unit", "details", "fuel", "litres", "dateFrom", "dateTo", "risNo",
  "maintType", "reading", "contact", "section", "notedBy"];

var MAX_LENGTH = 1000;
var MAX_SUBMISSIONS_PER_10_MIN = 60;

// --- Web app ---------------------------------------------------------------

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "list";
  if (action !== "list") return reply({ ok: false, error: "Unknown action." });
  return reply({ ok: true, requests: readAll().map(publicView) });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "Invalid request." });
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (body.action) {
      case "submit": return reply(submit(body.request || {}, body.website));
      case "add": return reply(staffOnly(body.key, function () { return add(body.request || {}); }));
      case "update": return reply(staffOnly(body.key, function () { return update(body.request || {}); }));
      case "delete": return reply(staffOnly(body.key, function () { return remove(body.id); }));
      case "check": return reply(staffOnly(body.key, function () { return { ok: true }; }));
      case "fuellog-load": return reply(staffOnly(body.key, loadFuelLog));
      case "fuellog-save": return reply(staffOnly(body.key, function () { return saveFuelLog(body.data, body.baseVersion); }));
      default: return reply({ ok: false, error: "Unknown action." });
    }
  } finally {
    lock.releaseLock();
  }
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// --- Actions ---------------------------------------------------------------

function submit(input, honeypot) {
  // "website" is a hidden form field people never see; bots fill it in.
  if (honeypot) return { ok: true, request: {} };
  var cache = CacheService.getScriptCache();
  var count = Number(cache.get("submissions") || 0);
  if (count >= MAX_SUBMISSIONS_PER_10_MIN) {
    return { ok: false, error: "Too many requests right now. Please try again in a few minutes or call the EMD office." };
  }
  cache.put("submissions", String(count + 1), 600);

  var kind = input.kind === "fuel" ? "fuel" : input.kind === "repair" ? "repair" : "";
  if (!kind) return { ok: false, error: "Unknown request type." };
  var record = pick(input, SUBMITTABLE);
  if (!record.requestedBy || !record.unit) return { ok: false, error: "Name and unit are required." };
  record.kind = kind;
  record.date = today();
  record.status = kind === "fuel" ? FUEL_STATUSES[0] : REPAIR_STAGES[0];
  record.id = nextId(kind === "fuel" ? "FR" : "RR");
  record.updated = record.date;
  record.submitted = timestamp();
  appendRecord(record);
  return { ok: true, request: publicView(record) };
}

function add(input) {
  var kind = input.kind === "fuel" ? "fuel" : input.kind === "repair" ? "repair" : "";
  if (!kind) return { ok: false, error: "Unknown request type." };
  var record = pick(input, EDITABLE.concat(["contact", "section", "notedBy"]));
  record.kind = kind;
  record.date = record.date || today();
  record.status = validStatus(kind, record.status) ? record.status : (kind === "fuel" ? FUEL_STATUSES[0] : REPAIR_STAGES[0]);
  record.id = nextId(kind === "fuel" ? "FR" : "RR");
  record.updated = today();
  record.submitted = timestamp();
  appendRecord(record);
  return { ok: true, request: publicView(record) };
}

function update(input) {
  var sheet = getSheet();
  var row = findRow(sheet, input.id);
  if (!row) return { ok: false, error: "Request " + input.id + " was not found." };
  var record = rowToRecord(sheet.getRange(row, 1, 1, COLUMNS.length).getValues()[0]);
  var changes = pick(input, EDITABLE);
  if (changes.status && !validStatus(record.kind, changes.status)) return { ok: false, error: "Unknown status." };
  EDITABLE.forEach(function (f) { if (f in input) record[f] = changes[f] || ""; });
  record.updated = today();
  sheet.getRange(row, 1, 1, COLUMNS.length).setValues([recordToRow(record)]);
  return { ok: true, request: publicView(record) };
}

function remove(id) {
  var sheet = getSheet();
  var row = findRow(sheet, id);
  if (!row) return { ok: false, error: "Request " + id + " was not found." };
  sheet.deleteRow(row);
  return { ok: true };
}

function staffOnly(key, fn) {
  var expected = PropertiesService.getScriptProperties().getProperty("STAFF_KEY");
  if (!expected) return { ok: false, error: "No staff key is set up yet. See the setup steps." };
  if (String(key || "") !== expected) {
    Utilities.sleep(1000); // slows down guessing
    return { ok: false, error: "Wrong staff key.", badKey: true };
  }
  return fn();
}

// --- Sheet helpers ---------------------------------------------------------

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    formatSheet(sheet);
  }
  return sheet;
}

function formatSheet(sheet) {
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight("bold");
  sheet.setFrozenRows(1);
  // Plain text, so dates and numbers stay exactly as entered.
  sheet.getRange(1, 1, sheet.getMaxRows(), COLUMNS.length).setNumberFormat("@");
  var statusCol = COLUMNS.indexOf("status") + 1;
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(FUEL_STATUSES.concat(REPAIR_STAGES), true).setAllowInvalid(false).build();
  sheet.getRange(2, statusCol, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
}

function readAll() {
  var sheet = getSheet();
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, COLUMNS.length).getValues()
    .map(rowToRecord)
    .filter(function (r) { return r.id; });
}

function findRow(sheet, id) {
  if (!id) return 0;
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim().toUpperCase() === String(id).trim().toUpperCase()) return i + 2;
  }
  return 0;
}

function appendRecord(record) {
  getSheet().appendRow(recordToRow(record));
}

function rowToRecord(row) {
  var r = {};
  COLUMNS.forEach(function (f, i) { r[f] = fromCell(row[i]); });
  return r;
}

function recordToRow(record) {
  return COLUMNS.map(function (f) { return toCell(record[f]); });
}

// Values starting with = + - @ would run as a formula in Sheets; the leading
// apostrophe keeps them as text.
function toCell(v) {
  var s = v == null ? "" : String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function fromCell(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TIME_ZONE, "yyyy-MM-dd");
  var s = v == null ? "" : String(v).trim();
  return /^'[=+\-@]/.test(s) ? s.slice(1) : s;
}

function publicView(record) {
  var out = {};
  PUBLIC_FIELDS.forEach(function (f) { if (record[f] !== undefined && record[f] !== "") out[f] = record[f]; });
  return out;
}

function pick(input, fields) {
  var out = {};
  fields.forEach(function (f) {
    if (input[f] !== undefined && input[f] !== null) out[f] = String(input[f]).trim().slice(0, MAX_LENGTH);
  });
  return out;
}

function validStatus(kind, status) {
  return (kind === "fuel" ? FUEL_STATUSES : REPAIR_STAGES).indexOf(status) >= 0;
}

// RR-20261027-001, RR-20261027-002, ... numbered per day and type.
function nextId(prefix) {
  var stem = prefix + "-" + today().replace(/-/g, "") + "-";
  var max = 0;
  readAll().forEach(function (r) {
    if (r.id.indexOf(stem) === 0) max = Math.max(max, Number(r.id.slice(stem.length)) || 0);
  });
  return stem + ("00" + (max + 1)).slice(-3);
}

function today() {
  return Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd");
}

function timestamp() {
  return Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd HH:mm");
}

// --- Vehicle fuel log (fuel-log.html) ---------------------------------------
// The whole log is kept as JSON on the FuelLog tab: A1 = version, B1 = saved
// time, and the JSON split over column A from row 2 (a cell holds at most
// 50,000 characters). Staff key required to read or save.

var FUEL_SHEET = "FuelLog";
var CHUNK = 45000;

function fuelSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(FUEL_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(FUEL_SHEET);
    sheet.getRange(1, 1, 1, 3).setValues([[0, "", "Saved by the website's Vehicle Fuel Log. Don't edit this tab by hand."]]);
  }
  return sheet;
}

function readFuelLog() {
  var sheet = fuelSheet();
  var head = sheet.getRange(1, 1, 1, 2).getValues()[0];
  var last = sheet.getLastRow();
  var json = "";
  if (last >= 2) {
    json = sheet.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }).join("");
  }
  var data = null;
  if (json) {
    try { data = JSON.parse(json); } catch (err) { data = null; }
  }
  var saved = head[1] instanceof Date ? head[1].toISOString() : String(head[1] || "");
  return { version: Number(head[0]) || 0, savedAt: saved, data: data };
}

function loadFuelLog() {
  var log = readFuelLog();
  return { ok: true, version: log.version, savedAt: log.savedAt, data: log.data };
}

function saveFuelLog(data, baseVersion) {
  if (!data || typeof data !== "object") return { ok: false, error: "Nothing to save." };
  var current = readFuelLog();
  // Someone else saved since this browser last loaded: send their copy back.
  if (Number(baseVersion) !== current.version) {
    return { ok: false, conflict: true, error: "Someone else saved changes first.", version: current.version, data: current.data };
  }
  var json = JSON.stringify(data);
  var chunks = [];
  for (var i = 0; i < json.length; i += CHUNK) chunks.push([json.slice(i, i + CHUNK)]);
  var sheet = fuelSheet();
  var last = sheet.getLastRow();
  if (last >= 2) sheet.getRange(2, 1, last - 1, 1).clearContent();
  if (chunks.length) sheet.getRange(2, 1, chunks.length, 1).setNumberFormat("@").setValues(chunks);
  var version = current.version + 1;
  var savedAt = new Date().toISOString();
  sheet.getRange(1, 1, 1, 2).setValues([[version, savedAt]]);
  return { ok: true, version: version, savedAt: savedAt };
}

// --- One-time setup --------------------------------------------------------

/** Run once from the editor: creates the Requests sheet with its headers. */
function setup() {
  var sheet = getSheet();
  formatSheet(sheet);
}

/**
 * Optional: copy requests already published on the website (js/requests.js)
 * into the sheet. Paste the list between the brackets, then run it once.
 */
function importRequests() {
  var list = [];
  var sheet = getSheet();
  list.forEach(function (r) {
    if (!findRow(sheet, r.id)) appendRecord(r);
  });
}
