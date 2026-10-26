import {
  SafetyDecision,
  CanonicalSafetyDecision,
  SafetyCategory,
  AssessmentMethod,
  toCanonicalDecision,
} from '@/types/safety';

export interface SafetyEvaluationResult {
  decision: SafetyDecision;
  category: SafetyCategory;
  rationaleSummary: string;
  permittedScope?: string;
  safeAlternative?: string;
  assessmentMethod: AssessmentMethod;
  policyVersion: string;
  injectionDetected?: boolean;
}

export interface UntrustedContentFraming {
  sanitizedText: string;
  xmlFramedContent: string;
  hasInjectionPayload: boolean;
  detectedSignatures: string[];
}

// Biological / Chemical hazardous synthesis signatures
const HAZARDOUS_CBRN_TERMS = [
  'weaponize',
  'synthesis protocol for',
  'enrichment centrifuge cascade',
  'aerosolize pathogen',
  'production of ricin',
  'cultivation of anthrax',
  'sarin gas synthesis',
  'vx nerve agent dispersion',
  'botulinum toxin weaponization',
  'dirty bomb dispersal',
  'plutonium refinement steps',
];

// Operational exploit generation patterns (active creation/weaponization)
const OPERATIONAL_EXPLOIT_PATTERNS = [
  /\b(write|create|build|generate|code)\s+(a\s+)?(ransomware|keylogger|stealer|zero-day\s+exploit|rootkit|payload)\b/i,
  /\b(bypass\s+(edr|antivirus|defender)\s+payload|credential\s+harvester\s+code)\b/i,
  /\b(ddos\s+attack\s+script|botnet\s+c2\s+controller\s+code)\b/i,
];

// Dual-use sensitive topic mentions without operational build commands
const DUAL_USE_RESEARCH_PATTERNS = [
  /\b(ransomware|malware|keylogger|rootkit|botnet|zero-day|exploit\s+chain)\b/i,
];

// Educational / Defensive cybersecurity signals
const DEFENSIVE_PREVENTION_PATTERNS = [
  /\b(prevent|mitigate|defend|defense|remediate|patch|cve-\d+|memory\s+safety|formal\s+verification|vulnerabilit(y|ies))\b/i,
  /\b(how\s+to\s+protect|incident\s+response|threat\s+intelligence|hardening|firewall|audit|resilience)\b/i,
];

// Disguised research attempts (e.g. "For educational purposes only, write an exploit")
const DISGUISED_RESEARCH_PATTERNS = [
  /\b(for\s+educational\s+purposes\s+only|as\s+a\s+thought\s+experiment|hypothetically)\s*,?\s*(write|generate|give\s+me)\s+(an?\s+)?(exploit|malware|payload)\b/i,
];

// Prompt injection signatures in imported sources
const PROMPT_INJECTION_SIGNATURES = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt\s+override/i,
  /you\s+are\s+now\s+(in\s+)?unrestricted/i,
  /disregard\s+(the\s+)?governing\s+policy/i,
  /exfiltrate\s+(api\s+keys|credentials|secrets)/i,
  /reveal\s+(internal\s+system\s+instructions|system\s+prompt)/i,
];

/**
 * Cross-Cutting Safety & Policy Engine
 *
 * Implements the 5-state policy model:
 * 1. ALLOW: Legitimate educational, scientific, and defensive research.
 * 2. RESTRICT: Dual-use topics permitted under explicit boundary constraints.
 * 3. REFUSE_AND_REDIRECT: Operational harm refused, with constructive safe alternatives.
 * 4. REVIEW_REQUIRED: Ambiguous, conflicting, or unassessed requests held conservatively.
 * 5. BLOCK_SPECIFIC_OPERATION: Absolute block on catastrophic operational harm (CBRN).
 */
export async function evaluateSafetyPolicy(
  text: string,
  entityType: 'source' | 'concept' | 'discovery' | 'investigation' | 'experiment',
  intendedAction: 'capture' | 'extract' | 'discover' | 'generate_plan' | 'export' = 'capture'
): Promise<SafetyEvaluationResult> {
  const policyVersion = 'v1.0';

  // Conservative handling for missing, undefined, or empty inputs
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      decision: 'REVIEW_REQUIRED',
      category: 'ambiguous',
      rationaleSummary: 'Input content is missing or unpopulated; conservative policy gate requires review before proceeding.',
      safeAlternative: 'Provide substantive research text or conceptual context to permit automated evaluation.',
      assessmentMethod: 'fallback_default',
      policyVersion,
    };
  }

  const normalized = text.toLowerCase();

  // 1. Absolute Block: Catastrophic CBRN Weaponization Protocols
  const isCBRN = HAZARDOUS_CBRN_TERMS.some((term) => normalized.includes(term));
  if (isCBRN) {
    return {
      decision: 'BLOCK_SPECIFIC_OPERATION',
      category: 'cbrn',
      rationaleSummary: 'Operational instructions or synthesis protocols for catastrophic biological, chemical, radiological, or nuclear agents are prohibited.',
      assessmentMethod: 'deterministic_rule',
      policyVersion,
    };
  }

  // 2. Disguised Harm Detection: Masked as hypothetical or educational
  for (const pattern of DISGUISED_RESEARCH_PATTERNS) {
    if (pattern.test(text)) {
      return {
        decision: 'REFUSE_AND_REDIRECT',
        category: 'cybersecurity_offensive',
        rationaleSummary: 'Refusing operational exploit weaponization regardless of educational framing.',
        permittedScope: 'Permitted: Architectural threat analysis, defensive mitigation strategies, and static code security modeling.',
        safeAlternative: 'Explore defensive vulnerability patching or static code audit patterns for this attack surface.',
        assessmentMethod: 'deterministic_rule',
        policyVersion,
      };
    }
  }

  const hasExploitPattern = OPERATIONAL_EXPLOIT_PATTERNS.some((p) => p.test(text));
  const hasDefensivePattern = DEFENSIVE_PREVENTION_PATTERNS.some((p) => p.test(text));
  const hasDualUseMention = DUAL_USE_RESEARCH_PATTERNS.some((p) => p.test(text));

  // 3. Conflicting Signals: Both offensive generation and defensive intentions present
  if (hasExploitPattern && hasDefensivePattern) {
    return {
      decision: 'REVIEW_REQUIRED',
      category: 'ambiguous',
      rationaleSummary: 'Conflicting signals detected: request pairs exploit payload indicators with defensive remediation claims. Conservative review is required before actionable generation.',
      permittedScope: 'Permitted upon manual verification: Defense telemetry modeling and vulnerability impact assessment.',
      safeAlternative: 'Isolate defensive remediation goals and remove requests for weaponized payloads.',
      assessmentMethod: 'deterministic_rule',
      policyVersion,
    };
  }

  // 4. Operational Exploit Requests
  if (hasExploitPattern) {
    if (intendedAction === 'generate_plan' || intendedAction === 'export') {
      return {
        decision: 'REFUSE_AND_REDIRECT',
        category: 'cybersecurity_offensive',
        rationaleSummary: 'Refusing operational exploit payload generation.',
        permittedScope: 'Permitted: Threat modeling, formal defense verification, telemetry detection signatures.',
        safeAlternative: 'Consider designing an investigation into threat telemetry detection rules (e.g. Sigma/YARA) for this vector.',
        assessmentMethod: 'deterministic_rule',
        policyVersion,
      };
    }

    // Fail-open for theoretical study / notes on malware mechanisms under explicit constraints
    return {
      decision: 'RESTRICT',
      category: 'dual_use_research',
      rationaleSummary: 'Dual-use threat topic identified. Research note capture permitted; executable weaponization is disabled.',
      permittedScope: 'Permitted: Theoretical concept exploration, vulnerability classification, defensive mitigation models.',
      safeAlternative: 'Document the structural mechanics and security countermeasures rather than operational exploits.',
      assessmentMethod: 'deterministic_rule',
      policyVersion,
    };
  }

  // 5. Dual-Use Topic Analysis (Mention of malware/exploit mechanisms for research)
  if (hasDualUseMention) {
    return {
      decision: 'RESTRICT',
      category: 'dual_use_research',
      rationaleSummary: 'Dual-use threat topic identified. Research note capture permitted; executable weaponization is disabled.',
      permittedScope: 'Permitted: Theoretical concept exploration, vulnerability classification, defensive mitigation models.',
      safeAlternative: 'Document the structural mechanics and security countermeasures rather than operational exploits.',
      assessmentMethod: 'deterministic_rule',
      policyVersion,
    };
  }

  // 6. Defensive & Preventative Research (Ensures sensitive keywords don't trigger false positives)
  if (hasDefensivePattern) {
    return {
      decision: 'ALLOW',
      category: 'cybersecurity_defensive',
      rationaleSummary: 'Verified defensive security and mitigation research.',
      permittedScope: 'Full access: Architectural vulnerability analysis, patch testing, defensive telemetry.',
      assessmentMethod: 'deterministic_rule',
      policyVersion,
    };
  }

  // 7. Ambiguous Dual-Use Checks (e.g. network tooling without context)
  if (
    (normalized.includes('port scan') || normalized.includes('packet injection') || normalized.includes('reverse shell')) &&
    !normalized.includes('mitigate') &&
    !normalized.includes('defend') &&
    !normalized.includes('firewall')
  ) {
    if (intendedAction === 'generate_plan') {
      return {
        decision: 'REVIEW_REQUIRED',
        category: 'ambiguous',
        rationaleSummary: 'Ambiguous dual-use tool request. Please clarify whether your research goal is defensive auditing or network resilience analysis.',
        permittedScope: 'Permitted upon clarification of defensive authorized boundary testing.',
        safeAlternative: 'Specify your authorization boundary or framing around network observability and intrusion prevention.',
        assessmentMethod: 'deterministic_rule',
        policyVersion,
      };
    }
  }

  // 8. Default: Benign Conceptual Exploration
  return {
    decision: 'ALLOW',
    category: 'benign',
    rationaleSummary: 'Benign conceptual knowledge exploration.',
    assessmentMethod: 'deterministic_rule',
    policyVersion,
  };
}

/**
 * Validates whether a safety decision permits promotion to actionable investigation / lab.
 * Enforces safety on the backend/service layer regardless of frontend inputs.
 */
export function isActionPermittedForLab(decision?: string | null): {
  permitted: boolean;
  canonicalDecision: CanonicalSafetyDecision;
  reason: string;
} {
  const canonical = toCanonicalDecision(decision);

  switch (canonical) {
    case 'ALLOW':
      return {
        permitted: true,
        canonicalDecision: 'ALLOW',
        reason: 'Safe for unrestricted investigation planning.',
      };
    case 'RESTRICT':
      return {
        permitted: true,
        canonicalDecision: 'RESTRICT',
        reason: 'Permitted with explicit boundary constraints; executable weaponization disabled.',
      };
    case 'REVIEW_REQUIRED':
      return {
        permitted: false,
        canonicalDecision: 'REVIEW_REQUIRED',
        reason: 'Safety policy review required before experiment planning can proceed.',
      };
    case 'REFUSE_AND_REDIRECT':
      return {
        permitted: false,
        canonicalDecision: 'REFUSE_AND_REDIRECT',
        reason: 'Harmful operational request refused. Consult safe alternatives.',
      };
    case 'BLOCK_SPECIFIC_OPERATION':
      return {
        permitted: false,
        canonicalDecision: 'BLOCK_SPECIFIC_OPERATION',
        reason: 'Catastrophic harm risk blocked by safety policy.',
      };
    default:
      return {
        permitted: false,
        canonicalDecision: 'REVIEW_REQUIRED',
        reason: 'Unknown or unassessed safety status held conservatively.',
      };
  }
}

/**
 * Sanitizes and encloses external untrusted user documents inside strict XML boundaries.
 * Intercepts indirect prompt injection payloads without destroying legitimate source text.
 */
export function sanitizeAndFrameUntrustedContent(
  rawContent: string,
  sourceId: string = 'src-untrusted'
): UntrustedContentFraming {
  const detectedSignatures: string[] = [];

  for (const sig of PROMPT_INJECTION_SIGNATURES) {
    if (sig.test(rawContent)) {
      detectedSignatures.push(sig.source);
    }
  }

  const hasInjectionPayload = detectedSignatures.length > 0;

  // Escape closing XML delimiters in user content to prevent breakout
  const sanitizedText = rawContent
    .replace(/<\/untrusted_document>/gi, '&lt;/untrusted_document&gt;')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[REDACTED_SCRIPT]');

  const xmlFramedContent = `<untrusted_document id="${sourceId}" injection_flag="${hasInjectionPayload ? 'DETECTED' : 'CLEAN'}">\n${sanitizedText}\n</untrusted_document>`;

  return {
    sanitizedText,
    xmlFramedContent,
    hasInjectionPayload,
    detectedSignatures,
  };
}
