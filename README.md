# Sistema de Gestão Full-Stack

Este projeto consiste numa aplicação completa de gestão (CRUD) de utilizadores, produtos e categorias, com funcionalidades avançadas de auditoria e notificações.

## 🚀 Tecnologias Utilizadas

### Backend
* **Framework:** NestJS.
* **Linguagem:** TypeScript.
* **ORM:** TypeORM para integração com base de dados.
* **Base de Dados:** PostgreSQL.
* **Autenticação:** Passport.js com estratégia JWT.
* **Documentação:** Swagger UI.

### Frontend
* **Framework:** Next.js 14 (App Router).
* **Gestão de Estado:** Zustand.
* **Componentes UI:** PrimeReact e estilos @uigovpe.
* **Comunicação API:** Axios.

---

## 🛠️ Instalação e Configuração

### 1. Requisitos Prévios
* Node.js v20 ou superior.
* Instância de PostgreSQL ativa.

### 2. Configuração do Backend
1.  Navegue até à pasta `backend`:
    ```bash
    cd backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure as variáveis de ambiente:
    * Renomeie o ficheiro `.env.example` para `.env`.
    * Certifique-se de que as credenciais do banco de dados (Host, User, Password) estão corretas.
4.  Execute o script de povoamento (seed) para criar os utilizadores base e dados iniciais:
    ```bash
    npm run seed
    ```
5.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run start:dev
    ```
    * API: `http://localhost:3001/api`.
    * Swagger: `http://localhost:3001/api/docs`.

### 3. Configuração do Frontend
1.  Navegue até à pasta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure o ficheiro `.env.local`:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3001/api
    ```
   
4.  Inicie a aplicação:
    ```bash
    npm run dev
    ```
    * Aceda em: `http://localhost:3000`.

---

## 📋 Funcionalidades

* **🔒 Autenticação e Perfis:** Login seguro com JWT e distinção entre administradores (ADMIN) e utilizadores comuns (USER).
* **📦 Gestão de Inventário:** CRUD completo de produtos com suporte para upload de imagens.
* **📂 Organização:** Sistema de categorias para classificação de produtos.
* **📜 Auditoria (Admin):** Registo automático de logs para criação, edição, eliminação e login.
* **🔔 Notificações:** Alertas para o utilizador quando os seus registos são alterados.
* **⭐ Favoritos:** Possibilidade de marcar produtos como favoritos.

---

## 👥 Utilizadores para Teste (Seed)

| Perfil | Email | Palavra-passe |
| :--- | :--- | :--- |
| **Administrador** | admin@example.com | Admin@123 |
| **Utilizador** | user@example.com | User@123 |



---

## 🐳 Docker
O projeto inclui ficheiros `Dockerfile` em ambos os diretórios para facilitar a criação de contentores e o deployment.
