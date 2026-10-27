(function () {
  "use strict";

  const config = window.EMD_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);
  const DRAFT_KEY = "emd-admin-draft";

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

  const storage = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ }
    }
  };

  const savedTheme = storage.get("emd-theme", null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  const localISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // --- Content model -----------------------------------------------------
  // Keeps only the fields the website uses, trimmed, so the published file
  // and the draft compare equal when nothing has really changed.
  const str = (v) => (v == null ? "" : String(v)).trim();
  function clean(c) {
    const org = c.org || {};
    return {
      announcements: (c.announcements || []).map((n) => ({ date: str(n.date), title: str(n.title), body: str(n.body) })),
      org: {
        chief: { role: str((org.chief || {}).role), name: str((org.chief || {}).name) },
        sections: (org.sections || []).map((s) => {
          const out = { role: str(s.role), name: str(s.name) };
          const staff = (s.staff || []).map(str).filter(Boolean);
          if (staff.length) out.staff = staff;
          return out;
        }),
        officesServed: (org.officesServed || []).map(str).filter(Boolean)
      },
      forms: (c.forms || []).map((f) => ({ title: str(f.title), description: str(f.description), file: str(f.file) || null })),
      password: c.password && c.password.hash
        ? { salt: str(c.password.salt), iterations: Number(c.password.iterations), hash: str(c.password.hash) }
        : null
    };
  }
  // Drop rows left completely empty.
  function publishable(c) {
    const out = clean(c);
    out.announcements = out.announcements.filter((n) => n.title || n.body)
      .sort((a, b) => b.date.localeCompare(a.date));
    out.org.sections = out.org.sections.filter((s) => s.role || s.name || s.staff);
    out.forms = out.forms.filter((f) => f.title || f.description || f.file);
    return out;
  }

  const published = clean({
    announcements: window.EMD_ANNOUNCEMENTS,
    org: window.EMD_ORG,
    forms: window.EMD_FORMS,
    password: window.EMD_ADMIN_PASSWORD
  });
  const same = (a, b) => JSON.stringify(publishable(a)) === JSON.stringify(publishable(b));

  let draft = storage.get(DRAFT_KEY, null);
  // A saved draft that matches the published site has been uploaded already.
  if (draft && same(draft, published)) { storage.remove(DRAFT_KEY); draft = null; }
  let content = clean(draft || published);

  function save() {
    if (same(content, published)) storage.remove(DRAFT_KEY);
    else storage.set(DRAFT_KEY, content);
    updateBar();
  }

  function updateBar() {
    const changed = !same(content, published);
    $("#admin-bar").classList.toggle("admin-bar-clean", !changed);
    $("#admin-state").replaceChildren(changed
      ? el("span", {}, el("b", { text: "Unpublished changes. " }), "Saved in this browser only. Download content.js and upload it to GitHub to publish.")
      : el("span", { text: "No changes. The website shows what is below." }));
    $("#admin-discard").hidden = !changed;
  }

  // --- GitHub links ------------------------------------------------------
  const gh = config.github || {};
  if (gh.repo && gh.branch) {
    const base = `https://github.com/${gh.repo}/upload/${gh.branch}/`;
    $("#upload-js").href = base + "js";
    $("#upload-forms").href = base + "forms";
  }

  // --- Editing helpers ---------------------------------------------------
  // A text input bound to obj[key]; saving does not re-render, so typing keeps focus.
  function input(label, obj, key, attrs, onChange) {
    const tag = (attrs && attrs.rows) ? "textarea" : "input";
    const node = el(tag, attrs || {});
    node.value = obj[key] || "";
    node.addEventListener("input", () => { obj[key] = node.value; save(); if (onChange) onChange(); });
    return el("label", { class: "field" }, el("span", {}, ...[].concat(label)), node);
  }

  function rowTools(list, i, render, what) {
    const move = (to) => {
      const [item] = list.splice(i, 1);
      list.splice(to, 0, item);
      save();
      render();
    };
    const up = el("button", { class: "edit-btn", type: "button", "aria-label": `Move ${what} up`, text: "↑" });
    const down = el("button", { class: "edit-btn", type: "button", "aria-label": `Move ${what} down`, text: "↓" });
    const del = el("button", { class: "btn btn-link", type: "button", text: "Delete" });
    up.disabled = i === 0;
    down.disabled = i === list.length - 1;
    up.addEventListener("click", () => move(i - 1));
    down.addEventListener("click", () => move(i + 1));
    del.addEventListener("click", () => {
      if (!confirm(`Delete this ${what}?`)) return;
      list.splice(i, 1);
      save();
      render();
    });
    return el("div", { class: "admin-tools" }, up, down, del);
  }

  const optional = (text) => [text + " ", el("em", { text: "(optional)" })];

  // --- Announcements -----------------------------------------------------
  function renderNews() {
    const list = content.announcements;
    $("#news-edit").replaceChildren(...(list.length ? list.map((n, i) => el("div", { class: "admin-card form" },
      el("div", { class: "form-row admin-row-date" },
        input("Date", n, "date", { type: "date" }),
        input("Title", n, "title", { required: "" })),
      input("Message", n, "body", { rows: 4 }),
      rowTools(list, i, renderNews, "announcement"))) : [el("p", { class: "empty", text: "No announcements. The section is hidden on the website." })]));
  }
  $("#add-news").addEventListener("click", () => {
    content.announcements.unshift({ date: localISO(new Date()), title: "", body: "" });
    save();
    renderNews();
    $("#news-edit input[required]").focus();
  });

  // --- Organization ------------------------------------------------------
  function renderOrgPreview() {
    const org = publishable(content).org;
    const person = (p, cls) => el("div", { class: "org-node " + cls },
      el("b", { text: p.role }), el("span", { text: p.name }),
      p.staff ? el("ul", { class: "org-staff" }, p.staff.map((s) => el("li", { text: s }))) : "");
    $("#org-chart").replaceChildren(
      person(org.chief, "org-chief"),
      el("div", { class: "org-sections" }, org.sections.map((s) => person(s, ""))));
  }

  function renderSections() {
    const list = content.org.sections;
    $("#sections-edit").replaceChildren(...list.map((s, i) => {
      const staff = el("textarea", { rows: 3, placeholder: "e.g. Juan Dela Cruz, Mechanic" });
      staff.value = (s.staff || []).join("\n");
      staff.addEventListener("input", () => { s.staff = staff.value.split("\n"); save(); renderOrgPreview(); });
      return el("div", { class: "admin-card form" },
        el("div", { class: "form-row" },
          input("Section or unit", s, "role", {}, renderOrgPreview),
          input("Head", s, "name", {}, renderOrgPreview)),
        el("label", { class: "field" }, el("span", {}, ...optional("Staff, one per line")), staff),
        rowTools(list, i, () => { renderSections(); renderOrgPreview(); }, "section"));
    }));
  }

  const chief = content.org.chief;
  [["#chief-name", "name"], ["#chief-role", "role"]].forEach(([sel, key]) => {
    const node = $(sel);
    node.value = chief[key];
    node.addEventListener("input", () => { chief[key] = node.value; save(); renderOrgPreview(); });
  });
  const offices = $("#offices");
  offices.value = content.org.officesServed.join("\n");
  offices.addEventListener("input", () => { content.org.officesServed = offices.value.split("\n"); save(); });

  $("#add-section").addEventListener("click", () => {
    content.org.sections.push({ role: "", name: "" });
    save();
    renderSections();
    renderOrgPreview();
    const inputs = document.querySelectorAll("#sections-edit .admin-card:last-child input");
    if (inputs[0]) inputs[0].focus();
  });

  // --- Forms -------------------------------------------------------------
  // A PDF chosen here is served from forms/ under a web-safe name.
  const safeName = (name) => name.toLowerCase().replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + ".pdf";
  const isLink = (f) => /^https?:\/\//i.test(f);

  // Check whether a file in this repository is on the live site yet.
  const fileChecks = new Map();
  function checkFile(path, note) {
    if (!fileChecks.has(path)) {
      fileChecks.set(path, fetch(path, { method: "HEAD", cache: "no-store" }).then((r) => r.ok).catch(() => null));
    }
    fileChecks.get(path).then((ok) => {
      if (ok === true) { note.className = "admin-file ok"; note.textContent = "✓ On the website"; }
      else if (ok === false) {
        note.className = "admin-file missing";
        note.replaceChildren(`Not uploaded yet: upload the PDF to the forms folder on GitHub, named exactly ${path.replace(/^forms\//, "")}`);
      }
    });
  }

  function fileNote(f) {
    const note = el("p", { class: "admin-file" });
    if (!f.file) note.textContent = "No file: the website shows “Available at the EMD office”.";
    else if (f.file.endsWith(".html")) note.textContent = "Printable form on this website.";
    else if (isLink(f.file)) note.textContent = "Link to a file on another website.";
    else checkFile(f.file, note);
    return note;
  }

  function renderForms() {
    const list = content.forms;
    $("#forms-edit").replaceChildren(...list.map((f, i) => {
      const card = el("div", { class: "admin-card form" });
      let note = fileNote(f);
      let clear;
      const refreshNote = () => {
        const n = fileNote(f);
        note.replaceWith(n);
        note = n;
        clear.hidden = !f.file;
      };
      const fileField = input(optional("File or link"), f, "file", { placeholder: "forms/trip-ticket.pdf or https://…" }, refreshNote);
      const fileInput = fileField.querySelector("input");
      const pick = el("input", { type: "file", accept: "application/pdf,.pdf", class: "sr-only" });
      const pickBtn = el("button", { class: "btn btn-ghost btn-sm", type: "button", text: "Choose PDF…" });
      clear = el("button", { class: "btn btn-link", type: "button", text: "Remove file" });
      pickBtn.addEventListener("click", () => pick.click());
      pick.addEventListener("change", () => {
        const file = pick.files[0];
        if (!file) return;
        f.file = "forms/" + safeName(file.name);
        fileInput.value = f.file;
        save();
        refreshNote();
        if (safeName(file.name) !== file.name) {
          alert(`Upload this PDF to the forms folder on GitHub as:\n\n${safeName(file.name)}\n\nRename it first, or the download link will not work.`);
        }
      });
      clear.addEventListener("click", () => { f.file = null; fileInput.value = ""; save(); refreshNote(); });
      card.append(
        input("Title", f, "title", { required: "" }),
        input(optional("Description"), f, "description", { rows: 2 }),
        fileField,
        el("div", { class: "admin-file-actions" }, pickBtn, pick, clear),
        note,
        rowTools(list, i, renderForms, "form"));
      clear.hidden = !f.file;
      if (f.file && f.file.endsWith(".html")) {
        fileInput.readOnly = true;
        pickBtn.hidden = true;
        clear.hidden = true;
      }
      return card;
    }));
  }
  $("#add-form").addEventListener("click", () => {
    content.forms.push({ title: "", description: "", file: null });
    save();
    renderForms();
    document.querySelector("#forms-edit .admin-card:last-child input").focus();
  });

  // --- Publish -----------------------------------------------------------
  function contentFile(c) {
    const lines = (list) => list.length ? "\n" + list.map((x) => "  " + JSON.stringify(x)).join(",\n") + "\n" : "";
    return [
      "// Announcements, organization chart and downloadable forms.",
      "// Edit these on the website's Admin page (admin.html): it downloads a new",
      "// copy of this file to upload here as js/content.js. You can also edit it directly.",
      "",
      "// Announcements: date as YYYY-MM-DD. The website shows the newest first.",
      `window.EMD_ANNOUNCEMENTS = [${lines(c.announcements)}];`,
      "",
      "// Organization chart. staff (optional) is a list of names shown under a section.",
      `window.EMD_ORG = ${JSON.stringify(c.org, null, 2)};`,
      "",
      "// Forms. file: a PDF in forms/ (e.g. \"forms/trip-ticket.pdf\"), a link (https://…),",
      "// one of the website's printable forms (.html), or null for \"Available at the EMD office\".",
      `window.EMD_FORMS = [${lines(c.forms)}];`,
      "",
      "// Admin page password, stored as a salted PBKDF2-SHA256 hash (not the password",
      "// itself). Change it on the Admin page. null: the Admin page opens without one.",
      `window.EMD_ADMIN_PASSWORD = ${JSON.stringify(c.password)};`,
      ""
    ].join("\n");
  }

  $("#admin-download").addEventListener("click", () => {
    const out = publishable(content);
    const problems = [];
    if (out.announcements.some((n) => !n.title)) problems.push("an announcement has no title");
    if (out.announcements.some((n) => !n.date)) problems.push("an announcement has no date");
    if (out.forms.some((f) => !f.title)) problems.push("a form has no title");
    if (problems.length && !confirm(`Check before publishing: ${problems.join("; ")}.\n\nDownload anyway?`)) return;
    const blob = new Blob([contentFile(out)], { type: "text/javascript" });
    const link = el("a", { href: URL.createObjectURL(blob), download: "content.js" });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  $("#admin-discard").addEventListener("click", () => {
    if (!confirm("Discard all unpublished changes in this browser?")) return;
    storage.remove(DRAFT_KEY);
    content = clean(published);
    location.reload();
  });

  // --- Password ----------------------------------------------------------
  // A lock against casual visitors. The real protection is GitHub: nothing
  // reaches the website unless someone with access to the repository uploads it.
  const SESSION_KEY = "emd-admin-session";
  const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  async function hashPassword(password, salt, iterations) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations }, key, 256);
    return hex(bits);
  }
  const session = {
    get() { try { return sessionStorage.getItem(SESSION_KEY); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem(SESSION_KEY, v); } catch (e) { /* storage unavailable */ } },
    clear() { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* storage unavailable */ } }
  };

  const live = published.password;
  function unlock() {
    $("#admin-lock").hidden = true;
    $("#main").hidden = false;
    $("#sign-out").hidden = !live;
    renderNews();
    renderSections();
    renderOrgPreview();
    renderForms();
    updateBar();
  }

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#login-status");
    const pw = $("#login-password");
    status.textContent = "Checking…";
    let ok = false;
    try { ok = (await hashPassword(pw.value, live.salt, live.iterations)) === live.hash; } catch (err) { /* no WebCrypto */ }
    if (!ok) {
      status.textContent = window.crypto && crypto.subtle ? "Wrong password. Try again." : "This browser can't check the password. Open the page over https.";
      pw.select();
      return;
    }
    session.set(live.hash);
    pw.value = "";
    status.textContent = "";
    unlock();
  });

  $("#sign-out").addEventListener("click", () => {
    session.clear();
    location.reload();
  });

  $("#password-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const a = $("#new-password"), b = $("#new-password-2"), status = $("#password-status");
    if (a.value.length < 10) { status.textContent = "Use at least 10 characters."; a.focus(); return; }
    if (a.value !== b.value) { status.textContent = "The two passwords don't match."; b.select(); return; }
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    const iterations = 310000;
    content.password = { salt, iterations, hash: await hashPassword(a.value, salt, iterations) };
    save();
    a.value = b.value = "";
    status.textContent = "New password set. Download content.js and upload it to GitHub to start using it.";
  });

  // No password published yet, or already signed in this browser session.
  if (!live || session.get() === live.hash) unlock();
  else $("#login-password").focus();

  // Exposed for the website's preview and for tests.
  window.EMD_ADMIN = { contentFile, publishable };
})();
