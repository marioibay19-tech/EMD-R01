// Site content. The fleet list and office location are real; repairs, the
// Citizen's Charter, reports, announcements, contact numbers and section heads
// are still SAMPLE data. Replace them, then set sampleData to false to hide
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
  alertMessage: "No active weather disturbance. Standby units remain on 24-hour call."
};

// Fleet, from the EMD equipment list. Engine serial numbers are left out on
// purpose because this file is public. Dates are kept exactly as recorded
// (DD/MM/YYYY). Optional fields the page also understands when you have them:
//   condition: "Serviceable" | "Under repair" | "Unserviceable"
//   nextPms: "YYYY-MM-DD", pmsType: "250-hr service", standby: true
window.EMD_FLEET = [
  {"propertyNo": "F5-334", "plateNo": "N/A", "makeModel": "Tadano Crane Truck Mtd. Nissan", "type": "Crane", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "02/04/2025", "ltoDate": "N/A"},
  {"propertyNo": "F5-372", "plateNo": "N/A", "makeModel": "Rough Terrain Crane, 80 tons", "type": "Crane", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "02/04/2025", "ltoDate": ""},
  {"propertyNo": "F16-111", "plateNo": "N/A", "makeModel": "Crawler Type , Hidromek", "type": "Excavator", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "03/07/2024", "ltoDate": "N/A"},
  {"propertyNo": "F16-208", "plateNo": "N/A", "makeModel": "Kobelco SK-200 Hydraulic Excavator", "type": "Excavator", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Rachelle G. Lomague", "position": "Chief, EMD", "parDate": "13/08/2024", "ltoDate": "N/A"},
  {"propertyNo": "F16-211", "plateNo": "N/A", "makeModel": "Kobelco SK-200 Hydraulic Excavator", "type": "Excavator", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "24/02/2025", "ltoDate": "N/A"},
  {"propertyNo": "F16-215", "plateNo": "N/A", "makeModel": "KATO HD820, Hydraulic Excavator, Crawler Type", "type": "Excavator", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "", "ltoDate": "N/A"},
  {"propertyNo": "G1-200", "plateNo": "N/A", "makeModel": "SEIMITSU GENSET", "type": "Generator set", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Dianne Jean D. Eguilos", "position": "Engineer III", "parDate": "12/07/2024", "ltoDate": "N/A"},
  {"propertyNo": "G1-607", "plateNo": "N/A", "makeModel": "Diesel Generator, Powerhouse PWH-12000E-DST", "type": "Generator set", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "N/A", "ltoDate": "N/A"},
  {"propertyNo": "G1-609", "plateNo": "N/A", "makeModel": "Generator Set Deis-25 JE493DB-03, 25kVA", "type": "Generator set", "group": "equipment", "office": "", "endUser": "", "position": "", "parDate": "N/A", "ltoDate": "N/A"},
  {"propertyNo": "H1-2349", "plateNo": "SAN-444", "makeModel": "Ford Fiera", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "", "ltoDate": ""},
  {"propertyNo": "H1-4074", "plateNo": "SEW-323", "makeModel": "Mitsubishi Pick-up L200", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Myrna T. Dulay", "position": "Engineer III", "parDate": "03/02/2026", "ltoDate": "23/03/2026"},
  {"propertyNo": "H1-4445", "plateNo": "SGY-858", "makeModel": "Mitsubishi L200 Pick-up, D/C, 4WD", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "31/08/2022", "ltoDate": "09/08/2023"},
  {"propertyNo": "H1-4469", "plateNo": "SBY-236", "makeModel": "Mitsubishi Pick-up L200 Single Cab", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division (A1-2), Regional Office", "endUser": "Bon Carlo P. Dugayo", "position": "Engineer III (Area 1-2)", "parDate": "13/06/2024", "ltoDate": "15/07/2025"},
  {"propertyNo": "H1-4577", "plateNo": "SFH-347", "makeModel": "Nissan Frontier, Pick-up Double Cab", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "14/08/2024", "ltoDate": "28/07/2026"},
  {"propertyNo": "H1-4624", "plateNo": "SGS-838", "makeModel": "Nissan Frontier, Double Cab, Pick-up, Mdl. 2003", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Kim Angelo K. Soy", "position": "Dredge Master III", "parDate": "31/07/2025", "ltoDate": "10/09/2025"},
  {"propertyNo": "H1-4972", "plateNo": "SFH-592", "makeModel": "Toyota Hi-Lux, 3.0L 4x4, Pick-up", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "31/08/2022", "ltoDate": "12/02/2026"},
  {"propertyNo": "H1-4973", "plateNo": "SEW-219", "makeModel": "Land Rover, Pick-up", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "31/08/2022", "ltoDate": "07/09/2024"},
  {"propertyNo": "H1-5181", "plateNo": "SKA-710", "makeModel": "Toyota Hilux 3.0L G 4x4, Pick-up", "type": "Service vehicle", "group": "vehicle", "office": "Maintenance Division, Regional Office", "endUser": "Renalyn Oller", "position": "Engineer II", "parDate": "07/04/2026", "ltoDate": "13/10/2025"},
  {"propertyNo": "H1-5191", "plateNo": "SKA-730", "makeModel": "Toyota Hilux JMT 4x2, Pick-up", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "28/04/2022", "ltoDate": "01/10/2025"},
  {"propertyNo": "H1-5212", "plateNo": "SKA-714", "makeModel": "Toyota Hi-Lux, 4x4", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "31/08/2022", "ltoDate": "13/04/2023"},
  {"propertyNo": "H1-5213", "plateNo": "SKA-716", "makeModel": "Hyundai Grand Starex GL Van", "type": "Service vehicle", "group": "vehicle", "office": "Legal Division, Regional Office", "endUser": "Clarence B. Rimando", "position": "Chief, Legal Division", "parDate": "27/09/2021", "ltoDate": "17/06/2022"},
  {"propertyNo": "H1M-5219", "plateNo": "SKA-731", "makeModel": "Nissan Navara 4x2", "type": "Service vehicle", "group": "vehicle", "office": "Maintenance Division, Regional Office", "endUser": "Allan N. Hufana", "position": "Engineer IV", "parDate": "02/06/2023", "ltoDate": "19/02/2026"},
  {"propertyNo": "H1-5340", "plateNo": "SHY-774", "makeModel": "Nissan Frontier Navara, Pick-up", "type": "Service vehicle", "group": "vehicle", "office": "Legal Division, Regional Office", "endUser": "John Lionel E. Ledda", "position": "Attorney III", "parDate": "03/06/2024", "ltoDate": "27/04/2026"},
  {"propertyNo": "H1-5886", "plateNo": "XSS-651", "makeModel": "Nissan Frontier, Pick-up Mdl. 2005", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "07/08/2024", "ltoDate": "27/01/2025"},
  {"propertyNo": "H1-5887", "plateNo": "AEW-851 (013601)", "makeModel": "Mitsubishi Montero Sport G.", "type": "Service vehicle", "group": "vehicle", "office": "Legal Division, Regional Office", "endUser": "Clarence B. Rimando", "position": "Chief, Legal Division", "parDate": "03/06/2024", "ltoDate": "14/01/2026"},
  {"propertyNo": "H1M-5888", "plateNo": "POZ-373 (013603)", "makeModel": "Mitsubishi Strada GLX 2.5 Pick-Up", "type": "Service vehicle", "group": "vehicle", "office": "Maintenance Division, Regional Office", "endUser": "Allan N. Hufana", "position": "Engineer IV", "parDate": "10/11/2021", "ltoDate": "31/03/2026"},
  {"propertyNo": "H1-5889", "plateNo": "PUI-530 (013610)", "makeModel": "Toyota Innova 2.5J DSL M/T", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "11/01/2023", "ltoDate": "01/10/2025"},
  {"propertyNo": "H1-5890", "plateNo": "WMP-140", "makeModel": "Mitsubishi L200, Pick-up", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "07/08/2024", "ltoDate": "14/10/2025"},
  {"propertyNo": "H1-5891", "plateNo": "RNF-827", "makeModel": "Isuzu DMax, 4x4, Double Cab", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "23/11/2018", "ltoDate": "07/07/2026"},
  {"propertyNo": "H1-5896", "plateNo": "XMJ-720", "makeModel": "Toyota, Hilux 4x2 Dlx, Mdl. 2003", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "18/06/2021", "ltoDate": "07/10/2025"},
  {"propertyNo": "H1-5898", "plateNo": "ABG-2815", "makeModel": "Isuzu Dmax, 4x4 MT LS", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Willer M. Bince", "position": "Chief, Construction Division", "parDate": "13/01/2025", "ltoDate": "13/05/2026"},
  {"propertyNo": "H1M-5899", "plateNo": "UOY-171", "makeModel": "Toyota Hilux 2.5 LJ 4X, Pick-up", "type": "Service vehicle", "group": "vehicle", "office": "Maintenance Division, Regional Office", "endUser": "Allan N. Hufana", "position": "Engineer IV", "parDate": "04/02/2019", "ltoDate": "28/01/2026"},
  {"propertyNo": "H1-5902", "plateNo": "NQC-313", "makeModel": "Mitsubishi Strada GLX 2.5 Pick-Up", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Willer M. Bince", "position": "Chief, Construction Division", "parDate": "13/01/2025", "ltoDate": "07/03/2026"},
  {"propertyNo": "H1M-5944", "plateNo": "ABI-1115", "makeModel": "Mitsubishi L300 Exceed 2.5 UV", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Edilberto F. Rosario", "position": "Chief, Construction Division", "parDate": "04/10/2016", "ltoDate": "06/05/2019"},
  {"propertyNo": "H1-6073", "plateNo": "AVA 7597", "makeModel": "Toyota Pick-up Hi Lux 2.5L G 4x4", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Mario Martin Caesar G. Atiga II", "position": "ENGINEER III", "parDate": "05/12/2024", "ltoDate": "13/07/2026"},
  {"propertyNo": "H1-6074", "plateNo": "AVA-6542", "makeModel": "2015 Mitsubishi Strada GLS V.2", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Dexter L. Cavaneyro", "position": "Chief, PDD", "parDate": "17/08/2018", "ltoDate": "10/02/2026"},
  {"propertyNo": "H1-6129", "plateNo": "ABI-1586", "makeModel": "Nissan, Pick-up MP300 Navara 2", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Willer M. Bince", "position": "Chief, Construction Division", "parDate": "09/03/2017", "ltoDate": "22/06/2026"},
  {"propertyNo": "H1-6248", "plateNo": "SCD-1655/B1-K147", "makeModel": "Mitsubishi L300 FB Body Exceed 2.5L", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "29/05/2025", "ltoDate": "05/11/2025"},
  {"propertyNo": "H1-6509", "plateNo": "FO-G953", "makeModel": "Nissan NV 350Urvan 2.5", "type": "Service vehicle", "group": "vehicle", "office": "Legal Division, Regional Office", "endUser": "Reina Mai R. Ruiz", "position": "Attorney III", "parDate": "15/04/2024", "ltoDate": "23/03/2026"},
  {"propertyNo": "H1-6510", "plateNo": "FO-L408", "makeModel": "Nissan NV 350Urvan 2.5", "type": "Service vehicle", "group": "vehicle", "office": "Legal Division, Regional Office", "endUser": "Clarence B. Rimando", "position": "Chief, Legal Division", "parDate": "09/03/2026", "ltoDate": "26/03/2026"},
  {"propertyNo": "H1-6846", "plateNo": "AAB-5586", "makeModel": "Toyota Hilux 3.0L G 4X", "type": "Service vehicle", "group": "vehicle", "office": "Legal Division, Regional Office", "endUser": "Jeffrey G. Mendoza", "position": "Attorney III", "parDate": "16/07/2024", "ltoDate": "15/06/2026"},
  {"propertyNo": "H1-7436", "plateNo": "NDY-6792", "makeModel": "Toyota Hilux, 2.8L 4x4 Pick up", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Julius M. Gaceta", "position": "Architect II, PDD", "parDate": "10/07/2019", "ltoDate": "10/02/2026"},
  {"propertyNo": "H1-7802", "plateNo": "ICL-1759", "makeModel": "Toyota Hilux 2.4L G 4x2, Pick-up, D/cab", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Jose B. Eguilos, Jr.", "position": "Engineer III", "parDate": "07/08/2024", "ltoDate": "17/09/2025"},
  {"propertyNo": "H1-8552", "plateNo": "ARA-1584", "makeModel": "Ford Ranger DBL 2.2L", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Larry Angelo L. Flores", "position": "Engineer III", "parDate": "20/09/2021", "ltoDate": "27/04/2026"},
  {"propertyNo": "H1-8878", "plateNo": "ALA-6489", "makeModel": "Toyota Hilux 2.5L J 4x2 M/T", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "02/02/2022", "ltoDate": "21/09/2025"},
  {"propertyNo": "H1-8879", "plateNo": "CAM-6125", "makeModel": "Toyota Rush 1.5G A/T", "type": "Service vehicle", "group": "vehicle", "office": "Finance Division, Regional Office", "endUser": "Dexter D. Lomboy", "position": "ACCOUNTANT IV", "parDate": "22/10/2024", "ltoDate": "18/05/2026"},
  {"propertyNo": "H1-8912", "plateNo": "NFQ-8536/ B9 B547", "makeModel": "Mitsubishi L300 Exceed C/C 2.2D M/T", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "31/08/2022", "ltoDate": "30/06/2026"},
  {"propertyNo": "H1-8913", "plateNo": "NET-1121/ S2 J025", "makeModel": "Toyota Hilux 2.4L 4x2 G M/T", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Rachelle G. Lomague", "position": "Chief, EMD", "parDate": "16/04/2024", "ltoDate": "06/01/2026"},
  {"propertyNo": "H1-8914", "plateNo": "NET-7279/ S3 I963", "makeModel": "Toyota Hilux 2.4L 4x2 G A/T", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Dianne Jean D. Eguilos", "position": "Engineer III", "parDate": "03/07/2024", "ltoDate": "21/09/2026"},
  {"propertyNo": "H1-8931", "plateNo": "YAA-3599 / C1 0444", "makeModel": "Ford Ranger 3.2L Wildtrak 4x4 AT", "type": "Service vehicle", "group": "vehicle", "office": "Maintenance Division, Regional Office", "endUser": "Allan N. Hufana", "position": "Engineer IV", "parDate": "24/03/2026", "ltoDate": "18/09/2025"},
  {"propertyNo": "H1-9108", "plateNo": "AEX-373", "makeModel": "Toyota Hilux 2.5L 4x2 Pick-Up", "type": "Service vehicle", "group": "vehicle", "office": "Maintenance Division, Regional Office", "endUser": "Allan N.Hufana", "position": "Engineer IV", "parDate": "21/07/2025", "ltoDate": "17/03/2026"},
  {"propertyNo": "H1-9133", "plateNo": "NGF-2129", "makeModel": "Mitsubishi L300 C/C 2.2D M FB", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Julian M. Narvas Jr.", "position": "Engineer III", "parDate": "20/02/2023", "ltoDate": "17/09/2025"},
  {"propertyNo": "H1-9481", "plateNo": "ABI-1148", "makeModel": "Mitsubishi L300 Deluxe 2.5 FB", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Alexander Paul B. Villanueva", "position": "Engineer III", "parDate": "07/09/2023", "ltoDate": "14/08/2026"},
  {"propertyNo": "H1-9528", "plateNo": "ABS-6277", "makeModel": "Mitsubishi L300 Deluxe 2.5 FB", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Julian M. Narvas, Jr.", "position": "Engineer III", "parDate": "20/09/2023", "ltoDate": "13/07/2026"},
  {"propertyNo": "H1-9529", "plateNo": "IAE-4278", "makeModel": "Toyota Hilux 2.4L 4x2", "type": "Service vehicle", "group": "vehicle", "office": "Commission on Audit", "endUser": "Janette G. Ancheta", "position": "State Auditor IV", "parDate": "13/11/2023", "ltoDate": "21/08/2026"},
  {"propertyNo": "H1-9639", "plateNo": "IDI-2146", "makeModel": "Mitsubishi L300 Deluxe 2.5 FB MT", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Jose B. Eguilos, Jr.", "position": "Engineer III", "parDate": "08/01/2024", "ltoDate": "08/06/2026"},
  {"propertyNo": "H1-9640", "plateNo": "IDI-4012", "makeModel": "Mitsubishi L300 Deluxe 2.5 FB MT", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Julian M. Narvas, Jr.", "position": "Engineer III", "parDate": "08/01/2024", "ltoDate": "10/02/2026"},
  {"propertyNo": "H1-9778", "plateNo": "ABI-2969", "makeModel": "Mitsubishi L300 Deluxe 2.5 , Mdl. 2015", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Maria Monina P. Delizo", "position": "Engineer III", "parDate": "01/04/2024", "ltoDate": "17/09/2025"},
  {"propertyNo": "H1-9795", "plateNo": "IAE-3961", "makeModel": "Toyota Hilux 2.4L 4x4 J MT", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Eugene Y. Del Rosario", "position": "Engineer II", "parDate": "06/03/2024", "ltoDate": "14/01/2026"},
  {"propertyNo": "H1-9796", "plateNo": "IAE-3150/S6D306", "makeModel": "Toyota Hilux 2.4L 4x4 J MT", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Myrna T. Dulay", "position": "Engineer III", "parDate": "03/02/2026", "ltoDate": "01/10/2025"},
  {"propertyNo": "H1-9797", "plateNo": "IAE-3463/S7R614", "makeModel": "Toyota Hilux 2.4L 4x4 J MT", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Pablito R. Laurido, Jr.", "position": "Engineer II", "parDate": "20/02/2024", "ltoDate": "16/03/2026"},
  {"propertyNo": "H1-9865", "plateNo": "IAE-3604", "makeModel": "Toyota Hilux 2.4L 4x4 J MT 2022", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Eugenio Q. Arquero IV", "position": "Engineer III", "parDate": "10/02/2026", "ltoDate": "27/04/2026"},
  {"propertyNo": "H1-9866", "plateNo": "IAE-4077", "makeModel": "Toyota Hilux 2.4L 4x4 J MT 2022", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Vilmaflor G. Gascon", "position": "Engineer III", "parDate": "03/02/2026", "ltoDate": "31/07/2026"},
  {"propertyNo": "H1-9868", "plateNo": "IAE-8325", "makeModel": "Toyota Hilux 2.8 Conquest 2023", "type": "Service vehicle", "group": "vehicle", "office": "Maintenance Division, Regional Office", "endUser": "Chriselda E. Nicer", "position": "Engineer III", "parDate": "23/09/2025", "ltoDate": "01/06/2026"},
  {"propertyNo": "H1-9870", "plateNo": "NFO-7614", "makeModel": "Toyota Hilux 2.8L GR-S 4x4 AT - 0E-011 2023", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Dexter L. Cavaneyro", "position": "Chief, PDD", "parDate": "09/05/2024", "ltoDate": "27/04/2026"},
  {"propertyNo": "H1-9949", "plateNo": "NIJ-8269", "makeModel": "Toyota Hiace 2.8L GL Grandia A/T", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "16/07/2024", "ltoDate": "16/07/2024"},
  {"propertyNo": "H1-10098", "plateNo": "IAE-3602", "makeModel": "Toyota Hilux 2.4L 4x4 2022", "type": "Service vehicle", "group": "vehicle", "office": "Legal Division, Regional Office", "endUser": "Francisco B. Rebuldela Jr.", "position": "Attorney III", "parDate": "29/05/2025", "ltoDate": "10/02/2026"},
  {"propertyNo": "H1-10099", "plateNo": "IAE-8307", "makeModel": "Isuzu D-Max 3.0 4x4 L", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Prima C. Laaguen", "position": "Engineer II", "parDate": "05/01/2026", "ltoDate": "14/06/2023"},
  {"propertyNo": "H1-10141", "plateNo": "IAD-3667", "makeModel": "Nissan Navarra 2.5 VL 4X4 AT", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Willer M. Bince", "position": "Chief, Construction Division", "parDate": "05/03/2025", "ltoDate": "13/07/2026"},
  {"propertyNo": "H1-10172", "plateNo": "IAC-4705", "makeModel": "Nissan Navarra 2.5 L", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Annalisa P. Simangan", "position": "Engineer III", "parDate": "14/04/2025", "ltoDate": "05/19/2026"},
  {"propertyNo": "H1-10226", "plateNo": "IAE-3379", "makeModel": "Toyota Hilux 2.4L 4x4 J MT", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Mario Martin Caesar G. Atiga II", "position": "Engineer III", "parDate": "05/03/2025", "ltoDate": "30/01/2025"},
  {"propertyNo": "H1-10228", "plateNo": "IAE-9056", "makeModel": "Isuzu D-Max 3.0 4x4 L", "type": "Service vehicle", "group": "vehicle", "office": "Supply and Procurement Management Section", "endUser": "Leila L. Collado", "position": "Chief, SPMS", "parDate": "05/03/2025", "ltoDate": "21/02/2025"},
  {"propertyNo": "H1-10418", "plateNo": "IAF-9379", "makeModel": "Toyota HILUX 2.4 J 4x4 M/T", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Mario Martin Caesar G. Atiga II", "position": "Engineer III", "parDate": "07/07/2025", "ltoDate": "03/06/2025"},
  {"propertyNo": "H1-10419", "plateNo": "IAF-9382", "makeModel": "Toyota HILUX 2.4 J 4x4 M/T", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Mario Martin Caesar G. Atiga II", "position": "Engineer III", "parDate": "07/07/2025", "ltoDate": "04/06/2025"},
  {"propertyNo": "H1-10454", "plateNo": "IAF-8234", "makeModel": "Toyota HILUX 2.8 Conquest 4X4 AT", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Eugene Y. Del Rosario", "position": "Engineer II", "parDate": "14/07/2025", "ltoDate": "08/07/2025"},
  {"propertyNo": "H1-10499", "plateNo": "IAE-9393", "makeModel": "Toyota Fortuner2.4 G 4X2 A/T -3Y-008", "type": "Service vehicle", "group": "vehicle", "office": "Legal Division, Regional Office", "endUser": "Clarence B. Rimando", "position": "Chief, Legal Division", "parDate": "15/07/2025", "ltoDate": "31/07/2025"},
  {"propertyNo": "H1-10584", "plateNo": "IAF-8233", "makeModel": "Hilux 2.8 Conquest 4X4 AT", "type": "Service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "07/10/2025", "ltoDate": "15/07/2025"},
  {"propertyNo": "H1-10589", "plateNo": "NKM-3113", "makeModel": "Toyota Hilux 2.4G 4X2 AT", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin Barrey L. Taguicana", "position": "Engineer III", "parDate": "24/02/2025", "ltoDate": "20/11/2025"},
  {"propertyNo": "H1-10590", "plateNo": "NKM-3409", "makeModel": "Toyota Hilux 2.4G 4X2 AT", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jasmin T. Palabay", "position": "Engineer III", "parDate": "24/02/2025", "ltoDate": "20/11/2025"},
  {"propertyNo": "H1-10591", "plateNo": "NKM-3434", "makeModel": "Toyota Hilux 2.4G 4X2 AT", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "24/02/2025", "ltoDate": "20/11/2025"},
  {"propertyNo": "H1-10616", "plateNo": "NKS-4907", "makeModel": "Toyota Hilux 2.4L 4x2 G A/T", "type": "Service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jonalyn V. Dawey", "position": "Engineer III", "parDate": "14/07/2025", "ltoDate": "02/12/2025"},
  {"propertyNo": "H1-10718", "plateNo": "NFO-9432", "makeModel": "Toyota Innova 2.8 E DI", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "29/01/2026", "ltoDate": "06/03/2026"},
  {"propertyNo": "H1-10737", "plateNo": "IAE-9540", "makeModel": "Toyota Hilux 2.8L Conquest 4x4 A/T", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Abraham A. Tinaza", "position": "Engineer II", "parDate": "26/05/2026", "ltoDate": "04/06/2026"},
  {"propertyNo": "H1-10844", "plateNo": "NHM-8187", "makeModel": "Toyota Hilux 2.8L Conquest 4x4 A/T", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Julian M. Narvas Jr.", "position": "Engineer III", "parDate": "Waiting for Updated PAR", "ltoDate": "29/07/2026"},
  {"propertyNo": "H1-10845", "plateNo": "CCA-6042", "makeModel": "Toyota Hilux 2.8L GR-S 4x4 A/T ER", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Dexter L. Cavaneyro", "position": "Chief, PDD", "parDate": "Waiting for Updated PAR", "ltoDate": "24/08/2026"},
  {"propertyNo": "H1-N/A", "plateNo": "NIK-3019", "makeModel": "Toyota Hilux 2.8L Conquest 4x4 A/T", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Geselle L. Perper", "position": "Engineer II", "parDate": "Waiting for Updated PAR", "ltoDate": "23/07/2026"},
  {"propertyNo": "H1-N/A", "plateNo": "IAD-4124", "makeModel": "Toyota Hilux 2.8L Conquest 4x4 A/T", "type": "Service vehicle", "group": "vehicle", "office": "Construction Division", "endUser": "Rafael Catbagan", "position": "Engineer II", "parDate": "Waiting for Updated PAR", "ltoDate": "22/07/2026"},
  {"propertyNo": "H1-N/A", "plateNo": "IAE-2548", "makeModel": "Toyota Hilux 2.4L 4x4 M/T", "type": "Service vehicle", "group": "vehicle", "office": "Planning and Design Division, Regional Office", "endUser": "Alexander Paul B. Villanueva", "position": "Engineer III", "parDate": "Waiting for Updated PAR", "ltoDate": "22/07/2026"},
  {"propertyNo": "H1-N/A", "plateNo": "NEE-7720", "makeModel": "Toyota Hilux 2.8L Conquest", "type": "Service vehicle", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "Waiting for Updated PAR", "ltoDate": "30/09/2026"},
  {"propertyNo": "EH1-2", "plateNo": "SCA-2102", "makeModel": "Foton Tunland V9 4X4 AT Hybrid", "type": "Hybrid service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Bryan P. Fernandez", "position": "Engineer III", "parDate": "24/02/2025", "ltoDate": "14/02/2025"},
  {"propertyNo": "EH1-19", "plateNo": "SNG-1114", "makeModel": "Foton Tunland V9 4x4 AT Mild Hybrid Electric Vehicle (MHEV)", "type": "Hybrid service vehicle", "group": "vehicle", "office": "QAHD, Regional Office", "endUser": "Myrna T. Dulay", "position": "Engineer III", "parDate": "27/10/2025", "ltoDate": "09/24/2025"},
  {"propertyNo": "EH1-20", "plateNo": "SNG-1123", "makeModel": "Foton Tunland V9 4X4 AT Hybrid", "type": "Hybrid service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Bon Carlo P. Dugayo", "position": "Engineer III", "parDate": "05/11/2025", "ltoDate": "24/11/2025"},
  {"propertyNo": "EH1-24", "plateNo": "SNG-1125", "makeModel": "Foton Tunland V9 4x4 AT Hybrid", "type": "Hybrid service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Charlie O. Sibaen", "position": "Engineer III", "parDate": "05/11/2025", "ltoDate": "26/11/2025"},
  {"propertyNo": "EH1-28", "plateNo": "NNV-2844", "makeModel": "Foton Tunland V9 4X4 AT Hybrid", "type": "Hybrid service vehicle", "group": "vehicle", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Kim Angelo K. Soy", "position": "Dredge Master III", "parDate": "31/07/2025", "ltoDate": "24/02/2026"},
  {"propertyNo": "H2-306", "plateNo": "ACN-1049", "makeModel": "Isuzu Elf Dropside Truck w/ Crane", "type": "Boom / stake truck", "group": "equipment", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "14/08/2024", "ltoDate": "12/09/2023"},
  {"propertyNo": "H2-460", "plateNo": "JOB-337 (SNA-6473)", "makeModel": "Stake Truck, Hino Dropside", "type": "Boom / stake truck", "group": "equipment", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "31/08/2022", "ltoDate": "08/10/2024"},
  {"propertyNo": "H2-591", "plateNo": "D2-R605", "makeModel": "Isuzu NQR75L Boom Truck Crane, 2022", "type": "Boom / stake truck", "group": "equipment", "office": "QAHD, Regional Office", "endUser": "Arturo F. Prepose", "position": "Chief, QAHD", "parDate": "03/07/2024", "ltoDate": "11/09/2026"},
  {"propertyNo": "H2-697", "plateNo": "SNI-4519", "makeModel": "Hino FG8JPA Boom Truck (Manlift)", "type": "Boom / stake truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "Waiting for updated PAR", "ltoDate": "15/05/2026"},
  {"propertyNo": "H2-701", "plateNo": "SNI-4816", "makeModel": "Isuzu NPR85 K VL20 Dropside (Stake Truck)", "type": "Boom / stake truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "Waiting for updated PAR", "ltoDate": "09/06/2026"},
  {"propertyNo": "H3-6899", "plateNo": "JM-9537", "makeModel": "Hino FG8JP7A, 1-Way, 4x2 5.5 cu.m., Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Dianne Jean D. Eguilos", "position": "Engineer III", "parDate": "02/04/2025", "ltoDate": "25/09/2019"},
  {"propertyNo": "H3-6908", "plateNo": "JM-9536", "makeModel": "Hino FG8JP7A, 1-Way, 4x2 5.5 cu.m., Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Dianne Jean D. Eguilos", "position": "Engineer III", "parDate": "02/04/2025", "ltoDate": "07/10/2025"},
  {"propertyNo": "H3-7187", "plateNo": "D2-J296", "makeModel": "Isuzu FVR34 (Euro 4)", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Dianne Jean D. Eguilos", "position": "Engineer III", "parDate": "07/03/2024", "ltoDate": "09/30/2025"},
  {"propertyNo": "H3-7192", "plateNo": "SND-4727", "makeModel": "Hino FG8JP7A Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "02/04/2025", "ltoDate": "09/01/2025"},
  {"propertyNo": "H3-7193", "plateNo": "SND-4728", "makeModel": "Hino FG8JP7A Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "02/04/2025", "ltoDate": "09/01/2025"},
  {"propertyNo": "H3-7208", "plateNo": "SNN-3968", "makeModel": "Hino FG8JP7A Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "24/02/2025", "ltoDate": "29/04/2025"},
  {"propertyNo": "H3-7209", "plateNo": "SNN-3969", "makeModel": "Hino FG8JP7A, 1-Way, 4x2 5.5 cu.m., Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "01/07/2025", "ltoDate": "04/29/2025"},
  {"propertyNo": "H3-7210", "plateNo": "SNN-3970", "makeModel": "Hino Dumptruck FG8JJ7 Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union (A1-1)", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "N/A", "ltoDate": "29/04/2025"},
  {"propertyNo": "H3-7211", "plateNo": "SNN-3971", "makeModel": "Hino FG8JP7A, 1-Way, 4x2 5.5 cu.m., Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "01/07/2025", "ltoDate": "04/29/2025"},
  {"propertyNo": "H3-7238", "plateNo": "SNN-2147", "makeModel": "Isuzu FVR34 Q, 5.5 CU. M. Dump Truck", "type": "Dump truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "N/A", "ltoDate": "01/26/2026"},
  {"propertyNo": "H4-154", "plateNo": "JM-5676", "makeModel": "Hino SS2PKUA / Soosung 50T Bed, Prime Mover with low Bed Trailer", "type": "Prime mover with low-bed trailer", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union (A1-2)", "endUser": "Bon Carlo P. Dugayo", "position": "Engineer III", "parDate": "05/02/2026", "ltoDate": "N/A"},
  {"propertyNo": "H4-155", "plateNo": "JM5677", "makeModel": "Hino SS2PKUA / Soosung 50T Bed, Prime Mover with low Bed Trailer", "type": "Prime mover with low-bed trailer", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "03/07/2024", "ltoDate": "30/09/2025"},
  {"propertyNo": "H4-186", "plateNo": "D2-Q018", "makeModel": "Prime Mover with Low Bed Trailer", "type": "Prime mover with low-bed trailer", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "02/04/2025", "ltoDate": "11/09/2026"},
  {"propertyNo": "H6-153", "plateNo": "JM-9105", "makeModel": "Hino FC9JJTA, Water Tank Truck", "type": "Water tank truck", "group": "equipment", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "31/08/2022", "ltoDate": "24/09/2025"},
  {"propertyNo": "H12-44", "plateNo": "NP-1405", "makeModel": "Mitsubishi Rosa Super Long 3.9L (30 seater)", "type": "Bus", "group": "vehicle", "office": "Administrative Division, Regional Office", "endUser": "Mary Rose N. Milo", "position": "Chief, Administrative Division", "parDate": "31/08/2022", "ltoDate": "31/01/2025"},
  {"propertyNo": "H14-6", "plateNo": "1312-00000445299", "makeModel": "Wrecker Truck w/ Crane", "type": "Wrecker truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "02/04/2025", "ltoDate": "07/10/2025"},
  {"propertyNo": "H16-12", "plateNo": "SNI-4203", "makeModel": "MOOG MBL 1800 on Scania Truck Chassis", "type": "Bridge inspection truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "23/06/2025", "ltoDate": "02/26/2026"},
  {"propertyNo": "H17-10", "plateNo": "N/A", "makeModel": "Truck, Mounted Flood Mitigation", "type": "Flood mitigation truck", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "02/04/2025", "ltoDate": ""},
  {"propertyNo": "H21-27", "plateNo": "N/A", "makeModel": "Giant G5000, Telehandler w/ Earth Bucket", "type": "Telehandler", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "N/A", "ltoDate": "N/A"},
  {"propertyNo": "J1-201", "plateNo": "N/A", "makeModel": "Lowbed Trailer, 1000kgs. Cap.", "type": "Low-bed trailer", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "07/03/2024", "ltoDate": "10/09/2023"},
  {"propertyNo": "J1-202", "plateNo": "N/A", "makeModel": "Lowbed Trailer, 50T Bed", "type": "Low-bed trailer", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union (A1-2)", "endUser": "Bon Carlo P. Dugayo", "position": "Engineer III", "parDate": "N/A", "ltoDate": "N/A"},
  {"propertyNo": "J1-263", "plateNo": "N/A", "makeModel": "Lowbed Trailer, CLW9403TPB", "type": "Low-bed trailer", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Jersel Froilan B. Rimando", "position": "Engineer IV", "parDate": "N/A", "ltoDate": "N/A"},
  {"propertyNo": "J6-48", "plateNo": "N/A", "makeModel": "Trailer Mounted Tower Floodlight, Atlas COPCP Hilight, Mdl. 2019 V4", "type": "Floodlight tower", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Dianne Jean D. Eguilos", "position": "Engineer III", "parDate": "03/07/2024", "ltoDate": "N/A"},
  {"propertyNo": "J6-49", "plateNo": "N/A", "makeModel": "Trailer Mounted Tower Floodlight, Atlas COPCP Hilight, Mdl. 2019 V4", "type": "Floodlight tower", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Dianne Jean D. Eguilos", "position": "Engineer III", "parDate": "03/07/2024", "ltoDate": "N/A"},
  {"propertyNo": "L1-1192", "plateNo": "N/A", "makeModel": "Komatzu Bulldozer, D65A-6", "type": "Bulldozer / crawler tractor", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "", "ltoDate": ""},
  {"propertyNo": "L1-1717", "plateNo": "N/A", "makeModel": "SU D65EX-16 Tractor Crawler", "type": "Bulldozer / crawler tractor", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "", "ltoDate": ""},
  {"propertyNo": "L1-1718", "plateNo": "N/A", "makeModel": "TDM15M Extra, Tractor Crawler", "type": "Bulldozer / crawler tractor", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "03/07/2024", "ltoDate": "N/A"},
  {"propertyNo": "L2-1719", "plateNo": "N/A", "makeModel": "Wheel Loader, Komatsu WA320-6", "type": "Wheel loader", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "N/A", "ltoDate": "N/A"},
  {"propertyNo": "L2-1458", "plateNo": "N/A", "makeModel": "Wheel Loader,Foton,Mdl. FL936F", "type": "Wheel loader", "group": "equipment", "office": "First Ilocos Norte District Engineering Office", "endUser": "Alvin-Barrey L. Taguicana", "position": "Engineer III", "parDate": "28/02/2024", "ltoDate": "N/A"},
  {"propertyNo": "LX-135", "plateNo": "N/A", "makeModel": "Backhoe Loader, MST 544S", "type": "Backhoe loader", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Rachelle G. Lomague", "position": "Chief, EMD", "parDate": "14/07/2025", "ltoDate": "N/A"},
  {"propertyNo": "K3-19", "plateNo": "N/A", "makeModel": "Watermaster 18, Classic IV (SDA-21)", "type": "Dredger", "group": "equipment", "office": "Equipment Management Division - Paoay Lake, Paoay, Ilocos Norte", "endUser": "Francis P. Albano", "position": "Dredge Master III", "parDate": "", "ltoDate": ""},
  {"propertyNo": "K4-33", "plateNo": "N/A", "makeModel": "Doosan (Amphibious Excavator)", "type": "Amphibious excavator", "group": "equipment", "office": "Equipment Management Division, Pugo, Bauang, La Union", "endUser": "Adrian Christian C. Angadol", "position": "Engineer II", "parDate": "18/12/2020", "ltoDate": ""},
  {"propertyNo": "T1-106", "plateNo": "N/A", "makeModel": "STIHL MS440 24\", Chainsaw", "type": "Chainsaw", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Rino G. Mazon", "position": "Automotive Eqpt. Inspector II", "parDate": "03/07/2024", "ltoDate": "N/A"},
  {"propertyNo": "T1-107", "plateNo": "N/A", "makeModel": "STIHL MS440 24\", Chainsaw", "type": "Chainsaw", "group": "equipment", "office": "Equipment Management Division, Acao, Bauang, La Union", "endUser": "Rino G. Mazon", "position": "Automotive Eqpt. Inspector II", "parDate": "03/07/2024", "ltoDate": "N/A"}
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
