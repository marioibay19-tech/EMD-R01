# DPWH Equipment Management Division — Website

A static, dependency-free web page for the Equipment Management Division (EMD).

## Sections
- **Quick actions**: repair request, fuel requisition, repair tracking and the emergency hotline, right below the header
- **Fleet status**: the division's 133 units with plate no., assigned office, end-user, PAR and LTO registration dates; filter by type, office or PAR status (with PAR, awaiting updated PAR, none on record); LTO registration status (expired, due within 30 days, registered) worked out from the plate number:
  the last digit sets the month (1 = Jan … 9 = Sep, 0 = Oct), the second-to-last digit the week (1–3: days 1–7, 4–6: 8–14, 7–8: 15–21, 9/0: 22–end), and the year is the one after the recorded LTO registration. Set `ltoDue: "YYYY-MM-DD"` on a unit in `js/fleet.js` (or the override field in **Edit**) to override it, e.g. for a brand-new vehicle with a multi-year first registration
- **PMS schedule**: units due in the next 30 days grouped by month, with overdue / due-soon flags and a "Show all" option
- **Disaster response readiness**: alert level, emergency hotline, and standby units by type
- **Requests**: maintenance/repair form that fills in a printable **Equipment and Service Vehicle Maintenance Request Form** (`repair-form.html`, Regional Office I layout, with the request no. used for tracking), and a fuel requisition form that fills in a printable **Requisition and Issue Slip (Fuel)** (`fuel-slip.html`, Appendix 63, Regional Office I layout) to print or save as PDF, sign and bring to the EMD office
- **Request monitoring**: fuel requisitions (Pending → Approved → Issued / Disapproved) and maintenance / repair requests (by repair stage), with totals, filters and search
- **Repair tracker**: look up a repair by reference number and see its stage
  (request received → pre-repair inspection → job order → repair → post-repair inspection → released), from the published monitoring list
- **Forms**: blank maintenance request form and fuel slip (printable), trip ticket, inspection reports, job order, PAR, and more
- **Reports**: operating hours by equipment type and monthly fuel consumption
- **Announcements**, **Organization** (division chief, sections, staff, offices served) and **Contact**
- **Admin** (`admin.html`): edit announcements, the organization chart and forms without touching code

Responsive down to phone width, with light/dark mode (follows the system, toggle in the header).

## Using it on a phone
Open https://marioibay19-tech.github.io/EMD-R01/ in the phone's browser. To keep it on the home screen like an app (it opens full screen with the EMD icon):
- **Android (Chrome):** tap the **⋮** menu → **Add to Home screen** (or **Install app**).
- **iPhone (Safari):** tap **Share** → **Add to Home Screen**.

The fleet list shows 25 units at a time with **Show more**; search and filters always cover all units. The fuel slip shrinks to fit the screen but still prints or saves as a full A4 page. The app needs an internet connection; it always shows the latest published data.

## Run locally
Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Updating the fleet (LTO registration and other details)
1. On the website, find the unit in **Fleet status** and click **Edit**.
2. Change the date of LTO registration (or plate no., PAR date, office, end-user, position). The dialog shows the new LTO status before you save.
3. Changes are saved **in that browser only**; a yellow bar shows how many units changed.
4. Click **Download fleet.js**, then on GitHub open the `js` folder → **Add file** → **Upload files**, drop in `fleet.js` and **Commit changes**.
5. The live site updates in a few minutes for everyone. The browser's saved changes clear themselves once the published list matches.

Anyone can make edits in their own browser, but only people with write access to this GitHub repository can publish them.

## Updating request monitoring
1. Requests prepared with the website's repair or fuel form are logged automatically in **Request monitoring** on that computer. For requests received on paper or by phone, click **Add request**.
2. Click **Edit** on a request to update its status, remarks, liters issued or RIS No.
3. Click **Download requests.js**, then on GitHub open the `js` folder → **Add file** → **Upload files**, drop in `requests.js` and **Commit changes**. Everyone then sees the updated list, and the repair tracker shows the new stage.

Requests made on another person's computer stay on that computer, so log the paper slip or request at the EMD office. The list is public; contact numbers and emails are not recorded. As with the fleet, have one person publish at a time.

## Admin page: announcements, organization chart and forms
Open **admin.html** (linked as **Admin** in the footer).
1. Post, edit or delete announcements; edit the division head, sections, section heads, staff and offices served; add, reorder or remove forms. Changes are saved in that browser as you type.
2. Click **Preview on the website** to see the site with your changes.
3. Click **Download content.js**, then use the link on the page to open the `js` folder on GitHub, drop in `content.js` and **Commit changes**. The site updates in about a minute.

To offer a PDF form for download, click **Choose PDF…** on the form, then upload the same PDF to the `forms` folder on GitHub (the page shows the exact file name to use and whether it is on the website yet). A link to a file elsewhere, such as Google Drive, also works.

The Admin page asks for a password (change it under **Password** on the page; the new one takes effect once content.js is uploaded). Only a salted hash of it is stored, in `js/content.js`. The password keeps casual visitors out of the editor, but the site has no server, so it is not real security: the actual protection is that only people who can commit to this GitHub repository can publish. To let a colleague publish, add them under **Settings → Collaborators** on GitHub.

## Updating the content
The fleet list is in `js/fleet.js`, request monitoring in `js/requests.js`, and announcements, the organization chart and forms in `js/content.js`; everything else lives in `js/data.js`. The fleet list and office location are real; the other sections still hold **sample data**.

Engine serial numbers are deliberately not published: this repository and site are public.

| What | Where (in `js/data.js` unless noted) |
|---|---|
| Office name, address, phone, hotline, email | `EMD_CONFIG` |
| Fuel slip letterhead and signatories (Approved by, Issued by) | `EMD_CONFIG.fuelSlip` |
| Maintenance request form letterhead and EMD approver | `EMD_CONFIG.repairForm` |
| Disaster alert level and message | `EMD_CONFIG.alertLevel` (`"normal"` or `"alert"`), `alertMessage` |
| Fleet list (and, when available, condition, PMS dates, standby units) | `EMD_FLEET` in `js/fleet.js` (or use **Edit** on the website) |
| Request monitoring and repair tracker | `EMD_REQUESTS` in `js/requests.js` (or use **Request monitoring** on the website); statuses in `EMD_FUEL_STATUSES` and `EMD_REPAIR_STAGES` |
| Downloadable forms | `EMD_FORMS` in `js/content.js` (or use the Admin page) — PDFs go in `forms/` |
| Report figures | `EMD_REPORTS` |
| Organization and offices served | `EMD_ORG` in `js/content.js` (or use the Admin page) |
| Announcements | `EMD_ANNOUNCEMENTS` in `js/content.js` (or use the Admin page) |

When the real data is in, set `EMD_CONFIG.sampleData` to `false` to remove the notice banner.

To add the DPWH seal, replace the `EMD` text mark in the header (`.brand-mark` in
`index.html`) with an `<img>`, using the official file approved by your office.

## Limitations
There is no backend yet. Neither request form sends anything to the EMD office:
the fuel form prepares the slip for the requester to print, and both forms only
log the request in that browser's monitoring list until someone publishes
`js/requests.js`. Connect the forms to a backend or form service to receive
submissions automatically.

## Hosting (GitHub Pages)
The site is served directly from the repository root. In **Settings → Pages**,
set **Source** to *Deploy from a branch*, pick the branch and `/ (root)`.
It will be available at https://marioibay19-tech.github.io/EMD-R01/.
