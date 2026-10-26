// Site content. Everything below is SAMPLE data: replace it with your office's
// real records, then set sampleData to false to hide the notice banner.

window.EMD_CONFIG = {
  sampleData: true,
  agency: "Department of Public Works and Highways",
  office: "Equipment Management Division",
  address: "Ground Floor, Building R01",
  hours: "Monday–Friday, 8:00 AM – 5:00 PM",
  phone: "(000) 000-0000",
  hotline: "(000) 000-0000",
  email: "emd@example.org",
  // Disaster readiness: "normal" or "alert"
  alertLevel: "normal",
  alertMessage: "No active weather disturbance. Standby units remain on 24-hour call."
};

// Fleet. condition: "Serviceable" | "Under repair" | "Unserviceable"
// standby: true for units assigned to disaster / clearing response.
window.EMD_FLEET = [
  { propertyNo: "EMD-HE-001", plateNo: "S1-0001", type: "Dump truck", makeModel: "Isuzu Giga 10-wheeler", assignedTo: "District Office 1", condition: "Serviceable", nextPms: "2026-11-04", pmsType: "250-hr service", standby: true },
  { propertyNo: "EMD-HE-002", plateNo: "S1-0002", type: "Dump truck", makeModel: "Hino 500 6-wheeler", assignedTo: "District Office 2", condition: "Under repair", nextPms: "2026-11-20", pmsType: "500-hr service", standby: false },
  { propertyNo: "EMD-HE-003", plateNo: "—", type: "Backhoe", makeModel: "Caterpillar 320 excavator", assignedTo: "Motor pool", condition: "Serviceable", nextPms: "2026-10-30", pmsType: "250-hr service", standby: true },
  { propertyNo: "EMD-HE-004", plateNo: "—", type: "Backhoe", makeModel: "Komatsu PC130", assignedTo: "Road widening project, km 12", condition: "Serviceable", nextPms: "2026-11-12", pmsType: "1,000-hr service", standby: false },
  { propertyNo: "EMD-HE-005", plateNo: "—", type: "Grader", makeModel: "Caterpillar 140K motor grader", assignedTo: "District Office 1", condition: "Serviceable", nextPms: "2026-11-08", pmsType: "500-hr service", standby: true },
  { propertyNo: "EMD-HE-006", plateNo: "—", type: "Grader", makeModel: "Komatsu GD555", assignedTo: "Motor pool", condition: "Unserviceable", nextPms: "", pmsType: "", standby: false },
  { propertyNo: "EMD-HE-007", plateNo: "—", type: "Road roller", makeModel: "Sakai SV512 vibratory roller", assignedTo: "Asphalt overlay project", condition: "Serviceable", nextPms: "2026-11-15", pmsType: "250-hr service", standby: false },
  { propertyNo: "EMD-HE-008", plateNo: "—", type: "Road roller", makeModel: "Dynapac CA250", assignedTo: "Motor pool", condition: "Under repair", nextPms: "2026-12-01", pmsType: "500-hr service", standby: false },
  { propertyNo: "EMD-HE-009", plateNo: "—", type: "Payloader", makeModel: "Caterpillar 938 wheel loader", assignedTo: "District Office 2", condition: "Serviceable", nextPms: "2026-10-28", pmsType: "250-hr service", standby: true },
  { propertyNo: "EMD-HE-010", plateNo: "—", type: "Payloader", makeModel: "Komatsu WA200", assignedTo: "Motor pool", condition: "Serviceable", nextPms: "2026-11-25", pmsType: "500-hr service", standby: true },
  { propertyNo: "EMD-SV-011", plateNo: "S1-0011", type: "Service vehicle", makeModel: "Toyota Hilux pickup", assignedTo: "Regional Office", condition: "Serviceable", nextPms: "2026-11-02", pmsType: "10,000-km service", standby: false },
  { propertyNo: "EMD-SV-012", plateNo: "S1-0012", type: "Service vehicle", makeModel: "Mitsubishi L300 van", assignedTo: "District Office 1", condition: "Serviceable", nextPms: "2026-12-10", pmsType: "20,000-km service", standby: false },
  { propertyNo: "EMD-SV-013", plateNo: "S1-0013", type: "Service vehicle", makeModel: "Isuzu Traviz utility truck", assignedTo: "Motor pool", condition: "Under repair", nextPms: "2026-11-18", pmsType: "10,000-km service", standby: false },
  { propertyNo: "EMD-HE-014", plateNo: "S1-0014", type: "Dump truck", makeModel: "Isuzu Forward 6-wheeler", assignedTo: "Motor pool", condition: "Serviceable", nextPms: "2026-11-06", pmsType: "250-hr service", standby: true },
  { propertyNo: "EMD-HE-015", plateNo: "—", type: "Backhoe", makeModel: "JCB 3CX backhoe loader", assignedTo: "District Office 2", condition: "Unserviceable", nextPms: "", pmsType: "", standby: false },
  { propertyNo: "EMD-SV-016", plateNo: "S1-0016", type: "Service vehicle", makeModel: "Toyota Hiace commuter", assignedTo: "Regional Office", condition: "Serviceable", nextPms: "2026-12-04", pmsType: "10,000-km service", standby: false }
];

// Repair tracker. stage is an index into EMD_REPAIR_STAGES.
window.EMD_REPAIR_STAGES = [
  "Request received",
  "Pre-repair inspection",
  "Job order issued",
  "Repair in progress",
  "Post-repair inspection",
  "Released"
];

window.EMD_REPAIRS = [
  { ref: "RR-2026-0142", propertyNo: "EMD-HE-002", unit: "Hino 500 6-wheeler dump truck", stage: 3, updated: "2026-10-22", remarks: "Clutch assembly replacement; parts delivered." },
  { ref: "RR-2026-0145", propertyNo: "EMD-HE-008", unit: "Dynapac CA250 road roller", stage: 1, updated: "2026-10-24", remarks: "Inspection scheduled; hydraulic leak reported." },
  { ref: "RR-2026-0139", propertyNo: "EMD-SV-013", unit: "Isuzu Traviz utility truck", stage: 4, updated: "2026-10-25", remarks: "Brake overhaul complete; road test pending." }
];

// Downloadable forms. Put PDFs in /forms and set file to e.g. "forms/trip-ticket.pdf".
// Forms with file: null show "Available at the EMD office" instead of a download link.
window.EMD_FORMS = [
  { title: "Driver's trip ticket", description: "Required for every official trip of a government vehicle or equipment.", file: null },
  { title: "Fuel requisition slip", description: "Request for fuel, oil and lubricants for an assigned unit.", file: null },
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
  chief: { role: "Division Chief", name: "Name to be updated" },
  sections: [
    { role: "Equipment Maintenance Section", name: "Section head to be updated" },
    { role: "Motor Pool and Dispatch Section", name: "Section head to be updated" },
    { role: "Fuel and Lubricants Unit", name: "Unit head to be updated" },
    { role: "Property and Records Section", name: "Section head to be updated" }
  ],
  officesServed: [
    "Regional Office",
    "District Engineering Office 1",
    "District Engineering Office 2",
    "District Engineering Office 3",
    "District Engineering Office 4"
  ]
};

window.EMD_ANNOUNCEMENTS = [
  { date: "2026-10-20", title: "Typhoon season standby", body: "Dump trucks, backhoes, payloaders and graders on the standby list must stay fuelled and ready for clearing operations until further notice." },
  { date: "2026-10-12", title: "November PMS schedule posted", body: "Check the PMS schedule below. Units due for service should be brought to the motor pool on the scheduled date." },
  { date: "2026-09-28", title: "Trip tickets required for fuel requests", body: "Fuel requisitions without an approved trip ticket will not be processed." }
];
