# TRE-GO - ARQUIVO

Crie um sistema web corporativo em React, Vite e Tailwind CSS para geração, gerenciamento e impressão de etiquetas de caixas de arquivo morto, baseado no modelo do arquivo "ETIQUETAS P1 - ADMIN (1).pdf".

### 🎨 IDENTIDADE VISUAL E DESIGN (ESTILO PREMIUM / iOS)
- Paleta de Cores: Focada estritamente em tons de Azul Claro, Cinza bem claro e Branco.
- Fundo do App: Implemente um fundo animado de forma sutil e elegante (ex: gradientes suaves em tons de azul e branco que se movem muito lentamente ou formas abstratas suaves com blur no fundo), garantindo que não distraia o usuário.
- Interface Liquid Glass (Glassmorphism): Todos os cards, caixas de preenchimento de dados, menus e campos de escrita devem seguir o estilo do iOS mais recente. Utilize fundos brancos/azulados translúcidos (ex: `bg-white/60`), efeito de desfoque de fundo intenso (`backdrop-blur-md`), bordas finas e brilhantes (`border-white/40`) e sombras suaves para dar profundidade de vidro suspenso.

### 🏛️ ESTRUTURA DO APLICATIVO
O sistema deve conter uma navegação lateral (Sidebar) em estilo glassmorphic com três seções principais, além de um cabeçalho e um rodapé institucional:

1. CABEÇALHO DO APP:
- Deve conter o título do sistema, a identidade do Tribunal Regional Eleitoral de Goiás (TRE-GO) e, obrigatoriamente no canto superior direito da tela, o símbolo oficial do TRE (esfera azul com estrelas sobreposta a formas geométricas amarela e verde).

2. RODAPÉ DO APP (FOOTER):
- Adicione as informações oficiais fixas do TRE-GO na base da aplicação de forma discreta e elegante: "Tribunal Regional Eleitoral de Goiás - TRE-GO | Seção de Gestão Documental - SEDOC | Sistema de Organização de Arquivos".

3. SEÇÃO: CADASTRO DE CÓDIGOS (Área de Configuração):
- Formulário no estilo liquid glass para cadastrar o "Código do Documento" (ex: 13.32) e sua respectiva "Descrição" (ex: REGISTRO DE CANDIDATURA).
- Salve os dados permanentemente (use Supabase ou localStorage) para alimentar o gerador. Exiba uma tabela limpa com os códigos já cadastrados e a opção de exclusão.

4. SEÇÃO: GERADOR DE ETIQUETAS:
- Tela dividida em duas colunas: Lado esquerdo é o formulário de entrada (com inputs no estilo iOS); Lado direito é a pré-visualização da etiqueta em tempo real.
- Campos do Formulário:
  * Ano de Produção (Apenas o ano digital, mas a etiqueta deve formatar como "ANO DE PRODUÇÃO XXXX")
  * Final (Ano de finalização do processo)
  * Número da Vaga (Apenas o número, formatado na etiqueta como "VAGA XXXX")
  * Códigos: 4 campos sequenciais. O primeiro é obrigatório, os outros 3 são opcionais.
  * Autopreenchimento: Ao selecionar ou digitar um código previamente cadastrado, o campo "Descrição" deve ser preenchido de forma totalmente automática. Permita edição manual se necessário.
- Botão "Gerar e Salvar": Salva a etiqueta no histórico/banco de dados e a adiciona à fila de fechamento.

5. SEÇÃO: HISTÓRICO E PESQUISA:
- Uma tela com campo de busca para pesquisar etiquetas geradas anteriormente por Ano, Vaga, Código ou Descrição.
- Cada item do histórico deve permitir a visualização dos dados e conter um botão "Reimprimir" que recarrega os dados exatos para a área de impressão.

### 🖨️ CONFIGURAÇÃO DA ETIQUETA E IMPRESSÃO (MUITO CRÍTICO)
- Layout da Etiqueta: Deve seguir fielmente a estrutura de grid/caixas com bordas finas do modelo "ETIQUETAS P1 - ADMIN (1).pdf". Deve conter o cabeçalho interno centralizado escrito: "TRIBUNAL REGIONAL ELEITORAL DE GOIÁS" e "SEÇÃO DE GESTÃO DOCUMENTAL - SEDOC". O design deve destacar as caixas de "ANO DE PRODUÇÃO", "DESTINO | FINAL", "GUARDA", "PERMANENTE", o destaque em negrito para "VAGA XXXX", a listagem dos códigos e o bloco para a "Descrição:".
- Fechamento da Fila de Impressão: O usuário deve poder selecionar 2 etiquetas do histórico ou geradas no momento para combiná-las.
- Configuração CSS de Impressão (@media print):
  * Force a página de impressão do navegador a ficar no formato A4 e estritamente no modo PAISAGEM (Landscape).
  * Posicione as 2 etiquetas selecionadas lado a lado ou perfeitamente distribuídas na folha A4 em modo paisagem, respeitando as proporções originais do documento físico.
  * Esconda absolutamente todos os elementos da interface web (menus, botões, formulários, fundo animado, rodapé do sistema) no momento da impressão, deixando visíveis apenas as duas etiquetas perfeitamente diagramadas para o papel.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://etiquetasarquivotrego.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f0bee3e2-36f8-46bf-a62d-d42b7a27f3ff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
