/**
 * SCRIPT DE IMPORTAÇÃO DOS 283 PERFIS AGENCY AGENTS
 * 
 * COLE ESTE CÓDIGO NO CONSOLE DO NAVEGADOR (F12 → Console)
 * enquanto estiver logado em https://enterprise.defesai.com.br/agency-catalog
 * 
 * Isso importará todos os 283 perfis do catálogo Agency Agents para o
 * armazenamento local da Enterprise.
 */

(async () => {
  const response = await fetch('/agency-profiles-import.json');
  if (!response.ok) {
    console.error('❌ Não foi possível carregar o arquivo JSON. Verifique se ele foi enviado para o servidor.');
    return;
  }
  
  const profiles = await response.json();
  console.log(`📦 Carregados ${profiles.length} perfis do arquivo JSON`);
  
  // Verificar se o serviço está disponível
  if (typeof window.agencyCatalogService === 'undefined') {
    console.error('❌ agencyCatalogService não está disponível no window. Verifique se a aplicação foi carregada.');
    return;
  }
  
  try {
    const imported = await window.agencyCatalogService.importProfilesAsync(profiles);
    console.log(`✅ ${imported.length} perfis importados com sucesso!`);
    console.log('📊 Estatísticas:', window.agencyCatalogService.stats());
    
    // Recarregar a página para refletir as mudanças
    console.log('🔄 Recarregando página...');
    window.location.reload();
  } catch (error) {
    console.error('❌ Erro ao importar perfis:', error);
  }
})();

console.log('📋 Script de importação pronto. Aguardando execução...');
