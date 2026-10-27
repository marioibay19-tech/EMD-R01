(function () {
  "use strict";

  const config = window.EMD_CONFIG || {};
  const fleet = window.EMD_FLEET || [];
  const stages = window.EMD_REPAIR_STAGES || [];
  const fuelStatuses = window.EMD_FUEL_STATUSES || ["Pending", "Approved", "Issued", "Disapproved"];
  const $ = (sel) => document.querySelector(sel);
  const SVG_NS = "http://www.w3.org/2000/svg";

  // --- Helpers -----------------------------------------------------------
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    children.flat().forEach((c) => node.append(c));
    return node;
  }

  function svg(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
    return node;
  }

  // Parse "YYYY-MM-DD" as a local date.
  const parseDate = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const fmtDate = (s) => {
    const d = parseDate(s);
    return d ? d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";
  };
  const fmtNum = (n) => n.toLocaleString("en-PH");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysFromToday = (s) => Math.round((parseDate(s) - today) / 86400000);

  const storage = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    }
  };

  // Announcements, organization and forms (js/content.js). With ?preview, show
  // the unpublished draft from the Admin page instead.
  const draft = new URLSearchParams(location.search).has("preview") ? storage.get("emd-admin-draft", null) : null;
  const content = draft || { announcements: window.EMD_ANNOUNCEMENTS, org: window.EMD_ORG, forms: window.EMD_FORMS };
  $("#preview-banner").hidden = !draft;

  const conditionClass = (c) => "badge badge-" + c.toLowerCase().replace(/\s+/g, "-");

  // --- Config ------------------------------------------------------------
  document.querySelectorAll("[data-config]").forEach((node) => {
    const key = node.dataset.config;
    const value = config[key] || "";
    // data-keep-children: only set the link target, keep the markup inside.
    if (!node.hasAttribute("data-keep-children")) node.textContent = value;
    if (node.tagName === "A") {
      if (key === "email") node.href = "mailto:" + value;
      else node.href = "tel:" + value.replace(/[^\d+]/g, "");
    }
  });
  $("#sample-banner").hidden = !config.sampleData;
  $("#year").textContent = today.getFullYear();

  // --- Theme -------------------------------------------------------------
  const root = document.documentElement;
  const savedTheme = storage.get("emd-theme", null);
  if (savedTheme) root.dataset.theme = savedTheme;

  $(".theme-toggle").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    storage.set("emd-theme", root.dataset.theme);
  });

  // --- Mobile nav --------------------------------------------------------
  const navToggle = $(".nav-toggle");
  const nav = $("#site-nav");
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  // --- Fleet edits -------------------------------------------------------
  // Edits made with the "Edit" button are kept in this browser, keyed by the
  // published property no. + plate no., until someone downloads fleet.js and
  // uploads it to GitHub. Once the published list matches, they are cleared.
  const EDITABLE = ["plateNo", "ltoDate", "ltoDue", "parDate", "office", "endUser", "position"];
  const EDITS_KEY = "emd-fleet-edits";
  const baseFleet = fleet.map((u) => ({ ...u }));
  const unitKeys = new Map(fleet.map((u, i) => [u, `${baseFleet[i].propertyNo}|${baseFleet[i].plateNo}`]));
  let fleetEdits = storage.get(EDITS_KEY, {});

  function applyEdits() {
    fleet.forEach((u, i) => {
      const key = unitKeys.get(u);
      const edit = fleetEdits[key];
      EDITABLE.forEach((f) => {
        if (edit && f in edit) u[f] = edit[f];
        else if (f in baseFleet[i]) u[f] = baseFleet[i][f];
        else delete u[f];
      });
      // Drop edits the published list already contains.
      if (edit && EDITABLE.every((f) => (edit[f] ?? baseFleet[i][f] ?? "") === (baseFleet[i][f] ?? ""))) delete fleetEdits[key];
    });
    storage.set(EDITS_KEY, fleetEdits);
  }
  applyEdits();
  const isEdited = (u) => Boolean(fleetEdits[unitKeys.get(u)]);

  // --- Stats -------------------------------------------------------------
  // "Equipment Management Division (A1-2), Regional Office" -> "Equipment Management Division"
  const officeGroup = (o) => o ? o.split(",")[0].replace(/\s*\(.*?\)/, "").replace(/\s+-\s+.*/, "").trim() : "Unassigned";
  const offices = [...new Set(fleet.map((u) => officeGroup(u.office)))].filter((o) => o !== "Unassigned").sort();
  $("#stat-total").textContent = fleet.length;
  $("#stat-vehicles").textContent = fleet.filter((u) => u.group === "vehicle").length;
  $("#stat-equipment").textContent = fleet.filter((u) => u.group !== "vehicle").length;
  $("#stat-offices").textContent = offices.length;

  // --- Fleet table -------------------------------------------------------
  const search = $("#fleet-search");
  const typeFilter = $("#fleet-type");
  const officeFilter = $("#fleet-office");
  const fleetBody = $("#fleet-body");
  const dash = (v) => v || "—";
  let sortKey = "";  // "" keeps the order of the equipment list
  let sortDir = 1;
  // "Office, Location" -> office on the first line, location underneath.
  const splitOffice = (o) => {
    const i = (o || "").indexOf(",");
    return i < 0 ? [o, ""] : [o.slice(0, i), o.slice(i + 1).trim()];
  };

  // Dates are recorded as DD/MM/YYYY; a few were typed MM/DD/YYYY, which is
  // detectable when the middle number is over 12. Used for sorting only.
  const dateKey = (s) => {
    const m = /^(\d\d)\/(\d\d)\/(\d{4})$/.exec(s || "");
    if (!m) return "";
    const [d, mo] = Number(m[2]) > 12 ? [m[2], m[1]] : [m[1], m[2]];
    return `${m[3]}-${mo}-${d}`;
  };
  const parStatus = (u) => /waiting/i.test(u.parDate) ? "awaiting" : dateKey(u.parDate) ? "with" : "none";
  let parFilter = "";
  // Show the list in pages so phones don't scroll through all 133 units.
  const FLEET_PAGE = 25;
  let fleetLimit = FLEET_PAGE;

  // LTO renewal schedule from the plate number: the last digit sets the month
  // (1 = Jan ... 9 = Sep, 0 = Oct) and the second-to-last digit the week
  // (1-3: days 1-7, 4-6: 8-14, 7-8: 15-21, 9/0: 22-end). The registration is
  // taken to be due again in the year after the recorded LTO registration
  // year. A unit can override this with ltoDue: "YYYY-MM-DD" in data.js
  // (e.g. a brand-new vehicle with a multi-year first registration).
  function ltoDue(u) {
    if (u.ltoDue) return parseDate(u.ltoDue);
    const year = Number((/(\d{4})$/.exec(u.ltoDate || "") || [])[1]);
    const plate = (u.plateNo || "").split(/[(/]/)[0];
    const digits = plate.replace(/\D/g, "");
    if (!year || digits.length < 2) return null;
    const last = Number(digits.slice(-1)), prev = Number(digits.slice(-2, -1));
    const month = last === 0 ? 10 : last;  // 1-based
    const endDay = prev >= 1 && prev <= 3 ? 7 : prev <= 6 && prev >= 4 ? 14 : prev === 7 || prev === 8 ? 21
      : new Date(year + 1, month, 0).getDate();  // 9 or 0: last day of the month
    return new Date(year + 1, month - 1, endDay);
  }
  const LTO_DUE_SOON = 30;
  function ltoStatus(u) {
    if (!u.plateNo || /^n\/?a$/i.test(u.plateNo)) return { key: "na" };
    const due = ltoDue(u);
    if (!due) return { key: "none", label: "No LTO record", cls: "chip" };
    const days = Math.round((due - today) / 86400000);
    if (days < 0) return { key: "expired", label: "Expired", cls: "badge badge-unserviceable", due };
    if (days <= LTO_DUE_SOON) return { key: "due", label: `Due in ${days} day${days === 1 ? "" : "s"}`, cls: "badge badge-under-repair", due };
    return { key: "valid", label: "Registered", cls: "badge badge-serviceable", due };
  }
  let ltoFilter = "";

  [...new Set(fleet.map((u) => u.type))].sort().forEach((t) => typeFilter.add(new Option(t, t)));
  offices.forEach((o) => officeFilter.add(new Option(o, o)));

  const unitList = $("#unit-list");
  // Suggestion text -> unit, so request forms can look up the chosen unit.
  const unitByOption = new Map();
  fleet.forEach((u) => {
    const text = `${u.propertyNo} — ${u.plateNo} ${u.makeModel}`;
    unitByOption.set(text, u);
    unitList.appendChild(new Option(text));
  });

  function renderFleet() {
    const q = search.value.trim().toLowerCase();
    const sortValue = (u) => sortKey === "parDate" || sortKey === "ltoDate" ? dateKey(u[sortKey]) : u[sortKey];
    const rows = fleet
      .filter((u) =>
        (!q || [u.propertyNo, u.plateNo, u.type, u.makeModel, u.office, u.endUser, u.position]
          .some((v) => (v || "").toLowerCase().includes(q))) &&
        (!typeFilter.value || u.type === typeFilter.value) &&
        (!officeFilter.value || officeGroup(u.office) === officeFilter.value) &&
        (!parFilter || parStatus(u) === parFilter) &&
        (!ltoFilter || ltoStatus(u).key === ltoFilter))
      .sort((a, b) => {
        if (!sortKey) return 0;
        // Blank values always sort last, whichever direction.
        const va = sortValue(a), vb = sortValue(b);
        if (!va || !vb) return !va - !vb;
        return va.localeCompare(vb, "en", { numeric: true }) * sortDir;
      });

    const shown = rows.slice(0, fleetLimit);
    fleetBody.replaceChildren(...shown.map((u) => el("tr", {},
      el("td", { "data-label": "Property no." }, el("span", { class: "cell-main", text: u.propertyNo }),
        isEdited(u) ? el("small", { class: "edited-tag", text: "Edited" }) : ""),
      el("td", { "data-label": "Plate no.", text: dash(u.plateNo) }),
      el("td", { "data-label": "Equipment" }, el("span", { class: "cell-main", text: u.makeModel }), el("small", { text: u.type })),
      el("td", { "data-label": "Assigned office" }, ...(() => {
        const [office, place] = splitOffice(u.office);
        return [el("span", { class: "cell-main", text: dash(office) }), place ? el("small", { text: place }) : ""];
      })()),
      el("td", { "data-label": "End-user" }, el("span", { class: "cell-main", text: dash(u.endUser) }), u.position ? el("small", { text: u.position }) : ""),
      el("td", { "data-label": "Date of PAR" }, parStatus(u) === "awaiting"
        ? el("span", { class: "badge badge-under-repair", text: "Awaiting updated PAR" })
        : document.createTextNode(dash(u.parDate))),
      el("td", { "data-label": "LTO registration" }, ...(() => {
        const st = ltoStatus(u);
        if (st.key === "na") return [document.createTextNode(dash(u.ltoDate))];
        return [
          el("span", { class: "cell-main", text: dash(u.ltoDate) }),
          el("small", { class: "lto-status" },
            el("span", { class: st.cls, text: st.label }),
            st.due ? document.createTextNode(` ${st.key === "expired" ? "was due" : "due"} ${st.due.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`) : "")
        ];
      })()),
      el("td", { class: "cell-edit", "data-label": "" }, (() => {
        const btn = el("button", { type: "button", class: "edit-btn", "aria-label": `Edit ${u.propertyNo} ${u.plateNo || ""}`.trim() }, "Edit");
        btn.addEventListener("click", () => openUnitDialog(u));
        return btn;
      })())
    )));

    $("#fleet-empty").hidden = rows.length > 0;
    $("#fleet-count").textContent = rows.length === fleet.length
      ? `Showing ${shown.length} of ${fleet.length} units`
      : `Showing ${shown.length} of ${rows.length} matching units (${fleet.length} in the fleet)`;
    const more = $("#fleet-more");
    more.hidden = shown.length >= rows.length;
    more.textContent = `Show ${Math.min(FLEET_PAGE, rows.length - shown.length)} more`;
    document.querySelectorAll("#fleet-table [data-sort]").forEach((btn) => {
      btn.closest("th").setAttribute("aria-sort",
        btn.dataset.sort === sortKey ? (sortDir === 1 ? "ascending" : "descending") : "none");
    });
    chipButtons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.par === parFilter)));
    ltoChipButtons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.lto === ltoFilter)));
    // Counts change when units are edited.
    chipButtons.forEach((btn) => { btn.querySelector("b").textContent = btn.dataset.par ? fleet.filter((u) => parStatus(u) === btn.dataset.par).length : fleet.length; });
    ltoChipButtons.forEach((btn) => { btn.querySelector("b").textContent = btn.dataset.lto ? fleet.filter((u) => ltoStatus(u).key === btn.dataset.lto).length : fleet.length; });
    const edited = Object.keys(fleetEdits).length;
    $("#edit-bar").hidden = edited === 0;
    $("#edit-count").textContent = `${edited} unit${edited === 1 ? "" : "s"} changed.`;
  }

  // PAR status chips filter the table.
  const chipButtons = [
    ["", "All units", ""],
    ["with", "With PAR", "badge-serviceable"],
    ["awaiting", "Awaiting updated PAR", "badge-under-repair"],
    ["none", "No PAR on record", "badge-unserviceable"]
  ].map(([key, label, cls]) => {
    const n = key ? fleet.filter((u) => parStatus(u) === key).length : fleet.length;
    const btn = el("button", { type: "button", class: `cond-chip ${cls}`.trim(), "data-par": key },
      el("span", { text: label }), el("b", { text: String(n) }));
    btn.addEventListener("click", () => { parFilter = key; fleetLimit = FLEET_PAGE; renderFleet(); });
    return btn;
  });
  $("#condition-chips").replaceChildren(el("span", { class: "chips-label", text: "PAR" }), ...chipButtons);

  // LTO registration status chips.
  const ltoChipButtons = [
    ["", "All units", ""],
    ["expired", "Expired", "badge-unserviceable"],
    ["due", `Due within ${LTO_DUE_SOON} days`, "badge-under-repair"],
    ["valid", "Registered", "badge-serviceable"],
    ["none", "No LTO record", ""]
  ].map(([key, label, cls]) => {
    const n = key ? fleet.filter((u) => ltoStatus(u).key === key).length : fleet.length;
    const btn = el("button", { type: "button", class: `cond-chip ${cls}`.trim(), "data-lto": key },
      el("span", { text: label }), el("b", { text: String(n) }));
    btn.addEventListener("click", () => { ltoFilter = key; fleetLimit = FLEET_PAGE; renderFleet(); });
    return btn;
  });
  $("#lto-chips").replaceChildren(el("span", { class: "chips-label", text: "LTO" }), ...ltoChipButtons);

  // Edit dialog. Date inputs use YYYY-MM-DD; the list stores DD/MM/YYYY.
  const dialog = $("#unit-dialog");
  const unitForm = $("#unit-form");
  const toDMY = (iso) => iso ? iso.split("-").reverse().join("/") : "";
  let editing = null;
  let initial = {};

  function previewLto() {
    const f = unitForm.elements;
    const draft = { plateNo: f.plateNo.value.trim(), ltoDate: toDMY(f.ltoDate.value), ltoDue: f.ltoDue.value };
    const st = ltoStatus(draft);
    const due = st.due ? st.due.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "";
    $("#lto-preview").textContent = st.key === "na" ? "No plate number: no LTO status."
      : st.key === "none" ? "Enter the registration date to work out the next due date."
      : `LTO status: ${st.label}. ${st.key === "expired" ? "Was due" : "Next due"} ${due}.`;
    $("#lto-preview").className = "lto-preview lto-" + st.key;
  }

  function openUnitDialog(u) {
    editing = u;
    const f = unitForm.elements;
    initial = {
      plateNo: u.plateNo || "", ltoDate: dateKey(u.ltoDate), ltoDue: u.ltoDue || "",
      parDate: dateKey(u.parDate), parAwaiting: parStatus(u) === "awaiting",
      office: u.office || "", endUser: u.endUser || "", position: u.position || ""
    };
    Object.entries(initial).forEach(([k, v]) => { if (k === "parAwaiting") f[k].checked = v; else f[k].value = v; });
    f.parDate.disabled = initial.parAwaiting;
    $("#unit-dialog-title").textContent = `Edit ${u.propertyNo}`;
    $("#unit-dialog-sub").textContent = u.makeModel;
    $("#unit-revert").hidden = !isEdited(u);
    previewLto();
    dialog.showModal();
  }

  ["plateNo", "ltoDate", "ltoDue"].forEach((n) => unitForm.elements[n].addEventListener("input", previewLto));
  unitForm.elements.parAwaiting.addEventListener("change", (e) => { unitForm.elements.parDate.disabled = e.target.checked; });
  dialog.querySelectorAll('button[value="cancel"]').forEach((b) => b.addEventListener("click", () => dialog.close()));

  function saveEdit(u, values) {
    const i = fleet.indexOf(u);
    const key = unitKeys.get(u);
    const diff = {};
    EDITABLE.forEach((field) => {
      if ((values[field] ?? "") !== (baseFleet[i][field] ?? "")) diff[field] = values[field];
    });
    if (Object.keys(diff).length) fleetEdits[key] = diff; else delete fleetEdits[key];
    applyEdits();
    renderFleet();
  }

  unitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = unitForm.elements;
    const u = editing;
    // Untouched date fields keep their recorded text (e.g. "N/A").
    const values = {
      plateNo: f.plateNo.value.trim(),
      ltoDate: f.ltoDate.value === initial.ltoDate ? u.ltoDate || "" : toDMY(f.ltoDate.value),
      ltoDue: f.ltoDue.value,
      parDate: f.parAwaiting.checked ? (initial.parAwaiting ? u.parDate : "Waiting for updated PAR")
        : f.parDate.value === initial.parDate && !initial.parAwaiting ? u.parDate || "" : toDMY(f.parDate.value),
      office: f.office.value.trim(), endUser: f.endUser.value.trim(), position: f.position.value.trim()
    };
    saveEdit(u, values);
    dialog.close();
  });

  $("#unit-revert").addEventListener("click", () => {
    delete fleetEdits[unitKeys.get(editing)];
    applyEdits();
    renderFleet();
    dialog.close();
  });

  $("#edit-discard").addEventListener("click", () => {
    if (!confirm("Discard all fleet changes saved in this browser?")) return;
    fleetEdits = {};
    applyEdits();
    renderFleet();
  });

  // Rebuild js/fleet.js from the current list, one unit per line.
  $("#edit-download").addEventListener("click", () => {
    const header = [
      "// EMD fleet list. Updated from the website: use \"Edit\" on a unit, then",
      "// \"Download fleet.js\" and upload the file here (js/fleet.js) on GitHub.",
      "// Engine serial numbers are left out on purpose because this file is public.",
      "// Dates are kept as recorded (DD/MM/YYYY). Optional fields per unit:",
      "//   ltoDue: \"YYYY-MM-DD\"  overrides the computed LTO due date",
      "//   condition: \"Serviceable\" | \"Under repair\" | \"Unserviceable\"",
      "//   nextPms: \"YYYY-MM-DD\", pmsType: \"250-hr service\", standby: true"
    ].join("\n");
    const body = fleet.map((u) => "  " + JSON.stringify(u, (k, v) => (k === "ltoDue" && !v ? undefined : v))).join(",\n");
    const blob = new Blob([`${header}\nwindow.EMD_FLEET = [\n${body}\n];\n`], { type: "text/javascript" });
    const link = el("a", { href: URL.createObjectURL(blob), download: "fleet.js" });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  // A new search or filter starts again from the first page.
  [search, typeFilter, officeFilter].forEach((node) => node.addEventListener("input", () => { fleetLimit = FLEET_PAGE; renderFleet(); }));
  $("#fleet-more").addEventListener("click", () => { fleetLimit += FLEET_PAGE; renderFleet(); });
  document.querySelectorAll("#fleet-table [data-sort]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sort;
      sortDir = key === sortKey ? -sortDir : 1;
      sortKey = key;
      renderFleet();
    });
  });
  renderFleet();

  // --- PMS schedule ------------------------------------------------------
  // Shows the next 30 days by default (overdue units always included),
  // grouped by month; "Show all" extends it to every scheduled unit.
  const PMS_WINDOW = 30;
  const pmsAll = fleet
    .filter((u) => u.nextPms)
    .sort((a, b) => a.nextPms.localeCompare(b.nextPms));
  const pmsSoon = pmsAll.filter((u) => daysFromToday(u.nextPms) <= PMS_WINDOW);
  const pmsMore = $("#pms-more");
  let pmsExpanded = false;

  function pmsItem(u) {
    const days = daysFromToday(u.nextPms);
    const d = parseDate(u.nextPms);
    let status = ["Scheduled", "chip"];
    if (days < 0) status = ["Overdue", "chip chip-critical"];
    else if (days <= 7) status = [days === 0 ? "Due today" : `Due in ${days} day${days === 1 ? "" : "s"}`, "chip chip-warning"];
    return el("li", { class: "pms-item" },
      el("time", { class: "pms-date", datetime: u.nextPms },
        el("span", { text: d.toLocaleDateString("en-PH", { weekday: "short" }) }),
        el("b", { text: String(d.getDate()) })),
      el("div", { class: "pms-body" },
        el("p", { class: "pms-unit", text: u.makeModel }),
        el("p", { class: "pms-meta", text: `${u.propertyNo} · ${u.pmsType}` }),
        el("p", { class: "pms-meta", text: dash(u.office) })),
      el("span", { class: status[1], text: status[0] }));
  }

  function renderPms() {
    const list = pmsExpanded ? pmsAll : pmsSoon;
    const months = list.reduce((acc, u) => {
      const key = u.nextPms.slice(0, 7);
      (acc[key] = acc[key] || []).push(u);
      return acc;
    }, {});
    $("#pms-list").replaceChildren(...Object.entries(months).map(([key, units]) => el("section", { class: "pms-month" },
      el("h3", {},
        document.createTextNode(parseDate(key + "-01").toLocaleDateString("en-PH", { month: "long", year: "numeric" })),
        el("span", { text: `${units.length} unit${units.length === 1 ? "" : "s"}` })),
      el("ol", { class: "pms-list" }, units.map(pmsItem)))));
    $("#pms-empty").hidden = list.length > 0;
    pmsMore.hidden = pmsAll.length === pmsSoon.length;
    pmsMore.textContent = pmsExpanded ? `Show next ${PMS_WINDOW} days only` : `Show all scheduled PMS (${pmsAll.length})`;
  }
  pmsMore.addEventListener("click", () => { pmsExpanded = !pmsExpanded; renderPms(); });
  renderPms();

  // --- Disaster readiness ------------------------------------------------
  const alertOn = config.alertLevel === "alert";
  $("#alert-card").classList.toggle("is-alert", alertOn);
  $("#alert-level").textContent = alertOn ? "Alert: response operations active" : "Normal operations";

  const standby = fleet.filter((u) => u.standby);
  const byType = standby.reduce((acc, u) => ((acc[u.type] = acc[u.type] || []).push(u), acc), {});
  $("#standby-grid").replaceChildren(...Object.entries(byType).map(([type, units]) => {
    const ready = units.filter((u) => u.condition === "Serviceable").length;
    return el("article", { class: "standby-card" },
      el("header", {},
        el("h3", { text: type }),
        el("p", { text: `${ready} of ${units.length} ready` })),
      el("ul", {}, units.map((u) => el("li", {},
        el("span", { text: `${u.propertyNo} · ${dash(u.office)}` }),
        u.condition ? el("span", { class: conditionClass(u.condition), text: u.condition }) : ""))));
  }));
  $("#standby-empty").hidden = standby.length > 0;

  // --- Request tabs ------------------------------------------------------
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });
  // Quick actions and footer links that open a specific request form.
  document.querySelectorAll("[data-open-tab]").forEach((link) => {
    link.addEventListener("click", () => selectTab(document.getElementById(link.dataset.openTab)));
  });

  // --- Scroll helpers ----------------------------------------------------
  // Highlight the nav link for the section at the middle of the screen.
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const spyTargets = navLinks.map((a) => document.querySelector(a.getAttribute("href")));
  const toTop = $("#to-top");
  const onScroll = () => {
    toTop.hidden = window.scrollY < 700;
    const mid = window.innerHeight / 2;
    const current = spyTargets.find((t) => {
      const r = t && t.getBoundingClientRect();
      return r && r.top <= mid && r.bottom > mid;
    });
    navLinks.forEach((a, i) => a.classList.toggle("active", spyTargets[i] === current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Request monitoring ------------------------------------------------
  // Published requests come from js/requests.js. New requests and changes
  // are kept in this browser (by id) until someone downloads requests.js and
  // uploads it to GitHub; changes the published list already has are cleared.
  const REQ_KEY = "emd-request-edits";
  const REQ_FIELDS = ["id", "kind", "date", "requestedBy", "office", "unit", "details", "fuel", "litres",
    "dateFrom", "dateTo", "risNo", "issuedLitres", "maintType", "reading", "status", "updated", "remarks"];
  const publishedReqs = window.EMD_REQUESTS || [];
  const localISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayISO = localISO(today);
  const cleanReq = (r) => Object.fromEntries(REQ_FIELDS.filter((k) => r[k] !== undefined && r[k] !== "").map((k) => [k, r[k]]));
  const sameReq = (a, b) => REQ_FIELDS.every((k) => String(a[k] ?? "") === String(b[k] ?? ""));
  let reqEdits = storage.get(REQ_KEY, {});
  Object.keys(reqEdits).forEach((id) => {
    const pub = publishedReqs.find((r) => r.id === id);
    const edit = reqEdits[id];
    if (edit.deleted ? !pub : pub && sameReq(edit, pub)) delete reqEdits[id];
  });
  storage.set(REQ_KEY, reqEdits);

  function allRequests() {
    const byId = new Map(publishedReqs.map((r) => [r.id, r]));
    Object.entries(reqEdits).forEach(([id, r]) => { if (r.deleted) byId.delete(id); else byId.set(id, r); });
    return [...byId.values()].sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id));
  }
  function newRequestId(prefix) {
    const taken = new Set(allRequests().map((r) => r.id));
    let id;
    do id = `${prefix}-${todayISO.replace(/-/g, "")}-${Math.floor(Math.random() * 900) + 100}`; while (taken.has(id));
    return id;
  }
  function saveRequest(r) {
    reqEdits[r.id] = cleanReq({ ...r, updated: todayISO });
    storage.set(REQ_KEY, reqEdits);
    renderRequests();
  }

  const KINDS = { fuel: "Fuel requisition", repair: "Maintenance / repair" };
  const statusesFor = (kind) => kind === "fuel" ? fuelStatuses : stages;
  const statusClass = (r) => ({
    Pending: "badge badge-under-repair", Approved: "badge badge-info", Issued: "badge badge-serviceable",
    Disapproved: "badge badge-unserviceable", Released: "badge badge-serviceable"
  })[r.status] || "badge badge-under-repair";
  const isOpen = (r) => r.kind === "fuel" ? r.status === "Pending" || r.status === "Approved" : r.status !== "Released";
  const unitParts = (text) => {
    const i = (text || "").indexOf(" — ");
    return i < 0 ? [text || "—", ""] : [text.slice(0, i), text.slice(i + 3)];
  };
  const shortDate = (s) => s ? parseDate(s).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "";

  const reqSearch = $("#req-search");
  const reqStatus = $("#req-status");
  let reqKind = "";
  [["fuel", fuelStatuses], ["repair", stages]].forEach(([kind, list]) => {
    const group = el("optgroup", { label: KINDS[kind] });
    list.forEach((s) => group.append(new Option(s, `${kind}:${s}`)));
    reqStatus.append(group);
  });

  const kindChips = [["", "All requests"], ["fuel", "Fuel requisitions"], ["repair", "Maintenance / repair"]].map(([key, label]) => {
    const btn = el("button", { type: "button", class: "cond-chip", "data-kind": key }, el("span", { text: label }), el("b", { text: "0" }));
    btn.addEventListener("click", () => { reqKind = key; renderRequests(); });
    return btn;
  });
  $("#req-kind-chips").replaceChildren(...kindChips);

  function renderRequests() {
    const all = allRequests();
    const q = reqSearch.value.trim().toLowerCase();
    const [statusKind, statusName] = reqStatus.value ? reqStatus.value.split(":") : ["", ""];
    const rows = all.filter((r) =>
      (!reqKind || r.kind === reqKind) &&
      (!statusName || (r.kind === statusKind && r.status === statusName)) &&
      (!q || [r.id, r.unit, r.requestedBy, r.office, r.details, r.risNo, r.remarks].some((v) => (v || "").toLowerCase().includes(q))));

    $("#req-body").replaceChildren(...rows.map((r) => {
      const [prop, model] = unitParts(r.unit);
      const fuelLine = r.kind === "fuel"
        ? [r.fuel, r.litres ? `${r.litres} L requested` : "", r.issuedLitres ? `${r.issuedLitres} L issued` : "",
           r.dateFrom ? (r.dateTo && r.dateTo !== r.dateFrom ? `${shortDate(r.dateFrom)}–${shortDate(r.dateTo)}` : shortDate(r.dateFrom)) : "",
           r.risNo ? `RIS ${r.risNo}` : ""].filter(Boolean).join(" · ")
        : [r.maintType ? `${r.maintType} maintenance` : "", r.reading ? `Reading ${r.reading}` : ""].filter(Boolean).join(" · ");
      const editBtn = el("button", { type: "button", class: "edit-btn", "aria-label": `Edit ${r.id}` }, "Edit");
      editBtn.addEventListener("click", () => openReqDialog(r));
      return el("tr", {},
        el("td", { "data-label": "Reference" }, el("span", { class: "cell-main", text: r.id }), el("small", { text: KINDS[r.kind] })),
        el("td", { "data-label": "Date", text: fmtDate(r.date) }),
        el("td", { "data-label": "Unit" }, el("span", { class: "cell-main", text: prop }), model ? el("small", { text: model }) : ""),
        el("td", { "data-label": "Requested by" }, el("span", { class: "cell-main", text: r.requestedBy || "—" }), r.office ? el("small", { text: r.office }) : ""),
        el("td", { "data-label": "Details" },
          fuelLine ? el("span", { class: "cell-main", text: fuelLine }) : "",
          r.details ? el("small", { class: "clamp", text: r.details }) : ""),
        el("td", { "data-label": "Status" }, el("span", { class: statusClass(r), text: r.status }),
          el("small", { text: `Updated ${fmtDate(r.updated || r.date)}` }),
          r.remarks ? el("small", { text: r.remarks }) : ""),
        el("td", { class: "cell-edit", "data-label": "" }, editBtn));
    }));

    $("#req-empty").hidden = rows.length > 0;
    $("#req-count").textContent = all.length ? `Showing ${rows.length} of ${all.length} requests` : "";
    kindChips.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.kind === reqKind));
      btn.querySelector("b").textContent = btn.dataset.kind ? all.filter((r) => r.kind === btn.dataset.kind).length : all.length;
    });

    // Summary tiles
    const month = todayISO.slice(0, 7);
    const fuel = all.filter((r) => r.kind === "fuel");
    const repair = all.filter((r) => r.kind === "repair");
    const issuedThisMonth = fuel.filter((r) => r.status === "Issued" && (r.updated || r.date || "").startsWith(month))
      .reduce((sum, r) => sum + Number(r.issuedLitres || r.litres || 0), 0);
    const tile = (label, value, note) => el("div", { class: "stat" }, el("dt", { text: label }), el("dd", { text: String(value) }), note ? el("p", { class: "stat-note", text: note }) : "");
    $("#monitor-stats").replaceChildren(
      tile("Fuel pending", fuel.filter((r) => r.status === "Pending").length, "Waiting for approval"),
      tile("Fuel approved", fuel.filter((r) => r.status === "Approved").length, "Approved, not yet issued"),
      tile("Liters issued", issuedThisMonth.toLocaleString("en-PH"), "This month"),
      tile("Open repairs", repair.filter(isOpen).length, `${repair.filter((r) => r.status === "Released").length} released`));

    const edited = Object.keys(reqEdits).length;
    $("#req-edit-bar").hidden = edited === 0;
    $("#req-edit-count").textContent = `${edited} request${edited === 1 ? "" : "s"} added or changed.`;
  }
  [reqSearch, reqStatus].forEach((n) => n.addEventListener("input", renderRequests));

  // Add / edit dialog
  const reqDialog = $("#req-dialog");
  const reqForm = $("#req-form");
  let editingReq = null;

  function setReqKind(kind) {
    const f = reqForm.elements;
    const current = f.status.value;
    f.status.replaceChildren(...statusesFor(kind).map((s) => new Option(s, s)));
    if (statusesFor(kind).includes(current)) f.status.value = current;
    reqForm.querySelector(".req-fuel-fields").hidden = kind !== "fuel";
    f.fuel.required = f.litres.required = kind === "fuel";
    $("#req-details-label").textContent = kind === "fuel" ? "Purpose" : "Problem description";
  }

  function openReqDialog(r) {
    editingReq = r;
    const f = reqForm.elements;
    reqForm.reset();
    $("#req-form-status").textContent = "";
    reqForm.querySelectorAll(".invalid").forEach((n) => n.classList.remove("invalid"));
    const kind = r ? r.kind : "fuel";
    reqForm.querySelectorAll('[name="kind"]').forEach((k) => { k.checked = k.value === kind; k.disabled = Boolean(r); });
    setReqKind(kind);
    const values = r || { date: todayISO, status: statusesFor(kind)[0] };
    ["status", "date", "remarks", "unit", "requestedBy", "office", "fuel", "litres", "issuedLitres", "risNo", "dateFrom", "dateTo", "details"]
      .forEach((k) => { f[k].value = values[k] ?? ""; });
    $("#req-dialog-title").textContent = r ? `Update ${r.id}` : "Add request";
    $("#req-dialog-sub").textContent = r ? KINDS[r.kind] : "Log a request received on paper or by phone.";
    $("#req-delete").hidden = !r;
    reqDialog.showModal();
  }

  reqForm.querySelectorAll('[name="kind"]').forEach((k) => k.addEventListener("change", () => setReqKind(k.value)));
  reqDialog.querySelectorAll('button[value="cancel"]').forEach((b) => b.addEventListener("click", () => reqDialog.close()));
  $("#req-add").addEventListener("click", () => openReqDialog(null));

  reqForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = reqForm.elements;
    reqForm.querySelectorAll(".invalid").forEach((n) => n.classList.remove("invalid"));
    const invalid = [...f].filter((n) => n.willValidate && !n.closest("[hidden]") && !n.checkValidity());
    if (invalid.length) {
      invalid.forEach((n) => (n.type === "radio" ? n.closest("fieldset") : n).classList.add("invalid"));
      invalid[0].focus();
      $("#req-form-status").textContent = "Please complete the highlighted fields.";
      $("#req-form-status").className = "form-status error";
      return;
    }
    const kind = editingReq ? editingReq.kind : reqForm.querySelector('[name="kind"]:checked').value;
    const record = {
      ...(editingReq || {}),
      id: editingReq ? editingReq.id : newRequestId(kind === "fuel" ? "FR" : "RR"),
      kind, status: f.status.value, date: f.date.value, remarks: f.remarks.value.trim(),
      unit: f.unit.value.trim(), requestedBy: f.requestedBy.value.trim(), office: f.office.value.trim(),
      details: f.details.value.trim()
    };
    if (kind === "fuel") {
      Object.assign(record, { fuel: f.fuel.value, litres: f.litres.value, issuedLitres: f.issuedLitres.value,
        risNo: f.risNo.value.trim(), dateFrom: f.dateFrom.value, dateTo: f.dateTo.value });
    }
    saveRequest(record);
    reqDialog.close();
  });

  $("#req-delete").addEventListener("click", () => {
    if (!editingReq || !confirm(`Delete ${editingReq.id} from the monitoring list?`)) return;
    const published = publishedReqs.some((r) => r.id === editingReq.id);
    if (published) reqEdits[editingReq.id] = { deleted: true }; else delete reqEdits[editingReq.id];
    storage.set(REQ_KEY, reqEdits);
    renderRequests();
    reqDialog.close();
  });

  $("#req-discard").addEventListener("click", () => {
    if (!confirm("Discard all request changes saved in this browser?")) return;
    reqEdits = {};
    storage.set(REQ_KEY, reqEdits);
    renderRequests();
  });

  // Rebuild js/requests.js from the current list, one request per line.
  $("#req-download").addEventListener("click", () => {
    const header = [
      "// EMD request monitoring: fuel requisitions and maintenance / repair requests.",
      "// Updated from the website: log or update requests in \"Request monitoring\",",
      "// then \"Download requests.js\" and upload the file here (js/requests.js) on GitHub.",
      "// This file is public: contact numbers and emails are not recorded.",
      "// Fields: id, kind (\"fuel\" | \"repair\"), date (YYYY-MM-DD), requestedBy, office,",
      "// unit, details, status, updated (YYYY-MM-DD), remarks; fuel also has fuel,",
      "// litres, dateFrom, dateTo, risNo, issuedLitres; repairs also have",
      "// maintType (Preventive | Corrective | Express) and reading."
    ].join("\n");
    const list = allRequests().map((r) => "  " + JSON.stringify(cleanReq(r)));
    const blob = new Blob([`${header}\nwindow.EMD_REQUESTS = [\n${list.join(",\n")}${list.length ? "\n" : ""}];\n`], { type: "text/javascript" });
    const link = el("a", { href: URL.createObjectURL(blob), download: "requests.js" });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  renderRequests();

  // --- Request forms -----------------------------------------------------
  // No backend yet: nothing is sent to the EMD office. Each request is logged
  // in this browser's Request monitoring list so staff can publish it.
  document.querySelectorAll(".request-form").forEach((form) => {
    const status = form.querySelector(".form-status");
    const slipLink = form.querySelector(".slip-print");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.className = "form-status";
      form.querySelectorAll(".invalid").forEach((n) => n.classList.remove("invalid"));
      const f = form.elements;
      if (f.dateTo) f.dateTo.setCustomValidity(f.dateFrom.value && f.dateTo.value && f.dateTo.value < f.dateFrom.value ? "End date is before start date" : "");
      const invalid = [...form.elements].filter((n) => n.willValidate && !n.checkValidity());
      if (invalid.length) {
        invalid.forEach((n) => (n.type === "radio" ? n.closest("fieldset") : n).classList.add("invalid"));
        invalid[0].focus();
        status.textContent = f.dateTo && f.dateTo.validationMessage && f.dateTo.value
          ? "The 'to' date is before the 'from' date."
          : "Please complete the highlighted fields.";
        status.classList.add("error");
        return;
      }

      if (form.dataset.prefix === "RR") {
        // Log it, then open the printable maintenance request form.
        const id = newRequestId("RR");
        const unit = unitByOption.get(f.unit.value.trim());
        saveRequest({
          id, kind: "repair", date: todayISO, status: stages[0], unit: f.unit.value.trim(),
          requestedBy: f.name.value.trim(), office: f.office.value.trim(), details: f.details.value.trim(),
          maintType: f.maintType.value, reading: f.reading.value.trim()
        });
        const params = new URLSearchParams({
          requestNo: id, date: todayISO, name: f.name.value.trim(), office: f.office.value.trim(),
          section: f.section.value.trim(), makeModel: unit ? unit.makeModel : "",
          dpcn: unit ? unit.propertyNo : f.unit.value.trim(),
          plate: unit && unit.plateNo && !/^n\/?a$/i.test(unit.plateNo) ? unit.plateNo : "",
          reading: f.reading.value.trim(), type: f.maintType.value, details: f.details.value.trim(),
          notedBy: f.notedBy.value.trim()
        });
        slipLink.href = "repair-form.html?" + params;
        slipLink.hidden = false;
        status.textContent = `Your request form is ready (Request No. ${id}, also logged in Request monitoring on this computer). Print it or save it as a PDF, sign it, have your division chief note it, and bring it to the EMD office. Use the request no. to track the repair below.`;
      } else {
        // The requester prints the slip and brings it in.
        const unit = unitByOption.get(f.unit.value.trim());
        const plate = unit && unit.plateNo && !/^n\/?a$/i.test(unit.plateNo) ? ` (${unit.plateNo})` : "";
        const params = new URLSearchParams({
          name: f.name.value.trim(), designation: f.designation.value.trim(),
          receivedBy: f.receivedBy.value.trim(), receivedDesignation: f.receivedDesignation.value.trim(),
          division: f.division.value.trim(), office: f.office.value.trim(),
          propertyNo: unit ? unit.propertyNo : f.unit.value.trim(), forUse: unit ? unit.makeModel + plate : "",
          fuel: f.fuel.value, litres: f.litres.value, risNo: f.risNo.value.trim(),
          dateFrom: f.dateFrom.value, dateTo: f.dateTo.value,
          odoPresent: f.odoPresent.value.trim(), odoPrevious: f.odoPrevious.value.trim(),
          tankBalance: f.tankBalance.value.trim(), purpose: f.details.value.trim()
        });
        const id = newRequestId("FR");
        saveRequest({
          id, kind: "fuel", date: todayISO, status: fuelStatuses[0], unit: f.unit.value.trim(),
          requestedBy: f.name.value.trim(), office: [f.division.value.trim(), f.office.value.trim()].filter(Boolean).join(", "),
          details: f.details.value.trim(), fuel: f.fuel.value, litres: f.litres.value,
          dateFrom: f.dateFrom.value, dateTo: f.dateTo.value, risNo: f.risNo.value.trim()
        });
        slipLink.href = "fuel-slip.html?" + params;
        slipLink.hidden = false;
        status.textContent = `Your fuel slip is ready (logged as ${id} in Request monitoring on this computer). Print it or save it as a PDF, have it signed, and bring it to the EMD office with your trip ticket.`;
      }
      status.classList.add("success");
      form.reset();
    });
  });

  // --- Repair tracker ----------------------------------------------------
  const trackResult = $("#track-result");
  $("#track-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const ref = e.target.elements.ref.value.trim().toUpperCase();
    const job = allRequests().find((r) => r.kind === "repair" && r.id.toUpperCase() === ref);
    if (!job) {
      trackResult.replaceChildren(el("p", { class: "form-status error", text: `No repair found for "${ref}". Check the reference number, or call the EMD office.` }));
      return;
    }
    const stage = Math.max(0, stages.indexOf(job.status));
    trackResult.replaceChildren(el("div", { class: "track-card" },
      el("p", { class: "track-head" },
        el("b", { text: job.id }),
        document.createTextNode(` · ${job.unit} · updated ${fmtDate(job.updated || job.date)}`)),
      el("ol", { class: "stepper" }, stages.map((s, i) => el("li", {
        class: i < stage ? "done" : i === stage ? "current" : "",
        ...(i === stage ? { "aria-current": "step" } : {})
      }, el("span", { text: s })))),
      job.remarks ? el("p", { class: "track-remarks", text: job.remarks }) : ""));
  });

  // --- Forms -------------------------------------------------------------
  // Only files on this site or http(s) links.
  const safeHref = (f) => f && !/^[a-z][a-z0-9+.-]*:/i.test(f) || /^https?:\/\//i.test(f || "");
  $("#forms-list").replaceChildren(...(content.forms || []).filter((f) => f.title).map((f) => el("li", { class: "form-card" },
    el("div", {}, el("h3", { text: f.title }), f.description ? el("p", { text: f.description }) : ""),
    !safeHref(f.file)
      ? el("span", { class: "form-unavailable", text: "Available at the EMD office" })
      : f.file.endsWith(".html")
      ? el("a", { class: "btn btn-ghost btn-sm", href: f.file, target: "_blank", rel: "noopener", text: "Open printable form" })
      : /^https?:/i.test(f.file)
      ? el("a", { class: "btn btn-ghost btn-sm", href: f.file, target: "_blank", rel: "noopener", text: "Open form" })
      : el("a", { class: "btn btn-ghost btn-sm", href: f.file, download: "", text: "Download PDF" }))));

  // --- Charts ------------------------------------------------------------
  const tooltip = $("#chart-tooltip");
  function showTip(text, x, y) {
    tooltip.textContent = text;
    tooltip.hidden = false;
    const w = tooltip.offsetWidth;
    tooltip.style.left = Math.min(Math.max(8, x - w / 2), window.innerWidth - w - 8) + "px";
    tooltip.style.top = (y - tooltip.offsetHeight - 12) + "px";
  }
  const hideTip = () => { tooltip.hidden = true; };

  // Round the axis up to a tidy step (1, 2, 2.5 or 5 × 10ⁿ), at most 5 gridlines.
  function niceScale(v) {
    const raw = v / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((n) => n * mag).find((n) => n >= raw);
    const ticks = Math.ceil(v / step);
    return { max: ticks * step, ticks };
  }

  // Rounded data-end, anchored to the baseline.
  function barPath(x, y, w, h, horizontal) {
    const r = Math.min(4, horizontal ? h / 2 : w / 2, horizontal ? w : h);
    return horizontal
      ? `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`
      : `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function attachHover(hit, bar, text) {
    const on = (x, y) => { bar.classList.add("active"); showTip(text, x, y); };
    const off = () => { bar.classList.remove("active"); hideTip(); };
    hit.addEventListener("pointermove", (e) => on(e.clientX, e.clientY));
    hit.addEventListener("pointerleave", off);
    hit.addEventListener("focus", () => {
      const r = bar.getBoundingClientRect();
      on(r.left + r.width / 2, r.top);
    });
    hit.addEventListener("blur", off);
  }

  function barChart(container, data, { unit, horizontal }) {
    const W = 560, rowH = 40;
    const m = horizontal ? { t: 8, r: 56, b: 28, l: 118 } : { t: 24, r: 12, b: 28, l: 52 };
    const H = horizontal ? m.t + m.b + data.length * rowH : 280;
    const { max, ticks } = niceScale(Math.max(...data.map((d) => d.value)));
    const plotW = W - m.l - m.r, plotH = H - m.t - m.b;
    const scale = (v) => (v / max) * (horizontal ? plotW : plotH);
    const top = data.reduce((a, b) => (b.value > a.value ? b : a));

    const chart = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": container.dataset.label || "" });
    for (let i = 0; i <= ticks; i++) {
      const v = (max / ticks) * i;
      if (horizontal) {
        const x = m.l + scale(v);
        chart.append(svg("line", { class: i ? "grid" : "axis", x1: x, x2: x, y1: m.t, y2: H - m.b }));
        const t = svg("text", { class: "tick", x, y: H - 8, "text-anchor": "middle" });
        t.textContent = fmtNum(v);
        chart.append(t);
      } else {
        const y = H - m.b - scale(v);
        chart.append(svg("line", { class: i ? "grid" : "axis", x1: m.l, x2: W - m.r, y1: y, y2: y }));
        const t = svg("text", { class: "tick", x: m.l - 8, y: y + 4, "text-anchor": "end" });
        t.textContent = fmtNum(v);
        chart.append(t);
      }
    }

    const band = (horizontal ? plotH : plotW) / data.length;
    const thickness = Math.min(horizontal ? 22 : 40, band * 0.6);
    data.forEach((d, i) => {
      const len = scale(d.value);
      const offset = i * band + (band - thickness) / 2;
      const bar = horizontal
        ? svg("path", { class: "bar", d: barPath(m.l, m.t + offset, len, thickness, true) })
        : svg("path", { class: "bar", d: barPath(m.l + offset, H - m.b - len, thickness, len, false) });
      const hit = horizontal
        ? svg("rect", { class: "hit", x: m.l, y: m.t + i * band, width: plotW, height: band, tabindex: 0 })
        : svg("rect", { class: "hit", x: m.l + i * band, y: m.t, width: band, height: plotH, tabindex: 0 });
      const label = svg("text", horizontal
        ? { class: "cat", x: m.l - 10, y: m.t + i * band + band / 2 + 4, "text-anchor": "end" }
        : { class: "cat", x: m.l + i * band + band / 2, y: H - 8, "text-anchor": "middle" });
      label.textContent = d.label;
      chart.append(bar, label);

      // Direct label on the highest value only.
      if (d === top) {
        const v = svg("text", horizontal
          ? { class: "value", x: m.l + len + 8, y: m.t + offset + thickness / 2 + 4 }
          : { class: "value", x: m.l + offset + thickness / 2, y: H - m.b - len - 8, "text-anchor": "middle" });
        v.textContent = fmtNum(d.value);
        chart.append(v);
      }
      const text = `${d.label}: ${fmtNum(d.value)} ${unit}`;
      hit.setAttribute("aria-label", text);
      chart.append(hit);
      attachHover(hit, bar, text);
    });
    container.replaceChildren(chart);
  }

  function dataTable(container, data, valueHead) {
    container.replaceChildren(el("table", { class: "simple-table" },
      el("thead", {}, el("tr", {}, el("th", { scope: "col", text: "" }), el("th", { scope: "col", text: valueHead }))),
      el("tbody", {}, data.map((d) => el("tr", {}, el("td", { text: d.label }), el("td", { text: fmtNum(d.value) }))))));
  }

  const reports = window.EMD_REPORTS || {};
  $("#util-period").textContent = reports.utilizationPeriod || "";
  $("#fuel-period").textContent = reports.fuelPeriod || "";
  $("#chart-util").dataset.label = "Operating hours by equipment type";
  $("#chart-fuel").dataset.label = "Monthly fuel consumption in litres";
  if (reports.utilization) {
    barChart($("#chart-util"), reports.utilization, { unit: "hours", horizontal: true });
    dataTable($("#table-util"), reports.utilization, "Operating hours");
  }
  if (reports.fuel) {
    barChart($("#chart-fuel"), reports.fuel, { unit: "litres", horizontal: false });
    dataTable($("#table-fuel"), reports.fuel, "Litres");
  }
  window.addEventListener("scroll", hideTip, { passive: true });

  // --- Announcements -----------------------------------------------------
  const news = (content.announcements || []).filter((n) => n.title || n.body)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  $("#news-list").replaceChildren(...news.map((n) => el("article", { class: "news-item" },
    n.date ? el("time", { datetime: n.date, text: fmtDate(n.date) }) : "",
    el("h3", { text: n.title }),
    el("p", { text: n.body }))));
  $("#announcements").hidden = !news.length;

  // --- Organization ------------------------------------------------------
  const org = content.org || {};
  const sections = (org.sections || []).filter((s) => s.role || s.name);
  const servedOffices = (org.officesServed || []).map((o) => o.trim()).filter(Boolean);
  const person = (p, cls) => el("div", { class: "org-node " + cls },
    el("b", { text: p.role }), el("span", { text: p.name }),
    (p.staff || []).some((x) => x.trim())
      ? el("ul", { class: "org-staff" }, p.staff.filter((x) => x.trim()).map((x) => el("li", { text: x })))
      : "");
  if (org.chief) {
    $("#org-chart").replaceChildren(
      person(org.chief, sections.length ? "org-chief" : "org-chief org-alone"),
      sections.length ? el("div", { class: "org-sections" }, sections.map((s) => person(s, ""))) : "");
  }
  $("#offices-served").replaceChildren(...servedOffices.map((o) => el("li", { text: o })));
  $(".served").hidden = !servedOffices.length;
})();
