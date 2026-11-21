/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { KnowledgeArticle } from '../types';

export const knowledgeService = {
  getArticles(category?: string, query?: string): KnowledgeArticle[] {
    let list = localStore.getKnowledgeArticles();
    if (category && category !== 'all') {
      list = list.filter(a => a.category === category);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getArticleById(id: string): KnowledgeArticle | undefined {
    return localStore.getKnowledgeArticles().find(a => a.id === id);
  },

  createArticle(data: Omit<KnowledgeArticle, 'id' | 'updated_at'>): KnowledgeArticle {
    const newArt: KnowledgeArticle = {
      ...data,
      id: `art-${Date.now()}`,
      updated_at: new Date().toISOString(),
    };

    localStore.updateKnowledgeArticles(prev => [newArt, ...prev]);
    localStore.logAudit({
      user_id: 'usr-001',
      user_email: 'admin@nettoscorp.com',
      action: 'CREATE',
      resource: 'knowledge_articles',
      resource_id: newArt.id,
      details: { code: newArt.code, title: newArt.title, category: newArt.category },
    });

    return newArt;
  },
};
