// main.js - Lógica principal da aplicação

// Estado global da aplicação
let appState = {
    subjects: [],
    examEvents: [], // Array de eventos de provas
    currentPage: 'dashboard',
    currentSubjectId: null
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Inicializa a aplicação
 */
async function initializeApp() {
    console.log("Iniciando Dashboard de Notas...");
    
    setupEventListeners();
    await loadSubjects();
    renderDashboardPage();
}

/**
 * Carrega as matérias da API
 */
async function loadSubjects() {
    appState.subjects = await fetchSubjects();
    renderSubjectsMenu();
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Modal de matéria
    const subjectModal = document.getElementById('subject-modal');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const closeSubjectModal = document.getElementById('close-subject-modal');
    const cancelSubject = document.getElementById('cancel-subject');
    const subjectForm = document.getElementById('subject-form');

    addSubjectBtn.addEventListener('click', () => openSubjectModal());
    closeSubjectModal.addEventListener('click', () => closeModal('subject-modal'));
    cancelSubject.addEventListener('click', () => closeModal('subject-modal'));
    subjectForm.addEventListener('submit', handleSubjectFormSubmit);

    // Modal de avaliação
    const evaluationModal = document.getElementById('evaluation-modal');
    const closeEvaluationModal = document.getElementById('close-evaluation-modal');
    const cancelEvaluation = document.getElementById('cancel-evaluation');
    const evaluationForm = document.getElementById('evaluation-form');

    closeEvaluationModal.addEventListener('click', () => closeModal('evaluation-modal'));
    cancelEvaluation.addEventListener('click', () => closeModal('evaluation-modal'));
    evaluationForm.addEventListener('submit', handleEvaluationFormSubmit);

    // Fechar modal ao clicar fora
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    });

    // Link do dashboard
    const dashboardLink = document.getElementById('dashboard-link');
    dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('dashboard');
    });

    // Link do calendário
    const calendarLink = document.getElementById('calendar-link');
    calendarLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('calendar');
    });

    // Modal de evento de prova
    const examEventModal = document.getElementById('exam-event-modal');
    const closeExamEventModal = document.getElementById('close-exam-event-modal');
    const cancelExamEvent = document.getElementById('cancel-exam-event');
    const examEventForm = document.getElementById('exam-event-form');

    closeExamEventModal.addEventListener('click', () => closeModal('exam-event-modal'));
    cancelExamEvent.addEventListener('click', () => closeModal('exam-event-modal'));
    examEventForm.addEventListener('submit', handleExamEventFormSubmit);
}

// ===== NAVEGAÇÃO =====

/**
 * Navega para uma página específica
 * @param {string} page - Nome da página
 * @param {string} subjectId - ID da matéria (opcional)
 */
function navigateTo(page, subjectId = null) {
    appState.currentPage = page;
    appState.currentSubjectId = subjectId;

    // Atualiza menu ativo
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    if (page === 'dashboard') {
        document.getElementById('dashboard-link').classList.add('active');
        renderDashboardPage();
    } else if (page === 'calendar') {
        document.getElementById('calendar-link').classList.add('active');
        renderCalendarPage();
    } else if (page === 'subject-detail') {
        document.querySelector(`[data-subject-id="${subjectId}"]`).classList.add('active');
        renderSubjectDetailPage(subjectId);
    }
}

// ===== RENDERIZAÇÃO DO MENU =====

/**
 * Renderiza a lista de matérias no menu lateral
 */
function renderSubjectsMenu() {
    const listElement = document.getElementById('subjects-list');
    listElement.innerHTML = '';

    if (appState.subjects.length === 0) {
        listElement.innerHTML = '<li style="padding: 1rem; color: var(--text-muted); text-align: center; font-size: 0.9rem;">Nenhuma matéria cadastrada</li>';
        return;
    }

    appState.subjects.forEach(subject => {
        const li = document.createElement('li');
        li.className = 'subject-item';
        li.innerHTML = `
            <a href="#" class="nav-item" data-subject-id="${subject.id}">
                <i class="fa-solid fa-book"></i>
                <span>${subject.nome}</span>
            </a>
            <button class="delete-subject" data-subject-id="${subject.id}" title="Deletar matéria">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        // Event listener para navegar para detalhes
        const link = li.querySelector('.nav-item');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('subject-detail', subject.id);
        });

        // Event listener para deletar
        const deleteBtn = li.querySelector('.delete-subject');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeleteSubject(subject.id, subject.nome);
        });

        listElement.appendChild(li);
    });
}

// ===== GERENCIAMENTO DE MATÉRIAS =====

/**
 * Abre o modal de adicionar/editar matéria
 * @param {string} subjectId - ID da matéria (null para nova matéria)
 */
function openSubjectModal(subjectId = null) {
    const modal = document.getElementById('subject-modal');
    const title = document.getElementById('subject-modal-title');
    const idInput = document.getElementById('subject-id');
    const nameInput = document.getElementById('subject-name');
    const colorInput = document.getElementById('subject-color');

    if (subjectId) {
        const subject = appState.subjects.find(s => s.id === subjectId);
        title.textContent = 'Editar Matéria';
        idInput.value = subjectId;
        nameInput.value = subject.nome;
        colorInput.value = subject.cor || '#3b82f6'; // Cor padrão se não existir
    } else {
        title.textContent = 'Adicionar Nova Matéria';
        idInput.value = '';
        nameInput.value = '';
        colorInput.value = '#3b82f6'; // Cor padrão
    }

    modal.classList.add('show');
    nameInput.focus();
}

/**
 * Fecha um modal
 * @param {string} modalId - ID do modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    
    // Limpa os formulários
    if (modalId === 'subject-modal') {
        document.getElementById('subject-form').reset();
        document.getElementById('subject-id').value = '';
    } else if (modalId === 'evaluation-modal') {
        document.getElementById('evaluation-form').reset();
        document.getElementById('evaluation-subject-id').value = '';
        document.getElementById('evaluation-trimester').value = '';
        document.getElementById('evaluation-index').value = '';
    }
}

/**
 * Lida com o envio do formulário de matéria
 */
async function handleSubjectFormSubmit(e) {
    e.preventDefault();

    const idInput = document.getElementById('subject-id');
    const nameInput = document.getElementById('subject-name');
    const colorInput = document.getElementById('subject-color');
    const subjectName = nameInput.value.trim();
    const subjectColor = colorInput.value;

    if (!subjectName) return;

    if (idInput.value) {
        // Editar matéria existente
        const subject = appState.subjects.find(s => s.id === idInput.value);
        subject.nome = subjectName;
        subject.cor = subjectColor;
        const updated = await updateSubject(idInput.value, subject);
        if (updated) {
            await loadSubjects();
            closeModal('subject-modal');
            if (appState.currentPage === 'subject-detail' && appState.currentSubjectId === idInput.value) {
                renderSubjectDetailPage(idInput.value);
            }
        }
    } else {
        // Adicionar nova matéria
        const newSubject = await addSubject(subjectName, subjectColor);
        if (newSubject) {
            await loadSubjects();
            closeModal('subject-modal');
            if (appState.currentPage === 'dashboard') {
                renderDashboardPage();
            }
        }
    }
}

/**
 * Lida com a deleção de uma matéria
 */
async function handleDeleteSubject(subjectId, subjectName) {
    if (!confirm(`Tem certeza que deseja deletar a matéria "${subjectName}"? Esta ação não pode ser desfeita.`)) {
        return;
    }

    const success = await deleteSubject(subjectId);
    if (success) {
        await loadSubjects();
        if (appState.currentPage === 'subject-detail' && appState.currentSubjectId === subjectId) {
            navigateTo('dashboard');
        } else if (appState.currentPage === 'dashboard') {
            renderDashboardPage();
        }
    }
}

// ===== CÁLCULOS =====

/**
 * Calcula a nota de um trimestre (média das avaliações)
 * @param {Array} evaluations - Array de avaliações
 * @returns {number|null} Nota do trimestre ou null
 */
function calculateTrimesterGrade(evaluations) {
    if (!evaluations || evaluations.length === 0) return null;
    
    let totalValue = 0;
    let totalGrade = 0;
    
    evaluations.forEach(eval => {
        const value = parseFloat(eval.valor || 100); // Valor padrão 100 para avaliações antigas
        const grade = parseFloat(eval.nota);
        totalValue += value;
        totalGrade += grade;
    });
    
    if (totalValue === 0) return null;
    
    // Calcula a média: (total de pontos obtidos / total de pontos possíveis) * 100
    return (totalGrade / totalValue) * 100;
}

/**
 * Determina a cor baseada na nota
 * @param {number} grade - Nota
 * @returns {string} Classe de cor ('green', 'yellow', 'red', 'gray')
 */
function getGradeColor(grade) {
    if (grade === null || grade === undefined) return 'gray';
    if (grade >= 60) return 'green';
    if (grade >= 40) return 'yellow';
    return 'red';
}

/**
 * Calcula a pontuação anual de uma matéria
 * @param {Object} subject - Objeto da matéria
 * @returns {number} Pontuação anual
 */
function calculateAnnualScore(subject) {
    let totalGrades = 0;
    let trimesterCount = 0;
    for (let i = 1; i <= 3; i++) {
        const grade = calculateTrimesterGrade(subject.trimestres[i.toString()]?.avaliacoes || []);
        if (grade !== null) {
            totalGrades += grade;
            trimesterCount++;
        }
    }
    return trimesterCount > 0 ? totalGrades / trimesterCount : 0;
}

/**
 * Calcula a média geral de um trimestre específico (todas as matérias)
 * @param {number} trimesterNumber - Número do trimestre (1, 2 ou 3)
 * @returns {number|null} Média geral do trimestre
 */
function calculateTrimesterAverage(trimesterNumber) {
    const grades = [];
    appState.subjects.forEach(subject => {
        const grade = calculateTrimesterGrade(subject.trimestres[trimesterNumber.toString()]?.avaliacoes || []);
        if (grade !== null) {
            grades.push(grade);
        }
    });
    
    if (grades.length === 0) return null;
    const totalGrades = grades.reduce((acc, g) => acc + g, 0);
    return totalGrades / grades.length;
}

/**
 * Calcula a nota mínima necessária na recuperação
 * @param {number} annualScore - Pontuação anual atual
 * @returns {number} Nota mínima necessária
 */
function calculateMinRecoveryGrade(annualScore) {
    // Fórmula: (180 - pontuação anual) / 2
    return Math.max(0, (180 - annualScore) / 2);
}

/**
 * Simula a nota final com uma nota de recuperação
 * @param {number} annualScore - Pontuação anual atual
 * @param {number} recoveryGrade - Nota da recuperação
 * @returns {number} Nota final simulada
 */
function simulateRecoveryGrade(annualScore, recoveryGrade) {
    return (annualScore * 3 + parseFloat(recoveryGrade) * 7) / 10;
}

// ===== RENDERIZAÇÃO DO DASHBOARD =====

/**
 * Renderiza a página do painel principal
 */
function renderDashboardPage() {
    const mainContent = document.getElementById('main-content');
    
    // Calcula estatísticas
    const totalSubjects = appState.subjects.length;
    const currentTrimester = getCurrentTrimester();
    const trimesterAverage = calculateTrimesterAverage(currentTrimester);
    
    // Calcula total de pontos anuais
    let totalAnnualPointsSum = 0;
    let subjectsWithAnnualScore = 0;
    appState.subjects.forEach(subject => {
        const annualScore = calculateAnnualScore(subject);
        if (annualScore > 0) { // Considera apenas matérias com média anual calculada
            totalAnnualPointsSum += annualScore;
            subjectsWithAnnualScore++;
        }
    });
    const averageAnnualScore = subjectsWithAnnualScore > 0 ? totalAnnualPointsSum / subjectsWithAnnualScore : 0;

    // Conta matérias por status
    let greenCount = 0, yellowCount = 0, redCount = 0;
    appState.subjects.forEach(subject => {
        const annualScore = calculateAnnualScore(subject);
        if (annualScore >= 180) greenCount++;
        else if (annualScore >= 120) yellowCount++;
        else redCount++;
    });

    mainContent.innerHTML = `
        <div class="dashboard-header">
            <h1>Painel Principal</h1>
            <p>Visão geral do seu desempenho acadêmico</p>
        </div>

        <div class="summary-cards">
            <div class="card blue">
                <div class="card-header">
                    <h3>Total de Matérias</h3>
                    <i class="fa-solid fa-book"></i>
                </div>
                <div class="card-value">${totalSubjects}</div>
                <div class="card-label">Matérias cadastradas</div>
            </div>

            <div class="card ${getGradeColor(trimesterAverage)}">
                <div class="card-header">
                    <h3>Média do ${currentTrimester}º Trimestre</h3>
                    <i class="fa-solid fa-chart-line"></i>
                </div>
                <div class="card-value">${trimesterAverage !== null ? trimesterAverage.toFixed(1) : '--'}</div>
                <div class="card-label">Pontos</div>
            </div>

            <div class="card blue">
                <div class="card-header">
                    <h3>Pontuação Anual Total</h3>
                    <i class="fa-solid fa-trophy"></i>
                </div>
                <div class="card-value">${averageAnnualScore.toFixed(1)}</div>
                <div class="card-label">Soma de todas as matérias</div>
            </div>

            <div class="card green">
                <div class="card-header">
                    <h3>Matérias Aprovadas</h3>
                    <i class="fa-solid fa-check-circle"></i>
                </div>
                <div class="card-value">${greenCount}</div>
                <div class="card-label">≥ 180 pontos</div>
            </div>

            <div class="card yellow">
                <div class="card-header">
                    <h3>Em Alerta</h3>
                    <i class="fa-solid fa-exclamation-triangle"></i>
                </div>
                <div class="card-value">${yellowCount}</div>
                <div class="card-label">120-179 pontos</div>
            </div>

            <div class="card red">
                <div class="card-header">
                    <h3>Críticas</h3>
                    <i class="fa-solid fa-times-circle"></i>
                </div>
                <div class="card-value">${redCount}</div>
                <div class="card-label">< 120 pontos</div>
            </div>
        </div>

        <div class="charts-container">
            <div class="chart-card">
                <h3><i class="fa-solid fa-chart-bar"></i> Desempenho por Matéria</h3>
                <canvas id="performance-chart"></canvas>
            </div>

            <div class="chart-card">
                <h3><i class="fa-solid fa-chart-line"></i> Evolução Trimestral</h3>
                <canvas id="evolution-chart"></canvas>
            </div>
        </div>
    `;

    // Renderiza os gráficos
    renderPerformanceChart();
    renderEvolutionChart();
}

/**
 * Retorna o trimestre atual baseado na data
 * @returns {number} Número do trimestre (1, 2 ou 3)
 */
function getCurrentTrimester() {
    const month = new Date().getMonth() + 1;
    if (month <= 4) return 1;
    if (month <= 8) return 2;
    return 3;
}

/**
 * Renderiza o gráfico de desempenho por matéria
 */
function renderPerformanceChart() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;

    const labels = appState.subjects.map(s => s.nome);
    const data = appState.subjects.map(s => calculateAnnualScore(s));
    const colors = appState.subjects.map(s => {
        const color = s.cor || '#3b82f6'; // Cor padrão se não existir
        return color + 'CC'; // Adiciona transparência (80%)
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pontuação Anual',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 300,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#a0aec0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0aec0'
                    }
                }
            }
        }
    });
}

/**
 * Renderiza o gráfico de evolução trimestral
 */
function renderEvolutionChart() {
    const ctx = document.getElementById('evolution-chart');
    if (!ctx) return;

    const trimester1 = calculateTrimesterAverage(1);
    const trimester2 = calculateTrimesterAverage(2);
    const trimester3 = calculateTrimesterAverage(3);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1º Trimestre', '2º Trimestre', '3º Trimestre'],
            datasets: [{
                label: 'Média Geral',
                data: [trimester1, trimester2, trimester3],
                borderColor: 'rgba(74, 144, 226, 1)',
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgba(74, 144, 226, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#a0aec0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0aec0'
                    }
                }
            }
        }
    });
}

// Continua na próxima parte...



// ===== RENDERIZAÇÃO DOS DETALHES DA MATÉRIA =====

/**
 * Renderiza a página de detalhes de uma matéria
 * @param {string} subjectId - ID da matéria
 */
async function renderSubjectDetailPage(subjectId) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i><p>Carregando...</p></div>';

    const subject = await fetchSubjectById(subjectId);
    if (!subject) {
        mainContent.innerHTML = '<div class="loading"><i class="fa-solid fa-exclamation-triangle"></i><p>Matéria não encontrada</p></div>';
        return;
    }

    // Calcula as notas de cada trimestre
    const trimester1Grade = calculateTrimesterGrade(subject.trimestres["1"]?.avaliacoes || []);
    const trimester2Grade = calculateTrimesterGrade(subject.trimestres["2"]?.avaliacoes || []);
    const trimester3Grade = calculateTrimesterGrade(subject.trimestres["3"]?.avaliacoes || []);

    // Calcula pontuação anual e nota mínima para recuperação
    const annualScore = calculateAnnualScore(subject);
    const minRecoveryGrade = calculateMinRecoveryGrade(annualScore);
    const needsRecovery = annualScore < 180;

    mainContent.innerHTML = `
        <div class="subject-detail-header">
            <h1>
                <button class="back-button" onclick="navigateTo('dashboard')">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                ${subject.nome}
            </h1>
            <div class="subject-actions">
                <button class="btn btn-secondary" onclick="openSubjectModal('${subject.id}')">
                    <i class="fa-solid fa-edit"></i>
                    Editar Nome
                </button>
            </div>
        </div>

        <div class="summary-cards" style="margin-bottom: 2rem;">
            <div class="card ${getGradeColor(annualScore >= 180 ? 100 : annualScore / 3)}">
                <div class="card-header">
                    <h3>Pontuação Anual</h3>
                    <i class="fa-solid fa-calculator"></i>
                </div>
                <div class="card-value">${annualScore.toFixed(1)}</div>
                <div class="card-label">de 300 pontos possíveis</div>
            </div>

            <div class="card ${needsRecovery ? 'yellow' : 'green'}">
                <div class="card-header">
                    <h3>Status</h3>
                    <i class="fa-solid ${needsRecovery ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                </div>
                <div class="card-value">${needsRecovery ? 'Recuperação' : 'Aprovado'}</div>
                <div class="card-label">${needsRecovery ? 'Necessária' : 'Parabéns!'}</div>
            </div>
        </div>

        <div class="trimesters-container">
            ${renderTrimesterCard(subject, "1", trimester1Grade)}
            ${renderTrimesterCard(subject, "2", trimester2Grade)}
            ${renderTrimesterCard(subject, "3", trimester3Grade)}
        </div>

        ${needsRecovery ? renderRecoverySection(annualScore, minRecoveryGrade) : ''}
    `;
}

/**
 * Renderiza um card de trimestre
 * @param {Object} subject - Objeto da matéria
 * @param {string} trimesterNumber - Número do trimestre
 * @param {number|null} grade - Nota do trimestre
 * @returns {string} HTML do card
 */
function renderTrimesterCard(subject, trimesterNumber, grade) {
    const evaluations = subject.trimestres[trimesterNumber]?.avaliacoes || [];
    const gradeColor = getGradeColor(grade);
    const gradeDisplay = grade !== null ? grade.toFixed(1) : '--';
    
    // Calcula pontos possíveis já aplicados
    let totalPointsUsed = 0;
    evaluations.forEach(eval => {
        totalPointsUsed += parseFloat(eval.valor || 0);
    });

    return `
        <div class="trimester-card">
            <div class="trimester-header">
                <h3><i class="fa-solid fa-calendar-alt"></i> ${trimesterNumber}º Trimestre</h3>
                <div class="trimester-grade ${gradeColor}">${gradeDisplay}</div>
            </div>
            
            <div class="points-indicator">
                <p><strong>Pontos possíveis já aplicados:</strong> ${totalPointsUsed.toFixed(1)} de 200</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(totalPointsUsed / 200 * 100).toFixed(1)}%"></div>
                </div>
            </div>

            <ul class="evaluations-list">
                ${evaluations.map((evaluation, index) => {
                    const value = parseFloat(evaluation.valor || 100);
                    const nota = parseFloat(evaluation.nota);
                    return `
                    <li class="evaluation-item">
                        <div class="evaluation-info">
                            <i class="fa-solid fa-file-alt"></i>
                            <div>
                                <span>${evaluation.nome}</span>
                                <small style="color: var(--text-muted); display: block; margin-top: 0.25rem;">
                                    ${nota.toFixed(1)} de ${value.toFixed(1)} pontos
                                </small>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span class="evaluation-grade">${((nota / value) * 100).toFixed(1)}%</span>
                            <div class="evaluation-actions">
                                <button class="icon-btn" onclick="openEvaluationModal('${subject.id}', '${trimesterNumber}', ${index})" title="Editar">
                                    <i class="fa-solid fa-edit"></i>
                                </button>
                                <button class="icon-btn delete" onclick="handleDeleteEvaluation('${subject.id}', '${trimesterNumber}', ${index}, '${evaluation.nome}')" title="Deletar">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </li>
                    `;
                }).join('')}
            </ul>

            <button class="add-evaluation-btn" onclick="openEvaluationModal('${subject.id}', '${trimesterNumber}')">
                <i class="fa-solid fa-plus"></i>
                <span>Adicionar Avaliação</span>
            </button>
        </div>
    `;
}

/**
 * Renderiza a seção de recuperação
 * @param {number} annualScore - Pontuação anual
 * @param {number} minRecoveryGrade - Nota mínima necessária
 * @returns {string} HTML da seção
 */
function renderRecoverySection(annualScore, minRecoveryGrade) {
    return `
        <div class="recovery-section">
            <h3><i class="fa-solid fa-graduation-cap"></i> Análise de Recuperação</h3>
            
            <div class="recovery-info">
                <div class="recovery-stat">
                    <label>Pontuação Atual</label>
                    <div class="value" style="color: var(--yellow);">${annualScore.toFixed(1)}</div>
                </div>
                <div class="recovery-stat">
                    <label>Pontos Faltando</label>
                    <div class="value" style="color: var(--red);">${(180 - annualScore).toFixed(1)}</div>
                </div>
                <div class="recovery-stat">
                    <label>Nota Mínima na Recuperação</label>
                    <div class="value" style="color: var(--green);">${minRecoveryGrade.toFixed(1)}</div>
                </div>
            </div>

            <div class="simulator">
                <h4><i class="fa-solid fa-flask"></i> Simulador de Recuperação</h4>
                <div class="simulator-input">
                    <input 
                        type="number" 
                        id="recovery-simulator-input" 
                        placeholder="Digite a nota da recuperação" 
                        min="0" 
                        max="100" 
                        step="0.1"
                        oninput="updateRecoverySimulator(${annualScore})"
                    >
                </div>
                <div class="simulator-result" id="recovery-result" style="display: none;">
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Nota Final Simulada:</p>
                    <div class="result-value" id="recovery-result-value">--</div>
                    <p id="recovery-result-status" style="margin-top: 0.5rem; font-size: 0.9rem;"></p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Atualiza o simulador de recuperação
 * @param {number} annualScore - Pontuação anual
 */
function updateRecoverySimulator(annualScore) {
    const input = document.getElementById('recovery-simulator-input');
    const resultDiv = document.getElementById('recovery-result');
    const resultValue = document.getElementById('recovery-result-value');
    const resultStatus = document.getElementById('recovery-result-status');

    const recoveryGrade = parseFloat(input.value);

    if (isNaN(recoveryGrade) || recoveryGrade < 0 || recoveryGrade > 100) {
        resultDiv.style.display = 'none';
        return;
    }

    const finalGrade = simulateRecoveryGrade(annualScore, recoveryGrade);
    const color = getGradeColor(finalGrade);

    resultDiv.style.display = 'block';
    resultValue.textContent = finalGrade.toFixed(1);
    resultValue.style.color = `var(--${color})`;

    if (finalGrade >= 60) {
        resultStatus.textContent = '✅ Aprovado! Parabéns!';
        resultStatus.style.color = 'var(--green)';
    } else {
        resultStatus.textContent = '❌ Reprovado. Continue estudando!';
        resultStatus.style.color = 'var(--red)';
    }
}

// ===== GERENCIAMENTO DE AVALIAÇÕES =====

/**
 * Abre o modal de adicionar/editar avaliação
 * @param {string} subjectId - ID da matéria
 * @param {string} trimester - Número do trimestre
 * @param {number} evaluationIndex - Índice da avaliação (null para nova)
 */
async function openEvaluationModal(subjectId, trimester, evaluationIndex = null) {
    const modal = document.getElementById('evaluation-modal');
    const title = document.getElementById('evaluation-modal-title');
    const subjectIdInput = document.getElementById('evaluation-subject-id');
    const trimesterInput = document.getElementById('evaluation-trimester');
    const indexInput = document.getElementById('evaluation-index');
    const nameInput = document.getElementById('evaluation-name');
    const valueInput = document.getElementById('evaluation-value');
    const gradeInput = document.getElementById('evaluation-grade');
    const pointsUsedSpan = document.getElementById('points-used');
    const pointsAvailableSpan = document.getElementById('points-available');

    subjectIdInput.value = subjectId;
    trimesterInput.value = trimester;

    // Calcula pontos já usados no trimestre
    const subject = await fetchSubjectById(subjectId);
    const evaluations = subject.trimestres[trimester]?.avaliacoes || [];
    let totalPointsUsed = 0;
    evaluations.forEach((eval, idx) => {
        if (evaluationIndex === null || idx !== evaluationIndex) {
            totalPointsUsed += parseFloat(eval.valor || 0);
        }
    });
    
    pointsUsedSpan.textContent = totalPointsUsed.toFixed(1);
    pointsAvailableSpan.textContent = (200 - totalPointsUsed).toFixed(1);

    if (evaluationIndex !== null) {
        const evaluation = subject.trimestres[trimester].avaliacoes[evaluationIndex];
        
        title.textContent = 'Editar Avaliação';
        indexInput.value = evaluationIndex;
        nameInput.value = evaluation.nome;
        valueInput.value = evaluation.valor || 100; // Valor padrão se não existir
        gradeInput.value = evaluation.nota;
    } else {
        title.textContent = `Adicionar Avaliação - ${trimester}º Trimestre`;
        indexInput.value = '';
        nameInput.value = '';
        valueInput.value = '';
        gradeInput.value = '';
    }

    modal.classList.add('show');
    nameInput.focus();
}

/**
 * Lida com o envio do formulário de avaliação
 */
async function handleEvaluationFormSubmit(e) {
    e.preventDefault();

    const subjectId = document.getElementById('evaluation-subject-id').value;
    const trimester = document.getElementById('evaluation-trimester').value;
    const index = document.getElementById('evaluation-index').value;
    const name = document.getElementById('evaluation-name').value.trim();
    const value = parseFloat(document.getElementById('evaluation-value').value);
    const grade = parseFloat(document.getElementById('evaluation-grade').value);

    if (!name || isNaN(value) || isNaN(grade) || value < 0 || grade < 0 || grade > value) {
        alert('Por favor, preencha todos os campos corretamente. A nota obtida não pode ser maior que o valor da atividade.');
        return;
    }

    // Valida o limite de 200 pontos por trimestre
    const subject = await fetchSubjectById(subjectId);
    const evaluations = subject.trimestres[trimester]?.avaliacoes || [];
    let totalPointsUsed = 0;
    evaluations.forEach((eval, idx) => {
        if (index === '' || idx !== parseInt(index)) {
            totalPointsUsed += parseFloat(eval.valor || 0);
        }
    });

    if (totalPointsUsed + value > 200) {
        alert(`O valor da atividade excede o limite de 200 pontos por trimestre. Pontos disponíveis: ${(200 - totalPointsUsed).toFixed(1)}`);
        return;
    }

    const evaluation = { nome: name, valor: value, nota: grade };

    if (index !== '') {
        // Editar avaliação existente
        await updateEvaluation(subjectId, trimester, parseInt(index), evaluation);
    } else {
        // Adicionar nova avaliação
        await addEvaluation(subjectId, trimester, evaluation);
    }

    closeModal('evaluation-modal');
    await loadSubjects();
    renderSubjectDetailPage(subjectId);
}

/**
 * Lida com a deleção de uma avaliação
 */
async function handleDeleteEvaluation(subjectId, trimester, evaluationIndex, evaluationName) {
    if (!confirm(`Tem certeza que deseja deletar a avaliação "${evaluationName}"?`)) {
        return;
    }

    await deleteEvaluation(subjectId, trimester, parseInt(evaluationIndex));
    await loadSubjects();
    renderSubjectDetailPage(subjectId);
}



// ===== CALENDÁRIO DE PROVAS =====

/**
 * Carrega os eventos de provas do localStorage
 */
function loadExamEvents() {
    const stored = localStorage.getItem('examEvents');
    appState.examEvents = stored ? JSON.parse(stored) : [];
}

/**
 * Salva os eventos de provas no localStorage
 */
function saveExamEvents() {
    localStorage.setItem('examEvents', JSON.stringify(appState.examEvents));
}

/**
 * Renderiza a página do calendário de provas
 */
function renderCalendarPage() {
    loadExamEvents();
    const mainContent = document.getElementById('main-content');
    
    // Ordena eventos por data
    const sortedEvents = [...appState.examEvents].sort((a, b) => new Date(a.data) - new Date(b.data));
    
    // Agrupa eventos por data
    const eventsByDate = {};
    sortedEvents.forEach(event => {
        if (!eventsByDate[event.data]) {
            eventsByDate[event.data] = [];
        }
        eventsByDate[event.data].push(event);
    });
    
    mainContent.innerHTML = `
        <div class="calendar-header">
            <h1><i class="fa-solid fa-calendar"></i> Calendário de Provas</h1>
            <button class="btn btn-primary" onclick="openExamEventModal()">
                <i class="fa-solid fa-plus"></i>
                Adicionar Evento
            </button>
        </div>
        
        <div class="calendar-container">
            ${sortedEvents.length === 0 ? `
                <div class="empty-state">
                    <i class="fa-solid fa-calendar-xmark"></i>
                    <h2>Nenhum evento cadastrado</h2>
                    <p>Adicione eventos de provas para organizar seu calendário</p>
                </div>
            ` : Object.keys(eventsByDate).map(date => {
                const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                return `
                    <div class="calendar-day">
                        <h3 class="calendar-day-header">${formattedDate}</h3>
                        <div class="calendar-events">
                            ${eventsByDate[date].map((event, index) => {
                                const subject = appState.subjects.find(s => s.id === event.materiaId);
                                const subjectName = subject ? subject.nome : 'Matéria não encontrada';
                                const subjectColor = subject ? subject.cor : '#3b82f6';
                                
                                return `
                                    <div class="calendar-event" style="border-left: 4px solid ${subjectColor}">
                                        <div class="event-header">
                                            <div class="event-title">
                                                <i class="fa-solid fa-book"></i>
                                                <strong>${subjectName}</strong>
                                                <span class="event-class">${event.aula}ª Aula</span>
                                            </div>
                                            <div class="event-actions">
                                                <button class="icon-btn" onclick="openExamEventModal('${event.id}')" title="Editar">
                                                    <i class="fa-solid fa-edit"></i>
                                                </button>
                                                <button class="icon-btn delete" onclick="handleDeleteExamEvent('${event.id}', '${subjectName}')" title="Deletar">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="event-content">
                                            <p><strong>Conteúdo:</strong> ${event.conteudo}</p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Abre o modal de adicionar/editar evento de prova
 * @param {string} eventId - ID do evento (null para novo evento)
 */
function openExamEventModal(eventId = null) {
    loadExamEvents();
    const modal = document.getElementById('exam-event-modal');
    const title = document.getElementById('exam-event-modal-title');
    const idInput = document.getElementById('exam-event-id');
    const dateInput = document.getElementById('exam-event-date');
    const subjectSelect = document.getElementById('exam-event-subject');
    const contentInput = document.getElementById('exam-event-content');
    const classSelect = document.getElementById('exam-event-class');
    
    // Popula o select de matérias
    subjectSelect.innerHTML = '<option value="">Selecione uma matéria</option>';
    appState.subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.nome;
        subjectSelect.appendChild(option);
    });
    
    if (eventId) {
        const event = appState.examEvents.find(e => e.id === eventId);
        if (event) {
            title.textContent = 'Editar Evento de Prova';
            idInput.value = eventId;
            dateInput.value = event.data;
            subjectSelect.value = event.materiaId;
            contentInput.value = event.conteudo;
            classSelect.value = event.aula;
        }
    } else {
        title.textContent = 'Adicionar Evento de Prova';
        idInput.value = '';
        dateInput.value = '';
        subjectSelect.value = '';
        contentInput.value = '';
        classSelect.value = '';
    }
    
    modal.classList.add('show');
    dateInput.focus();
}

/**
 * Lida com o envio do formulário de evento de prova
 */
async function handleExamEventFormSubmit(e) {
    e.preventDefault();
    
    const idInput = document.getElementById('exam-event-id');
    const dateInput = document.getElementById('exam-event-date');
    const subjectSelect = document.getElementById('exam-event-subject');
    const contentInput = document.getElementById('exam-event-content');
    const classSelect = document.getElementById('exam-event-class');
    
    const eventData = {
        id: idInput.value || Date.now().toString(),
        data: dateInput.value,
        materiaId: subjectSelect.value,
        conteudo: contentInput.value.trim(),
        aula: classSelect.value
    };
    
    if (!eventData.data || !eventData.materiaId || !eventData.conteudo || !eventData.aula) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    if (idInput.value) {
        // Editar evento existente
        const index = appState.examEvents.findIndex(e => e.id === idInput.value);
        if (index !== -1) {
            appState.examEvents[index] = eventData;
        }
    } else {
        // Adicionar novo evento
        appState.examEvents.push(eventData);
    }
    
    saveExamEvents();
    closeModal('exam-event-modal');
    renderCalendarPage();
}

/**
 * Lida com a deleção de um evento de prova
 */
function handleDeleteExamEvent(eventId, subjectName) {
    if (!confirm(`Tem certeza que deseja deletar o evento de prova de "${subjectName}"?`)) {
        return;
    }
    
    appState.examEvents = appState.examEvents.filter(e => e.id !== eventId);
    saveExamEvents();
    renderCalendarPage();
}

