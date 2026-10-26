# Equipment Management Division — Website

A static, dependency-free web page for the Equipment Management Division (EMD).

## Sections
- **Hero** with live counts (assets tracked, available, in maintenance)
- **Services**: procurement, inventory & tagging, maintenance, issuance/transfer, disposal, reporting
- **Equipment inventory**: searchable, filterable (category/status), sortable table
- **Request form**: loans, acquisitions, repairs, transfers, disposal (client-side validation)
- **Announcements** and **Contact** details

Responsive down to phone width, with light/dark mode (follows the system, toggle in the header).

## Run locally
Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Customizing
- Inventory data: `js/data.js` (swap for an API call when a backend exists)
- Contact details and announcements: `index.html`
- Colors and theme tokens: top of `css/styles.css`

The request form currently confirms on the page only; connect it to a backend
or form service to actually store submissions.
