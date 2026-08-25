// Common IPC (1860) → BNS (2023) mapping for chatbot translator.
// Source: BNS 2023 Schedule mapping. Only high-frequency sections are listed; chatbot system prompt tells LLM to handle the rest via knowledge.
export const IPC_TO_BNS: Record<string, string> = {
  "302": "103 (Murder)",
  "304": "105 (Culpable homicide not amounting to murder)",
  "304A": "106 (Causing death by negligence)",
  "307": "109 (Attempt to murder)",
  "323": "115(2) (Voluntarily causing hurt)",
  "325": "117 (Grievous hurt)",
  "354": "74 (Assault/criminal force to woman)",
  "354A": "75 (Sexual harassment)",
  "354B": "76 (Assault to disrobe)",
  "354C": "77 (Voyeurism)",
  "354D": "78 (Stalking)",
  "363": "96 (Kidnapping)",
  "366": "98 (Kidnapping/abducting child)",
  "376": "63 (Rape) / 64 (Punishment for rape)",
  "377": "64 (Punishment for rape)",
  "378": "— (removed, now BNS 63-64)",
  "379": "63 (Rape)",
  "392": "— (see BNS theft chapter)",
  "406": "316 (Criminal breach of trust)",
  "420": "318 (Cheating)",
  "498A": "85 (Cruelty by husband/relatives)",
  "506": "351 (Criminal intimidation)",
  "509": "79 (Word/gesture to insult modesty)",
};

export const CRPC_TO_BNSS: Record<string, string> = {
  "125": "144 (Maintenance)",
  "154": "173 (FIR)",
  "161": "180 (Examination by police)",
  "164": "183 (Recording confessions)",
  "173": "193 (Report by police)",
  "200": "223 (Magistrate complaint)",
  "438": "482 (Anticipatory bail)",
  "439": "483 (Bail conditions)",
};

export const EVIDENCE_TO_BSA: Record<string, string> = {
  "32": "23 (Relevancy of statement by deceased)",
  "45": "39 (Opinion of experts)",
  "65A": "62 (Admissibility of electronic records)",
  "65B": "63 (Admissibility of electronic records certificate)",
  "101": "104 (Burden of proof)",
  "118": "121 (Presumption as to dowry death)",
};

export function getBareActHint(): string {
  return "BNS 2023 replaces IPC (e.g. IPC 302→BNS 103), BNSS replaces CrPC (CrPC 438→BNSS 482), BSA replaces Evidence Act (Evidence 45→BSA 39). After 1 July 2024 cite BNS/BNSS/BSA.";
}

export function translateIpcMentions(text: string): string | null {
  const ipcRegex = /\bIPC\s*(?:Sec(?:tion)?\.?\s*)?(\d+[A-Z]?)\b/gi;
  const crpcRegex = /\bCrPC\s*(?:Sec(?:tion)?\.?\s*)?(\d+[A-Z]?)\b/gi;
  const evRegex = /\b(?:Evidence|IEA)\s*(?:Sec(?:tion)?\.?\s*)?(\d+[A-Z]?)\b/gi;
  const hits: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = ipcRegex.exec(text)) !== null) {
    const sec = m[1].toUpperCase();
    const bns = IPC_TO_BNS[sec];
    if (bns) hits.push(`IPC ${sec} → BNS ${bns}`);
  }
  while ((m = crpcRegex.exec(text)) !== null) {
    const sec = m[1].toUpperCase();
    const bnss = CRPC_TO_BNSS[sec];
    if (bnss) hits.push(`CrPC ${sec} → BNSS ${bnss}`);
  }
  while ((m = evRegex.exec(text)) !== null) {
    const sec = m[1].toUpperCase();
    const bsa = EVIDENCE_TO_BSA[sec];
    if (bsa) hits.push(`Evidence ${sec} → BSA ${bsa}`);
  }
  return hits.length ? hits.join("; ") : null;
}
