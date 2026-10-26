import { SafetyDecision, SafetyCategory, SafetyAssessment } from '@/types/safety';

// Re-export or define safety types if not present
export interface SafetyEvaluationResult {
  decision: 'ALLOW' | 'ALLOW_WITH_LIMITS' | 'CLARIFY' | 'REFUSE_AND_REDIRECT' | 'BLOCK_SPECIFIC_OPERATION';
  category: 'benign' | 'cybersecurity_defensive' | 'cybersecurity_offensive' | 'cbrn' | 'harmful_action' | 'dual_use_research' | 'ambiguous';
  rationaleSummary: string;
  permittedScope?: string;
  assessmentMethod: 'deterministic_rule' | 'llm_classifier' | 'fallback_default';
  policyVersion: string;
}

// Regex triggers for fast deterministic first-pass screening
const CBRN_PATTERNS = [
  /\b(weaponize|synthesis\s+protocol\s+for|enrichment\s+centrifuge\s+cascade|aerosolize\s+pathogen)\b/i,
  /\b(ricin|sarin|vx\s+nerve|anthrax|botulinum)\s+(production|cultivation|dispersion)\b/i,
];

const OFFENSIVE_EXPLOIT_PATTERNS = [
  /\b(build\s+ransomware|create\s+keylogger|generate\s+zero-day\s+exploit|bypass\s+edr\s+payload)\b/i,
  /\b(ddos\s+script\s+generator|credential\s+harvester\s+code)\b/i,
];

const DEFENSIVE_CYBER_PATTERNS = [
  /\b(mitigate|defend|cve-\d+|vulnerability\s+analysis|threat\s+intelligence|formal\s+verification|memory\s+safety)\b/i,
];

export async function evaluateSafetyPolicy(
  text: string,
  entityType: 'source' | 'concept' | 'discovery' | 'investigation' | 'experiment',
  intendedAction: 'capture' | 'extract' | 'discover' | 'generate_plan' | 'export' = 'capture'
): Promise<SafetyEvaluationResult> {
  const policyVersion = 'v1.0';

  // 1. Check for absolute prohibited operational requests (CBRN / severe harm)
  for (const pattern of CBRN_PATTERNS) {
    if (pattern.test(text)) {
      return {
        decision: 'BLOCK_SPECIFIC_OPERATION',
        category: 'cbrn',
        rationaleSummary: 'Operational instructions or synthesis protocols for catastrophic chemical, biological, or nuclear agents are prohibited.',
        assessmentMethod: 'deterministic_rule',
        policyVersion,
      };
    }
  }

  // 2. Check for actionable offensive exploit requests
  for (const pattern of OFFENSIVE_EXPLOIT_PATTERNS) {
    if (pattern.test(text)) {
      if (intendedAction === 'generate_plan' || intendedAction === 'export') {
        return {
          decision: 'REFUSE_AND_REDIRECT',
          category: 'cybersecurity_offensive',
          rationaleSummary: 'Refusing operational exploit weaponization payload. Redirecting to threat mitigation architecture and defense.',
          permittedScope: 'Permitted: Architectural resilience, static code analysis, defensive telemetry, and vulnerability patching models.',
          assessmentMethod: 'deterministic_rule',
          policyVersion,
        };
      }
      // Fail-open for raw note capture (user taking research notes on a known malware mechanism)
      return {
        decision: 'ALLOW_WITH_LIMITS',
        category: 'dual_use_research',
        rationaleSummary: 'Dual-use cyber threat research. Note capture allowed, operational exploit payload generation disabled.',
        permittedScope: 'Theoretical study, architectural vulnerability classification, and mitigation modeling.',
        assessmentMethod: 'deterministic_rule',
        policyVersion,
      };
    }
  }

  // 3. Defensive cybersecurity analysis
  for (const pattern of DEFENSIVE_CYBER_PATTERNS) {
    if (pattern.test(text)) {
      return {
        decision: 'ALLOW',
        category: 'cybersecurity_defensive',
        rationaleSummary: 'Legitimate defensive security and threat analysis.',
        assessmentMethod: 'deterministic_rule',
        policyVersion,
      };
    }
  }

  // Default: Benign research content
  return {
    decision: 'ALLOW',
    category: 'benign',
    rationaleSummary: 'Benign conceptual knowledge exploration.',
    assessmentMethod: 'deterministic_rule',
    policyVersion,
  };
}
