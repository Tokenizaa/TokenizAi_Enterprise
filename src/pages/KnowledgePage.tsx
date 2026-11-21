/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { FilterBar } from '../components/data/FilterBar';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { DetailDrawer } from '../components/layout/DetailDrawer';
import { knowledgeService } from '../services/knowledgeService';
import { KnowledgeArticle } from '../types';
import {
  BookOpen,
  FileText,
  Search,
  Plus,
  Layers,
  ShieldCheck,
  User,
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface KnowledgePageProps {
  onNavigate: (route: string) => void;
}

export const KnowledgePage: React.FC<KnowledgePageProps> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => knowledgeService.getArticles());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // New Article Form
  const [formData, setFormData] = useState({
    code: `POP-CORP-0${articles.length + 1}`,
    title: '',
    category: 'Procedimentos Operacionais (POP)' as KnowledgeArticle['category'],
    summary: '',
    content: '',
    author_name: 'Dr. Orlando Netto',
    version: 'v1.0',
  });

  const refreshData = () => {
    setArticles(knowledgeService.getArticles(selectedCategory, searchQuery));
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setArticles(knowledgeService.getArticles(selectedCategory, q));
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setArticles(knowledgeService.getArticles(cat, searchQuery));
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    knowledgeService.createArticle({
      code: formData.code,
      title: formData.title,
      category: formData.category,
      summary: formData.summary,
      content: formData.content,
      author_name: formData.author_name,
      version: formData.version,
    });

    setIsModalOpen(false);
    setFormData({
      code: `POP-CORP-0${articles.length + 2}`,
      title: '',
      category: 'Procedimentos Operacionais (POP)',
      summary: '',
      content: '',
      author_name: 'Dr. Orlando Netto',
      version: 'v1.0',
    });
    refreshData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Base de Conhecimento & Procedimentos (POP)"
        subtitle="Biblioteca institucional de procedimentos operacionais padrão, arquitetura e compliance."
        primaryAction={{
          label: 'Novo Artigo / POP',
          onClick: () => setIsModalOpen(true),
          icon: Plus,
        }}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de Documentos"
          value={articles.length}
          subtext="Artigos e POPs homologados"
          icon={BookOpen}
        />
        <StatCard
          label="Procedimentos (POP)"
          value={articles.filter(a => a.category === 'Procedimentos Operacionais (POP)').length}
          subtext="Instruções de execução"
          icon={FileText}
        />
        <StatCard
          label="Segurança & Compliance"
          value={articles.filter(a => a.category === 'Segurança & Compliance').length}
          subtext="Normativas e integridade"
          icon={ShieldCheck}
        />
        <StatCard
          label="Engenharia & Arquitetura"
          value={articles.filter(a => a.category === 'Arquitetura & Engenharia').length}
          subtext="Infraestrutura e modelos"
          icon={Layers}
        />
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Pesquisar nos manuais, POPs ou normas técnicas..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <FilterBar
            filters={[
              {
                key: 'category',
                label: 'Categoria',
                options: [
                  { value: 'all', label: 'Todas as Categorias' },
                  { value: 'Procedimentos Operacionais (POP)', label: 'POPs Operacionais' },
                  { value: 'Arquitetura & Engenharia', label: 'Arquitetura & IA' },
                  { value: 'Segurança & Compliance', label: 'Segurança & Compliance' },
                  { value: 'Políticas de Pessoal', label: 'Políticas de Pessoal' },
                ],
                value: selectedCategory,
                onChange: handleCategoryChange,
              },
            ]}
            onReset={() => handleCategoryChange('all')}
            hasActiveFilters={selectedCategory !== 'all'}
          />
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg">
              Nenhum artigo ou POP encontrado para a busca especificada.
            </div>
          ) : (
            articles.map(art => (
              <div
                key={art.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 font-mono">
                    <span className="text-amber-400 font-medium">{art.code}</span>
                    <div className="flex items-center gap-2">
                      <span>{art.category}</span>
                      <span>·</span>
                      <span>{art.version}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100 mb-2">{art.title}</h3>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {art.summary}
                  </p>
                </div>

                <div className="border-t border-zinc-800/80 pt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <User className="w-3.5 h-3.5 text-zinc-600" />
                    {art.author_name}
                  </span>

                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    <span>Ler Procedimento</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Drawer: Article View */}
      <DetailDrawer
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || 'Procedimento Operacional'}
        subtitle={`${selectedArticle?.code} · Versão: ${selectedArticle?.version}`}
      >
        {selectedArticle && (
          <div className="space-y-6">
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Categoria</span>
                <span className="text-zinc-200">{selectedArticle.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Autor / Homologador</span>
                <span className="text-zinc-200">{selectedArticle.author_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Última Revisão</span>
                <span className="text-zinc-200">
                  {new Date(selectedArticle.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block uppercase tracking-wider">
                Resumo Executivo
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded border border-zinc-800">
                {selectedArticle.summary}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block uppercase tracking-wider">
                Instruções de Execução & Normas
              </span>
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Modal: New Article */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Procedimento (POP) ou Norma"
        subtitle="Documente fluxos corporativos padronizados para consulta da equipe e dos agentes."
      >
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código de Identificação" required>
              <TextInput
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Versão do Documento" required>
              <TextInput
                value={formData.version}
                onChange={e => setFormData({ ...formData, version: e.target.value })}
                placeholder="Ex: v1.0"
                required
              />
            </FormField>
          </div>

          <FormField label="Título do Procedimento" required>
            <TextInput
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Rotina de Homologação de Modelos e Avaliação Constitucional"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Categoria" required>
              <SelectInput
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as KnowledgeArticle['category'] })}
                options={[
                  { value: 'Procedimentos Operacionais (POP)', label: 'Procedimentos Operacionais (POP)' },
                  { value: 'Arquitetura & Engenharia', label: 'Arquitetura & Engenharia' },
                  { value: 'Segurança & Compliance', label: 'Segurança & Compliance' },
                  { value: 'Políticas de Pessoal', label: 'Políticas de Pessoal' },
                ]}
              />
            </FormField>

            <FormField label="Autor / Homologador" required>
              <TextInput
                value={formData.author_name}
                onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Resumo Executivo" required>
            <TextInput
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Síntese breve do objetivo do procedimento"
              required
            />
          </FormField>

          <FormField label="Conteúdo Completo & Passos de Execução" required>
            <TextArea
              rows={6}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escreva passo a passo os requisitos, validações e critérios de aceite..."
              required
            />
          </FormField>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel="Publicar Procedimento"
          />
        </form>
      </Modal>
    </div>
  );
};
