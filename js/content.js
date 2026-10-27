// Announcements, organization chart and downloadable forms.
// Edit these on the website's Admin page (admin.html): it downloads a new
// copy of this file to upload here as js/content.js. You can also edit it directly.

// Announcements: date as YYYY-MM-DD. The website shows the newest first.
window.EMD_ANNOUNCEMENTS = [
  {"date":"2026-10-20","title":"Typhoon season standby","body":"Dump trucks, backhoes, payloaders and graders on the standby list must stay fuelled and ready for clearing operations until further notice."},
  {"date":"2026-10-12","title":"November PMS schedule posted","body":"Check the PMS schedule below. Units due for service should be brought to the motor pool on the scheduled date."},
  {"date":"2026-09-28","title":"Trip tickets required for fuel requests","body":"Fuel requisitions without an approved trip ticket will not be processed."}
];

// Organization chart. staff (optional) is a list of names shown under a section.
window.EMD_ORG = {
  "chief": {
    "role": "Division Chief",
    "name": "Rachelle G. Lomague"
  },
  "sections": [
    {
      "role": "Equipment Maintenance Section",
      "name": "Section head to be updated"
    },
    {
      "role": "Motor Pool and Dispatch Section",
      "name": "Section head to be updated"
    },
    {
      "role": "Fuel and Lubricants Unit",
      "name": "Unit head to be updated"
    },
    {
      "role": "Property and Records Section",
      "name": "Section head to be updated"
    }
  ],
  "officesServed": [
    "Administrative Division",
    "Construction Division",
    "Finance Division",
    "Legal Division",
    "Maintenance Division",
    "Planning and Design Division",
    "QAHD",
    "Supply and Procurement Management Section",
    "Commission on Audit",
    "First Ilocos Norte District Engineering Office"
  ]
};

// Forms. file: a PDF in forms/ (e.g. "forms/trip-ticket.pdf"), a link (https://…),
// one of the website's printable forms (.html), or null for "Available at the EMD office".
window.EMD_FORMS = [
  {"title":"Driver's trip ticket","description":"Required for every official trip of a government vehicle or equipment.","file":null},
  {"title":"Equipment and service vehicle maintenance request form","description":"Blank form to print and fill in by hand. To print one already filled in, use the maintenance / repair form above.","file":"repair-form.html"},
  {"title":"Requisition and issue slip (fuel)","description":"Blank fuel slip to print and fill in by hand. To print one already filled in, use the fuel requisition form above.","file":"fuel-slip.html"},
  {"title":"Pre-repair inspection report","description":"Findings and cost estimate before a repair is approved.","file":null},
  {"title":"Job order","description":"Authorizes the repair work and the parts to be used.","file":null},
  {"title":"Post-repair inspection report","description":"Confirms the repair was completed before the unit is released.","file":null},
  {"title":"Equipment condition report","description":"Periodic report on the condition of an assigned unit.","file":null},
  {"title":"Property acknowledgement receipt (PAR)","description":"Accountability record when equipment is issued to personnel.","file":null},
  {"title":"Inventory and inspection report of unserviceable property","description":"For units recommended for disposal.","file":null}
];
