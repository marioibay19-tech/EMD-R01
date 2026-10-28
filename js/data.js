// Site settings. The fleet list and office location are real; reports and
// contact numbers are still SAMPLE data. Announcements, the organization chart
// and downloadable forms are in js/content.js (edit them on admin.html).
// Replace the sample data, then set sampleData to false to hide the notice banner.

window.EMD_CONFIG = {
  sampleData: true,
  agency: "Department of Public Works and Highways",
  office: "Equipment Management Division",
  address: "Acao, Bauang, La Union",
  hours: "Monday–Friday, 8:00 AM – 5:00 PM",
  phone: "(000) 000-0000",
  hotline: "(000) 000-0000",
  email: "emd@example.org",
  // Google Sheet request log (google-apps-script/README.md). Paste the web app
  // URL here to send requests to the sheet and show it in Request monitoring.
  // Leave it blank to keep requests in each browser and js/requests.js.
  requestLog: "https://script.google.com/macros/s/AKfycbwyk6QWjtr-y1o3btdQidUueAZMM5-Qd5vE-oABhsq6gWatDcoqCU2xKza_BN04oxeaJA/exec",
  // Where the Admin page sends you to upload files.
  github: { repo: "marioibay19-tech/EMD-R01", branch: "claude/admiring-sagan-f7r3nh" },
  // Disaster readiness: "normal" or "alert"
  alertLevel: "normal",
  alertMessage: "No active weather disturbance. Standby units remain on 24-hour call.",
  // Requisition and Issue Slip (Fuel), from the Regional Office I template.
  fuelSlip: {
    appendix: "Appendix 63",
    header: ["Republic of the Philippines", "DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS", "REGIONAL OFFICE I", "Aguila Road, Sevilla, San Fernando City, La Union"],
    entity: "Department of Public Works and Highways",
    approvedBy: { name: "ATTY. MARY ROSE N. MILO", designation: "Chief, Administrative Division" },
    issuedBy: { name: "LEILA L. COLLADO", designation: "Chief, SPMS" }
  },
  // Equipment and Service Vehicle Maintenance Request Form, Regional Office I.
  repairForm: {
    header: ["Republic of the Philippines", "DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS", "REGIONAL OFFICE I", "Aguila Road, Sevilla, San Fernando City, La Union"],
    emdApprover: { name: "RACHELLE G. LOMAGUE", designation: "Chief, Equipment Management Division" }
  }
};

// Request monitoring statuses. Repairs move through these stages in order;
// the "Track a repair" box shows them as steps.
window.EMD_REPAIR_STAGES = [
  "Request received",
  "Pre-repair inspection",
  "Job order issued",
  "Repair in progress",
  "Post-repair inspection",
  "Released"
];
window.EMD_FUEL_STATUSES = ["Pending", "Approved", "Issued", "Disapproved"];

// Reports. Utilization in operating hours; fuel in litres.
window.EMD_REPORTS = {
  utilizationPeriod: "September 2026",
  utilization: [
    { label: "Dump truck", value: 412 },
    { label: "Backhoe", value: 356 },
    { label: "Payloader", value: 298 },
    { label: "Grader", value: 214 },
    { label: "Road roller", value: 176 },
    { label: "Service vehicle", value: 520 }
  ],
  fuelPeriod: "May–October 2026",
  fuel: [
    { label: "May", value: 8420 },
    { label: "Jun", value: 9150 },
    { label: "Jul", value: 10980 },
    { label: "Aug", value: 11240 },
    { label: "Sep", value: 9870 },
    { label: "Oct", value: 7630 }
  ]
};
