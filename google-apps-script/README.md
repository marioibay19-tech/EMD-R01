# EMD request log (Google Sheet)

This connects the website's request forms to a Google Sheet:

- Every fuel and maintenance / repair request sent from the website becomes a row in the sheet, with its request no. (for example `RR-20261027-001`).
- **Request monitoring** and **Track a repair** on the website read the sheet, so everyone sees the same, current list.
- EMD staff update a request's status either in the sheet or with **Edit** on the website (which asks for the staff key).
- The requester's contact no. is saved in the sheet only. The website never shows it.

It is free and needs a Google account. Use the office's account if you have one, so the log doesn't depend on one person.

## Setup (about 10 minutes)

1. **Create the sheet.** Go to [sheets.new](https://sheets.new) and name the file, for example *EMD request log*.
2. **Add the script.** In the sheet, open **Extensions → Apps Script**. Delete the sample code, paste in everything from [`Code.gs`](Code.gs), and click **Save** (the disk icon).
3. **Set the staff key.** In Apps Script, click **Project Settings** (the gear icon) → **Script properties** → **Add script property**:
   - Property: `STAFF_KEY`
   - Value: a long password only EMD staff know, for example four random words. This is what staff type in to update requests on the website.

   Click **Save script properties**.
4. **Create the Requests tab.** Go back to **Editor** (the `< >` icon), choose `setup` in the function list at the top, and click **Run**. Google asks for permission: click **Review permissions**, pick your account, then **Advanced → Go to (project name) (unsafe)** → **Allow**. ("Unsafe" only means Google hasn't reviewed your own script.) A **Requests** tab with column headings appears in the sheet.
5. **Publish it as a web app.** Click **Deploy → New deployment**, click the gear next to *Select type* and choose **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. **Connect the website.** On GitHub, open `js/data.js`, click the pencil icon, and paste the URL between the quotes:

   ```js
   requestLog: "https://script.google.com/macros/s/…/exec",
   ```

   Click **Commit changes**. In about a minute, the Request monitoring section on the website shows "Live from the EMD request log".

## Day-to-day

- **Update a request on the website:** in Request monitoring, click **Edit**, change the status or remarks, enter the staff key, and **Save**. The key is remembered until the tab is closed.
- **Update it in the sheet:** change the `status` cell (it has a drop-down), `remarks`, `issuedLitres` or `risNo`. Don't change the `id` column. The website shows the change the next time someone loads or refreshes the page.
- **Paper or phone requests:** use **Add request** on the website (it gives the next request no.), or add a row in the sheet yourself.
- **Who can see the sheet:** only people you share it with. Share it with EMD staff who need to update statuses. The public website shows the list without contact numbers.

## Vehicle fuel log

The website's **Vehicle fuel log** (`fuel-log.html`) can save to the same sheet, in a **FuelLog** tab the script creates. This needs the latest `Code.gs`. If you set up the sheet before the fuel log was added, update the script (next section) once. On the fuel log page, click **Connect** and enter the staff key. The log is then shared by every computer that connects, and saved there even if a browser's data is cleared. Don't edit the FuelLog tab by hand.

If two computers save at almost the same moment, the later one loads the other's copy and shows a message; re-enter the last change if it is missing. (Its own copy is kept in that browser as a precaution.)

## Changing the script later

After pasting new code, use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The web app URL stays the same.

To change the staff key, edit the `STAFF_KEY` script property. No new deployment is needed.

## Limits

- Anyone can send a request, as with any public form. The script ignores bot submissions caught by a hidden field and accepts at most 60 requests in 10 minutes. Delete junk rows in the sheet if they get through.
- If the website can't reach the sheet (no internet), the requester can still print the form. The request no. is left blank for EMD staff to write in.
