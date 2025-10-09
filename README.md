# 🗺️ Plataforma de Mapa da Equipe

Uma aplicação web de página única (SPA) para visualizar e gerenciar membros de uma equipe em um mapa interativo do Brasil. A aplicação é totalmente _self-contained_ (funciona em um único arquivo `index.html`) e não requer servidor ou dependências externas para ser executada.

---

## ✨ Principais Funcionalidades

-   **Visualização Interativa no Mapa**: Membros são exibidos em um mapa do Brasil (Leaflet.js). Para evitar sobreposição, membros do mesmo estado são distribuídos em um círculo ("girassol") ao redor do centro do estado, garantindo que todos sejam visíveis.
-   **CRUD Completo de Membros**: Adicione, edite e remova membros facilmente através de uma interface intuitiva.
-   **Responsável Regional**: Designe um membro como "Responsável Regional". Ele ganhará destaque visual no mapa com um ícone de estrela e na lista de membros.
-   **Busca e Filtragem**: Encontre membros rapidamente na lista pesquisando por nome, estado, cidade ou telefone.
-   **Dashboard de Estatísticas**: Visualize um resumo rápido do número total de membros e a distribuição percentual por região.
-   **Exportação de Dados Múltiplos Formatos**:
    -   **JSON**: Para backup e importação.
    -   **PDF**: Para gerar um relatório profissional da lista de membros.
    -   **Excel (.xlsx)**: Para análise de dados em planilhas.
-   **Importação de Dados**: Carregue uma lista de membros a partir de um arquivo JSON (sobrescreve os dados existentes).
-   **Relatórios Visuais por Região**: Exporte um relatório visual em formato **PNG** para cada uma das 5 regiões do Brasil, ideal para apresentações.
-   **Internacionalização (i18n)**: Suporte completo para três idiomas:
    -   🇧🇷 Português
    -   🇺🇸 English
    -   🇪🇸 Español
-   **Persistência Local**: Todos os dados são salvos no `localStorage` do navegador, para que seu trabalho não seja perdido ao fechar a página.
-   **Modo Escuro**: Interface com tema claro e escuro, com detecção automática da preferência do sistema.
-   **Totalmente Responsivo**: A interface se adapta a diferentes tamanhos de tela, de desktops a dispositivos móveis.

---

## 🚀 Como Executar

A beleza deste projeto está na sua simplicidade. Nenhuma instalação é necessária.

1.  Faça o download do arquivo `index.html`.
2.  Abra o arquivo `index.html` em qualquer navegador web moderno (como Google Chrome, Mozilla Firefox, Microsoft Edge).

É isso! A aplicação já está pronta para ser usada.

---

## 🛠️ Tecnologias Utilizadas

-   **Frontend**: HTML5, CSS3, JavaScript (ES6+)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Mapa Interativo**: [Leaflet.js](https://leafletjs.com/)
-   **Notificações**: [Toastify.js](https://apvarun.github.io/toastify-js/)
-   **Exportação de Imagem (PNG)**: [html2canvas](https://html2canvas.hertzen.com/)
-   **Exportação de PDF**: [jsPDF](https://github.com/parallax/jsPDF) com o plugin [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
-   **Exportação de Excel (XLSX)**: [SheetJS (xlsx)](https://sheetjs.com/)

---

## 📖 Guia de Uso

### Adicionar um Membro
1.  Vá para a aba **Adicionar**.
2.  Preencha os campos (Nome e Estado são obrigatórios).
3.  Marque a caixa **"Responsável pela Região"** se desejar que este membro tenha destaque.
4.  Clique no botão **"Adicionar Membro"**.

### Gerenciar Membros
-   **Visualizar**: Na aba **Lista**, você pode ver todos os membros cadastrados. Use a barra de busca para filtrar a lista.
-   **Editar**: Clique no ícone de lápis (✏️) em um card de membro (na lista ou no popup do mapa).
-   **Remover**: Clique no ícone de lixeira (🗑️) para remover um membro. Uma confirmação será solicitada.

### Gerenciamento de Dados
-   **Exportar (Backup)**: Na seção "Exportar Lista de Membros", clique no formato desejado (JSON, PDF, Excel). **É altamente recomendado fazer backups regulares usando a opção JSON.**
-   **Importar**: Clique em "Importar JSON" e selecione um arquivo `.json` válido. **Atenção: A importação substituirá todos os dados existentes na aplicação.**

---

## ⚠️ Armazenamento de Dados

Os dados são salvos exclusivamente no **armazenamento local (`localStorage`) do seu navegador**. Isso significa que:
-   Os dados são persistentes naquela máquina e naquele navegador.
-   Limpar os dados do seu navegador irá apagar todos os membros cadastrados.
-   Os dados não são compartilhados entre diferentes navegadores ou computadores.

Use a funcionalidade de **Exportar para JSON** para criar backups e transferir seus dados para outra máquina.