# PRODUCT.md - SellionPDV

## 1. Visão Geral
* **O que é:** Plataforma SaaS web de Gestão Financeira e Frente de Caixa (PDV), otimizada inicialmente para quiosques de sorvete.
* **Problema que resolve:** Substitui controles manuais e planilhas, unificando a agilidade de vendas diárias com um Backoffice estratégico (Mini-ERP).
* **Modelo de Negócio:** Arquitetura Multi-tenant escalável, projetada para atender e isolar logicamente os dados de múltiplas lojas e redes de franquias.

## 2. Perfis de Usuário (RBAC)
* **ADMIN (Gerente/Proprietário):** Acesso total. Gerencia o catálogo, configura modificadores de produtos, audita caixas e analisa dados financeiros gerenciais (DRE).
* **OPERADOR (Caixa):** Acesso restrito à operação diária. Fica bloqueado no ambiente de PDV para realizar vendas, abertura/fechamento de turno, sangrias e reforços.

## 3. Módulos Principais
1. Autenticação e Gestão de Usuários
2. Frente de Caixa (PDV)
3. Controle de Caixa (Turnos)
4. Gestão de Catálogo (Produtos e Modificadores)
5. Gestão de Equipe (Funcionários)
6. Dashboard e Relatórios Financeiros