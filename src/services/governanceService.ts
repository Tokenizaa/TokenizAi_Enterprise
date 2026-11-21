/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { Decision, Deliberation, GovernanceDocument } from '../types';

export const governanceService = {
  // ===================================================================
  // DECISIONS (DEC)
  // ===================================================================
  getDecisions(): Decision[] {
    return localStore.getDecisions();
  },

  getDecisionById(id: string): Decision | undefined {
    return localStore.getDecisions().find(d => d.id === id);
  },

  getDecisionByCode(code: string): Decision | undefined {
    return localStore.getDecisions().find(d => d.dec_code.toLowerCase() === code.toLowerCase());
  },

  createDecision(data: Omit<Decision, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Decision {
    const user = localStore.getSessionUser();
    const orgId = user?.organization_id || 'org-nettos-001';

    const newDecision: Decision = {
      id: `dec-${Date.now()}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };

    localStore.updateDecisions(prev => [newDecision, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'decisions',
      resource_id: newDecision.id,
      details: { dec_code: newDecision.dec_code, title: newDecision.title },
    });

    return newDecision;
  },

  updateDecision(id: string, updates: Partial<Decision>): Decision {
    const user = localStore.getSessionUser();
    let updated: Decision | null = null;

    localStore.updateDecisions(prev =>
      prev.map(d => {
        if (d.id === id) {
          updated = { ...d, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return d;
      })
    );

    if (!updated) throw new Error('Decisão não encontrada.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'decisions',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  deleteDecision(id: string): void {
    const user = localStore.getSessionUser();
    const dec = this.getDecisionById(id);
    if (!dec) return;

    localStore.updateDecisions(prev => prev.filter(d => d.id !== id));

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'decisions',
      resource_id: id,
      details: { dec_code: dec.dec_code, title: dec.title },
    });
  },

  // ===================================================================
  // DELIBERATIONS (CNS)
  // ===================================================================
  getDeliberations(): Deliberation[] {
    return localStore.getDeliberations();
  },

  getDeliberationById(id: string): Deliberation | undefined {
    return localStore.getDeliberations().find(d => d.id === id);
  },

  getDeliberationByCode(code: string): Deliberation | undefined {
    return localStore.getDeliberations().find(d => d.cns_code.toLowerCase() === code.toLowerCase());
  },

  createDeliberation(data: Omit<Deliberation, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Deliberation {
    const user = localStore.getSessionUser();
    const orgId = user?.organization_id || 'org-nettos-001';

    const newDelib: Deliberation = {
      id: `cns-${Date.now()}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };

    localStore.updateDeliberations(prev => [newDelib, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'deliberations',
      resource_id: newDelib.id,
      details: { cns_code: newDelib.cns_code, session_date: newDelib.session_date },
    });

    return newDelib;
  },

  updateDeliberation(id: string, updates: Partial<Deliberation>): Deliberation {
    const user = localStore.getSessionUser();
    let updated: Deliberation | null = null;

    localStore.updateDeliberations(prev =>
      prev.map(d => {
        if (d.id === id) {
          updated = { ...d, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return d;
      })
    );

    if (!updated) throw new Error('Deliberação não encontrada.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'deliberations',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  deleteDeliberation(id: string): void {
    const user = localStore.getSessionUser();
    const d = this.getDeliberationById(id);
    if (!d) return;

    localStore.updateDeliberations(prev => prev.filter(item => item.id !== id));

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'deliberations',
      resource_id: id,
      details: { cns_code: d.cns_code, title: d.title },
    });
  },

  // ===================================================================
  // DOCUMENTS (DELIB, POLICIES, REPORTS)
  // ===================================================================
  getDocuments(): GovernanceDocument[] {
    return localStore.getDocuments();
  },

  getDocumentById(id: string): GovernanceDocument | undefined {
    return localStore.getDocuments().find(d => d.id === id);
  },

  createDocument(data: Omit<GovernanceDocument, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): GovernanceDocument {
    const user = localStore.getSessionUser();
    const orgId = user?.organization_id || 'org-nettos-001';

    const newDoc: GovernanceDocument = {
      id: `doc-${Date.now()}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_id: user?.id,
      author_name: user?.full_name,
      ...data,
    };

    localStore.updateDocuments(prev => [newDoc, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'documents',
      resource_id: newDoc.id,
      details: { doc_code: newDoc.doc_code, title: newDoc.title, doc_type: newDoc.doc_type },
    });

    return newDoc;
  },

  updateDocument(id: string, updates: Partial<GovernanceDocument>): GovernanceDocument {
    const user = localStore.getSessionUser();
    let updated: GovernanceDocument | null = null;

    localStore.updateDocuments(prev =>
      prev.map(d => {
        if (d.id === id) {
          updated = { ...d, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return d;
      })
    );

    if (!updated) throw new Error('Documento não encontrado.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'documents',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  deleteDocument(id: string): void {
    const user = localStore.getSessionUser();
    const doc = this.getDocumentById(id);
    if (!doc) return;

    localStore.updateDocuments(prev => prev.filter(d => d.id !== id));

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'documents',
      resource_id: id,
      details: { doc_code: doc.doc_code, title: doc.title },
    });
  },

  // ===================================================================
  // CROSS-REFERENCING (CNS <-> DEC <-> DELIB)
  // ===================================================================
  getCrossReferences(identifier: string): {
    decision?: Decision;
    deliberation?: Deliberation;
    document?: GovernanceDocument;
  } {
    const clean = identifier.trim().toUpperCase();
    const decisions = localStore.getDecisions();
    const deliberations = localStore.getDeliberations();
    const documents = localStore.getDocuments();

    // 1. Check if identifier is DEC
    const foundDec = decisions.find(d => d.dec_code.toUpperCase() === clean);
    // 2. Check if identifier is CNS
    const foundDelib = deliberations.find(d => d.cns_code.toUpperCase() === clean);
    // 3. Check if identifier is DELIB / Document
    const foundDoc = documents.find(d => d.doc_code.toUpperCase() === clean || d.delib_ref?.toUpperCase() === clean);

    // If DEC was found, find related deliberation and document
    if (foundDec) {
      const relDelib = deliberations.find(d => d.id === foundDec.deliberation_ref_id || d.dec_ref_id === foundDec.id || d.cns_code === foundDec.deliberation_cns_code);
      const relDoc = documents.find(d => d.dec_ref === foundDec.dec_code || (relDelib && (d.cns_ref === relDelib.cns_code || d.delib_ref === relDelib.delib_file_ref)));
      return { decision: foundDec, deliberation: relDelib, document: relDoc };
    }

    // If Deliberation was found, find related decision and document
    if (foundDelib) {
      const relDec = decisions.find(d => d.id === foundDelib.dec_ref_id || d.deliberation_ref_id === foundDelib.id || d.dec_code === foundDelib.dec_code_ref);
      const relDoc = documents.find(d => d.cns_ref === foundDelib.cns_code || d.delib_ref === foundDelib.delib_file_ref || d.doc_code === foundDelib.delib_file_ref);
      return { decision: relDec, deliberation: foundDelib, document: relDoc };
    }

    // If Document was found
    if (foundDoc) {
      const relDec = decisions.find(d => d.dec_code === foundDoc.dec_ref);
      const relDelib = deliberations.find(d => d.cns_code === foundDoc.cns_ref || d.delib_file_ref === foundDoc.delib_ref || d.delib_file_ref === foundDoc.doc_code);
      return { decision: relDec, deliberation: relDelib, document: foundDoc };
    }

    return {};
  },
};
