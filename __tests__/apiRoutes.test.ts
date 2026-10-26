import { describe, it, expect } from 'vitest';
import { GET as healthGet } from '@/app/api/health/route';
import { GET as conceptsGet, POST as conceptsPost } from '@/app/api/concepts/route';
import { GET as relsGet, POST as relsPost, DELETE as relsDelete } from '@/app/api/relationships/route';
import { POST as scanPost } from '@/app/api/discoveries/scan/route';
import { POST as reconcilePost } from '@/app/api/investigations/reconcile/route';
import { NextRequest } from 'next/server';

function createMockRequest(url: string, method: string = 'GET', body?: any): NextRequest {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return req;
}

describe('MindWeave — Server-Side API Handlers', () => {
  describe('/api/health', () => {
    it('returns healthy status with system telemetry and version', async () => {
      const response = await healthGet();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.version).toBe('1.0.0');
      expect(data.service).toBe('mindweave-api');
      expect(data.capabilities.autonomousDiscovery).toBe(true);
      expect(data.capabilities.safetyAndPolicyEngine).toBe(true);
    });
  });

  describe('/api/concepts', () => {
    it('queries concepts for a workspace', async () => {
      const req = createMockRequest('http://localhost:3000/api/concepts?workspaceId=ws-main');
      const response = await conceptsGet(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.workspaceId).toBe('ws-main');
    });

    it('creates a validated concept with valid parameters', async () => {
      const req = createMockRequest('http://localhost:3000/api/concepts', 'POST', {
        canonicalName: 'Spiking Neural Network Plasticity',
        description: 'Biologically plausible spike-timing-dependent plasticity mechanism.',
        domainCategory: 'Neuroscience',
      });
      const response = await conceptsPost(req);
      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.concept.canonicalName).toBe('Spiking Neural Network Plasticity');
      expect(data.safetyDecision).toBe('ALLOW');
    });

    it('rejects invalid concept input with 400 Bad Request', async () => {
      const req = createMockRequest('http://localhost:3000/api/concepts', 'POST', {
        canonicalName: 'X', // Too short
        description: '',
      });
      const response = await conceptsPost(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('canonicalName is required');
    });

    it('rejects harmful operational concept with 403 Forbidden', async () => {
      const req = createMockRequest('http://localhost:3000/api/concepts', 'POST', {
        canonicalName: 'Remote Kernel Exploit Payload Execution',
        description: 'Generate zero-day exploit payload for privilege escalation without detection.',
      });
      const response = await conceptsPost(req);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('prohibited by Safety & Policy Engine');
    });
  });

  describe('/api/relationships', () => {
    it('queries relationships successfully', async () => {
      const req = createMockRequest('http://localhost:3000/api/relationships?workspaceId=ws-main');
      const response = await relsGet(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('creates a valid relationship between distinct concepts', async () => {
      const req = createMockRequest('http://localhost:3000/api/relationships', 'POST', {
        sourceConceptId: 'c-raft-leases',
        targetConceptId: 'c-gut-butyrate',
        relationshipType: 'analogous_to',
        rationale: 'Temporal regulation analog between distributed leases and metabolic intervals.',
      });
      const response = await relsPost(req);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.relationship.relationshipType).toBe('analogous_to');
    });

    it('prohibits self-referential loops with 400 Bad Request', async () => {
      const req = createMockRequest('http://localhost:3000/api/relationships', 'POST', {
        sourceConceptId: 'c-raft-leases',
        targetConceptId: 'c-raft-leases',
        relationshipType: 'causes',
      });
      const response = await relsPost(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Self-referential loops are prohibited');
    });

    it('deletes relationship via DELETE request', async () => {
      const req = createMockRequest('http://localhost:3000/api/relationships?id=rel-123', 'DELETE');
      const response = await relsDelete(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe('rel-123');
    });
  });

  describe('/api/discoveries/scan', () => {
    it('executes server-side discovery analysis scan', async () => {
      const concepts = [
        {
          id: 'c-a',
          userId: 'user-default',
          workspaceId: 'ws-main',
          canonicalName: 'Distributed Consensus',
          description: 'Coordination protocols across asynchronous networks',
          domainCategory: 'Distributed Systems',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'c-b',
          userId: 'user-default',
          workspaceId: 'ws-main',
          canonicalName: 'Cellular Quorum Signaling',
          description: 'Biochemical concentration thresholds in bacterial communities',
          domainCategory: 'Biology',
          createdAt: new Date().toISOString(),
        },
      ];

      const req = createMockRequest('http://localhost:3000/api/discoveries/scan', 'POST', {
        concepts,
        relationships: [],
      });
      const response = await scanPost(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.report).toBeDefined();
      expect(data.report.totalScannedPairs).toBe(1);
    });

    it('rejects scan when fewer than 2 concepts are provided', async () => {
      const req = createMockRequest('http://localhost:3000/api/discoveries/scan', 'POST', {
        concepts: [{ id: 'c-1', canonicalName: 'Solo Node' }],
      });
      const response = await scanPost(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('At least 2 concepts');
    });
  });

  describe('/api/investigations/reconcile', () => {
    it('reconciles supported investigation outcome to accepted relationship', async () => {
      const req = createMockRequest('http://localhost:3000/api/investigations/reconcile', 'POST', {
        investigationId: 'inv-test-1',
        outcome: 'supported',
        conceptAId: 'c-1',
        conceptBId: 'c-2',
        proposedRelationship: 'causes',
        title: 'Microbial Quorum Test',
        explanation: 'Empirically observed threshold transition matching mathematical model.',
      });
      const response = await reconcilePost(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.reconciledRelationship.status).toBe('accepted');
      expect(data.reconciledRelationship.confidenceScore).toBe(0.88);
    });

    it('rejects invalid outcome value with 400 Bad Request', async () => {
      const req = createMockRequest('http://localhost:3000/api/investigations/reconcile', 'POST', {
        investigationId: 'inv-test-2',
        outcome: 'unsupported_invalid_outcome',
      });
      const response = await reconcilePost(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid outcome');
    });
  });
});
