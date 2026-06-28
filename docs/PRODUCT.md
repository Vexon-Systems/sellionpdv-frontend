# PRODUCT.md - SellionPDV

## 1. Visão Geral
* **O que é:** Plataforma SaaS web de Gestão Financeira e Frente de Caixa (PDV), otimizada inicialmente para quiosques de sorvete.
* **Problema que resolve:** Substitui controles manuais e planilhas, unificando a agilidade de vendas diárias com um Backoffice estratégico (Mini-ERP).
* **Modelo de Negócio:** Arquitetura Multi-tenant escalável, projetada para atender e isolar logicamente os dados de múltiplas lojas e redes de franquias.

## 2. Perfis de Usuário (RBAC)
* **ADMIN (Gerente/Proprietário):** Acesso total. Gerencia o catálogo, configura modificadores de produtos, audita caixas e analisa dados financeiros gerenciais (DRE).
* **OPERADOR (Caixa):** Acesso restrito à operação diária. Fica bloqueado no ambiente de PDV para realizar vendas, abertura/fechamento de turno, sangrias e reforços.

## 3. Módulos Principais

| # | Módulo | Acesso | Descrição |
|---|--------|--------|-----------|
| 1 | **Autenticação** | Público | Login JWT, perfil e preferências do usuário |
| 2 | **Frente de Caixa (PDV)** | Operador + Admin | Grade de produtos, carrinho, checkout com múltiplas formas de pagamento |
| 3 | **Controle de Caixa** | Operador + Admin | Abertura, sangria/reforço, fechamento cego com cálculo de furo |
| 4 | **Catálogo** | Admin | Categorias, produtos com ficha técnica, grupos de modificadores |
| 5 | **Maquininhas** | Admin | Cadastro de terminais, taxas genéricas e taxas por bandeira (VISA, MC, ELO, etc.) |
| 6 | **Gestão de Equipe** | Admin | CRUD de funcionários, roles (ADMIN/OPERADOR), soft delete |
| 7 | **Dashboard** | Admin | KPIs em tempo real, gráficos de série temporal, top produtos, mix de pagamentos |
| 8 | **Relatórios** | Admin | Histórico de vendas, auditoria de caixas, análise de crescimento comparativo |
| 9 | **Financeiro** | Admin | Lançamentos manuais de despesas + DRE Gerencial completo (até Lucro Líquido) |