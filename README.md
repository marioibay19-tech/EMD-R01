# DPWH Equipment Management Division — Website

A static, dependency-free web page for the Equipment Management Division (EMD).

## Sections
- **Quick actions**: repair request, fuel requisition, repair tracking and the emergency hotline, right below the header
- **Fleet status**: searchable, sortable list of heavy equipment and service vehicles; condition chips (Serviceable, Under repair, Unserviceable) filter the list
- **PMS schedule**: units due in the next 30 days grouped by month, with overdue / due-soon flags and a "Show all" option
- **Disaster response readiness**: alert level, emergency hotline, and standby units by type
- **Requests**: maintenance/repair and fuel requisition forms
- **Repair tracker**: look up a repair by reference number and see its stage
  (request received → pre-repair inspection → job order → repair → post-repair inspection → released)
- **Citizen's Charter** (RA 11032): requirements, steps and processing time per service
- **Forms**: trip ticket, fuel requisition slip, inspection reports, job order, PAR, and more
- **Reports**: operating hours by equipment type and monthly fuel consumption
- **Announcements**, **Organization** (division chief, sections, offices served) and **Contact**

Responsive down to phone width, with light/dark mode (follows the system, toggle in the header).

## Run locally
Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Updating the content
All content lives in `js/data.js`. **It currently holds sample data.**

| What | Where in `js/data.js` |
|---|---|
| Office name, address, phone, hotline, email | `EMD_CONFIG` |
| Disaster alert level and message | `EMD_CONFIG.alertLevel` (`"normal"` or `"alert"`), `alertMessage` |
| Fleet, PMS dates, standby units | `EMD_FLEET` |
| Repairs shown in the tracker | `EMD_REPAIRS` |
| Citizen's Charter | `EMD_CHARTER` — replace with your approved charter |
| Downloadable forms | `EMD_FORMS` — put PDFs in `forms/` and set `file` |
| Report figures | `EMD_REPORTS` |
| Organization and offices served | `EMD_ORG` |
| Announcements | `EMD_ANNOUNCEMENTS` |

When the real data is in, set `EMD_CONFIG.sampleData` to `false` to remove the notice banner.

To add the DPWH seal, replace the `EMD` text mark in the header (`.brand-mark` in
`index.html`) with an `<img>`, using the official file approved by your office.

## Limitations
There is no backend yet. Form submissions are confirmed on the page only; new
repair requests are remembered in the submitter's own browser so they can be
tracked there, but they are not sent to the division. Connect the forms to a
backend or form service to receive submissions.

## Hosting (GitHub Pages)
The site is served directly from the repository root. In **Settings → Pages**,
set **Source** to *Deploy from a branch*, pick the branch and `/ (root)`.
It will be available at https://marioibay19-tech.github.io/EMD-R01/.
