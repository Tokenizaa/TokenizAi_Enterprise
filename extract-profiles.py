#!/usr/bin/env python3
"""Extrai os 283 perfis do CATALOGO_GERAL e gera JSON para importação."""

import re
import json
import hashlib
from pathlib import Path

DOC_PATH = "/home/lg/workspace/NettosCorp/NettosCorp/paperclip/CATALOGO_GERAL_AGENTES_AGENCY_AGENTS_TOKENIZAI.md"
OUTPUT_PATH = "/home/lg/workspace/NettosCorp/NettosCorp/enterprise/agency-profiles-import.json"

CATEGORY_MAP = {
    'academic': 'strategy',
    'design': 'technology',
    'engineering': 'technology',
    'finance': 'finance',
    'game-development': 'technology',
    'gis': 'technology',
    'healthcare': 'other',
    'marketing': 'marketing',
    'paid-media': 'marketing',
    'product': 'product',
    'project-management': 'operations',
    'research': 'research',
    'sales': 'sales',
    'security': 'security',
    'spatial-computing': 'technology',
    'specialized': 'other',
    'support': 'customer-success',
    'testing': 'technology',
}

with open(DOC_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Encontrar a seção C (Fichas Completas)
section_start = content.find('## C. Fichas Completas dos Agentes')
if section_start == -1:
    print("ERRO: Seção C não encontrada")
    exit(1)

section_content = content[section_start:]

# Regex para extrair cada ficha
# Grupos: 1=nome, 2=nome_original, 3=nome_pt, 4=categoria, 5=especialidade, 6=source_file
ficha_pattern = re.compile(
    r'^### (.+?)\n'
    r'\n'
    r'- \*\*Nome original:\*\*(.+?)\n'
    r'- \*\*Nome em português:\*\*(.+?)\n'
    r'- \*\*Categoria:\*\*(.+?)\n'
    r'- \*\*Especialidade:\*\*(.+?)\n'
    r'- \*\*Arquivo de origem:\*\*(.+?)\n',
    re.MULTILINE
)

matches = list(ficha_pattern.finditer(section_content))
print(f"Encontradas {len(matches)} fichas")

profiles = []
for i, m in enumerate(matches):
    name = m.group(1).strip()
    # m.group(2) = Nome original
    # m.group(3) = Nome em português
    categoria_line = m.group(4).strip()
    especialidade = m.group(5).strip()
    source_file = m.group(6).strip()

    # Extrair categoria do formato "Nome (`slug`)"
    cat_match = re.search(r'\`([^\`]+)\`', categoria_line)
    category_slug = cat_match.group(1) if cat_match else 'other'
    category = CATEGORY_MAP.get(category_slug, 'other')

    # Encontrar o fim desta ficha
    start = m.end()
    next_match = matches[i + 1] if i + 1 < len(matches) else None
    end = next_match.start() if next_match else len(section_content)
    ficha_text = section_content[start:end]

    # Extrair Descrição Profissional
    desc_match = re.search(r'#### Descrição Profissional\n\n(.+?)(?=\n#### |\n---\n|\Z)', ficha_text, re.DOTALL)
    description = desc_match.group(1).strip() if desc_match else especialidade

    # Extrair Competências
    comp_match = re.search(r'#### Competências\n\n(.+?)(?=\n#### |\n---\n|\Z)', ficha_text, re.DOTALL)
    comp_text = comp_match.group(1).strip() if comp_match else ''
    competencies = []
    if comp_text and 'Não especificado' not in comp_text:
        for line in comp_text.split('\n'):
            line = line.strip().lstrip('*').strip()
            if line:
                competencies.append(line)
    if not competencies:
        competencies = [especialidade]

    # Extrair Personalidade
    pers_match = re.search(r'#### Personalidade\n\n(.+?)(?=\n#### |\n---\n|\Z)', ficha_text, re.DOTALL)
    personality = pers_match.group(1).strip() if pers_match else ''
    if not personality or 'Não especificado' in personality:
        personality = f"Profissional especializado em {especialidade.lower()}"

    # Extrair Responsabilidades
    resp_match = re.search(r'#### Responsabilidades\n\n(.+?)(?=\n#### |\n---\n|\Z)', ficha_text, re.DOTALL)
    resp_text = resp_match.group(1).strip() if resp_match else ''
    responsibilities = []
    if resp_text and 'Não especificado' not in resp_text:
        for line in resp_text.split('\n'):
            line = line.strip().lstrip('*').strip()
            if line:
                responsibilities.append(line)
    if not responsibilities:
        responsibilities = [f"Atuar como {name} na categoria {categoria_line}"]

    # Extrair Metodologia
    met_match = re.search(r'#### Metodologias\n\n(.+?)(?=\n#### |\n---\n|\Z)', ficha_text, re.DOTALL)
    methodology = met_match.group(1).strip() if met_match else ''
    if not methodology or 'Não especificado' in methodology:
        methodology = f"Metodologia profissional baseada em {especialidade.lower()}"

    # Código baseado no nome (remover número inicial)
    name_clean = re.sub(r'^\d+\.\s*', '', name)
    code = re.sub(r'[^a-z0-9]', '-', name_clean.lower()).strip('-')
    code = re.sub(r'-+', '-', code)

    # Hash do arquivo de origem
    source_hash = hashlib.sha256(source_file.encode()).hexdigest()[:16]

    profile = {
        "category": category,
        "specialty": especialidade,
        "name": name_clean,
        "code": code,
        "identity": description,
        "specialty_description": especialidade,
        "competencies": competencies,
        "personality": personality,
        "responsibilities": responsibilities,
        "methodology": methodology,
        "status": "disponivel",
        "source_file": source_file,
        "source_hash": source_hash,
    }
    profiles.append(profile)

print(f"Extraídos {len(profiles)} perfis")

with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(profiles, f, ensure_ascii=False, indent=2)

print(f"Salvo em: {OUTPUT_PATH}")

# Estatísticas por categoria
from collections import Counter
cats = Counter(p['category'] for p in profiles)
print("\nPor categoria:")
for cat, count in sorted(cats.items()):
    print(f"  {cat}: {count}")

# Mostrar primeiros 3 perfis como exemplo
print("\nExemplos:")
for p in profiles[:3]:
    print(f"  {p['code']}: {p['name']} -> {p['category']}")