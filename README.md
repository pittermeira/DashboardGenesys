# Dashboard Genesys Cloud

Uma aplicação web moderna e interativa desenvolvida para análise e visualização de dados de interações do Genesys Cloud. Este dashboard permite o upload de arquivos CSV, oferecendo insights detalhados sobre performance de agentes, filas, distribuição temporal e códigos de finalização.

## Funcionalidades

-   **Upload de Dados Simplificado**: Importação de arquivos CSV de interações do Genesys Cloud com suporte a "arrastar e soltar" (drag-and-drop).
-   **Dashboard Interativo**: Visão geral com métricas chave (KPIs) e gráficos de desempenho.
-   **Análises Detalhadas**:
    -   **Por Fila (Queue)**: Distribuição de chamadas, volume e tempo médio por fila.
    -   **Por Agente**: Performance individual, volume de interações e duração média.
    -   **Série Temporal**: Análise de volume de interações por hora do dia para identificar picos.
    -   **Wrap-up Codes**: Distribuição e frequência dos códigos de finalização de atendimento.
-   **Gerenciamento de Arquivos**: Histórico de arquivos enviados, permitindo alternar entre datasets ativos ou excluir dados antigos.
-   **Filtros Avançados**: Filtragem dinâmica por período, fila, agente, tipo de mídia e fluxo.
-   **Exportação de Relatórios**:
    -   Geração de relatórios formatados em **PDF**.
    -   Exportação de dados filtrados em **CSV**.

##  Tecnologias Utilizadas

-   **Frontend**: [React](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/) (baseado em Radix UI)
-   **Gerenciamento de Estado**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
-   **Roteamento**: [wouter](https://github.com/molefrog/wouter)
-   **Ícones**: [Lucide React](https://lucide.dev/)
-   **Geração de PDF**: jsPDF & jspdf-autotable

##  Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   npm (gerenciador de pacotes)

##  Instalação e Execução

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/dashboard-genesys.git
    ```

2.  **Acesse a pasta do cliente**
    ```bash
    cd dashboard-genesys/client
    ```

3.  **Instale as dependências**
    ```bash
    npm install
    ```

4.  **Execute o projeto em modo de desenvolvimento**
    ```bash
    npm run dev
    ```

    **Para rodar o backend na porta 5000:**
    ```bash
    npm run dev:server
    ```

5.  **Acesse a aplicação**
    Abra seu navegador e acesse a URL indicada no terminal (geralmente `http://localhost:5000`).

##  Licença

Este projeto está sob a licença MIT.