// Site content. The fleet list and office location are real; the Citizen's
// Charter, reports, announcements, contact numbers and section heads are
// still SAMPLE data. Replace them, then set sampleData to false to hide
// the notice banner.

window.EMD_CONFIG = {
  sampleData: true,
  agency: "Department of Public Works and Highways",
  office: "Equipment Management Division",
  address: "Acao, Bauang, La Union",
  hours: "Monday–Friday, 8:00 AM – 5:00 PM",
  phone: "(000) 000-0000",
  hotline: "(000) 000-0000",
  email: "emd@example.org",
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

// Downloadable forms. Put PDFs in /forms and set file to e.g. "forms/trip-ticket.pdf".
// Forms with file: null show "Available at the EMD office" instead of a download link.
window.EMD_FORMS = [
  { title: "Driver's trip ticket", description: "Required for every official trip of a government vehicle or equipment.", file: null },
  { title: "Requisition and issue slip (fuel)", description: "Blank fuel slip to print and fill in by hand. To print one already filled in, use the fuel requisition form above.", file: "fuel-slip.html" },
  { title: "Pre-repair inspection report", description: "Findings and cost estimate before a repair is approved.", file: null },
  { title: "Job order", description: "Authorizes the repair work and the parts to be used.", file: null },
  { title: "Post-repair inspection report", description: "Confirms the repair was completed before the unit is released.", file: null },
  { title: "Equipment condition report", description: "Periodic report on the condition of an assigned unit.", file: null },
  { title: "Property acknowledgement receipt (PAR)", description: "Accountability record when equipment is issued to personnel.", file: null },
  { title: "Inventory and inspection report of unserviceable property", description: "For units recommended for disposal.", file: null }
];

// Citizen's Charter. Replace with your office's approved charter.
window.EMD_CHARTER = [
  {
    service: "Fuel requisition",
    classification: "Simple",
    transaction: "G2G – Government to Government",
    whoMayAvail: "DPWH offices and project units with assigned equipment",
    requirements: [
      ["Fuel requisition slip (1 original)", "EMD office / Forms section of this page"],
      ["Approved trip ticket (1 copy)", "Requesting office"]
    ],
    steps: [
      ["Submit the fuel requisition slip and trip ticket.", "Receive and check the documents; verify the unit's fuel record.", "None", "15 minutes", "Fuel and lubricants staff"],
      ["Wait for approval.", "Review and approve the requisition.", "None", "30 minutes", "Division Chief or authorized officer"],
      ["Receive the fuel or fuel withdrawal slip.", "Issue fuel and record it in the fuel logbook.", "None", "15 minutes", "Fuel and lubricants staff"]
    ],
    total: "1 hour"
  },
  {
    service: "Repair and maintenance request",
    classification: "Complex",
    transaction: "G2G – Government to Government",
    whoMayAvail: "DPWH offices and project units with assigned equipment",
    requirements: [
      ["Repair request (via this page or written request)", "Requesting office"],
      ["Latest equipment condition report", "Requesting office"]
    ],
    steps: [
      ["Submit the repair request.", "Log the request and issue a reference number.", "None", "15 minutes", "Records staff"],
      ["Bring the unit to the motor pool or wait for the inspection team.", "Conduct pre-repair inspection and prepare the cost estimate.", "None", "1 working day", "Equipment inspector"],
      ["Wait for the job order.", "Approve and issue the job order.", "None", "1 working day", "Division Chief"],
      ["Wait for completion.", "Carry out the repair.", "None", "Depends on the repair", "Maintenance section"],
      ["Receive the unit.", "Conduct post-repair inspection and release the unit.", "None", "1 working day", "Equipment inspector"]
    ],
    total: "3 working days, plus repair time"
  },
  {
    service: "Emergency equipment deployment",
    classification: "Simple",
    transaction: "G2G – Government to Government",
    whoMayAvail: "DPWH offices and disaster risk reduction and management offices",
    requirements: [
      ["Request by phone, radio or written request", "Requesting office"]
    ],
    steps: [
      ["Call the EMD hotline with the location and the equipment needed.", "Log the request and check available standby units.", "None", "15 minutes", "Duty officer"],
      ["Coordinate on site.", "Dispatch the unit and operator with a trip ticket.", "None", "Depends on distance", "Motor pool and dispatch"]
    ],
    total: "Dispatch within 1 hour of request, travel time excluded"
  }
];

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

window.EMD_ORG = {
  chief: { role: "Division Chief", name: "Rachelle G. Lomague" },
  sections: [
    { role: "Equipment Maintenance Section", name: "Section head to be updated" },
    { role: "Motor Pool and Dispatch Section", name: "Section head to be updated" },
    { role: "Fuel and Lubricants Unit", name: "Unit head to be updated" },
    { role: "Property and Records Section", name: "Section head to be updated" }
  ],
  // Offices with equipment assigned, from the fleet list.
  officesServed: [
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

window.EMD_ANNOUNCEMENTS = [
  { date: "2026-10-20", title: "Typhoon season standby", body: "Dump trucks, backhoes, payloaders and graders on the standby list must stay fuelled and ready for clearing operations until further notice." },
  { date: "2026-10-12", title: "November PMS schedule posted", body: "Check the PMS schedule below. Units due for service should be brought to the motor pool on the scheduled date." },
  { date: "2026-09-28", title: "Trip tickets required for fuel requests", body: "Fuel requisitions without an approved trip ticket will not be processed." }
];
