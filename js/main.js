(function () {
  "use strict";

  const config = window.EMD_CONFIG || {};
  const fleet = window.EMD_FLEET || [];
  const stages = window.EMD_REPAIR_STAGES || [];
  const repairs = window.EMD_REPAIRS || [];
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

  [...new Set(fleet.map((u) => u.type))].sort().forEach((t) => typeFilter.add(new Option(t, t)));
  offices.forEach((o) => officeFilter.add(new Option(o, o)));

  const unitList = $("#unit-list");
  fleet.forEach((u) => unitList.appendChild(new Option(`${u.propertyNo} — ${u.plateNo} ${u.makeModel}`)));

  function renderFleet() {
    const q = search.value.trim().toLowerCase();
    const sortValue = (u) => sortKey === "parDate" || sortKey === "ltoDate" ? dateKey(u[sortKey]) : u[sortKey];
    const rows = fleet
      .filter((u) =>
        (!q || [u.propertyNo, u.plateNo, u.type, u.makeModel, u.office, u.endUser, u.position]
          .some((v) => (v || "").toLowerCase().includes(q))) &&
        (!typeFilter.value || u.type === typeFilter.value) &&
        (!officeFilter.value || officeGroup(u.office) === officeFilter.value) &&
        (!parFilter || parStatus(u) === parFilter))
      .sort((a, b) => {
        if (!sortKey) return 0;
        // Blank values always sort last, whichever direction.
        const va = sortValue(a), vb = sortValue(b);
        if (!va || !vb) return !va - !vb;
        return va.localeCompare(vb, "en", { numeric: true }) * sortDir;
      });

    fleetBody.replaceChildren(...rows.map((u) => el("tr", {},
      el("td", { "data-label": "Property no.", text: u.propertyNo }),
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
      el("td", { "data-label": "LTO registration", text: dash(u.ltoDate) })
    )));

    $("#fleet-empty").hidden = rows.length > 0;
    $("#fleet-count").textContent = `Showing ${rows.length} of ${fleet.length} units`;
    document.querySelectorAll("#fleet-table [data-sort]").forEach((btn) => {
      btn.closest("th").setAttribute("aria-sort",
        btn.dataset.sort === sortKey ? (sortDir === 1 ? "ascending" : "descending") : "none");
    });
    chipButtons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.par === parFilter)));
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
    btn.addEventListener("click", () => { parFilter = key; renderFleet(); });
    return btn;
  });
  $("#condition-chips").replaceChildren(...chipButtons);

  [search, typeFilter, officeFilter].forEach((node) => node.addEventListener("input", renderFleet));
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

  // --- Request forms -----------------------------------------------------
  // No backend yet: submissions are confirmed on the page, and repair
  // requests are remembered in this browser so they can be tracked.
  const localRepairs = () => storage.get("emd-repairs", []);

  document.querySelectorAll(".request-form").forEach((form) => {
    const status = form.querySelector(".form-status");
    const dateInput = form.elements.date;
    if (dateInput) dateInput.min = today.toISOString().slice(0, 10);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.className = "form-status";
      form.querySelectorAll(".invalid").forEach((n) => n.classList.remove("invalid"));
      const invalid = [...form.elements].filter((n) => n.willValidate && !n.checkValidity());
      if (invalid.length) {
        invalid.forEach((n) => (n.type === "radio" ? n.closest("fieldset") : n).classList.add("invalid"));
        invalid[0].focus();
        status.textContent = "Please complete the highlighted fields.";
        status.classList.add("error");
        return;
      }

      const ref = `${form.dataset.prefix}-${today.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      if (form.dataset.prefix === "RR") {
        const unit = form.elements.unit.value;
        storage.set("emd-repairs", [...localRepairs(), {
          ref, propertyNo: unit.split(" — ")[0], unit, stage: 0,
          updated: today.toISOString().slice(0, 10), remarks: "Waiting for pre-repair inspection."
        }]);
        status.textContent = `Repair request received. Reference: ${ref}. Use it to track the repair below.`;
      } else {
        status.textContent = `Fuel requisition received. Reference: ${ref}. Bring your trip ticket when claiming the fuel.`;
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
    const job = [...repairs, ...localRepairs()].find((r) => r.ref.toUpperCase() === ref);
    if (!job) {
      trackResult.replaceChildren(el("p", { class: "form-status error", text: `No repair found for "${ref}". Check the reference number, or call the EMD office.` }));
      return;
    }
    trackResult.replaceChildren(el("div", { class: "track-card" },
      el("p", { class: "track-head" },
        el("b", { text: job.ref }),
        document.createTextNode(` · ${job.unit} · updated ${fmtDate(job.updated)}`)),
      el("ol", { class: "stepper" }, stages.map((s, i) => el("li", {
        class: i < job.stage ? "done" : i === job.stage ? "current" : "",
        ...(i === job.stage ? { "aria-current": "step" } : {})
      }, el("span", { text: s })))),
      job.remarks ? el("p", { class: "track-remarks", text: job.remarks }) : ""));
  });

  // --- Citizen's Charter -------------------------------------------------
  const table = (head, rows) => el("div", { class: "table-scroll" }, el("table", { class: "charter-table" },
    el("thead", {}, el("tr", {}, head.map((h) => el("th", { scope: "col", text: h })))),
    el("tbody", {}, rows.map((r) => el("tr", {}, r.map((c) => el("td", { text: c })))))));

  $("#charter-list").replaceChildren(...(window.EMD_CHARTER || []).map((svc, i) => el("details", { class: "charter-item", ...(i === 0 ? { open: "" } : {}) },
    el("summary", {}, el("span", { text: svc.service }), el("span", { class: "chip", text: svc.total })),
    el("dl", { class: "charter-meta" },
      el("div", {}, el("dt", { text: "Classification" }), el("dd", { text: svc.classification })),
      el("div", {}, el("dt", { text: "Type of transaction" }), el("dd", { text: svc.transaction })),
      el("div", {}, el("dt", { text: "Who may avail" }), el("dd", { text: svc.whoMayAvail }))),
    el("h4", { text: "Requirements" }),
    table(["Checklist of requirements", "Where to secure"], svc.requirements),
    el("h4", { text: "Steps" }),
    table(["Client steps", "Agency actions", "Fees", "Processing time", "Person responsible"], svc.steps),
    el("p", { class: "charter-total" }, el("b", { text: "Total processing time: " }), document.createTextNode(svc.total)))));

  // --- Forms -------------------------------------------------------------
  $("#forms-list").replaceChildren(...(window.EMD_FORMS || []).map((f) => el("li", { class: "form-card" },
    el("div", {}, el("h3", { text: f.title }), el("p", { text: f.description })),
    f.file
      ? el("a", { class: "btn btn-ghost btn-sm", href: f.file, download: "", text: "Download PDF" })
      : el("span", { class: "form-unavailable", text: "Available at the EMD office" }))));

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
    container.replaceChildren(el("table", { class: "charter-table" },
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
  $("#news-list").replaceChildren(...(window.EMD_ANNOUNCEMENTS || []).map((n) => el("article", { class: "news-item" },
    el("time", { datetime: n.date, text: fmtDate(n.date) }),
    el("h3", { text: n.title }),
    el("p", { text: n.body }))));

  // --- Organization ------------------------------------------------------
  const org = window.EMD_ORG || { sections: [], officesServed: [] };
  const person = (p, cls) => el("div", { class: "org-node " + cls }, el("b", { text: p.role }), el("span", { text: p.name }));
  if (org.chief) {
    $("#org-chart").replaceChildren(
      person(org.chief, "org-chief"),
      el("div", { class: "org-sections" }, org.sections.map((s) => person(s, ""))));
  }
  $("#offices-served").replaceChildren(...org.officesServed.map((o) => el("li", { text: o })));
})();
