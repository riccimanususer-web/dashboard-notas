// api.js - Gerenciamento de comunicação com a MockAPI

// URL base da API (fornecida pelo usuário)
const API_BASE_URL = 'https://68f027e50b966ad500320c90.mockapi.io/api/manus';

/**
 * Busca todas as matérias da API
 * @returns {Promise<Array>} Array de matérias
 */
async function fetchSubjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/materias`);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Falha ao buscar matérias:", error);
        return [];
    }
}

/**
 * Busca uma matéria específica por ID
 * @param {string} id - ID da matéria
 * @returns {Promise<Object|null>} Objeto da matéria ou null
 */
async function fetchSubjectById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/materias/${id}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar matéria: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Falha ao buscar matéria:", error);
        return null;
    }
}

/**
 * Adiciona uma nova matéria
 * @param {string} subjectName - Nome da matéria
 * @returns {Promise<Object|null>} Objeto da nova matéria ou null
 */
async function addSubject(subjectName) {
    const newSubjectData = {
        nome: subjectName,
        trimestres: {
            "1": { avaliacoes: [] },
            "2": { avaliacoes: [] },
            "3": { avaliacoes: [] }
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}/materias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newSubjectData),
        });
        if (!response.ok) {
            throw new Error(`Erro ao adicionar matéria: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Falha ao adicionar matéria:", error);
        return null;
    }
}

/**
 * Atualiza uma matéria existente
 * @param {string} id - ID da matéria
 * @param {Object} updatedData - Dados atualizados
 * @returns {Promise<Object|null>} Objeto da matéria atualizada ou null
 */
async function updateSubject(id, updatedData) {
    try {
        const response = await fetch(`${API_BASE_URL}/materias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) {
            throw new Error(`Erro ao atualizar matéria: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Falha ao atualizar matéria:", error);
        return null;
    }
}

/**
 * Deleta uma matéria
 * @param {string} id - ID da matéria
 * @returns {Promise<boolean>} True se deletado com sucesso
 */
async function deleteSubject(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/materias/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Erro ao deletar matéria: ${response.statusText}`);
        }
        return true;
    } catch (error) {
        console.error("Falha ao deletar matéria:", error);
        return false;
    }
}

/**
 * Adiciona uma avaliação a um trimestre específico
 * @param {string} subjectId - ID da matéria
 * @param {string} trimester - Número do trimestre ("1", "2" ou "3")
 * @param {Object} evaluation - Objeto da avaliação {nome, nota}
 * @returns {Promise<Object|null>} Matéria atualizada ou null
 */
async function addEvaluation(subjectId, trimester, evaluation) {
    try {
        // Busca a matéria atual
        const subject = await fetchSubjectById(subjectId);
        if (!subject) return null;

        // Adiciona a avaliação ao trimestre
        if (!subject.trimestres[trimester]) {
            subject.trimestres[trimester] = { avaliacoes: [] };
        }
        subject.trimestres[trimester].avaliacoes.push(evaluation);

        // Atualiza a matéria
        return await updateSubject(subjectId, subject);
    } catch (error) {
        console.error("Falha ao adicionar avaliação:", error);
        return null;
    }
}

/**
 * Atualiza uma avaliação específica
 * @param {string} subjectId - ID da matéria
 * @param {string} trimester - Número do trimestre
 * @param {number} evaluationIndex - Índice da avaliação no array
 * @param {Object} updatedEvaluation - Dados atualizados da avaliação
 * @returns {Promise<Object|null>} Matéria atualizada ou null
 */
async function updateEvaluation(subjectId, trimester, evaluationIndex, updatedEvaluation) {
    try {
        const subject = await fetchSubjectById(subjectId);
        if (!subject) return null;

        subject.trimestres[trimester].avaliacoes[evaluationIndex] = updatedEvaluation;
        return await updateSubject(subjectId, subject);
    } catch (error) {
        console.error("Falha ao atualizar avaliação:", error);
        return null;
    }
}

/**
 * Deleta uma avaliação específica
 * @param {string} subjectId - ID da matéria
 * @param {string} trimester - Número do trimestre
 * @param {number} evaluationIndex - Índice da avaliação no array
 * @returns {Promise<Object|null>} Matéria atualizada ou null
 */
async function deleteEvaluation(subjectId, trimester, evaluationIndex) {
    try {
        const subject = await fetchSubjectById(subjectId);
        if (!subject) return null;

        subject.trimestres[trimester].avaliacoes.splice(evaluationIndex, 1);
        return await updateSubject(subjectId, subject);
    } catch (error) {
        console.error("Falha ao deletar avaliação:", error);
        return null;
    }
}

