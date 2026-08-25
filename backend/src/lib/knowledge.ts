const SNIPPETS: Array<{ keywords: string[]; text: string }> = [
  { keywords: ["divorce", "talak", "maintenance", "alimony"], text: "HMA §13 divorce grounds, CrPC 125/BNSS §144 maintenance, Muslim Women Act. Mutual consent 6-month cooling may be waived." },
  { keywords: ["bail", "anticipatory", "custody"], text: "BNSS §482 (CrPC 438) anticipatory bail, §480 regular bail. Consider flight risk, tampering." },
  { keywords: ["property", "registry", "sale deed", "stamp"], text: "Transfer of Property Act, Registration Act §17, Stamp Act. Sale deed needs registration; agreement to sell not title." },
  { keywords: ["rent", "eviction", "tenant"], text: "Rent Control Acts state-wise; 11-month agreement, Model Tenancy Act 2021. Eviction only via due process." },
  { keywords: ["consumer", "refund", "defect"], text: "Consumer Protection Act 2019 — deficiency, unfair trade. Limitation 2 years. E-daakhil filing." },
  { keywords: ["cyber", "fraud", "upi", "digital arrest"], text: "IT Act §66C/D, BNS §318 cheating, report 1930, cybercrime.gov.in within 24h golden hour for UPI." },
  { keywords: ["labour", "pf", "gratuity", "termination"], text: "Industrial Disputes Act, Shops & Establishments, Code on Wages 2019. Termination needs 30-day notice/severance for workmen." },
];

export function getRelevantContext(query: string): string | null {
  const q = query.toLowerCase();
  const hits = SNIPPETS.filter((s) => s.keywords.some((k) => q.includes(k)));
  if (hits.length === 0) return null;
  return hits.map((h) => h.text).join("\n");
}
