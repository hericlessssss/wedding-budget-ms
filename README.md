# Vows4Ever - Sistema de Gerenciamento de Casamento

Vows4Ever é uma plataforma completa e intuitiva para gerenciamento de casamentos, desenvolvida com tecnologias modernas e focada na melhor experiência do usuário. O sistema oferece ferramentas essenciais para organizar todos os aspectos do planejamento do casamento, desde orçamentos até tarefas diárias.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18**: Framework JavaScript para construção da interface
- **TypeScript**: Superset JavaScript para adicionar tipagem estática
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Framework CSS para estilização
- **Lucide React**: Biblioteca de ícones
- **React Router DOM**: Roteamento da aplicação
- **date-fns**: Manipulação de datas
- **FullCalendar**: Componente de calendário

### Backend
- **Supabase**: Plataforma de backend como serviço
  - Banco de dados PostgreSQL
  - Autenticação de usuários
  - Row Level Security (RLS)
  - Storage para arquivos
  - Realtime subscriptions

## 🎯 Funcionalidades

### 1. Dashboard
O painel principal oferece uma visão geral do planejamento do casamento:
- Resumo do orçamento (total, gasto e restante)
- Contagem de fornecedores
- Próximos eventos
- Tarefas recentes
- Atividades recentes

### 2. Orçamento
Sistema completo de gerenciamento financeiro:
- Categorias de despesas personalizáveis
- Acompanhamento de valores acordados vs. gastos
- Status de pagamento (pendente, parcial, pago)
- Visualização do orçamento total e saldo restante
- Gráficos e relatórios de gastos

### 3. Fornecedores
Gerenciamento completo de fornecedores do casamento:
- Categorias predefinidas:
  - Buffet
  - Decoração
  - Fotografia
  - Música
  - Cerimonial
  - Vestido
  - Local
  - Convites
  - Doces
  - Bolo
  - Outros
- Informações detalhadas:
  - Nome e serviço
  - Preço
  - Status (potencial/confirmado)
  - Status de pagamento
  - Links de portfólio
  - Instagram
  - Upload de contratos
- Observações e comentários
- Sistema de filtros e busca

### 4. Agenda
Calendário interativo para gerenciamento de eventos:
- Visualização mensal, semanal e diária
- Criação de eventos com:
  - Título e descrição
  - Data e hora de início/fim
  - Status (pendente, concluído, cancelado)
- Eventos coloridos por status
- Drag & drop para reorganização
- Lembretes e notificações
- Visualização responsiva

### 5. Galeria
Organização de referências e inspirações:
- Categorias personalizadas:
  - Decoração
  - Flores
  - Vestidos
  - Ternos
  - Convites
  - Bolos
  - Locais
  - Mesas
- Upload de imagens
- Links externos
- Sistema de tags
- Modo grade e slideshow

### 6. Tarefas
Sistema Kanban para gerenciamento de tarefas:
- Listas padrão:
  - A Fazer
  - Em Andamento
  - Concluído
- Recursos:
  - Título e descrição
  - Prioridade (baixa, média, alta)
  - Data de vencimento
  - Drag & drop entre listas
  - Filtros e busca
  - Atribuição de responsáveis

## 🔒 Segurança

- Autenticação segura via Supabase
- Row Level Security (RLS) em todas as tabelas
- Políticas de acesso granulares
- Proteção contra SQL injection
- Backups automáticos
- HTTPS/SSL

## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se a diferentes tamanhos de tela:
- Desktop
- Tablet
- Smartphone
- Orientação retrato e paisagem

## 🔄 Integração como Micro Frontend

Para integrar o Vows4Ever como um micro frontend em um site existente, siga estas etapas:

### 1. Build do Projeto
```bash
npm run build
```

### 2. Configuração do Host
No site principal, adicione as seguintes dependências:
```html
<link rel="stylesheet" href="[caminho]/vows4ever/style.css">
<script type="module" src="[caminho]/vows4ever/main.js"></script>
```

### 3. Componente de Integração
```javascript
// vows4ever-widget.js
class Vows4EverWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <div id="vows4ever-root"></div>
    `;
    
    // Inicializa o app
    window.Vows4Ever.mount(this.shadowRoot.getElementById('vows4ever-root'));
  }
}

customElements.define('vows4ever-widget', Vows4EverWidget);
```

### 4. Uso no Site Principal
```html
<!-- Adicione onde desejar que o Vows4Ever apareça -->
<vows4ever-widget></vows4ever-widget>
```

### 5. Configuração de Rotas
Certifique-se de que o sistema de rotas do site principal está configurado para lidar com as rotas do Vows4Ever:

```javascript
// No router do site principal
{
  path: '/wedding-planner/*',
  component: () => import('./vows4ever-widget')
}
```

### 6. Estilização
Para manter a consistência visual:

```css
/* Variáveis CSS compartilhadas */
:root {
  --vows4ever-primary: #your-primary-color;
  --vows4ever-secondary: #your-secondary-color;
  /* ... outras variáveis ... */
}
```

### 7. Comunicação entre Aplicações
Use eventos customizados para comunicação:

```javascript
// Emitir eventos do Vows4Ever
window.dispatchEvent(new CustomEvent('vows4ever:event', { detail: data }));

// Escutar eventos no site principal
window.addEventListener('vows4ever:event', (e) => {
  console.log(e.detail);
});
```

## 🛠 Manutenção

Para manter o sistema atualizado e funcionando corretamente:

1. Atualizações regulares de dependências
2. Monitoramento de performance
3. Backup regular dos dados
4. Testes de segurança
5. Verificação de compatibilidade cross-browser

## 📝 Notas Importantes

- O sistema requer uma conta no Supabase
- Configuração inicial do banco de dados é automatizada
- Recomendado uso de CDN para assets
- Cache implementado para melhor performance
- Sistema de logs para debugging