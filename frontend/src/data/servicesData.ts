export interface ServiceInfo {
  slug: string;
  name: string;
  shortName: string;
  svgType: string;
  description: string;
  documents: string[];
  fee: string;
}

export const servicesData: ServiceInfo[] = [
  {
    slug: "family-law",
    name: "Family & Divorce Law",
    shortName: "Family & Divorce",
    svgType: "family",
    description:
      "Guidance through divorce, child custody, maintenance and domestic matters with a sensitive, solution-first approach.",
    documents: ["Marriage certificate", "ID & address proof of both spouses", "Passport-size photographs", "Income proof of both parties", "Age proof", "Separation agreement / MoU (mutual consent divorce)", "Children's birth certificates (custody matters)", "Previous legal notices, if any"],
    fee: "₹5,000 – ₹30,000",
  },
  {
    slug: "property-law",
    name: "Property Disputes",
    shortName: "Property",
    svgType: "property",
    description:
      "Resolution of title disputes, tenancy conflicts, encroachments and registration issues for residential and commercial property.",
    documents: ["Title deed / sale deed", "Registry & stamp duty receipts", "Property tax receipts", "Encumbrance certificate", "Mutation records (Jamabandi / ROR)", "Site map / layout approval", "ID proof of owner"],
    fee: "₹10,000 – ₹40,000",
  },
  {
    slug: "criminal-law",
    name: "Criminal Defense",
    shortName: "Criminal Defense",
    svgType: "criminal",
    description:
      "Representation from the FIR stage through investigation and trial, including anticipatory and regular bail applications.",
    documents: ["FIR copy / complaint", "Arrest memo & remand orders", "Chargesheet (if filed)", "ID & address proof of the accused", "Passport-size photographs", "Affidavit of the accused", "Surety documents (ID, address & income proof)", "Medical reports (where applicable)", "Previous bail orders, if any"],
    fee: "₹10,000 – ₹50,000 (per stage)",
  },
  {
    slug: "corporate-law",
    name: "Corporate & Startup",
    shortName: "Corporate",
    svgType: "corporate",
    description:
      "Incorporation, shareholder agreements, compliance, due diligence and commercial contracts for businesses of all sizes.",
    documents: ["PAN & Aadhaar of directors / shareholders", "Address proof (bank statement / utility bill)", "Passport-size photographs", "Registered office proof (utility bill + NOC / rent agreement)", "Digital Signature Certificate (DSC) of directors", "MOA / AOA", "Shareholding pattern", "Board resolutions", "Existing agreements"],
    fee: "₹15,000 – ₹1,00,000 (custom retainer)",
  },
  {
    slug: "cyber-crime",
    name: "Cyber Crime",
    shortName: "Cyber Crime",
    svgType: "cyber",
    description:
      "Filing complaints for online fraud, identity theft, defamation and data breaches, and representation before cyber cells.",
    documents: ["Soft copy of national ID proof (Aadhaar / PAN / Passport)", "Transaction details (bank / wallet name, UTR No., date, amount)", "Bank statement (last 6 months)", "SMS / transaction alerts received", "Screenshots & evidence files (emails, chats, URLs)", "Suspect details, if known"],
    fee: "₹8,000 – ₹35,000",
  },
  {
    slug: "tax-law",
    name: "Tax & Compliance",
    shortName: "Tax",
    svgType: "civil",
    description:
      "Income tax notices, GST disputes, appeals before tribunals and compliance guidance for individuals and businesses.",
    documents: ["Tax notices / assessment orders", "Notice of demand", "Grounds of appeal & statement of facts", "Appeal fee payment challan", "ITR filings", "Financial statements", "GST returns", "Bank statements"],
    fee: "₹5,000 – ₹25,000",
  },
  {
    slug: "consumer-law",
    name: "Consumer Protection",
    shortName: "Consumer",
    svgType: "consumer",
    description:
      "Claims against defective products, deficient services, unfair trade practices and delayed deliveries under the Consumer Protection Act.",
    documents: ["Invoice / bill / cash memo / receipt", "Warranty card", "Prior written complaint / legal notice with acknowledgment", "Correspondence with the seller / service provider", "ID & address proof of the complainant", "Defective product evidence"],
    fee: "₹3,000 – ₹15,000",
  },
  {
    slug: "labour-law",
    name: "Labour & Employment",
    shortName: "Labour",
    svgType: "labour",
    description:
      "Wrongful termination, unpaid wages, workplace harassment and employer-employee disputes for workers and companies.",
    documents: ["Appointment letter / employment contract", "Offer letter", "Salary slips (last 3 months)", "Form 16 / proof of earnings", "Attendance / muster roll records", "Termination letter", "Domestic enquiry notice (if any)", "ID proof", "Correspondence with the employer"],
    fee: "₹5,000 – ₹20,000",
  },
  {
    slug: "women-rights",
    name: "Women's Rights",
    shortName: "Women's Rights",
    svgType: "women",
    description:
      "Legal support for domestic violence, dowry harassment, workplace safety and matrimonial remedies, including free legal aid guidance.",
    documents: ["Domestic Incident Report (Form I) / application in Form II", "Affidavit (Form III, for ex-parte orders)", "Marriage certificate", "Copy of complaint to the police, if any", "Medical / medico-legal reports", "Financial records & list of stridhan", "Previous court / maintenance orders, if any", "Harassment evidence", "Identity documents"],
    fee: "₹2,000 – ₹10,000 (legal aid may be free)",
  },
  {
    slug: "civil-law",
    name: "Civil Litigation",
    shortName: "Civil",
    svgType: "civil",
    description:
      "Recovery suits, breach of contract claims, injunctions and other civil matters before district courts and tribunals.",
    documents: ["Contract / agreement", "Invoices & receipts", "Legal notice copies with acknowledgment", "Correspondence between the parties", "ID & address proof of the parties", "Property records (if relevant)"],
    fee: "₹5,000 – ₹30,000",
  },
  {
    slug: "traffic-law",
    name: "Traffic & Motor Vehicle",
    shortName: "Traffic",
    svgType: "traffic",
    description:
      "Challans, licence suspension, accident claims and motor vehicle disputes before the Claims Tribunal and traffic authorities.",
    documents: ["Challan / notice", "Driving licence", "RC book", "Accident FIR / report", "MLC / post-mortem report", "ID & address proof of claimant and deceased", "Original treatment bills & treatment record", "Educational qualifications of the deceased", "Income proof", "Age proof", "Disability certificate (injury claims)", "Third-party insurance cover note", "Affidavit of relationship"],
    fee: "₹2,000 – ₹10,000",
  },
  {
    slug: "elder-law",
    name: "Senior Citizens & Succession",
    shortName: "Elder Law",
    svgType: "senior",
    description:
      "Wills, succession certificates, maintenance for senior citizens and protection against elder abuse.",
    documents: ["Death certificate", "ID & address proof of the applicant", "Legal heir certificate / family tree", "Relationship proof (birth / marriage certificates)", "No-objection from other legal heirs", "Details of debts, securities & assets", "Existing will (if any)", "Pension / income records"],
    fee: "₹3,000 – ₹12,000",
  },
];
