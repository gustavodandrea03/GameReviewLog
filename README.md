# GameReviewLog

O projeto GameReviewLog (GRL) é uma Single Page Application (SPA) de catálogo e crítica de jogos, desenvolvida em Angular e usando o Supabase como backend Serverless.

A aplicação utiliza o Angular (Standalone Components) no frontend para gerenciar a interface e o roteamento (SPA). O backend é totalmente Serverless, baseado no Supabase, e implementa os quatro pilares:

Database (PostgreSQL): Armazena o CRUD completo para as entidades Jogos e Revisões, gerenciando a relação 1:N entre elas.

Authentication: Gerencia o Login/Registro de usuários.

Storage: Armazena ficheiros como capas de jogos e screenshots.

Functions: Utiliza uma função de banco de dados (Trigger) para calcular a pontuação média de um jogo em tempo real.

Segurança e Funcionalidades
O GRL garante a segurança através de Route Guards (para proteger rotas de escrita) e Row-Level Security (RLS), que impede que usuários modifiquem dados criados por outros. A principal funcionalidade é o Gerenciamento de Revisões e Jogos, com o diferencial de cálculo automático de pontuação média no backend via Trigger, demonstrando uma aplicação robusta de lógica de negócio em uma arquitetura Serverless.

