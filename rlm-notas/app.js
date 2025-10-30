// Global State - Armazenamento em memória (não usa localStorage)
let currentUser = null;
let users = [
  { email: 'admin@rlmtec.com', senha: '123456', nome: 'Administrador RLM' }
];

let tickets = [
  {
    id: 1,
    titulo: 'Reparo Urgente - Sistema Down',
    tipo: 'Reparo de Equipamentos',
    prioridade: 'Alta',
    descricao: 'Sistema de produção parou. Necessário diagnóstico e reparo urgente da placa eletrônica do controlador',
    cliente: 'Empresa ABC Manufatura',
    telefone: '(11) 98765-4321',
    endereco: 'Rua Industrial, 123 - São Paulo/SP',
    data_criacao: '2025-10-30',
    data_prazo: '2025-10-30',
    status: 'Aberto'
  },
  {
    id: 2,
    titulo: 'Manutenção Preventiva Mensal',
    tipo: 'Manutenção Preventiva',
    prioridade: 'Média',
    descricao: 'Manutenção programada conforme cronograma. Limpeza, inspeção e testes funcionais dos equipamentos',
    cliente: 'Indústria Delta Ltda',
    telefone: '(11) 87654-3210',
    endereco: 'Avenida Tecnológica, 456 - São Paulo/SP',
    data_criacao: '2025-10-28',
    data_prazo: '2025-11-05',
    status: 'Em Andamento'
  },
  {
    id: 3,
    titulo: 'Instalação Novo Servidor',
    tipo: 'Instalação de Sistemas',
    prioridade: 'Alta',
    descricao: 'Instalação, configuração e testes de novo servidor redundante para backup crítico',
    cliente: 'Empresa Gama Solutions',
    telefone: '(11) 99876-5432',
    endereco: 'Rua das Soluções, 789 - São Paulo/SP',
    data_criacao: '2025-10-20',
    data_prazo: '2025-11-02',
    status: 'Finalizado'
  },
  {
    id: 4,
    titulo: 'Inspeção de Conformidade',
    tipo: 'Inspeção Técnica',
    prioridade: 'Baixa',
    descricao: 'Inspeção de conformidade com normas de segurança e documentação técnica',
    cliente: 'Empresa Beta Tech',
    telefone: '(11) 91234-5678',
    endereco: 'Rua Tecnológica, 321 - São Paulo/SP',
    data_criacao: '2025-10-29',
    data_prazo: '2025-11-10',
    status: 'Aberto'
  },
  {
    id: 5,
    titulo: 'Consultoria Sistema ERP',
    tipo: 'Consultoria Técnica',
    prioridade: 'Média',
    descricao: 'Consultoria para implementação de novo sistema ERP. Análise de processos e customizações necessárias',
    cliente: 'Empresa Sigma Corp',
    telefone: '(11) 92345-6789',
    endereco: 'Av. Corporate, 1000 - São Paulo/SP',
    data_criacao: '2025-10-15',
    data_prazo: '2025-10-31',
    status: 'Finalizado'
  }
];

let nextTicketId = 6;
let editingTicketId = null;
let currentFilters = {
  tipo: '',
  prioridade: '',
  cliente: '',
  dataInicial: '',
  dataFinal: '',
  search: ''
};

// Utility Functions
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

// Authentication Functions
function showLoginForm() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.querySelectorAll('.auth-tab')[0].classList.add('active');
  document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

function showRegisterForm() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  document.querySelectorAll('.auth-tab')[0].classList.remove('active');
  document.querySelectorAll('.auth-tab')[1].classList.add('active');
}

function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginPassword').value;
  
  const user = users.find(u => u.email === email && u.senha === senha);
  
  if (user) {
    currentUser = user;
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    showToast(`Bem-vindo ao Sistema RLM, ${user.nome}!`, 'success');
    showDashboard();
  } else {
    showToast('Email ou senha incorretos. Use: admin@rlmtec.com / 123456', 'error');
  }
}

function handleRegister(event) {
  event.preventDefault();
  
  const nome = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const senha = document.getElementById('registerPassword').value;
  const confirmarSenha = document.getElementById('registerConfirmPassword').value;
  
  if (senha !== confirmarSenha) {
    showToast('As senhas não coincidem', 'error');
    return;
  }
  
  if (users.find(u => u.email === email)) {
    showToast('Este email já está cadastrado', 'error');
    return;
  }
  
  users.push({ email, senha, nome });
  showToast('Conta criada com sucesso!', 'success');
  showLoginForm();
  document.getElementById('registerForm').reset();
}

function handleLogout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    currentUser = null;
    showScreen('loginScreen');
    showToast('Até logo! Sessão encerrada com sucesso', 'info');
  }
}

// Dashboard Functions
function showDashboard() {
  showScreen('dashboardScreen');
  document.getElementById('userInfo').textContent = currentUser.nome;
  renderTickets();
}

function renderTickets() {
  const openTicketsContainer = document.getElementById('openTickets');
  const closedTicketsContainer = document.getElementById('closedTickets');
  
  const filteredTickets = applyCurrentFilters();
  
  const openTickets = filteredTickets.filter(t => t.status === 'Aberto' || t.status === 'Em Andamento');
  const closedTickets = filteredTickets.filter(t => t.status === 'Finalizado' || t.status === 'Cancelado');
  
  document.getElementById('openCount').textContent = openTickets.length;
  document.getElementById('closedCount').textContent = closedTickets.length;
  
  openTicketsContainer.innerHTML = openTickets.length === 0 
    ? '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-24);">Nenhuma nota aberta</p>'
    : openTickets.map(ticket => createTicketCard(ticket)).join('');
  
  closedTicketsContainer.innerHTML = closedTickets.length === 0
    ? '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-24);">Nenhuma nota finalizada</p>'
    : closedTickets.map(ticket => createTicketCard(ticket)).join('');
}

function createTicketCard(ticket) {
  const statusClass = ticket.status.toLowerCase().replace(/ /g, '-');
  return `
    <div class="ticket-card ${statusClass}" onclick="viewTicketDetail(${ticket.id})">
      <div class="ticket-header">
        <div>
          <div class="ticket-id">#${String(ticket.id).padStart(4, '0')}</div>
          <div class="ticket-title">${ticket.titulo}</div>
        </div>
        <span class="ticket-priority ${ticket.prioridade.toLowerCase()}">${ticket.prioridade}</span>
      </div>
      <div class="ticket-info">
        <div><strong>Cliente:</strong> ${ticket.cliente}</div>
        <div><strong>Tipo:</strong> ${ticket.tipo}</div>
        <div><strong>Prazo:</strong> ${formatDate(ticket.data_prazo)}</div>
      </div>
      <div class="ticket-actions">
        <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); editTicket(${ticket.id})">Editar</button>
        ${ticket.status === 'Aberto' || ticket.status === 'Em Andamento' 
          ? `<button class="btn btn--primary btn--sm" onclick="event.stopPropagation(); closeTicket(${ticket.id})">Finalizar</button>`
          : ''}
        <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); deleteTicket(${ticket.id})" style="color: var(--color-error);">Excluir</button>
      </div>
    </div>
  `;
}

// Ticket Management Functions
function showNewTicketForm() {
  editingTicketId = null;
  document.getElementById('formTitle').textContent = 'Nova Nota';
  document.getElementById('ticketForm').reset();
  showScreen('newTicketScreen');
}

function editTicket(ticketId) {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  
  editingTicketId = ticketId;
  document.getElementById('formTitle').textContent = 'Editar Nota';
  
  document.getElementById('ticketTitulo').value = ticket.titulo;
  document.getElementById('ticketTipo').value = ticket.tipo;
  document.getElementById('ticketPrioridade').value = ticket.prioridade;
  document.getElementById('ticketDescricao').value = ticket.descricao;
  document.getElementById('ticketCliente').value = ticket.cliente;
  document.getElementById('ticketTelefone').value = ticket.telefone;
  document.getElementById('ticketEndereco').value = ticket.endereco;
  document.getElementById('ticketPrazo').value = ticket.data_prazo;
  
  showScreen('newTicketScreen');
}

function handleTicketSubmit(event) {
  event.preventDefault();
  
  const ticketData = {
    titulo: document.getElementById('ticketTitulo').value,
    tipo: document.getElementById('ticketTipo').value,
    prioridade: document.getElementById('ticketPrioridade').value,
    descricao: document.getElementById('ticketDescricao').value,
    cliente: document.getElementById('ticketCliente').value,
    telefone: document.getElementById('ticketTelefone').value,
    endereco: document.getElementById('ticketEndereco').value,
    data_prazo: document.getElementById('ticketPrazo').value
  };
  
  if (editingTicketId) {
    // Update existing ticket
    const ticket = tickets.find(t => t.id === editingTicketId);
    if (ticket) {
      Object.assign(ticket, ticketData);
      showToast('Nota atualizada com sucesso!', 'success');
    }
  } else {
    // Create new ticket
    const newTicket = {
      id: nextTicketId++,
      ...ticketData,
      data_criacao: new Date().toISOString().split('T')[0],
      status: 'Aberto'
    };
    tickets.push(newTicket);
    showToast('Nota criada com sucesso!', 'success');
  }
  
  showDashboard();
}

function closeTicket(ticketId) {
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.status = 'Finalizado';
    showToast('Nota finalizada com sucesso!', 'success');
    renderTickets();
  }
}

function deleteTicket(ticketId) {
  if (confirm('Tem certeza que deseja excluir esta nota?')) {
    tickets = tickets.filter(t => t.id !== ticketId);
    showToast('Nota excluída com sucesso!', 'success');
    renderTickets();
    updateHistoryStats();
  }
}

function viewTicketDetail(ticketId) {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  
  const detailHTML = `
    <div class="detail-section">
      <h3>Informações Gerais</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">ID da Nota</div>
          <div class="detail-value">#${String(ticket.id).padStart(4, '0')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Status</div>
          <div class="detail-value">${ticket.status}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Prioridade</div>
          <div class="detail-value">
            <span class="ticket-priority ${ticket.prioridade.toLowerCase()}">${ticket.prioridade}</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Tipo de Serviço</div>
          <div class="detail-value">${ticket.tipo}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>Detalhes da Nota</h3>
      <div class="detail-item">
        <div class="detail-label">Título</div>
        <div class="detail-value">${ticket.titulo}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Descrição</div>
        <div class="detail-value">${ticket.descricao}</div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>Informações do Cliente</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Cliente</div>
          <div class="detail-value">${ticket.cliente}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Telefone</div>
          <div class="detail-value">${ticket.telefone}</div>
        </div>
        <div class="detail-item" style="grid-column: 1 / -1;">
          <div class="detail-label">Endereço</div>
          <div class="detail-value">${ticket.endereco}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>Datas</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Data de Criação</div>
          <div class="detail-value">${formatDate(ticket.data_criacao)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Data de Prazo</div>
          <div class="detail-value">${formatDate(ticket.data_prazo)}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-actions">
      <button class="btn btn--outline" onclick="editTicket(${ticket.id})">Editar Nota</button>
      ${ticket.status === 'Aberto' || ticket.status === 'Em Andamento' 
        ? `<button class="btn btn--primary" onclick="closeTicket(${ticket.id}); showDashboard();">Finalizar Nota</button>`
        : ''}
      <button class="btn btn--outline" onclick="deleteTicket(${ticket.id}); showDashboard();" style="color: var(--color-error);">Excluir Nota</button>
    </div>
  `;
  
  document.getElementById('ticketDetailContent').innerHTML = detailHTML;
  showScreen('ticketDetailScreen');
}

// Filter and Search Functions
function showFilters() {
  const panel = document.getElementById('filtersPanel');
  panel.classList.toggle('hidden');
}

function handleSearch() {
  currentFilters.search = document.getElementById('searchInput').value.toLowerCase();
  renderTickets();
}

function applyFilters() {
  currentFilters.tipo = document.getElementById('filterTipo').value;
  currentFilters.prioridade = document.getElementById('filterPrioridade').value;
  currentFilters.cliente = document.getElementById('filterCliente').value.toLowerCase();
  currentFilters.dataInicial = document.getElementById('filterDataInicial').value;
  currentFilters.dataFinal = document.getElementById('filterDataFinal').value;
  renderTickets();
}

function clearFilters() {
  currentFilters = {
    tipo: '',
    prioridade: '',
    cliente: '',
    dataInicial: '',
    dataFinal: '',
    search: ''
  };
  
  document.getElementById('filterTipo').value = '';
  document.getElementById('filterPrioridade').value = '';
  document.getElementById('filterCliente').value = '';
  document.getElementById('filterDataInicial').value = '';
  document.getElementById('filterDataFinal').value = '';
  document.getElementById('searchInput').value = '';
  
  renderTickets();
}

function applyCurrentFilters() {
  return tickets.filter(ticket => {
    // Search filter
    if (currentFilters.search) {
      const searchMatch = 
        ticket.titulo.toLowerCase().includes(currentFilters.search) ||
        String(ticket.id).includes(currentFilters.search) ||
        ticket.cliente.toLowerCase().includes(currentFilters.search);
      if (!searchMatch) return false;
    }
    
    // Type filter
    if (currentFilters.tipo && ticket.tipo !== currentFilters.tipo) {
      return false;
    }
    
    // Priority filter
    if (currentFilters.prioridade && ticket.prioridade !== currentFilters.prioridade) {
      return false;
    }
    
    // Client filter
    if (currentFilters.cliente && !ticket.cliente.toLowerCase().includes(currentFilters.cliente)) {
      return false;
    }
    
    // Date filters
    if (currentFilters.dataInicial && ticket.data_criacao < currentFilters.dataInicial) {
      return false;
    }
    if (currentFilters.dataFinal && ticket.data_criacao > currentFilters.dataFinal) {
      return false;
    }
    
    return true;
  });
}

// History Functions
function showHistory() {
  showScreen('historyScreen');
  updateHistoryStats();
  renderHistoryTable();
}

function updateHistoryStats() {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Aberto' || t.status === 'Em Andamento').length;
  const closedTickets = tickets.filter(t => t.status === 'Finalizado' || t.status === 'Cancelado').length;
  
  document.getElementById('totalTickets').textContent = totalTickets;
  document.getElementById('openTicketsCount').textContent = openTickets;
  document.getElementById('closedTicketsCount').textContent = closedTickets;
}

function renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  
  if (tickets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: var(--space-24); color: var(--color-text-secondary);">Nenhuma nota cadastrada</td></tr>';
    return;
  }
  
  tbody.innerHTML = tickets.map(ticket => `
    <tr>
      <td>#${String(ticket.id).padStart(4, '0')}</td>
      <td>${ticket.titulo}</td>
      <td>${ticket.cliente}</td>
      <td>${ticket.tipo}</td>
      <td><span class="ticket-priority ${ticket.prioridade.toLowerCase()}">${ticket.prioridade}</span></td>
      <td>${ticket.status}</td>
      <td>${formatDate(ticket.data_criacao)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn--outline btn--sm" onclick="viewTicketDetail(${ticket.id})">Ver</button>
          <button class="btn btn--outline btn--sm" onclick="editTicket(${ticket.id})">Editar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Initialize app
showScreen('loginScreen');