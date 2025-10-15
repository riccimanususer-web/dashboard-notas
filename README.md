# 📚 Dashboard de Notas - Meu Boletim

Uma aplicação web moderna e completa para gerenciamento de notas escolares, com cálculos automáticos de médias trimestrais, sistema de recuperação e visualizações gráficas interativas.

## ✨ Funcionalidades

### 🎯 Painel Principal
- **Cards de Resumo**: Visualização rápida de métricas importantes
  - Total de matérias cadastradas
  - Média do 3º trimestre
  - Pontuação anual total
  - Matérias aprovadas, em alerta e críticas
- **Gráficos Interativos**:
  - Desempenho por matéria (gráfico de barras)
  - Evolução trimestral (gráfico de linha)

### 📖 Gerenciamento de Matérias
- Adicionar novas matérias
- Editar nome das matérias
- Deletar matérias
- Navegação intuitiva entre matérias

### 📝 Detalhes da Matéria
- **Organização por Trimestres**: 3 trimestres independentes
- **Avaliações**:
  - Adicionar avaliações com nome e nota (0-100)
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
Média do Trimestre = Soma de todas as notas / Quantidade de avaliações
```

### Pontuação Anual
```
Pontuação Anual = Soma das médias dos 3 trimestres
Máximo possível: 300 pontos (100 por trimestre)
```

### Status de Aprovação
- **Aprovado**: ≥ 180 pontos
- **Recuperação**: 120-179 pontos
- **Reprovado**: < 120 pontos

### Nota Mínima na Recuperação
```
Nota Mínima = (180 - Pontuação Atual) / 2
```

### Nota Final com Recuperação
```
Nota Final = (Pontuação Atual + Nota da Recuperação) / 2
```

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

1. **Adicionar Matéria**: Clique em "+ Adicionar Matéria" na barra lateral
2. **Acessar Detalhes**: Clique no nome da matéria
3. **Adicionar Avaliações**: Clique em "+ Adicionar Avaliação" em cada trimestre
4. **Visualizar Análise**: Role para baixo para ver a análise de recuperação
5. **Simular Recuperação**: Digite uma nota no simulador para ver o resultado
6. **Voltar ao Painel**: Clique em "Painel Principal" para ver o resumo geral

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
  "trimestres": [
    {
      "numero": 1,
      "avaliacoes": [
        {
          "id": "av1",
          "nome": "Prova 1",
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

- **Background**: `#0f1419` (escuro)
- **Cards**: `#1a1f2e` (azul escuro)
- **Primária**: `#3b82f6` (azul)
- **Sucesso**: `#10b981` (verde)
- **Alerta**: `#f59e0b` (laranja)
- **Erro**: `#ef4444` (vermelho)
- **Texto**: `#e5e7eb` (cinza claro)

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

- **Persistência**: Todos os dados são salvos automaticamente na MockAPI
- **Validação**: Notas devem estar entre 0 e 100
- **Responsividade**: Interface adaptável para diferentes tamanhos de tela
- **Performance**: Gráficos renderizados sob demanda

## 🐛 Solução de Problemas

### Dados não estão sendo salvos
- Verifique se a URL da MockAPI está correta
- Confirme que você tem conexão com a internet
- Abra o console do navegador (F12) para ver erros

### Gráficos não aparecem
- Certifique-se de que o CDN do Chart.js está acessível
- Verifique se há matérias cadastradas com notas

### Interface não carrega corretamente
- Limpe o cache do navegador
- Verifique se todos os arquivos estão no mesmo diretório
- Confirme que está usando um navegador moderno

## 👨‍💻 Desenvolvido com

- Amor por educação 📚
- Café ☕
- JavaScript puro (sem frameworks pesados!)
- Design moderno e intuitivo

---

**Versão**: 1.0.0  
**Última atualização**: Outubro 2025

Desenvolvido como uma solução completa para gerenciamento acadêmico pessoal.

