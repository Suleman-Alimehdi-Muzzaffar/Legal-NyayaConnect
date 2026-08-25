export interface ResourceArticleSection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface ResourceArticle {
  slug: string;
  title: string;
  tagline: string;
  intro: string;
  sections: ResourceArticleSection[];
}

export const resourceArticles: ResourceArticle[] = [
  {
    slug: "property-dispute-resolution",
    title: "Understanding Property Dispute Resolution",
    tagline: "Step by step process to resolve inherited property disputes out of court",
    intro:
      "Inherited property disputes are among the most common civil matters in India. Many of them can be resolved without stepping into a courtroom — through family settlement, mediation or negotiation — saving years of time, money and relationships.",
    sections: [
      {
        heading: "Why Resolve Property Disputes Out of Court",
        body: [
          "Court litigation over inherited property routinely takes 5–10 years or more. Beyond the delay, litigation costs include court fees, advocate fees and the emotional toll on family relationships. Out-of-court resolution keeps matters private, cheaper and faster, and often preserves family ties that litigation destroys.",
        ],
      },
      {
        heading: "Step 1: Gather All Documents",
        body: [
          "Before any negotiation, collect every document relating to the property. Missing documents are the single biggest reason settlements fall apart.",
        ],
        bullets: [
          "Original title deed / sale deed of the property.",
          "Mutation records and property tax receipts from the local authority.",
          "Will, succession certificate or letters of administration, if any.",
          "Registered partition deed, if one already exists.",
          "Encumbrance certificate to confirm the property is free of mortgages or claims.",
        ],
      },
      {
        heading: "Step 2: Identify All Legal Heirs",
        body: [
          "Under the Indian Succession Act, 1925 and the applicable personal law, identify every legal heir. In many families heirs include daughters, who have an equal right to ancestral property since the Hindu Succession (Amendment) Act, 2005. Make a family tree on paper so nothing is overlooked.",
        ],
      },
      {
        heading: "Step 3: Try a Family Settlement",
        body: [
          "A family settlement is a written agreement where co-owners divide the property among themselves. It does not need registration if it merely records an existing right, but registering it makes enforcement far easier. Once all adult heirs sign, the settlement binds everyone and can be the basis for mutation of records in the sub-registrar's office.",
        ],
      },
      {
        heading: "Step 4: If Needed, Use Mediation",
        body: [
          "If direct talks fail, a mediator — often a retired judge or senior advocate — can facilitate a settlement. Mediation is confidential and the mediator has no power to force a decision, but a well-run mediation resolves a large majority of inheritance disputes. The court may also refer the matter to mediation under Section 89 of the Code of Civil Procedure before trial.",
        ],
      },
      {
        heading: "Step 5: Formalise the Resolution",
        body: [
          "Once agreed, execute a registered partition deed or memorandum of family settlement, get the revenue records mutated, and obtain possession documents. If any co-owner later refuses to comply, the deed becomes the basis for a declaratory suit or execution proceedings.",
        ],
      },
      {
        heading: "When You Must Go to Court",
        body: [
          "Out-of-court resolution is not always possible — for example, with forged documents, minors or absent heirs, or where title is genuinely disputed. In such cases a partition suit or declaratory suit may be unavoidable, but even then the court may push the parties toward a mediated compromise first.",
        ],
      },
    ],
  },
  {
    slug: "rent-agreement-template",
    title: "Standard Rent Agreement Template",
    tagline: "Legally vetted draft for residential rental agreements",
    intro:
      "A written rent agreement protects both landlord and tenant. This guide explains the essential clauses every residential tenancy agreement in India should contain before you sign.",
    sections: [
      {
        heading: "What a Rent Agreement Must Contain",
        body: ["A valid residential rent agreement should clearly record:"],
        bullets: [
          "Names, addresses and identification (Aadhaar/PAN) of landlord and tenant.",
          "Full address and description of the rented premises.",
          "Monthly rent and the date by which it must be paid each month.",
          "Security deposit amount and the conditions for its refund.",
          "Duration of the tenancy and notice period for termination.",
          "Which utilities (electricity, water, maintenance) are included in the rent.",
        ],
      },
      {
        heading: "Stamp Duty and Registration",
        body: [
          "Rent agreements for more than 11 or 12 months must be registered with the Sub-Registrar, and stamp duty is payable according to the state's rates. Registration provides a legal record and makes the agreement enforceable in court.",
        ],
      },
      {
        heading: "Standard Clauses to Watch For",
        body: ["Read these clauses carefully before signing:"],
        bullets: [
          "Lock-in period and penalties for early exit.",
          "Annual rent escalation percentage, if any.",
          "Responsibility for minor repairs and maintenance.",
          "Terms for sub-letting (usually prohibited).",
          "Conditions for entry of the landlord for inspection.",
        ],
      },
      {
        heading: "Landlord and Tenant Rights",
        body: [
          "The tenant has the right to quiet enjoyment of the premises, and the landlord has the right to receive rent on time and to recover possession after proper notice. Unilateral termination, arbitrary rent hikes without notice, or illegal eviction are not permitted without following the agreement and applicable state tenancy law.",
        ],
      },
    ],
  },
  {
    slug: "how-to-file-an-fir",
    title: "How to File an FIR Correctly",
    tagline: "Expert advocate explains the legal procedure for filing an FIR",
    intro:
      "A First Information Report (FIR) is the formal written complaint that starts criminal investigation in India. Filing it correctly the first time can make the difference between a fast, fair investigation and a case that gets stuck.",
    sections: [
      {
        heading: "Who Can File an FIR",
        body: [
          "The person affected by the offence, a person with knowledge of it, or a relative or acquaintance of the victim can file an FIR. It can be filed at the police station having jurisdiction over where the offence occurred.",
        ],
      },
      {
        heading: "The Correct Way to Report",
        body: [
          "Give a written complaint in your own words, in chronological order, stating who, what, when, where and how. Carry whatever evidence you have — photos, messages, call records, witnesses. If you are reporting in person, ask the officer to read the FIR back to you and to give you a free copy of the recorded FIR (under Section 154 CrPC / Section 173 BNSS).",
        ],
      },
      {
        heading: "What If the Police Refuse to Register",
        body: [
          "If the police refuse to register your FIR, you can send a written complaint by post to the Superintendent of Police / Commissioner of Police. If that also fails, you may file a complaint directly before the Magistrate, who can order the police to investigate.",
        ],
      },
      {
        heading: "Information to Keep Ready",
        body: [
          "Police will note your complaint and file number. Keep a copy of the FIR for insurance claims, medical treatment and follow-up with the investigating officer. Note the name and phone number of the investigating officer and the case diary / FIR number.",
        ],
      },
      {
        heading: "Common Mistakes to Avoid",
        body: ["Avoid these errors:"],
        bullets: [
          "Not mentioning all relevant facts and names at the first report.",
          "Giving vague or exaggerated details that differ from later statements.",
          "Failing to collect a copy of the FIR.",
          "Filing in the wrong jurisdiction.",
          "Destroying or altering evidence before the police arrive.",
        ],
      },
    ],
  },
  {
    slug: "digital-privacy-ruling",
    title: "Supreme Court Ruling on Digital Privacy",
    tagline: "Impact of the new DPDP Act on consumer data protection",
    intro:
      "In Justice K.S. Puttaswamy v. Union of India (2017), a nine-judge bench of the Supreme Court declared the right to privacy a fundamental right. The Digital Personal Data Protection (DPDP) Act, 2023 is the statutory framework that now operationalises that right for ordinary consumers.",
    sections: [
      {
        heading: "What the 2017 Judgment Decided",
        body: [
          "The Supreme Court unanimously held that privacy is intrinsic to life and personal liberty under Article 21, and is a fundamental right under Part III of the Constitution. The judgment also laid down a proportionality test: any restriction on privacy must be backed by law, pursue a legitimate aim, and be proportionate to that aim.",
        ],
      },
      {
        heading: "The DPDP Act, 2023 in Brief",
        body: [
          "The DPDP Act regulates how personal data is processed in India. Its key obligations on companies include:",
        ],
        bullets: [
          "Processing personal data only for lawful, specified purposes with consent.",
          "Providing clear notices in simple language about how data is used.",
          "Giving users the right to access, correct and erase their data.",
          "Implementing reasonable security safeguards against breaches.",
          "Appointing a Data Protection Officer and grievance officer.",
          "Accountability for data breaches and penalties for violations.",
        ],
      },
      {
        heading: "What This Means for Consumers",
        body: [
          "As a consumer you now have enforceable rights: to know what data a company holds about you, to demand correction, and to ask for erasure. You must be given meaningful notice and choice. Apps and websites can no longer hide sweeping data collection inside opaque terms of service.",
        ],
      },
      {
        heading: "What to Do If Your Data Is Misused",
        body: [
          "First approach the company's grievance officer and request action. If the response is unsatisfactory, you can complain to the Data Protection Board. For serious breaches you may also have civil remedies and, where fraud is involved, grounds to approach the police and courts.",
        ],
      },
    ],
  },
  {
    slug: "startup-incorporation-playbook",
    title: "Startup Incorporation Playbook",
    tagline: "Legal checklist for founders incorporating a Pvt Ltd company",
    intro:
      "Incorporating a private limited company in India is the most common structure for funded startups. This playbook walks through the legal steps, documents and timelines founders need to know.",
    sections: [
      {
        heading: "Why Incorporate as a Pvt Ltd Company",
        body: [
          "A private limited company offers limited liability, separate legal identity, ease of raising equity funding, and a credible structure for employees and customers. The main costs are the time to incorporate (roughly 7–15 working days) and annual compliance obligations.",
        ],
      },
      {
        heading: "Steps to Incorporate",
        body: ["The incorporation process runs on the Ministry of Corporate Affairs (MCA) portal:"],
        bullets: [
          "Obtain Digital Signature Certificates (DSC) for the proposed directors.",
          "Reserve the company name through the RUN (Reserve Unique Name) facility.",
          "Draft the Memorandum of Association (MoA) and Articles of Association (AoA).",
          "File SPICe+ incorporation forms along with declarations and address proofs.",
          "Receive the Certificate of Incorporation with CIN.",
          "Apply for PAN, TAN and, if needed, GST registration.",
        ],
      },
      {
        heading: "Key Documents",
        body: [
          "Have these ready before you start: identity and address proof of directors, registered office proof (utility bill or rent agreement), and photographs. If any director is a foreign national, additional documents and apostilisation may be required.",
        ],
      },
      {
        heading: "Post-Incorporation Compliance",
        body: ["After incorporation, do not forget:"],
        bullets: [
          "Open a current account in the company's name and deposit the subscribed capital.",
          "Appoint an auditor within 30 days.",
          "File the declaration of commencement if required.",
          "Hold board meetings and maintain statutory registers.",
          "File annual returns and financial statements each year.",
        ],
      },
      {
        heading: "Startup India Recognition",
        body: [
          "Startups meeting the criteria can apply for recognition under the Startup India scheme, which offers tax benefits, easier compliance norms and access to funding and mentorship programs.",
        ],
      },
    ],
  },
  {
    slug: "nda-template",
    title: "Non-Disclosure Agreement (NDA)",
    tagline: "Standard dual-party NDA for protecting business secrets",
    intro:
      "A Non-Disclosure Agreement protects confidential information shared between parties — during a business discussion, an investment pitch or an employee engagement. This guide covers the clauses every NDA should have.",
    sections: [
      {
        heading: "What an NDA Protects",
        body: [
          "An NDA restricts the receiving party from disclosing or using confidential information for any purpose other than the agreed one. It typically covers business plans, financial data, customer lists, source code, trade secrets and proprietary methods.",
        ],
      },
      {
        heading: "Essential Clauses",
        body: ["A solid NDA contains:"],
        bullets: [
          "Definition of confidential information — specific and not overly broad.",
          "Obligations of the receiving party and permitted use.",
          "Exclusions: public information, independently developed data, information already known.",
          "Duration of confidentiality obligations (often 2–5 years, indefinite for trade secrets).",
          "Return or destruction of materials on termination.",
          "Remedies, including injunctive relief.",
        ],
      },
      {
        heading: "Unilateral vs Mutual",
        body: [
          "Use a unilateral (one-way) NDA when only one party shares secrets — a startup pitching to an investor, for instance. Use a mutual (two-way) NDA when both parties exchange confidential information, such as a joint venture or partnership discussion.",
        ],
      },
      {
        heading: "Signing and Enforcement",
        body: [
          "Execute the NDA before sharing any confidential material, and clearly mark shared documents as confidential. A breach can be enforced through an injunction and damages. For high-value matters, consult an advocate to tailor the agreement rather than using a generic template.",
        ],
      },
    ],
  },
  {
    slug: "consumer-ecommerce-rights",
    title: "Consumer Rights in E-commerce",
    tagline: "How to claim refunds and file cases against defective online products",
    intro:
      "Online shopping is fully covered under the Consumer Protection Act, 2019. If a product is defective, delayed or never delivered, consumers have clear rights and a simple process to get a refund or replacement.",
    sections: [
      {
        heading: "Your Rights as an Online Buyer",
        body: ["Under the 2019 Act you have the right to:"],
        bullets: [
          "Receive goods that match the description, quality and features shown.",
          "Get a refund or replacement for defective or deficient goods.",
          "A refund for services not rendered or rendered below standard.",
          "Compensation for loss or injury caused by defective products.",
          "Protection against unfair trade practices and misleading advertisements.",
        ],
      },
      {
        heading: "Step-by-Step Complaint Process",
        body: [
          "Contact the seller or e-commerce platform's customer care with order details and photographs. If unresolved, escalate to the platform's internal dispute resolution mechanism (mandatory since 2021). Keep every record — order confirmation, invoice, screenshots and chat logs.",
        ],
      },
      {
        heading: "Filing a Consumer Complaint",
        body: [
          "If the seller does not respond, file a complaint before the District Consumer Commission (up to ₹50 lakh), the State Commission (₹50 lakh–₹2 crore) or the National Commission (above ₹2 crore). Complaints can be filed online through the e-daakhil portal. There is no court fee for consumers earning below the poverty line, and legal aid may be available.",
        ],
      },
      {
        heading: "Time Limits and Evidence",
        body: [
          "A complaint must be filed within two years of the cause of action. Keep the product, packaging, bills, screenshots of the listing and chat records. These are your primary evidence before the commission.",
        ],
      },
      {
        heading: "Unfair Practices to Report",
        body: [
          "Fake discounts, bait-and-switch pricing, forged reviews, manipulation of search results and refusal to honour refunds are all unfair trade practices. Such conduct can be reported to the platform, the consumer commission or the central consumer protection authority.",
        ],
      },
    ],
  },
  {
    slug: "family-court-procedures",
    title: "Navigating Family Court Procedures",
    tagline: "A walkthrough of proceedings in matrimonial disputes",
    intro:
      "Family Courts in India are designed to be less adversarial and more conciliatory than ordinary civil courts. Understanding the stages of a family court matter helps parties prepare and reduces anxiety.",
    sections: [
      {
        heading: "Matters Handled by Family Courts",
        body: [
          "Family Courts deal with matrimonial disputes — divorce, restitution of conjugal rights, judicial separation, maintenance, custody of children, and declaration of validity of marriage. Some states also handle disputes relating to guardianship and inheritance.",
        ],
      },
      {
        heading: "The Conciliation Stage",
        body: [
          "Before admitting a petition, the court is obliged to attempt reconciliation through a counsellor or mediation. This is a genuine opportunity: a trained mediator can help both sides reach a settlement covering divorce, maintenance and custody in one agreement, avoiding years of litigation.",
        ],
      },
      {
        heading: "Court Proceedings Step by Step",
        body: ["If conciliation fails, the matter proceeds:"],
        bullets: [
          "Petition filed and served on the respondent.",
          "Written statement filed by the respondent.",
          "Issues framed by the court.",
          "Evidence stage: examination-in-chief, cross-examination and arguments.",
          "Judgment and decree.",
        ],
      },
      {
        heading: "Interim Applications",
        body: [
          "At any stage either party can seek interim orders — maintenance (Section 125 CrPC / 144 BNSS), child custody during the proceedings, or a protection order in domestic violence cases. These are decided quickly and remain in force until the final judgment.",
        ],
      },
      {
        heading: "Practical Advice for Parties",
        body: [
          "Attend every hearing personally or through counsel. Bring all relevant documents — marriage certificate, bank statements, communication records. Keep a diary of every meeting and event. Counselling is not a weakness; a well-negotiated settlement is often faster and fairer than a contested decree.",
        ],
      },
    ],
  },
  {
    slug: "cybercrime-first-24-hours",
    title: "Cybercrime: Immediate Actions to Take",
    tagline: "First 24 hours checklist if you fall victim to financial cyber fraud",
    intro:
      "The first 24 hours after a cybercrime are critical — especially for financial fraud, where speed determines whether your money can be recovered. This checklist tells you exactly what to do.",
    sections: [
      {
        heading: "The First Hour",
        body: ["Act immediately:"],
        bullets: [
          "Call the 24x7 cyber helpline 1930 and report the fraud.",
          "Freeze the affected bank account / card immediately through your bank's app or helpline.",
          "Change passwords for your net banking, email and UPI PINs.",
          "Note the fraudster's number, transaction IDs and the exact amounts and times.",
        ],
      },
      {
        heading: "Report on the National Portal",
        body: [
          "File a complaint on the National Cyber Crime Reporting Portal (cybercrime.gov.in) or call 1930. Keep the complaint/incident number. For social media crimes, choose the appropriate category; for financial fraud, the complaint is routed to the concerned bank and police team automatically.",
        ],
      },
      {
        heading: "Preserve All Evidence",
        body: [
          "Take screenshots of every message, call log, payment confirmation and the fraudster's profile. Do not delete anything. Store these securely — they are essential for the police investigation and for a successful charge against the perpetrator.",
        ],
      },
      {
        heading: "Safeguard Your Identity",
        body: [
          "If documents such as PAN or Aadhaar were compromised, consider applying for an FIR, informing the issuing authority, and monitoring for loans or accounts opened in your name. Obtain a credit report to check for suspicious activity.",
        ],
      },
      {
        heading: "When a Complaint Is Not Enough",
        body: [
          "If the bank fails to act or the amount is large, escalate to the banking ombudsman. Where personal harassment, stalking or threats are involved, seek a protection order and treat your safety as the first priority.",
        ],
      },
    ],
  },
  {
    slug: "employment-offer-letter",
    title: "Employment Offer Letter",
    tagline: "Standard contract for hiring full-time employees",
    intro:
      "An offer letter formalises the terms of employment and protects both the employer and the employee. This guide explains the essential elements of an effective offer letter in India.",
    sections: [
      {
        heading: "What an Offer Letter Must Cover",
        body: ["A complete offer letter should state:"],
        bullets: [
          "Designation, role and reporting structure.",
          "Compensation — fixed pay, variable pay, and benefits.",
          "Probation period and confirmation process.",
          "Working hours, leave policy and notice period.",
          "Confidentiality, non-compete and IP assignment clauses.",
          "Grounds and procedure for termination.",
        ],
      },
      {
        heading: "Offer Letter vs Employment Contract",
        body: [
          "The offer letter sets out the headline terms; the employment contract (or appointment letter) carries the detailed terms, company policies and statutory compliance documents. Both together form the employment agreement and are signed by the employee.",
        ],
      },
      {
        heading: "Compliance and Statutory Deductions",
        body: [
          "Employers must register for PF (EPFO) and ESI where applicable, deduct TDS, and issue Form 16 annually. State labour codes and the relevant state Shops & Establishments Act govern working hours, leave and overtime.",
        ],
      },
      {
        heading: "Clauses to Review Carefully",
        body: [
          "Before signing, pay attention to the notice period, probation length, non-compete scope, IP assignment (especially for developers and designers), and any clauses that restrict future employment. Courts generally disfavour overly broad non-competes for employees, but the language still matters.",
        ],
      },
    ],
  },
  {
    slug: "labour-code-amendments",
    title: "New Amendments in Labour Laws",
    tagline: "What employers need to know about the upcoming labour codes",
    intro:
      "India has consolidated 29 central labour laws into four labour codes — on wages, industrial relations, social security and occupational safety. Understanding them is essential for every employer and HR team.",
    sections: [
      {
        heading: "The Four Labour Codes",
        body: ["The codes combine and modernise existing labour law:"],
        bullets: [
          "Code on Wages, 2019 — uniform rules for minimum wages, payment and bonus.",
          "Industrial Relations Code, 2020 — rules on unions, strikes and dispute resolution.",
          "Social Security Code, 2020 — PF, ESI, gratuity and welfare for organised and unorganised workers.",
          "Occupational Safety, Health and Working Conditions Code, 2020 — workplace safety, working hours and welfare provisions.",
        ],
      },
      {
        heading: "Key Changes for Employers",
        body: [
          "The codes introduce a universal floor wage, expanded social security coverage to gig and platform workers, and simpler registration under a single window. Employers must comply with new definitions of wages, revised notice periods for industrial disputes and updated compliance obligations.",
        ],
      },
      {
        heading: "What Has Not Changed Yet",
        body: [
          "The rules under the codes are being notified in phases by the central and state governments. Employers should track which provisions are in force in their state, because a code becomes enforceable only after its rules are notified and implemented.",
        ],
      },
      {
        heading: "How to Prepare",
        body: [
          "Review employment contracts and policies against the new wage definition, update payroll systems for the changed wage basket, digitise records for e-inspection, and train HR staff on the new compliance calendar. Consult an employment law specialist before the codes come into force in your state.",
        ],
      },
    ],
  },
];

export const getResourceArticle = (slug: string): ResourceArticle | undefined =>
  resourceArticles.find((article) => article.slug === slug);
