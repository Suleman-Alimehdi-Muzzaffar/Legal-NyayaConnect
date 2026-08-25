export interface LegalTopicSection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface LegalTopic {
  slug: string;
  title: string;
  tagline: string;
  intro: string;
  sections: LegalTopicSection[];
}

export const legalTopics: LegalTopic[] = [
  {
    slug: "constitutional-rights",
    title: "Constitutional Rights",
    tagline: "The supreme guarantees of the Republic",
    intro:
      "The Constitution of India, in force since 26 January 1950, is the supreme law of the land. It defines the structure of government and guarantees a set of Fundamental Rights to every person, along with Fundamental Duties for every citizen.",
    sections: [
      {
        heading: "The Constitution and the Preamble",
        body: [
          "The Preamble declares India a sovereign, socialist, secular, democratic republic and promises justice, liberty, equality and fraternity to all citizens. It is the compass the courts use when interpreting the Constitution.",
        ],
      },
      {
        heading: "Fundamental Rights at a Glance",
        body: [
          "Part III of the Constitution (Articles 12–35) protects the following six categories of rights:",
        ],
        bullets: [
          "Right to Equality (Articles 14–18) — equality before law, no discrimination, equality of opportunity in public employment, abolition of untouchability and titles.",
          "Right to Freedom (Articles 19–22) — speech, assembly, movement, profession, life and personal liberty, and protection on arrest.",
          "Right against Exploitation (Articles 23–24) — no forced or bonded labour, no child labour in hazardous work.",
          "Right to Freedom of Religion (Articles 25–28) — freedom of conscience and religious practice.",
          "Cultural and Educational Rights (Articles 29–30) — protection of minorities and their institutions.",
          "Right to Constitutional Remedies (Article 32) — the right to move the Supreme Court to enforce the above.",
        ],
      },
      {
        heading: "Rights Apply to Everyone",
        body: [
          "Most Fundamental Rights protect all persons in India, citizens and non-citizens alike. Some, such as the freedoms under Article 19 and equality of opportunity in public employment, are available only to citizens.",
        ],
      },
      {
        heading: "Reasonable Restrictions and Emergencies",
        body: [
          "Fundamental Rights are not absolute. The State may impose reasonable restrictions in the interests of public order, security of the State, decency and morality. During a formally declared National Emergency, some rights may be suspended, but Articles 20 and 21 remain protected.",
        ],
      },
      {
        heading: "Enforcing Your Rights",
        body: [
          "If a Fundamental Right is violated, you can file a writ petition in a High Court (Article 226) or the Supreme Court (Article 32). A law that violates Fundamental Rights is unconstitutional under Article 13 and can be struck down.",
        ],
      },
    ],
  },
  {
    slug: "property-laws",
    title: "Property Laws",
    tagline: "Buy, own and protect your assets legally",
    intro:
      "Property law in India is governed by a mix of central and state statutes. This guide covers the essentials of buying, registering and protecting immovable property, and what to do when a dispute arises.",
    sections: [
      {
        heading: "Key Laws That Govern Property",
        body: ["The main legal framework includes:"],
        bullets: [
          "Transfer of Property Act, 1882 — how property is transferred by sale, gift, mortgage and lease.",
          "Registration Act, 1908 — most property transactions must be registered to be valid.",
          "Indian Stamp Act, 1899 — stamp duty is payable on sale deeds and other instruments.",
          "Real Estate (Regulation and Development) Act, 2016 (RERA) — regulates builders and protects home buyers.",
          "Indian Succession Act, 1925 and personal laws — govern inheritance and succession.",
        ],
      },
      {
        heading: "Due Diligence Before You Buy",
        body: ["Before purchasing any property, you should:"],
        bullets: [
          "Verify the title and past ownership records of the property.",
          "Obtain an encumbrance certificate to confirm the property is not mortgaged or subject to claims.",
          "Cross-check the seller's documents against local land records and mutation entries.",
          "Verify the approved layout, plan and approvals for the property or project.",
          "Check for pending dues such as property tax, electricity and water charges.",
        ],
      },
      {
        heading: "Sale Deed and Registration",
        body: [
          "The sale deed is the main document that transfers ownership. It must be executed on stamp paper of appropriate value, presented for registration before the Sub-Registrar, and registration fees and stamp duty must be paid. Only after registration does ownership legally pass to the buyer.",
        ],
      },
      {
        heading: "Common Property Disputes",
        body: ["Typical disputes that reach the courts include:"],
        bullets: [
          "Title disputes and forged documents.",
          "Encroachment and adverse possession claims.",
          "Partition suits among co-owners and family members.",
          "Tenant–landlord eviction and possession matters.",
          "Builder–buyer disputes over delays, quality and possession.",
          "Disputes over the validity of wills and inheritance.",
        ],
      },
      {
        heading: "Protecting Your Rights",
        body: [
          "Keep originals of all documents, get a lawyer to verify title before high-value purchases, and register every transfer. In builder disputes, home buyers can approach RERA for timely remedies. For title fraud or encroachment, consult an advocate who practises in the local civil court.",
        ],
      },
    ],
  },
  {
    slug: "consumer-protection",
    title: "Consumer Protection",
    tagline: "Your rights when goods or services fail you",
    intro:
      "The Consumer Protection Act, 2019 protects every person who buys goods or services for personal use. It gives consumers clear rights and a simple, affordable mechanism to get refunds, replacements or compensation.",
    sections: [
      {
        heading: "Who Is a Consumer",
        body: [
          "A consumer is any person who buys goods or hires services for a consideration, for personal or family use — not for resale or commercial purposes. Online purchases are covered too.",
        ],
      },
      {
        heading: "The Six Consumer Rights",
        body: ["The Act recognises six rights of consumers:"],
        bullets: [
          "Right to safety — protection from hazardous goods and services.",
          "Right to be informed — about quality, quantity, purity, price and standard.",
          "Right to choose — a variety of goods and services at competitive prices.",
          "Right to be heard — consumer interests represented in decisions.",
          "Right to redressal — fair settlement of genuine complaints.",
          "Right to consumer education — knowledge of one's rights.",
        ],
      },
      {
        heading: "Unfair Trade Practices",
        body: [
          "The Act prohibits unfair trade practices such as false advertising, misleading claims, hoarding, false billing and deceptive offers. Endorsing a product without testing it is also an unfair practice.",
        ],
      },
      {
        heading: "Where to File a Complaint",
        body: [
          "Consumer Commissions function at three levels, and jurisdiction depends on the value of the goods or services:",
        ],
        bullets: [
          "District Consumer Disputes Redressal Commission — for claims up to ₹50 lakh.",
          "State Consumer Disputes Redressal Commission — for claims between ₹50 lakh and ₹2 crore.",
          "National Consumer Disputes Redressal Commission — for claims above ₹2 crore.",
        ],
      },
      {
        heading: "How to File a Complaint",
        body: [
          "File first with the seller or service provider in writing. If unresolved, file a complaint with the appropriate Consumer Commission — online through the e-daakhil portal or physically. Keep the invoice, warranty, bills, photographs and all correspondence as evidence. A complaint can be filed in person, or through an authorised agent or a lawyer.",
        ],
      },
    ],
  },
  {
    slug: "criminal-procedure",
    title: "Criminal Procedure",
    tagline: "From FIR to bail — how the criminal process works",
    intro:
      "The criminal justice process determines how a crime is reported, investigated, tried and punished. Since 1 July 2024, the Bharatiya Nagarik Suraksha Sanhita (BNSS) governs criminal procedure, replacing the earlier Code of Criminal Procedure.",
    sections: [
      {
        heading: "New Criminal Laws (2024)",
        body: [
          "India's criminal justice system was overhauled in 2023 with three new codes that came into force on 1 July 2024:",
        ],
        bullets: [
          "Bharatiya Nyaya Sanhita (BNS) — replaces the Indian Penal Code (IPC).",
          "Bharatiya Nagarik Suraksha Sanhita (BNSS) — replaces the Code of Criminal Procedure.",
          "Bharatiya Sakshya Adhiniyam (BSA) — replaces the Indian Evidence Act.",
        ],
      },
      {
        heading: "FIR — The First Information Report",
        body: [
          "An FIR is the written complaint of a cognizable offence, recorded by the police. You have the right to lodge an FIR at the police station where the offence occurred. If the police refuse, you can approach a senior officer or file a complaint before the Magistrate. A 'Zero FIR' can be lodged at any police station, regardless of jurisdiction, and is then transferred to the correct one. The police must give you a free copy of the FIR.",
        ],
      },
      {
        heading: "Your Rights on Arrest",
        body: [
          "Article 22 of the Constitution and the BNSS protect every arrested person:",
        ],
        bullets: [
          "The right to know the grounds of arrest.",
          "The right to remain silent.",
          "The right to consult and be defended by a lawyer of your choice.",
          "The right to inform a relative or friend about the arrest.",
          "The right to be produced before a magistrate within 24 hours of arrest.",
          "The right to be examined by a medical practitioner, and to have a doctor of your choice examine you.",
        ],
      },
      {
        heading: "Bail",
        body: [
          "Bail is the release of an accused person on a bond to appear for trial. A person arrested for a bailable offence is entitled to bail as a matter of right. For non-bailable offences, the court decides based on the gravity of the offence, the evidence, and the risk of flight. Anticipatory bail can be sought in advance by a person who fears arrest on a non-bailable charge.",
        ],
      },
      {
        heading: "The Trial Process",
        body: [
          "After investigation, the police file a charge-sheet before the court. The court then proceeds with framing of charges, recording of evidence, arguments and judgment. Trials are held before Magistrates for less serious offences and before Sessions Courts for serious offences. You can follow proceedings and seek updates through e-courts services.",
        ],
      },
      {
        heading: "Victim's Rights",
        body: [
          "The victim has the right to legal aid, to be informed of the progress of the case, to be heard at key stages, and to claim compensation. Victim compensation schemes exist under the Victim Compensation Scheme for victims of certain serious crimes.",
        ],
      },
    ],
  },
  {
    slug: "family-law-basics",
    title: "Family Law Basics",
    tagline: "Marriage, divorce, custody and maintenance",
    intro:
      "Family law governs the most personal areas of life — marriage, divorce, children, maintenance and inheritance. Indian family law is a blend of secular statutes and personal laws, and the family courts exist specifically to resolve these matters.",
    sections: [
      {
        heading: "Marriage in India",
        body: [
          "Marriages in India are governed by personal laws (Hindu Marriage Act, 1955; Indian Christian Marriage Act, 1872; Muslim personal law) and the secular Special Marriage Act, 1954 for inter-faith or civil marriages. Every marriage must be registered — registration provides legal proof of the marriage.",
        ],
      },
      {
        heading: "Divorce",
        body: [
          "A divorce can be granted by mutual consent (typically involving a cooling-off period, which the court can waive in certain cases) or contested on grounds such as cruelty, desertion, adultery or mental disorder. The Family Court or District Court handles divorce petitions depending on the law applicable.",
        ],
      },
      {
        heading: "Child Custody",
        body: [
          "In custody matters, the paramount consideration is the welfare of the child. Courts may grant custody, visitation rights, or joint parenting arrangements depending on the child's age, stability of parents and the child's wishes in suitable cases.",
        ],
      },
      {
        heading: "Maintenance and Alimony",
        body: [
          "A spouse and children have the right to maintenance. Separate maintenance proceedings exist under the criminal law for wives and children, and under the Protection of Women from Domestic Violence Act, 2005, along with civil claims for alimony. Courts consider the income and needs of both parties while fixing amounts.",
        ],
      },
      {
        heading: "Adoption and Guardianship",
        body: [
          "Adoption in India is primarily regulated by the Hindu Adoption and Maintenance Act, 1956 and the Juvenile Justice (Care and Protection of Children) Act, 2015, through the Central Adoption Resource Authority (CARA). Guardianship matters for minor children are handled by courts.",
        ],
      },
      {
        heading: "Where to Approach",
        body: [
          "Most matrimonial and family disputes are heard by Family Courts, which use a less adversarial, more conciliatory approach. Counselling and mediation are encouraged before litigation. An advocate who practises family law in your jurisdiction can guide you through the documents and procedures involved.",
        ],
      },
    ],
  },
  {
    slug: "digital-rights",
    title: "Digital Rights",
    tagline: "Your rights in the online world",
    intro:
      "As our lives move online, the law has evolved to protect your data, privacy and interests in the digital space. This guide covers your digital rights and what to do if you become a victim of cybercrime.",
    sections: [
      {
        heading: "Right to Privacy",
        body: [
          "In Justice K.S. Puttaswamy v. Union of India (2017), a nine-judge bench of the Supreme Court declared the right to privacy a fundamental right under Article 21. Privacy is the foundation on which data protection law is built.",
        ],
      },
      {
        heading: "The Digital Personal Data Protection Act, 2023",
        body: [
          "The DPDP Act, 2023 regulates how organisations collect and process personal data. Key protections include:",
        ],
        bullets: [
          "Your consent is required before personal data is processed.",
          "You have the right to withdraw consent and request correction or erasure of your data.",
          "Organisations must implement reasonable security safeguards.",
          "Grievances can be raised with the Data Protection Board of India.",
        ],
      },
      {
        heading: "The Information Technology Act, 2000",
        body: [
          "The IT Act defines and punishes cyber offences, including unauthorised access, tampering with computer systems, publishing obscene material online, and identity theft. Intermediaries (platforms) must follow due-diligence rules and act on takedown requests for unlawful content.",
        ],
      },
      {
        heading: "Common Cybercrimes",
        body: ["Be aware of these frequent offences:"],
        bullets: [
          "Phishing and fake websites that steal login credentials.",
          "UPI and payment fraud — including 'digital arrest' scams.",
          "Identity theft and SIM-swap fraud.",
          "Cyberbullying, cyberstalking and online harassment.",
          "Revenge-porn and non-consensual sharing of intimate images.",
          "Ransomware and malware attacks.",
        ],
      },
      {
        heading: "What to Do if You Are a Victim",
        body: [
          "Report immediately: call the national helpline 1930, lodge a complaint at cybercrime.gov.in, and register an FIR. Notify your bank to freeze accounts involved in financial fraud. Preserve evidence — screenshots, links, transaction IDs and messages. Under the IT Act, service providers and the police are obliged to act on reports of offensive content.",
        ],
      },
      {
        heading: "Everyday Digital Hygiene",
        body: [
          "Use strong, unique passwords and enable two-factor authentication. Never share OTPs or PINs. Verify official numbers and websites before sharing money or personal data. The right to be left alone, the right to delete data, and the right to know what data is held about you are all now part of the digital rights framework.",
        ],
      },
    ],
  },
];

export function getLegalTopic(slug: string): LegalTopic | undefined {
  return legalTopics.find((topic) => topic.slug === slug);
}

