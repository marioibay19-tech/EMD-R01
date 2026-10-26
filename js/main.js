(function () {
  "use strict";

  const inventory = window.EMD_INVENTORY || [];
  const $ = (sel) => document.querySelector(sel);

  // --- Theme -------------------------------------------------------------
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("emd-theme");
    if (saved) root.dataset.theme = saved;
  } catch (e) { /* storage unavailable */ }

  $(".theme-toggle").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("emd-theme", root.dataset.theme); } catch (e) { /* ignore */ }
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
  const count = (status) => inventory.filter((i) => i.status === status).length;
  $("#stat-total").textContent = inventory.length;
  $("#stat-available").textContent = count("Available");
  $("#stat-maintenance").textContent = count("Maintenance");

  // --- Inventory table ---------------------------------------------------
  const search = $("#inv-search");
  const category = $("#inv-category");
  const status = $("#inv-status");
  const body = $("#inv-body");
  let sortKey = "tag";
  let sortDir = 1;

  [...new Set(inventory.map((i) => i.category))].sort().forEach((c) => {
    category.add(new Option(c, c));
  });

  const datalist = $("#equipment-list");
  inventory.forEach((i) => datalist.appendChild(new Option(`${i.tag} — ${i.name}`)));

  const statusClass = (s) => "badge badge-" + s.toLowerCase().replace(/\s+/g, "-");

  function render() {
    const q = search.value.trim().toLowerCase();
    const rows = inventory
      .filter((i) =>
        (!q || [i.tag, i.name, i.location].some((v) => v.toLowerCase().includes(q))) &&
        (!category.value || i.category === category.value) &&
        (!status.value || i.status === status.value))
      .sort((a, b) => a[sortKey].localeCompare(b[sortKey]) * sortDir);

    body.replaceChildren(...rows.map((i) => {
      const tr = document.createElement("tr");
      [i.tag, i.name, i.category, i.location, i.nextService].forEach((v, idx) => {
        const td = document.createElement("td");
        td.textContent = v;
        td.dataset.label = ["Tag no.", "Equipment", "Category", "Location", "Next service"][idx];
        tr.appendChild(td);
      });
      const td = document.createElement("td");
      td.dataset.label = "Status";
      const badge = document.createElement("span");
      badge.className = statusClass(i.status);
      badge.textContent = i.status;
      td.appendChild(badge);
      tr.appendChild(td);
      return tr;
    }));

    $("#inv-empty").hidden = rows.length > 0;
    $("#inv-count").textContent = `Showing ${rows.length} of ${inventory.length} items`;
    document.querySelectorAll("[data-sort]").forEach((btn) => {
      const th = btn.closest("th");
      th.setAttribute("aria-sort", btn.dataset.sort === sortKey ? (sortDir === 1 ? "ascending" : "descending") : "none");
    });
  }

  [search, category, status].forEach((el) => el.addEventListener("input", render));
  document.querySelectorAll("[data-sort]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sort;
      sortDir = key === sortKey ? -sortDir : 1;
      sortKey = key;
      render();
    });
  });
  render();

  // --- Request form ------------------------------------------------------
  const form = $("#request-form");
  const formStatus = $("#form-status");
  form.elements.date.min = new Date().toISOString().slice(0, 10);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.className = "form-status";
    const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    if (invalid.length) {
      invalid.forEach((el) => el.classList.add("invalid"));
      invalid[0].focus();
      formStatus.textContent = "Please complete the highlighted fields.";
      formStatus.classList.add("error");
      return;
    }
    // No backend yet: generate a reference number so users get confirmation.
    const ref = "REQ-" + Date.now().toString(36).toUpperCase();
    formStatus.textContent = `Thank you! Your request has been recorded. Reference: ${ref}`;
    formStatus.classList.add("success");
    form.reset();
  });

  $("#year").textContent = new Date().getFullYear();
})();
