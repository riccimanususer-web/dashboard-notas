# 📚 Dashboard de Notas - Meu Boletim

Uma aplicação web moderna e completa para gerenciamento de notas escolares, com cálculos automáticos de médias trimestrais, sistema de recuperação e visualizações gráficas interativas.

## ✨ Funcionalidades

### 🎯 Painel Principal
- **Cards de Resumo**: Visualização rápida de métricas importantes
  - Total de matérias cadastradas
  - Média do 3º trimestre
  - Média anual total (corrigida)
  - Matérias aprovadas, em alerta e críticas
- **Gráficos Interativos**:
  - Desempenho por matéria (gráfico de barras, agora com cores personalizadas)
  - Evolução trimestral (gráfico de linha)

### 📖 Gerenciamento de Matérias
- Adicionar novas matérias com seleção de cor personalizada
- Editar nome e cor das matérias
- Deletar matérias
- Navegação intuitiva entre matérias

### 📝 Detalhes da Matéria
- **Organização por Trimestres**: 3 trimestres independentes
- **Avaliações**:
  - Adicionar avaliações com nome, **valor da atividade** e **nota obtida**
  - **Limite de 200 pontos** por trimestre para o valor total das atividades
  - **Indicador de pontos possíveis já aplicados** por trimestre
  - Editar avaliações existentes
  - Deletar avaliações
  - Cálculo automático da média trimestral
- **Cards de Status**:
  - Pontuação anual atual
  - Status de aprovação (Aprovado/Recuperação/Reprovado)
- **Análise de Recuperação**:
  - Pontuação atual
  - Pontos faltando para aprovação
  - Nota mínima necessária na recuperação
- **Simulador de Recuperação**:
  - Simule sua nota de recuperação
  - Veja a nota final resultante
  - Feedback visual de aprovação/reprovação

### 🗓️ Calendário de Provas
- **Adicionar Eventos**: Crie eventos de provas com Data, Matéria, Conteúdo e Qual Aula
- **Visualização Dedicada**: Página exclusiva para o calendário, mostrando eventos organizados por data
- **Edição e Exclusão**: Gerencie seus eventos de prova facilmente
- **Integração com Matérias**: Eventos de prova exibem a cor da matéria correspondente

## 🎨 Design

Interface moderna inspirada no design "Unity", com:
- Esquema de cores dark mode profissional
- Gradientes e efeitos visuais sofisticados
- Ícones intuitivos (Lucide Icons)
- Animações e transições suaves
- Layout responsivo e organizado

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com gradientes e animações
- **JavaScript (Vanilla)**: Lógica de negócios e manipulação do DOM
- **Chart.js**: Gráficos interativos
- **MockAPI**: Backend simulado para persistência de dados
- **Lucide Icons**: Ícones modernos via CDN

## 📐 Regras de Cálculo

### Média Trimestral
```
Média do Trimestre = (Soma das Notas Obtidas / Soma dos Valores das Atividades) * 100
```
*Observação: O total de pontos possíveis para atividades em um trimestre é limitado a 200. A média resultante é em uma escala de 0 a 100.*

### Média Anual (por matéria)
```
Média Anual = (Média 1º Trimestre + Média 2º Trimestre + Média 3º Trimestre) / (Número de trimestres com notas)
```
*Observação: A "Pontuação Anual Total" no painel principal é a média das médias anuais de todas as matérias.*

### Status de Aprovação (por matéria)
- **Aprovado**: Média Anual ≥ 60 pontos
- **Recuperação**: Média Anual entre 40 e 59.9 pontos
- **Reprovado**: Média Anual < 40 pontos

### Nota Mínima na Recuperação
```
Nota Mínima = (180 - (Média Anual * 3)) / 2
```
*Esta fórmula calcula a nota mínima necessária na recuperação para atingir 60 pontos de média anual, considerando que a média anual é multiplicada por 3 para fins de cálculo de pontos totais para aprovação (180 pontos).

### Nota Final com Recuperação
```
Nota Final = (Média Anual * 3 + Nota da Recuperação * 7) / 10
```
*A Nota da Recuperação é em uma escala de 0 a 100.*

## 🚀 Como Usar

### 1. Configuração da API

A aplicação está configurada para usar a MockAPI. A URL da API já está configurada no arquivo `api.js`:

```javascript
const API_BASE_URL = 'https://68f027e50b966ad500320c90.mockapi.io/api/manus';
```

### 2. Executar a Aplicação

Basta abrir o arquivo `index.html` em qualquer navegador moderno:

```bash
# Opção 1: Abrir diretamente
open index.html

# Opção 2: Usar um servidor local
python3 -m http.server 8000
# Acesse: http://localhost:8000
```

### 3. Fluxo de Uso

1. **Adicionar Matéria**: Clique em "+ Adicionar Matéria" na barra lateral, defina o nome e **escolha uma cor**.
2. **Acessar Detalhes**: Clique no nome da matéria.
3. **Adicionar Avaliações**: Clique em "+ Adicionar Avaliação" em cada trimestre. Informe o **Nome da Avaliação**, **Valor da Atividade** (pontuação máxima) e **Nota Obtida**. Observe o indicador de pontos possíveis já aplicados.
4. **Visualizar Análise**: Role para baixo para ver a análise de recuperação.
5. **Simular Recuperação**: Digite uma nota no simulador para ver o resultado.
6. **Acessar Calendário**: Clique em "Calendário de Provas" na barra lateral para ver ou adicionar eventos.
7. **Voltar ao Painel**: Clique em "Painel Principal" para ver o resumo geral.

## 📁 Estrutura de Arquivos

```
dashboard-notas/
├── index.html          # Estrutura HTML principal
├── style.css           # Estilos e design
├── api.js              # Comunicação com MockAPI
├── main.js             # Lógica da aplicação
└── README.md           # Documentação
```

## 🎯 Estrutura de Dados (MockAPI)

```json
{
  "id": "1",
  "nome": "Matemática",
  "cor": "#FF0000", // Nova propriedade de cor
  "trimestres": [
    {
      "numero": 1,
      "avaliacoes": [
        {
          "id": "av1",
          "nome": "Prova 1",
          "valor": 100, // Novo campo
          "nota": 75
        }
      ]
    },
    {
      "numero": 2,
      "avaliacoes": []
    },
    {
      "numero": 3,
      "avaliacoes": []
    }
  ]
}
```

## 🎨 Paleta de Cores

- **Background**: `#1a1a2e`
- **Secondary Background**: `#16213e`
- **Sidebar Background**: `#0f1624`
- **Card Background**: `#1e2a47`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a0aec0`
- **Text Muted**: `#718096`
- **Accent Color**: `#4a90e2`
- **Accent Hover**: `#357abd`
- **Green (Aprovado)**: `#48bb78`
- **Yellow (Alerta)**: `#ecc94b`
- **Red (Crítico)**: `#f56565`
- **Border Color**: `#2d3748`

## 🔄 Funcionalidades Futuras (Sugestões)

- [ ] Exportar boletim em PDF
- [ ] Gráfico de pizza para distribuição de status
- [ ] Filtros e ordenação de matérias
- [ ] Temas personalizáveis (light/dark)
- [ ] Metas personalizadas por matéria
- [ ] Histórico de alterações
- [ ] Notificações de prazos
- [ ] Backup e restauração de dados

## 📝 Notas de Desenvolvimento

- **Persistência**: Todos os dados são salvos automaticamente na MockAPI e eventos de calendário no localStorage.
- **Validação**: Notas e valores de atividades são validados para garantir a consistência.
- **Responsividade**: Interface adaptável para diferentes tamanhos de tela.
- **Performance**: Gráficos renderizados sob demanda.

## 🐛 Solução de Problemas

### Dados não estão sendo salvos
- Verifique se a URL da MockAPI está correta.
- Confirme que você tem conexão com a internet.
- Abra o console do navegador (F12) para ver erros.

### Gráficos não aparecem
- Certifique-se de que o CDN do Chart.js está acessível.
- Verifique se há matérias cadastradas com notas.

### Interface não carrega corretamente
- Limpe o cache do navegador.
- Verifique se todos os arquivos estão no mesmo diretório.
- Confirme que está usando um navegador moderno.

---

**Versão**: 1.1.0  
**Última atualização**: Outubro 2025

Desenvolvido como uma solução completa para gerenciamento acadêmico pessoal.
