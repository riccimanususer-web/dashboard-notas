// main.js - Lógica principal da aplicação

// Estado global da aplicação
let appState = {
    subjects: [],
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

    if (subjectId) {
        const subject = appState.subjects.find(s => s.id === subjectId);
        title.textContent = 'Editar Matéria';
        idInput.value = subjectId;
        nameInput.value = subject.nome;
    } else {
        title.textContent = 'Adicionar Nova Matéria';
        idInput.value = '';
        nameInput.value = '';
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
    const subjectName = nameInput.value.trim();

    if (!subjectName) return;

    if (idInput.value) {
        // Editar matéria existente
        const subject = appState.subjects.find(s => s.id === idInput.value);
        subject.nome = subjectName;
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
        const newSubject = await addSubject(subjectName);
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
    const sum = evaluations.reduce((acc, eval) => acc + parseFloat(eval.nota), 0);
    return sum / evaluations.length;
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
    let total = 0;
    for (let i = 1; i <= 3; i++) {
        const grade = calculateTrimesterGrade(subject.trimestres[i.toString()]?.avaliacoes || []);
        if (grade !== null) {
            total += grade;
        }
    }
    return total;
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
    return grades.reduce((acc, g) => acc + g, 0) / grades.length;
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
    return (annualScore + parseFloat(recoveryGrade)) / 2;
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
    let totalAnnualPoints = 0;
    appState.subjects.forEach(subject => {
        totalAnnualPoints += calculateAnnualScore(subject);
    });

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
                <div class="card-value">${totalAnnualPoints.toFixed(0)}</div>
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
    const colors = data.map(score => {
        if (score >= 180) return 'rgba(72, 187, 120, 0.8)';
        if (score >= 120) return 'rgba(236, 201, 75, 0.8)';
        return 'rgba(245, 101, 101, 0.8)';
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

    return `
        <div class="trimester-card">
            <div class="trimester-header">
                <h3><i class="fa-solid fa-calendar-alt"></i> ${trimesterNumber}º Trimestre</h3>
                <div class="trimester-grade ${gradeColor}">${gradeDisplay}</div>
            </div>

            <ul class="evaluations-list">
                ${evaluations.map((evaluation, index) => `
                    <li class="evaluation-item">
                        <div class="evaluation-info">
                            <i class="fa-solid fa-file-alt"></i>
                            <span>${evaluation.nome}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span class="evaluation-grade">${parseFloat(evaluation.nota).toFixed(1)}</span>
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
                `).join('')}
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
    const gradeInput = document.getElementById('evaluation-grade');

    subjectIdInput.value = subjectId;
    trimesterInput.value = trimester;

    if (evaluationIndex !== null) {
        const subject = await fetchSubjectById(subjectId);
        const evaluation = subject.trimestres[trimester].avaliacoes[evaluationIndex];
        
        title.textContent = 'Editar Avaliação';
        indexInput.value = evaluationIndex;
        nameInput.value = evaluation.nome;
        gradeInput.value = evaluation.nota;
    } else {
        title.textContent = `Adicionar Avaliação - ${trimester}º Trimestre`;
        indexInput.value = '';
        nameInput.value = '';
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
    const grade = parseFloat(document.getElementById('evaluation-grade').value);

    if (!name || isNaN(grade) || grade < 0 || grade > 100) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const evaluation = { nome: name, nota: grade };

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

