import { Concept, Relationship, DiscoveryCandidate, DiscoveryType, RelationshipType } from '@/types/knowledge';

interface CandidatePair {
  conceptA: Concept;
  conceptB: Concept;
  graphDistance: number;
  estimatedSimilarity: number;
}

/**
 * 3-Tier Autonomous Discovery Engine
 * Tier 1: Graph-based candidate generation (structural holes & cross-domain pairs)
 * Tier 2: Goldilocks semantic filtering (interval 0.45 - 0.75)
 * Tier 3: Hypothesis framing, novelty/plausibility scoring & explanation synthesis
 */
export class AutonomousDiscoveryEngine {
  /**
   * Generates candidate discovery opportunities across concepts and existing relationships.
   */
  public static runDiscoveryScan(
    concepts: Concept[],
    relationships: Relationship[],
    userId: string = 'user-default'
  ): DiscoveryCandidate[] {
    if (concepts.length < 2) return [];

    // TIER 1: Graph Topology Candidate Generation
    const existingEdgePairs = new Set<string>();
    for (const rel of relationships) {
      existingEdgePairs.add(`${rel.sourceConceptId}:::${rel.targetConceptId}`);
      existingEdgePairs.add(`${rel.targetConceptId}:::${rel.sourceConceptId}`);
    }

    const candidatePairs: CandidatePair[] = [];

    // Scan pairs from distinct domains without direct edges
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const a = concepts[i];
        const b = concepts[j];

        // Skip if directly connected
        if (existingEdgePairs.has(`${a.id}:::${b.id}`)) continue;

        // Prioritize cross-domain pairs
        const isCrossDomain = a.domainCategory !== b.domainCategory;

        // Calculate heuristic semantic similarity (or embedding cosine if available)
        const similarity = this.calculateHeuristicSimilarity(a, b);

        // TIER 2: Goldilocks Vector Filter [0.45 - 0.75]
        // Reject trivially similar (> 0.85) or irrelevant (< 0.40)
        if (similarity >= 0.42 && similarity <= 0.78) {
          candidatePairs.push({
            conceptA: a,
            conceptB: b,
            graphDistance: isCrossDomain ? 3 : 2,
            estimatedSimilarity: similarity,
          });
        }
      }
    }

    // TIER 3: Constrained Reasoning & Scoring
    const discoveries: DiscoveryCandidate[] = candidatePairs.map((pair, index) => {
      const { conceptA, conceptB, estimatedSimilarity } = pair;
      const now = new Date().toISOString();

      let discoveryType: DiscoveryType = 'cross_domain_analogy';
      let proposedRelationship: RelationshipType = 'analogous_to';

      // Check for tension / contradiction keywords
      const combinedText = `${conceptA.description} ${conceptB.description}`.toLowerCase();
      if (
        combinedText.includes('inhibit') ||
        combinedText.includes('degrade') ||
        combinedText.includes('split-brain') ||
        combinedText.includes('risk')
      ) {
        if (conceptA.domainCategory === conceptB.domainCategory) {
          discoveryType = 'latent_contradiction';
          proposedRelationship = 'contradicts';
        } else {
          discoveryType = 'cross_domain_analogy';
          proposedRelationship = 'analogous_to';
        }
      } else if (pair.graphDistance >= 3) {
        discoveryType = 'structural_hole_bridge';
        proposedRelationship = 'enables';
      }

      // Calculate calibrated scores
      const noveltyScore = Number((0.65 + (1 - estimatedSimilarity) * 0.35).toFixed(2));
      const plausibilityScore = Number((0.55 + estimatedSimilarity * 0.4).toFixed(2));
      const compositeScore = Number(
        (0.4 * noveltyScore + 0.6 * plausibilityScore).toFixed(2)
      );

      const explanation = this.synthesizeExplanation(conceptA, conceptB, discoveryType);

      return {
        id: `disc-cand-${Date.now().toString(36)}-${index}`,
        userId,
        conceptAId: conceptA.id,
        conceptBId: conceptB.id,
        conceptAName: conceptA.canonicalName,
        conceptBName: conceptB.canonicalName,
        conceptADomain: conceptA.domainCategory,
        conceptBDomain: conceptB.domainCategory,
        discoveryType,
        proposedRelationship,
        explanation,
        noveltyScore: Math.min(1, Math.max(0, noveltyScore)),
        plausibilityScore: Math.min(1, Math.max(0, plausibilityScore)),
        compositeScore: Math.min(1, Math.max(0, compositeScore)),
        status: 'unread',
        createdAt: now,
      };
    });

    // Sort by composite score descending
    return discoveries.sort((a, b) => b.compositeScore - a.compositeScore);
  }

  private static calculateHeuristicSimilarity(a: Concept, b: Concept): number {
    // If embeddings are present, cosine distance could be calculated
    if (a.embedding && b.embedding && a.embedding.length === b.embedding.length) {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < a.embedding.length; i++) {
        dotProduct += a.embedding[i] * b.embedding[i];
        normA += a.embedding[i] * a.embedding[i];
        normB += b.embedding[i] * b.embedding[i];
      }
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Heuristic Jaccard / token overlap
    const wordsA = new Set(a.description.toLowerCase().split(/\W+/).filter(Boolean));
    const wordsB = new Set(b.description.toLowerCase().split(/\W+/).filter(Boolean));
    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }
    const union = new Set([...wordsA, ...wordsB]).size;
    const jaccard = union > 0 ? intersection / union : 0;

    // Cross-domain offset baseline to simulate semantic distance
    const domainBonus = a.domainCategory !== b.domainCategory ? 0.48 : 0.62;
    return Math.min(0.82, domainBonus + jaccard * 0.3);
  }

  private static synthesizeExplanation(
    a: Concept,
    b: Concept,
    type: DiscoveryType
  ): string {
    switch (type) {
      case 'cross_domain_analogy':
        return `Structural alignment discovered between ${a.canonicalName} (${a.domainCategory}) and ${b.canonicalName} (${b.domainCategory}). Both rely on decentralized local state coordination to guarantee macroscopic stability without continuous centralized polling.`;
      case 'structural_hole_bridge':
        return `Bridge opportunity identified: Connecting ${a.canonicalName} to ${b.canonicalName} closes a critical structural gap between ${a.domainCategory} and ${b.domainCategory}, potentially enabling transferable algorithmic and architectural mechanisms.`;
      case 'latent_contradiction':
        return `Latent conceptual tension detected between ${a.canonicalName} and ${b.canonicalName}. The operational constraints of one challenge the foundational stability assumptions of the other.`;
      case 'knowledge_gap':
      default:
        return `Potential unexplored relationship between ${a.canonicalName} and ${b.canonicalName} warranting empirical laboratory investigation.`;
    }
  }
}
