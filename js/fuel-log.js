(function () {
  "use strict";

  // Vehicle fuel log. Fuel is entered by date range and split equally across
  // the days; odometers are typed every Monday morning and Friday afternoon,
  // and each day's odometer in between is worked out in proportion to the fuel
  // used that day. Saved in this browser and, when the EMD Google Sheet is
  // connected (EMD_CONFIG.requestLog), in the sheet as well.

  const config = window.EMD_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);
  const STORE_KEY = "emd-fuel-log";
  const BACKUP_KEY = "emd-fuel-log-before-sync";
  const LOG_URL = (config.requestLog || "").trim();
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? "" : v);
    }
    children.flat().forEach((c) => { if (c !== null && c !== undefined && c !== "") node.append(c); });
    return node;
  }

  const storage = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    }
  };
  const session = {
    get(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
    remove(k) { try { sessionStorage.removeItem(k); } catch (e) { /* storage unavailable */ } }
  };

  const savedTheme = storage.get("emd-theme", null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  // --- Dates -------------------------------------------------------------
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const dayDiff = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const mondayOf = (s) => addDays(s, -((parse(s).getDay() + 6) % 7));
  const weekday = (s) => parse(s).getDay();
  const todayISO = iso(new Date());
  const monthOf = (s) => s.slice(0, 7);
  const monthDays = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    const n = new Date(y, m, 0).getDate();
    return Array.from({ length: n }, (_, i) => `${ym}-${pad(i + 1)}`);
  };
  const fmtDate = (s, opts) => parse(s).toLocaleDateString("en-PH", opts || { month: "short", day: "numeric", year: "numeric" });
  const fmtMonth = (ym) => parse(ym + "-01").toLocaleDateString("en-PH", { month: "long", year: "numeric" });
  const fmtNum = (n, digits = 0) => n == null || Number.isNaN(n) ? "" : Number(n).toLocaleString("en-PH", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  const toNumber = (v) => {
    const s = String(v ?? "").replace(/[,\s]/g, "");
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  // --- Units -------------------------------------------------------------
  const hasPlate = (p) => Boolean(p && !/^n\/?a$/i.test(p.trim()) && !/^\s*$/.test(p));
  const allUnits = (window.EMD_FLEET || []).map((u) => ({
    key: `${u.propertyNo}|${u.plateNo}`,
    id: u.propertyNo,
    plate: hasPlate(u.plateNo) ? u.plateNo.trim() : "",
    model: u.makeModel || "",
    type: u.type || "",
    office: u.office || "",
    officeGroup: (u.office || "").split(",")[0].replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+-\s+.*$/, "").trim() || "No office recorded"
  }));
  const unitByKey = new Map(allUnits.map((u) => [u.key, u]));
  const optionText = (u) => `${u.id} — ${u.plate || "no plate"} ${u.model}`.trim();
  const unitByOption = new Map(allUnits.map((u) => [optionText(u), u]));

  function findUnit(text) {
    const t = String(text || "").trim();
    if (!t) return null;
    if (unitByOption.has(t)) return unitByOption.get(t);
    const lower = t.toLowerCase();
    const matches = allUnits.filter((u) => u.id.toLowerCase() === lower || (u.plate && u.plate.toLowerCase() === lower));
    return matches.length === 1 ? matches[0] : null;
  }
  const units = () => allUnits.filter((u) => state.settings.includeNoPlate || u.plate);
  const matchesSearch = (u, q) => !q || [u.id, u.plate, u.model, u.type, u.office].some((v) => v.toLowerCase().includes(q));

  // --- State -------------------------------------------------------------
  const DEFAULT_SETTINGS = { pmInterval: 5000, dueSoon: 500, kmlMin: 2, kmlMax: 25, includeNoPlate: true };
  function normalize(s) {
    s = s && typeof s === "object" ? s : {};
    return {
      entries: Array.isArray(s.entries) ? s.entries.filter((e) => e && unitByKey.has(e.unit) && e.from && e.to && Number(e.litres) > 0) : [],
      readings: s.readings && typeof s.readings === "object" ? s.readings : {},
      pm: s.pm && typeof s.pm === "object" ? s.pm : {},
      settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) },
      // Issued fuel requisitions whose auto-added entry was deleted here.
      skippedRequests: Array.isArray(s.skippedRequests) ? s.skippedRequests : [],
      updated: s.updated || ""
    };
  }
  let state = normalize(storage.get(STORE_KEY, null));
  let fuelCache = null;

  function changed() {
    fuelCache = null;
    state.updated = new Date().toISOString();
    if (!storage.set(STORE_KEY, state)) setSync("error", "Couldn't save in this browser (storage full or blocked).");
    scheduleSync();
  }

  // Litres per day for every unit: Map unitKey -> Map date -> litres.
  function fuelByDay() {
    if (fuelCache) return fuelCache;
    fuelCache = new Map();
    for (const e of state.entries) {
      const days = dayDiff(e.from, e.to) + 1;
      if (days < 1) continue;
      const per = Number(e.litres) / days;
      let m = fuelCache.get(e.unit);
      if (!m) fuelCache.set(e.unit, (m = new Map()));
      for (let i = 0; i < days; i++) {
        const d = addDays(e.from, i);
        m.set(d, (m.get(d) || 0) + per);
      }
    }
    return fuelCache;
  }
  const fuelOn = (key, d) => (fuelByDay().get(key) || new Map()).get(d) || 0;
  const fuelBetween = (key, from, to) => {
    const m = fuelByDay().get(key);
    if (!m) return 0;
    let sum = 0;
    for (const [d, l] of m) if (d >= from && d <= to) sum += l;
    return sum;
  };

  // Readings are kept per week (its Monday): { mon, fri }.
  const reading = (key, monday) => ((state.readings[key] || {})[monday]) || {};
  function setReading(key, monday, field, value) {
    const r = { ...reading(key, monday) };
    if (value === null) delete r[field]; else r[field] = value;
    state.readings[key] = state.readings[key] || {};
    if (r.mon === undefined && r.fri === undefined) delete state.readings[key][monday];
    else state.readings[key][monday] = r;
    if (!Object.keys(state.readings[key]).length) delete state.readings[key];
    changed();
  }
  // Monday morning: the typed reading, or last Friday afternoon's carried over.
  function weekStart(key, monday) {
    const r = reading(key, monday);
    if (r.mon != null) return { value: r.mon, typed: true };
    const prev = reading(key, addDays(monday, -7));
    if (prev.fri != null) return { value: prev.fri, typed: false, carried: true };
    return null;
  }
  const weekEnd = (key, monday) => {
    const r = reading(key, monday);
    return r.fri != null ? { value: r.fri, typed: true } : null;
  };

  // The odometer for each day of a week: Mon..Fri mornings worked out in
  // proportion to the fuel used (Friday shows the afternoon reading), and
  // Sat/Sun only when fuel was used then.
  function weekOdometers(key, monday) {
    const out = new Map();
    const start = weekStart(key, monday);
    const end = weekEnd(key, monday);
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const fuel = days.slice(0, 5).map((d) => fuelOn(key, d));
    if (start) out.set(days[0], { value: start.value, typed: start.typed });
    if (start && end) {
      const km = end.value - start.value;
      const total = fuel.reduce((a, b) => a + b, 0);
      let before = 0;
      for (let i = 1; i < 4; i++) {
        before += fuel[i - 1];
        const share = total > 0 ? before / total : i / 5;
        out.set(days[i], { value: Math.round(start.value + km * share), typed: false });
      }
    }
    if (end) out.set(days[4], { value: end.value, typed: true });
    for (const i of [5, 6]) {
      if (fuelOn(key, days[i]) > 0 && end) out.set(days[i], { value: end.value, typed: false });
    }
    return out;
  }
  function odometersBetween(key, from, to) {
    const out = new Map();
    for (let m = mondayOf(from); m <= to; m = addDays(m, 7)) {
      for (const [d, v] of weekOdometers(key, m)) if (d >= from && d <= to) out.set(d, v);
    }
    return out;
  }
  function distance(key, from, to) {
    const odo = [...odometersBetween(key, from, to).entries()].sort((a, b) => a[0].localeCompare(b[0]));
    if (!odo.length) return { first: null, last: null, km: null };
    const first = odo[0][1].value, last = odo[odo.length - 1][1].value;
    return { first, last, km: odo.length > 1 ? last - first : 0 };
  }
  function latestReading(key) {
    const weeks = Object.entries(state.readings[key] || {}).sort((a, b) => b[0].localeCompare(a[0]));
    for (const [monday, r] of weeks) {
      if (r.fri != null) return { value: r.fri, date: addDays(monday, 4) };
      if (r.mon != null) return { value: r.mon, date: monday };
    }
    return null;
  }

  // --- Lock (the Admin page password) -----------------------------------
  const SESSION_KEY = "emd-admin-session";
  const live = window.EMD_ADMIN_PASSWORD && window.EMD_ADMIN_PASSWORD.hash ? window.EMD_ADMIN_PASSWORD : null;
  const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  async function hashPassword(password, salt, iterations) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations }, key, 256);
    return hex(bits);
  }
  $("#fl-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#fl-login-status"), pw = $("#fl-password");
    status.textContent = "Checking…";
    let ok = false;
    try { ok = (await hashPassword(pw.value, live.salt, live.iterations)) === live.hash; } catch (err) { /* no WebCrypto */ }
    if (!ok) { status.textContent = "Wrong password. Try again."; pw.select(); return; }
    session.set(SESSION_KEY, live.hash);
    pw.value = ""; status.textContent = "";
    unlock();
  });
  $("#fl-lock").addEventListener("click", () => { session.remove(SESSION_KEY); location.reload(); });

  // --- Google Sheet sync -------------------------------------------------
  const KEY_SESSION = "emd-staff-key";
  let serverVersion = null;
  let syncTimer = null;
  let syncing = false;
  let syncAgain = false;
  let connected = false;

  function setSync(kind, text) {
    const node = $("#fl-sync");
    node.className = "fl-sync" + (kind ? " is-" + kind : "");
    node.textContent = text;
    $("#fl-store-text").textContent = connected
      ? "This log is saved in this browser and in the EMD Google Sheet (FuelLog tab), so it's the same on every computer that connects."
      : LOG_URL
      ? "This log is saved in this browser only. Connect to the Google Sheet to share it between computers and keep it safe."
      : "This log is saved in this browser only. Use Download backup regularly, or set up the Google Sheet request log (google-apps-script/README.md) to save it there too.";
    $("#fl-sync-now").hidden = !connected;
    $("#fl-sync-connect").hidden = connected || !LOG_URL;
  }

  async function api(action, payload) {
    const res = await fetch(LOG_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, key: session.get(KEY_SESSION), ...payload })
    });
    const data = await res.json();
    if (!data.ok) throw Object.assign(new Error(data.error || "The Google Sheet refused the request."), data);
    return data;
  }

  async function connect(key) {
    session.set(KEY_SESSION, key);
    setSync("loading", "Connecting to the Google Sheet…");
    try {
      const data = await api("fuellog-load", {});
      connected = true;
      serverVersion = data.version || 0;
      const remote = data.data ? normalize(data.data) : null;
      const localHasData = state.entries.length || Object.keys(state.readings).length;
      if (remote && (remote.entries.length || Object.keys(remote.readings).length)) {
        // The sheet's copy wins; keep this browser's copy aside in case.
        if (localHasData && JSON.stringify(remote) !== JSON.stringify(state)) storage.set(BACKUP_KEY, state);
        state = remote;
        fuelCache = null;
        storage.set(STORE_KEY, state);
        setSync("ok", `Saved to Google Sheet · ${fmtTime(data.savedAt)}`);
        renderAll();
      } else if (localHasData) {
        await pushNow();
      } else {
        setSync("ok", "Connected to Google Sheet");
      }
      $("#fl-connect").hidden = true;
      syncRequests();
      return true;
    } catch (err) {
      connected = false;
      if (err.badKey) session.remove(KEY_SESSION);
      setSync("error", err.badKey ? "Wrong staff key" : err.message.includes("Unknown action")
        ? "The Google Sheet script needs updating (see the setup guide)" : "Couldn't reach the Google Sheet");
      return false;
    }
  }
  const fmtTime = (s) => {
    const d = s ? new Date(s) : new Date();
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
  };

  function scheduleSync() {
    if (!connected) { setSync("", "Saved in this browser"); return; }
    setSync("loading", "Saving…");
    clearTimeout(syncTimer);
    syncTimer = setTimeout(pushNow, 1500);
  }
  async function pushNow() {
    if (!connected) return;
    if (syncing) { syncAgain = true; return; }
    syncing = true;
    try {
      const data = await api("fuellog-save", { data: state, baseVersion: serverVersion });
      serverVersion = data.version;
      setSync("ok", `Saved to Google Sheet · ${fmtTime(data.savedAt)}`);
    } catch (err) {
      if (err.conflict) {
        // Someone else saved first: take their copy, keep ours aside.
        storage.set(BACKUP_KEY, state);
        state = normalize(err.data);
        serverVersion = err.version;
        fuelCache = null;
        storage.set(STORE_KEY, state);
        renderAll();
        setSync("error", "Someone else saved changes, so their copy was loaded. Check your last entry.");
      } else {
        setSync("error", "Not saved to the Google Sheet yet (saved in this browser). Will retry.");
        clearTimeout(syncTimer);
        syncTimer = setTimeout(pushNow, 30000);
      }
    } finally {
      syncing = false;
      if (syncAgain) { syncAgain = false; pushNow(); }
    }
  }
  window.addEventListener("beforeunload", (e) => {
    if (connected && (syncing || syncTimer) && $("#fl-sync").classList.contains("is-loading")) { e.preventDefault(); e.returnValue = ""; }
  });

  $("#fl-connect-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = $("#fl-staff-key");
    if (await connect(input.value.trim())) input.value = "";
    else input.select();
  });
  $("#fl-connect-later").addEventListener("click", () => { $("#fl-connect").hidden = true; session.set("emd-fuel-log-later", "1"); });
  $("#fl-sync-now").addEventListener("click", () => pushNow());
  $("#fl-sync-connect").addEventListener("click", () => { $("#fl-connect").hidden = false; selectTab("input"); $("#fl-staff-key").focus(); });

  // --- Tabs --------------------------------------------------------------
  const tabs = [...document.querySelectorAll(".fl-tabs [role=tab]")];
  function selectTab(name) {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    document.querySelectorAll(".fl-panel").forEach((p) => { p.hidden = p.id !== "tab-" + name; });
    session.set("emd-fuel-log-tab", name);
    renderTab(name);
  }
  tabs.forEach((t) => t.addEventListener("click", () => selectTab(t.dataset.tab)));
  const currentTab = () => (tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0]).dataset.tab;
  function renderTab(name) {
    ({ input: renderInput, monitoring: renderMonitoring, checks: renderChecks, maintenance: renderPm, reports: renderReports, settings: renderSettings })[name]();
  }
  function renderAll() {
    renderTab(currentTab());
    updateCounts();
  }

  // --- Input: add fuel ---------------------------------------------------
  $("#fl-units").replaceChildren(...allUnits.map((u) => new Option(optionText(u))));
  const addForm = $("#fl-add");
  $("#fl-add-from").value = $("#fl-add-to").value = todayISO;
  $("#fl-add-from").addEventListener("change", (e) => {
    const to = $("#fl-add-to");
    if (!to.value || to.value < e.target.value) to.value = e.target.value;
  });
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = $("#fl-add-status");
    status.className = "form-status error";
    const unitInput = $("#fl-add-unit"), litresInput = $("#fl-add-litres");
    const unit = findUnit(unitInput.value);
    const litres = toNumber(litresInput.value);
    const from = $("#fl-add-from").value, to = $("#fl-add-to").value;
    addForm.querySelectorAll(".invalid").forEach((n) => n.classList.remove("invalid"));
    const fail = (node, msg) => { node.classList.add("invalid"); node.focus(); status.textContent = msg; };
    if (!unit) return fail(unitInput, "Choose a vehicle from the list (type its property no. or plate).");
    if (!litres || litres <= 0) return fail(litresInput, "Enter the liters.");
    if (!from) return fail($("#fl-add-from"), "Enter the start date.");
    if (!to || to < from) return fail($("#fl-add-to"), "The 'To' date must be on or after the 'From' date.");
    if (dayDiff(from, to) > 61) return fail($("#fl-add-to"), "The date range is longer than two months. Check the dates.");
    state.entries.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), unit: unit.key, litres, from, to });
    changed();
    const days = dayDiff(from, to) + 1;
    status.className = "form-status success";
    status.textContent = `Added ${fmtNum(litres, 2)} L for ${unit.id} over ${days} day${days === 1 ? "" : "s"} (${fmtNum(litres / days, 2)} L/day).`;
    unitInput.value = ""; litresInput.value = "";
    if (from < readWeek || from > addDays(readWeek, 6)) setReadWeek(mondayOf(from));
    else renderInput();
    updateCounts();
    unitInput.focus();
  });

  function renderEntries() {
    const range = $("#fl-entries-range").value;
    let from = "0000-00-00", to = "9999-99-99";
    if (range === "week") { from = readWeek; to = addDays(readWeek, 6); }
    if (range === "month") { from = monthOf(readWeek) + "-01"; to = monthDays(monthOf(readWeek)).pop(); }
    const q = $("#fl-read-search").value.trim().toLowerCase();
    const list = state.entries
      .filter((e) => e.to >= from && e.from <= to && matchesSearch(unitByKey.get(e.unit), q))
      .sort((a, b) => b.from.localeCompare(a.from) || unitByKey.get(a.unit).id.localeCompare(unitByKey.get(b.unit).id));
    $("#fl-entries tbody").replaceChildren(...list.map((e) => {
      const u = unitByKey.get(e.unit);
      const days = dayDiff(e.from, e.to) + 1;
      const del = el("button", { class: "btn btn-ghost btn-sm", type: "button", text: "Delete", "aria-label": `Delete ${fmtNum(e.litres, 2)} L for ${u.id}` });
      del.addEventListener("click", () => {
        if (!confirm(`Delete ${fmtNum(e.litres, 2)} L for ${u.id} (${e.from} to ${e.to})?` +
          (e.request ? `\n\nIt came from fuel requisition ${e.request} and won't be added again.` : ""))) return;
        state.entries = state.entries.filter((x) => x !== e);
        if (e.request && !state.skippedRequests.includes(e.request)) state.skippedRequests.push(e.request);
        changed();
        renderInput();
        updateCounts();
      });
      return el("tr", {},
        el("td", { class: "strong" }, u.id, e.request ? el("small", { class: "fl-from-req", text: e.request }) : ""),
        el("td", { text: u.plate || "—" }),
        el("td", { class: "num", text: fmtNum(e.litres, 2) }), el("td", { text: e.from }), el("td", { text: e.to }),
        el("td", { class: "num", text: String(days) }), el("td", { class: "num", text: fmtNum(e.litres / days, 2) }),
        el("td", { class: "actions" }, del));
    }));
    $("#fl-entries-empty").hidden = list.length > 0;
  }
  $("#fl-entries-range").addEventListener("change", renderEntries);

  // --- Input: weekly readings --------------------------------------------
  let readWeek = mondayOf(todayISO);
  function setReadWeek(monday) {
    readWeek = mondayOf(monday);
    $("#fl-week-date").value = readWeek;
    renderInput();
  }
  $("#fl-week-prev").addEventListener("click", () => setReadWeek(addDays(readWeek, -7)));
  $("#fl-week-next").addEventListener("click", () => setReadWeek(addDays(readWeek, 7)));
  $("#fl-week-date").addEventListener("change", (e) => { if (e.target.value) setReadWeek(e.target.value); });
  $("#fl-read-search").addEventListener("input", renderInput);
  $("#fl-read-missing").addEventListener("change", renderInput);

  function readingInput(u, field) {
    const r = reading(u.key, readWeek);
    const input = el("input", { type: "text", inputmode: "numeric", class: "fl-odo", "aria-label": `${u.id} ${field === "mon" ? "Monday morning" : "Friday afternoon"} odometer` });
    input.value = r[field] != null ? fmtNum(r[field]) : "";
    if (field === "mon" && r.mon == null) {
      const carried = weekStart(u.key, readWeek);
      if (carried) { input.placeholder = fmtNum(carried.value); input.classList.add("carried"); }
    }
    input.addEventListener("input", () => {
      const n = toNumber(input.value);
      input.classList.toggle("invalid", Number.isNaN(n) || n < 0);
      if (Number.isNaN(n) || n < 0) return;
      setReading(u.key, readWeek, field, n === null ? null : Math.round(n));
      const row = input.closest("tr");
      updateReadingRow(u, row);
      updateReadingCounts();
      updateCounts();
    });
    input.addEventListener("blur", () => {
      const n = toNumber(input.value);
      if (n != null && !Number.isNaN(n)) input.value = fmtNum(n);
    });
    input.addEventListener("keydown", (e) => {
      // Enter moves down the column, like a spreadsheet.
      if (e.key !== "Enter") return;
      e.preventDefault();
      const next = input.closest("tr").nextElementSibling;
      const col = field === "mon" ? 0 : 1;
      if (next) next.querySelectorAll("input.fl-odo")[col].focus();
    });
    return input;
  }
  function updateReadingRow(u, row) {
    const start = weekStart(u.key, readWeek), end = weekEnd(u.key, readWeek);
    const km = start && end ? end.value - start.value : null;
    const kmCell = row.querySelector(".km");
    kmCell.textContent = km == null ? "" : fmtNum(km);
    kmCell.classList.toggle("bad", km != null && km < 0);
    const carriedInput = row.querySelectorAll("input.fl-odo")[0];
    if (!carriedInput.value) {
      const c = weekStart(u.key, readWeek);
      carriedInput.placeholder = c && !c.typed ? fmtNum(c.value) : "";
      carriedInput.classList.toggle("carried", Boolean(c && !c.typed));
    }
  }
  function updateReadingCounts() {
    const list = units();
    const mon = list.filter((u) => weekStart(u.key, readWeek)).length;
    const fri = list.filter((u) => weekEnd(u.key, readWeek)).length;
    $("#fl-read-counts").textContent = `Monday morning: ${mon} of ${list.length} · Friday afternoon: ${fri} of ${list.length}`;
  }

  function renderInput() {
    $("#fl-week-date").value = readWeek;
    $("#fl-week-label").textContent = `Week of Monday ${fmtDate(readWeek, { month: "short", day: "numeric" })} to Friday ${fmtDate(addDays(readWeek, 4), { month: "short", day: "numeric", year: "numeric" })}`;
    const q = $("#fl-read-search").value.trim().toLowerCase();
    const onlyMissing = $("#fl-read-missing").checked;
    const rows = units().filter((u) => matchesSearch(u, q) && (!onlyMissing || !weekStart(u.key, readWeek) || !weekEnd(u.key, readWeek)));
    $("#fl-readings tbody").replaceChildren(...rows.map((u) => {
      const row = el("tr", {},
        el("td", { class: "strong", text: u.id }), el("td", { text: u.plate || "—" }),
        el("td", { class: "muted small", text: u.model }),
        el("td", {}, readingInput(u, "mon")), el("td", {}, readingInput(u, "fri")),
        el("td", { class: "num km" }), el("td", { class: "num", text: fmtNum(fuelBetween(u.key, readWeek, addDays(readWeek, 6)), 2) }));
      updateReadingRow(u, row);
      return row;
    }));
    updateReadingCounts();
    renderEntries();
  }

  // --- Monitoring --------------------------------------------------------
  const monMonth = $("#fl-mon-month"), monWeek = $("#fl-mon-week");
  function weeksOf(ym) {
    const days = monthDays(ym), weeks = [];
    for (const d of days) {
      if (!weeks.length || weekday(d) === 1) weeks.push([]);
      weeks[weeks.length - 1].push(d);
    }
    return weeks;
  }
  function fillWeeks(selectToday) {
    const weeks = weeksOf(monMonth.value);
    const prev = monWeek.value;
    monWeek.replaceChildren(new Option("Whole month", "all"), ...weeks.map((w, i) =>
      new Option(`Week ${i + 1} (${Number(w[0].slice(8))}–${Number(w[w.length - 1].slice(8))})`, String(i))));
    const todayWeek = weeks.findIndex((w) => w.includes(todayISO));
    monWeek.value = selectToday && todayWeek >= 0 ? String(todayWeek) : (prev && [...monWeek.options].some((o) => o.value === prev) ? prev : (todayWeek >= 0 ? String(todayWeek) : "0"));
  }
  monMonth.value = monthOf(todayISO);
  fillWeeks(true);
  monMonth.addEventListener("change", () => { if (!monMonth.value) monMonth.value = monthOf(todayISO); fillWeeks(false); renderMonitoring(); });
  monWeek.addEventListener("change", renderMonitoring);
  $("#fl-mon-today").addEventListener("click", () => { monMonth.value = monthOf(todayISO); fillWeeks(true); renderMonitoring(); });
  $("#fl-mon-search").addEventListener("input", renderMonitoring);
  $("#fl-mon-active").addEventListener("change", renderMonitoring);

  const shownDays = () => monWeek.value === "all" ? monthDays(monMonth.value) : weeksOf(monMonth.value)[Number(monWeek.value)] || [];
  const isActive = (u, from, to) => fuelBetween(u.key, from, to) > 0 || odometersBetween(u.key, from, to).size > 0;

  function renderMonitoring() {
    const days = shownDays();
    const mDays = monthDays(monMonth.value);
    const mFrom = mDays[0], mTo = mDays[mDays.length - 1];
    const q = $("#fl-mon-search").value.trim().toLowerCase();
    const onlyActive = $("#fl-mon-active").checked;
    const list = units().filter((u) => matchesSearch(u, q) && (!onlyActive || isActive(u, mFrom, mTo)));
    const weekView = monWeek.value !== "all";
    const grid = $("#fl-grid");
    const head = el("tr", {},
      el("th", { class: "sticky c1", scope: "col", text: "Vehicle" }), el("th", { class: "sticky c2", scope: "col", text: "Plate" }),
      el("th", { class: "sticky c3", scope: "col" }),
      days.map((d) => el("th", { scope: "col", class: "day" + (d === todayISO ? " today" : "") + (weekday(d) % 6 === 0 ? " weekend" : "") },
        el("b", { text: String(Number(d.slice(8))) }), el("small", { text: DAY_NAMES[weekday(d)] }))),
      weekView ? el("th", { scope: "col", class: "sum", text: "Week L" }) : null,
      el("th", { scope: "col", class: "sum", text: "Month L" }), el("th", { scope: "col", class: "sum", text: "Month km" }),
      el("th", { scope: "col", class: "sum", text: "First odo" }), el("th", { scope: "col", class: "sum", text: "Last odo" }));
    let totalL = 0, totalKm = 0;
    const body = [];
    for (const u of list) {
      const odo = odometersBetween(u.key, mFrom, mTo);
      const monthL = fuelBetween(u.key, mFrom, mTo);
      const dist = distance(u.key, mFrom, mTo);
      totalL += monthL; totalKm += dist.km || 0;
      const dayCls = (d) => "day" + (d === todayISO ? " today" : "") + (weekday(d) % 6 === 0 ? " weekend" : "");
      const rowspan = { rowspan: "2" };
      body.push(el("tr", { class: "fuel-row" },
        el("th", { class: "sticky c1", scope: "row", ...rowspan, text: u.id }),
        el("td", { class: "sticky c2", ...rowspan, text: u.plate || "—" }),
        el("td", { class: "sticky c3 rowlabel", text: "Fuel (L)" }),
        days.map((d) => { const l = fuelOn(u.key, d); return el("td", { class: dayCls(d), text: l ? fmtNum(l, 2) : "" }); }),
        weekView ? el("td", { class: "sum", ...rowspan, text: fmtNum(fuelBetween(u.key, days[0], days[days.length - 1]), 2) }) : null,
        el("td", { class: "sum", ...rowspan, text: monthL ? fmtNum(monthL, 2) : "" }),
        el("td", { class: "sum", ...rowspan, text: dist.km != null ? fmtNum(dist.km) : "" }),
        el("td", { class: "sum", ...rowspan, text: dist.first != null ? fmtNum(dist.first) : "" }),
        el("td", { class: "sum", ...rowspan, text: dist.last != null ? fmtNum(dist.last) : "" })));
      body.push(el("tr", { class: "odo-row" },
        el("td", { class: "sticky c3 rowlabel", text: "Odometer" }),
        days.map((d) => {
          const v = odo.get(d);
          return el("td", { class: dayCls(d) + (v ? (v.typed ? " typed" : " computed") : ""), text: v ? fmtNum(v.value) : "" });
        })));
    }
    grid.replaceChildren(el("thead", {}, head), el("tbody", {}, body));
    $("#fl-grid-empty").hidden = list.length > 0;
    $("#fl-mon-totals").replaceChildren(el("b", { text: fmtNum(totalL, 2) }), " L · ", el("b", { text: fmtNum(totalKm) }), " km");
  }

  // CSV export of the month: one row per vehicle per day.
  const csvCell = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = el("a", { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  $("#fl-export").addEventListener("click", () => {
    const days = monthDays(monMonth.value);
    const q = $("#fl-mon-search").value.trim().toLowerCase();
    const rows = [["Vehicle", "Plate", "Unit", "Date", "Day", "Fuel (L)", "Odometer", "Odometer source"]];
    for (const u of units().filter((x) => matchesSearch(x, q) && isActive(x, days[0], days[days.length - 1]))) {
      const odo = odometersBetween(u.key, days[0], days[days.length - 1]);
      for (const d of days) {
        const l = fuelOn(u.key, d), v = odo.get(d);
        if (!l && !v) continue;
        rows.push([u.id, u.plate, u.model, d, DAY_NAMES[weekday(d)], l ? Math.round(l * 100) / 100 : "", v ? v.value : "", v ? (v.typed ? "typed" : "computed") : ""]);
      }
    }
    download(`fuel-log-${monMonth.value}.csv`, "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n"), "text/csv");
  });

  // CSV import: fuel (Vehicle, Liters, From, To) or readings (Vehicle, Date, Odometer).
  function parseCsv(text) {
    const rows = []; let row = [], cell = "", quoted = false;
    text = text.replace(/^﻿/, "");
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') quoted = false;
        else cell += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((c) => c.trim()));
  }
  // Accepts YYYY-MM-DD, MM/DD/YYYY or DD/MM/YYYY (when the day is over 12).
  function csvDate(s) {
    s = String(s || "").trim();
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      let [a, b] = [Number(m[1]), Number(m[2])];
      if (a > 12) [a, b] = [b, a];
      return `${m[3]}-${pad(a)}-${pad(b)}`;
    }
    return "";
  }
  $("#fl-import-btn").addEventListener("click", () => $("#fl-import").click());
  $("#fl-import").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const status = $("#fl-import-status");
    const rows = parseCsv(await file.text());
    if (rows.length < 2) { status.className = "form-status error"; status.textContent = "The file has no rows to import."; return; }
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const col = (...names) => header.findIndex((h) => names.some((n) => h.startsWith(n)));
    const cVeh = col("vehicle", "property", "unit no", "plate");
    const cLit = col("liter", "litre", "fuel");
    const cFrom = col("from", "start"), cTo = col("to", "end");
    const cDate = col("date"), cOdo = col("odometer", "odo", "reading");
    let added = 0, skipped = 0;
    const problems = [];
    const ownExport = header.includes("odometer source");
    for (const r of rows.slice(1)) {
      const unit = findUnit(r[cVeh]) || (header[cVeh + 1] === "plate" ? findUnit(r[cVeh + 1]) : null);
      if (!unit) { skipped++; if (problems.length < 3) problems.push(`unknown vehicle "${r[cVeh] || ""}"`); continue; }
      if (cLit >= 0 && cFrom >= 0 && !ownExport) {
        const litres = toNumber(r[cLit]), from = csvDate(r[cFrom]), to = csvDate(cTo >= 0 ? r[cTo] : r[cFrom]) || from;
        if (!litres || litres <= 0 || !from || to < from) { skipped++; continue; }
        state.entries.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), unit: unit.key, litres, from, to });
        added++;
      } else if (cDate >= 0) {
        const d = csvDate(r[cDate]);
        if (!d) { skipped++; continue; }
        // From an exported file, bring back only what was typed, plus the fuel per day.
        if (ownExport) {
          const litres = cLit >= 0 ? toNumber(r[cLit]) : null;
          if (litres > 0 && !fuelOn(unit.key, d)) {
            state.entries.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), unit: unit.key, litres, from: d, to: d });
            added++;
          }
          if (r[header.indexOf("odometer source")] !== "typed") continue;
        }
        const odo = toNumber(r[cOdo]);
        const wd = weekday(d);
        if (odo == null || Number.isNaN(odo) || (wd !== 1 && wd !== 5)) { if (!ownExport) skipped++; continue; }
        const r2 = { ...reading(unit.key, mondayOf(d)) };
        r2[wd === 1 ? "mon" : "fri"] = Math.round(odo);
        state.readings[unit.key] = state.readings[unit.key] || {};
        state.readings[unit.key][mondayOf(d)] = r2;
        added++;
      } else {
        status.className = "form-status error";
        status.textContent = "Couldn't recognise the columns. Use Vehicle, Liters, From, To (fuel) or Vehicle, Date, Odometer (readings).";
        return;
      }
    }
    changed();
    renderAll();
    status.className = "form-status " + (skipped ? "error" : "success");
    status.textContent = `Imported ${added} row${added === 1 ? "" : "s"}` + (skipped ? `; skipped ${skipped} (${problems.join(", ") || "missing or invalid values; readings must be on a Monday or Friday"}).` : ".");
  });

  $("#fl-clear-month").addEventListener("click", () => {
    const ym = monMonth.value;
    const days = monthDays(ym);
    const inMonth = state.entries.filter((e) => e.from >= days[0] && e.from <= days[days.length - 1]);
    let weeks = 0;
    for (const key of Object.keys(state.readings)) for (const m of Object.keys(state.readings[key])) if (monthOf(m) === ym) weeks++;
    if (!inMonth.length && !weeks) { alert(`Nothing to clear in ${fmtMonth(ym)}.`); return; }
    if (!confirm(`Delete ${inMonth.length} fuel entr${inMonth.length === 1 ? "y" : "ies"} starting in ${fmtMonth(ym)} and the odometer readings for weeks starting in ${fmtMonth(ym)}? Download a backup first if you may need them.`)) return;
    state.entries = state.entries.filter((e) => !inMonth.includes(e));
    for (const key of Object.keys(state.readings)) {
      for (const m of Object.keys(state.readings[key])) if (monthOf(m) === ym) delete state.readings[key][m];
      if (!Object.keys(state.readings[key]).length) delete state.readings[key];
    }
    changed();
    renderAll();
  });

  // --- Checks ------------------------------------------------------------
  const chkMonth = $("#fl-chk-month");
  chkMonth.value = monthOf(todayISO);
  chkMonth.addEventListener("change", () => { if (!chkMonth.value) chkMonth.value = monthOf(todayISO); renderChecks(); });

  function findIssues(ym) {
    const s = state.settings;
    const days = monthDays(ym);
    const issues = [];
    const add = (level, u, monday, text) => issues.push({ level, u, monday, text });
    const mondays = [];
    for (let m = mondayOf(days[0]); m <= days[days.length - 1]; m = addDays(m, 7)) mondays.push(m);
    for (const u of units()) {
      for (const m of mondays) {
        const r = reading(u.key, m);
        const start = weekStart(u.key, m), end = weekEnd(u.key, m);
        const fuel = fuelBetween(u.key, m, addDays(m, 6));
        const label = fmtDate(m, { month: "short", day: "numeric" });
        if (start && end && end.value < start.value) add("error", u, m, `Friday reading (${fmtNum(end.value)}) is lower than Monday's (${fmtNum(start.value)}).`);
        const prev = reading(u.key, addDays(m, -7));
        if (r.mon != null && prev.fri != null && r.mon < prev.fri) add("error", u, m, `Monday reading (${fmtNum(r.mon)}) is lower than the previous Friday's (${fmtNum(prev.fri)}): the odometer went backwards.`);
        if (r.mon != null && prev.fri != null && r.mon - prev.fri > 300) add("warn", u, m, `Monday reading is ${fmtNum(r.mon - prev.fri)} km more than last Friday's: was it used over the weekend?`);
        if (fuel > 0 && (!start || !end)) add("warn", u, m, `${fmtNum(fuel, 2)} L of fuel in the week of ${label}, but the ${!start ? "Monday" : "Friday"} reading is missing.`);
        if (start && end && end.value - start.value > 0 && fuel === 0) add("warn", u, m, `${fmtNum(end.value - start.value)} km driven in the week of ${label} with no fuel recorded.`);
        if (start && end && fuel > 0 && end.value > start.value) {
          const kml = (end.value - start.value) / fuel;
          if (kml < s.kmlMin || kml > s.kmlMax) add("warn", u, m, `${fmtNum(kml, 1)} km per liter in the week of ${label} (normal: ${s.kmlMin}–${s.kmlMax}). Check the fuel and the readings.`);
        }
        if (start && end && end.value - start.value > 3000) add("warn", u, m, `${fmtNum(end.value - start.value)} km in one week: check for a typing mistake.`);
      }
      // The same fuel typed twice.
      const seen = new Map();
      for (const e of state.entries.filter((x) => x.unit === u.key && x.to >= days[0] && x.from <= days[days.length - 1])) {
        const sig = `${e.litres}|${e.from}|${e.to}`;
        if (seen.has(sig)) add("warn", u, mondayOf(e.from), `Two identical fuel entries: ${fmtNum(e.litres, 2)} L from ${e.from} to ${e.to}. Delete one if it was entered twice.`);
        seen.set(sig, true);
      }
    }
    return issues.filter((i) => i.monday <= days[days.length - 1]);
  }

  function renderChecks() {
    const issues = findIssues(chkMonth.value);
    const errors = issues.filter((i) => i.level === "error").length;
    $("#fl-chk-summary").textContent = issues.length
      ? `${issues.length} thing${issues.length === 1 ? "" : "s"} to check in ${fmtMonth(chkMonth.value)} (${errors} error${errors === 1 ? "" : "s"})`
      : "";
    $("#fl-checks").replaceChildren(...(issues.length ? issues
      .sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1) || a.u.id.localeCompare(b.u.id) || a.monday.localeCompare(b.monday))
      .map((i) => {
        const go = el("button", { class: "btn btn-ghost btn-sm", type: "button", text: "Go to week" });
        go.addEventListener("click", () => {
          $("#fl-read-search").value = i.u.id;
          readWeek = i.monday;
          selectTab("input");
          document.querySelector("#fl-readings").scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return el("div", { class: "fl-issue " + i.level },
          el("span", { class: "badge " + (i.level === "error" ? "badge-unserviceable" : "badge-under-repair"), text: i.level === "error" ? "Error" : "Check" }),
          el("div", {}, el("b", { text: `${i.u.id}${i.u.plate ? " · " + i.u.plate : ""}` }), el("p", { text: i.text })),
          go);
      }) : [el("div", { class: "empty-state" },
        el("span", { class: "empty-icon", "aria-hidden": "true", text: "✓" }),
        el("div", {}, el("p", { class: "empty-title", text: "No problems found" }), el("p", { text: `Fuel and odometer readings for ${fmtMonth(chkMonth.value)} look consistent.` })))]));
  }

  // --- Maintenance -------------------------------------------------------
  $("#fl-pm-search").addEventListener("input", renderPm);
  $("#fl-pm-due").addEventListener("change", renderPm);
  function pmStatus(u) {
    const s = state.settings;
    const cur = latestReading(u.key);
    const pm = state.pm[u.key] || {};
    if (!cur) return { key: "none", label: "No readings", cur, pm };
    if (pm.odo == null) return { key: "unknown", label: "No PM record", cur, pm };
    const since = cur.value - pm.odo;
    const next = pm.odo + s.pmInterval;
    const key = since >= s.pmInterval ? "due" : since >= s.pmInterval - s.dueSoon ? "soon" : "ok";
    return { key, label: { due: "Due", soon: "Due soon", ok: "OK" }[key], cur, pm, since, next };
  }
  function renderPm() {
    const s = state.settings;
    $("#fl-pm-hint").textContent = `PM every ${fmtNum(s.pmInterval)} km; “Due soon” within ${fmtNum(s.dueSoon)} km (change these in Settings). Enter the odometer at each vehicle's last PM, or click “PM done” when a PM is finished.`;
    const q = $("#fl-pm-search").value.trim().toLowerCase();
    const dueOnly = $("#fl-pm-due").checked;
    const rank = { due: 0, soon: 1, unknown: 2, ok: 3, none: 4 };
    const rows = units().map((u) => ({ u, st: pmStatus(u) }))
      .filter(({ u, st }) => matchesSearch(u, q) && (!dueOnly || st.key === "due" || st.key === "soon"))
      .sort((a, b) => rank[a.st.key] - rank[b.st.key] || a.u.id.localeCompare(b.u.id));
    const counts = units().map(pmStatus).reduce((acc, st) => (acc[st.key] = (acc[st.key] || 0) + 1, acc), {});
    $("#fl-pm-summary").textContent = `${counts.due || 0} due · ${counts.soon || 0} due soon · ${counts.unknown || 0} with no PM record`;
    $("#fl-pm tbody").replaceChildren(...rows.map(({ u, st }) => {
      const odoIn = el("input", { type: "text", inputmode: "numeric", class: "fl-odo", "aria-label": `${u.id} odometer at last PM` });
      odoIn.value = st.pm.odo != null ? fmtNum(st.pm.odo) : "";
      const dateIn = el("input", { type: "date", "aria-label": `${u.id} date of last PM` });
      dateIn.value = st.pm.date || "";
      const save = () => {
        const n = toNumber(odoIn.value);
        odoIn.classList.toggle("invalid", Number.isNaN(n));
        if (Number.isNaN(n)) return;
        const pm = { ...(state.pm[u.key] || {}) };
        if (n == null) delete pm.odo; else pm.odo = Math.round(n);
        if (dateIn.value) pm.date = dateIn.value; else delete pm.date;
        if (Object.keys(pm).length) state.pm[u.key] = pm; else delete state.pm[u.key];
        changed();
        renderPm();
        updateCounts();
      };
      odoIn.addEventListener("change", save);
      dateIn.addEventListener("change", save);
      const done = el("button", { class: "btn btn-ghost btn-sm", type: "button", text: "PM done" });
      done.disabled = !st.cur;
      done.addEventListener("click", () => {
        if (!confirm(`Record a PM for ${u.id} today at ${fmtNum(st.cur.value)} km?`)) return;
        state.pm[u.key] = { odo: st.cur.value, date: todayISO };
        changed();
        renderPm();
        updateCounts();
      });
      const cls = { due: "badge badge-unserviceable", soon: "badge badge-under-repair", ok: "badge badge-serviceable", unknown: "badge", none: "badge" }[st.key];
      return el("tr", {},
        el("td", { class: "strong", text: u.id }), el("td", { text: u.plate || "—" }), el("td", { class: "muted small", text: u.model }),
        el("td", { class: "num" }, st.cur ? fmtNum(st.cur.value) : "—", st.cur ? el("small", { class: "muted block", text: fmtDate(st.cur.date) }) : ""),
        el("td", {}, odoIn), el("td", {}, dateIn),
        el("td", { class: "num", text: st.since != null ? fmtNum(st.since) + " km" : "" }),
        el("td", { class: "num", text: st.next != null ? fmtNum(st.next) : "" }),
        el("td", {}, el("span", { class: cls, text: st.label })),
        el("td", { class: "actions" }, done));
    }));
  }

  // --- Reports -----------------------------------------------------------
  const repMonth = $("#fl-rep-month");
  repMonth.value = monthOf(todayISO);
  repMonth.addEventListener("change", () => { if (!repMonth.value) repMonth.value = monthOf(todayISO); renderReports(); });
  function reportRows(ym) {
    const days = monthDays(ym), from = days[0], to = days[days.length - 1];
    return units().map((u) => {
      const litres = fuelBetween(u.key, from, to);
      const dist = distance(u.key, from, to);
      const entries = state.entries.filter((e) => e.unit === u.key && e.to >= from && e.from <= to).length;
      return { u, litres, km: dist.km, kml: litres > 0 && dist.km > 0 ? dist.km / litres : null, entries };
    }).filter((r) => r.litres > 0 || r.km);
  }
  function renderReports() {
    const ym = repMonth.value;
    const rows = reportRows(ym).sort((a, b) => b.litres - a.litres);
    const totalL = rows.reduce((a, r) => a + r.litres, 0);
    const totalKm = rows.reduce((a, r) => a + (r.km || 0), 0);
    const kmForL = rows.filter((r) => r.kml != null);
    const avg = kmForL.length ? kmForL.reduce((a, r) => a + r.km, 0) / kmForL.reduce((a, r) => a + r.litres, 0) : null;
    const tile = (label, value, note) => el("div", { class: "stat" }, el("dt", { text: label }), el("dd", { text: value }), note ? el("p", { class: "stat-note", text: note }) : "");
    $("#fl-rep-stats").replaceChildren(
      tile("Fuel issued", fmtNum(totalL, 0) + " L", fmtMonth(ym)),
      tile("Distance", fmtNum(totalKm) + " km", "From the odometer readings"),
      tile("Average", avg ? fmtNum(avg, 1) + " km/L" : "—", "Vehicles with both fuel and km"),
      tile("Vehicles", String(rows.length), "With fuel or distance"));
    $("#fl-rep-title").textContent = `Fuel and distance by vehicle, ${fmtMonth(ym)}`;
    $("#fl-rep tbody").replaceChildren(...rows.map((r) => el("tr", {},
      el("td", { class: "strong", text: r.u.id }), el("td", { text: r.u.plate || "—" }), el("td", { class: "muted small", text: r.u.model }),
      el("td", { class: "small", text: r.u.officeGroup }),
      el("td", { class: "num", text: fmtNum(r.litres, 2) }), el("td", { class: "num", text: r.km != null ? fmtNum(r.km) : "—" }),
      el("td", { class: "num", text: r.kml != null ? fmtNum(r.kml, 1) : "—" }), el("td", { class: "num", text: String(r.entries) }))));
    $("#fl-rep tfoot").replaceChildren(rows.length ? el("tr", {},
      el("th", { colspan: "4", scope: "row", text: "Total" }), el("td", { class: "num", text: fmtNum(totalL, 2) }),
      el("td", { class: "num", text: fmtNum(totalKm) }), el("td", { class: "num", text: avg ? fmtNum(avg, 1) : "—" }),
      el("td", { class: "num", text: String(rows.reduce((a, r) => a + r.entries, 0)) })) : "");
    $("#fl-rep-empty").hidden = rows.length > 0;
    const byOffice = new Map();
    for (const r of rows) {
      const o = byOffice.get(r.u.officeGroup) || { n: 0, litres: 0, km: 0, kmL: 0, lForKm: 0 };
      o.n++; o.litres += r.litres; o.km += r.km || 0;
      if (r.kml != null) { o.kmL += r.km; o.lForKm += r.litres; }
      byOffice.set(r.u.officeGroup, o);
    }
    $("#fl-rep-office tbody").replaceChildren(...[...byOffice.entries()].sort((a, b) => b[1].litres - a[1].litres).map(([name, o]) => el("tr", {},
      el("td", { text: name }), el("td", { class: "num", text: String(o.n) }), el("td", { class: "num", text: fmtNum(o.litres, 2) }),
      el("td", { class: "num", text: fmtNum(o.km) }), el("td", { class: "num", text: o.lForKm ? fmtNum(o.kmL / o.lForKm, 1) : "—" }))));
  }
  $("#fl-rep-export").addEventListener("click", () => {
    const rows = [["Vehicle", "Plate", "Unit", "Office", "Fuel (L)", "km", "km/L", "Fuel entries"],
      ...reportRows(repMonth.value).map((r) => [r.u.id, r.u.plate, r.u.model, r.u.officeGroup, Math.round(r.litres * 100) / 100, r.km ?? "", r.kml != null ? Math.round(r.kml * 10) / 10 : "", r.entries])];
    download(`fuel-report-${repMonth.value}.csv`, "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n"), "text/csv");
  });
  $("#fl-rep-print").addEventListener("click", () => window.print());

  // --- Settings ----------------------------------------------------------
  const settingsForm = $("#fl-settings");
  function renderSettings() {
    const f = settingsForm.elements, s = state.settings;
    ["pmInterval", "dueSoon", "kmlMin", "kmlMax"].forEach((k) => { f[k].value = s[k]; });
    f.includeNoPlate.checked = s.includeNoPlate;
    setSync($("#fl-sync").className.replace("fl-sync", "").replace("is-", "").trim(), $("#fl-sync").textContent);
  }
  settingsForm.addEventListener("change", () => {
    const f = settingsForm.elements;
    const next = { ...state.settings };
    for (const k of ["pmInterval", "dueSoon", "kmlMin", "kmlMax"]) {
      const n = toNumber(f[k].value);
      if (n == null || Number.isNaN(n) || n < 0) { f[k].classList.add("invalid"); return; }
      f[k].classList.remove("invalid");
      next[k] = n;
    }
    if (next.kmlMin >= next.kmlMax) { f.kmlMax.classList.add("invalid"); $("#fl-settings-status").textContent = "The highest km per liter must be more than the lowest."; return; }
    next.includeNoPlate = f.includeNoPlate.checked;
    state.settings = next;
    changed();
    updateCounts();
    $("#fl-settings-status").className = "form-status success";
    $("#fl-settings-status").textContent = "Saved.";
  });
  settingsForm.addEventListener("submit", (e) => e.preventDefault());

  $("#fl-backup").addEventListener("click", () => {
    download(`fuel-log-backup-${todayISO}.json`, JSON.stringify({ type: "emd-fuel-log", saved: new Date().toISOString(), ...state }, null, 1), "application/json");
  });
  $("#fl-restore-btn").addEventListener("click", () => $("#fl-restore").click());
  $("#fl-restore").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const status = $("#fl-backup-status");
    try {
      const data = JSON.parse(await file.text());
      if (data.type !== "emd-fuel-log") throw new Error("not a fuel log backup");
      const restored = normalize(data);
      if (!confirm(`Replace the current fuel log with this backup (${restored.entries.length} fuel entries, saved ${data.saved ? new Date(data.saved).toLocaleString("en-PH") : "on an unknown date"})?`)) return;
      state = restored;
      changed();
      renderAll();
      status.className = "form-status success";
      status.textContent = "Backup restored.";
    } catch (err) {
      status.className = "form-status error";
      status.textContent = "That file isn't a fuel log backup.";
    }
  });
  $("#fl-clear-all").addEventListener("click", () => {
    if (!confirm("Delete ALL fuel entries, odometer readings and PM records? Download a backup first if you may need them.")) return;
    if (!confirm("Are you sure? This cannot be undone.")) return;
    state = normalize({ settings: state.settings });
    changed();
    renderAll();
  });

  // --- Issued fuel requisitions -----------------------------------------
  // A fuel requisition marked "Issued" in Request monitoring is added here
  // automatically, with the liters issued (or requested) over its dates. If
  // the requisition later changes, its entry follows; if it is no longer
  // Issued, its entry is removed. Entries deleted here are not re-added.
  const fleetText = new Map((window.EMD_FLEET || []).map((u) => [`${u.propertyNo} — ${u.plateNo} ${u.makeModel}`, `${u.propertyNo}|${u.plateNo}`]));
  function requestUnit(text) {
    const t = String(text || "").trim();
    if (fleetText.has(t)) return unitByKey.get(fleetText.get(t));
    return findUnit(t) || findUnit(t.split(" — ")[0]) || findUnit(t.split(/\s+/)[0]);
  }
  async function loadRequests() {
    if (LOG_URL) {
      const res = await fetch(LOG_URL + (LOG_URL.includes("?") ? "&" : "?") + "action=list", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      return data.requests || [];
    }
    // Without the sheet: the published list plus this browser's changes.
    const byId = new Map((window.EMD_REQUESTS || []).map((r) => [r.id, r]));
    Object.entries(storage.get("emd-request-edits", {})).forEach(([id, r]) => { if (r.deleted) byId.delete(id); else byId.set(id, r); });
    return [...byId.values()];
  }
  let requestsChecked = false;
  async function syncRequests() {
    const note = $("#fl-req-status");
    let list;
    try { list = await loadRequests(); } catch (err) {
      note.className = "form-status error";
      note.textContent = "Couldn't check Request monitoring for issued fuel requisitions. Try Refresh later.";
      return;
    }
    requestsChecked = true;
    const fuel = new Map(list.filter((r) => r.kind === "fuel" && r.id).map((r) => [r.id, r]));
    let added = 0, updated = 0, removed = 0;
    const unmatched = [];
    for (const r of fuel.values()) {
      const existing = state.entries.find((e) => e.request === r.id);
      if (r.status !== "Issued") {
        if (existing) { state.entries = state.entries.filter((e) => e !== existing); removed++; }
        continue;
      }
      if (state.skippedRequests.includes(r.id)) continue;
      const unit = requestUnit(r.unit);
      const litres = toNumber(r.issuedLitres) || toNumber(r.litres);
      const from = r.dateFrom || r.date, to = r.dateTo && r.dateTo >= from ? r.dateTo : from;
      if (!unit || !litres || litres <= 0 || !from) { unmatched.push(r.id); continue; }
      if (existing) {
        if (existing.unit !== unit.key || existing.litres !== litres || existing.from !== from || existing.to !== to) {
          Object.assign(existing, { unit: unit.key, litres, from, to });
          updated++;
        }
      } else {
        state.entries.push({ id: "req-" + r.id, unit: unit.key, litres, from, to, request: r.id });
        added++;
      }
    }
    if (added || updated || removed) { changed(); renderAll(); }
    const parts = [];
    if (added) parts.push(`added ${added} issued fuel requisition${added === 1 ? "" : "s"}`);
    if (updated) parts.push(`updated ${updated}`);
    if (removed) parts.push(`removed ${removed} no longer marked Issued`);
    note.className = "form-status" + (unmatched.length ? " error" : parts.length ? " success" : "");
    note.textContent = (parts.length ? "From Request monitoring: " + parts.join(", ") + ". " : "") +
      (unmatched.length ? `${unmatched.length} issued requisition${unmatched.length === 1 ? "" : "s"} couldn't be added (unit not in the fleet list, or no liters or dates): ${unmatched.slice(0, 5).join(", ")}.` : "");
  }
  $("#fl-req-refresh").addEventListener("click", () => syncRequests());
  // Pick up requisitions issued while this page was open in another tab.
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && requestsChecked) syncRequests(); });

  // --- Tab badges --------------------------------------------------------
  function updateCounts() {
    const issues = findIssues(monthOf(todayISO)).length;
    const due = units().filter((u) => ["due", "soon"].includes(pmStatus(u).key)).length;
    const c1 = $("#fl-checks-count"), c2 = $("#fl-pm-count");
    c1.hidden = !issues; c1.textContent = String(issues);
    c2.hidden = !due; c2.textContent = String(due);
  }

  // --- Start -------------------------------------------------------------
  function unlock() {
    $("#fl-locked").hidden = true;
    $("#main").hidden = false;
    $("#fl-lock").hidden = !live;
    if (LOG_URL && session.get(KEY_SESSION)) connect(session.get(KEY_SESSION));
    else {
      setSync("", "Saved in this browser");
      $("#fl-connect").hidden = !LOG_URL || Boolean(session.get("emd-fuel-log-later"));
      syncRequests();
    }
    const tab = session.get("emd-fuel-log-tab");
    selectTab(tabs.some((t) => t.dataset.tab === tab) ? tab : "input");
    updateCounts();
  }

  if (!live || session.get(SESSION_KEY) === live.hash) unlock();
  else { $("#fl-locked").hidden = false; $("#fl-password").focus(); }

  // For tests.
  window.EMD_FUEL_LOG = { weekOdometers: (k, m) => weekOdometers(k, m), state: () => state };
})();
