# NEU Wallet Backend

## Project Setup

This guide will walk you through setting up the development environment for this project. The setup includes installing Node.js, Bun, Docker, and configuring a PostgreSQL container.

### Prerequisites

Before proceeding, ensure you have the following installed on your system:

- Node.js: [Download and install Node.js](https://nodejs.org)
- Bun: [Install Bun](https://bun.sh/)
- Docker: [Install Docker](https://docs.docker.com/get-docker/)

### Setup Instructions

1. **Clone the repository:**
    ```bash
    git clone https://github.com/TheSpecsss/neu-wallet-backend
    cd new-wallet-backend
    ```

2. **Pull Postgres Image:**
    ```bash
    docker pull postgres
    ```

3. **Create Container:**
    ```bash
    docker run --name neu-wallet-be-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
    ```
    - Create and start a PostgreSQL container with the following credentials:
        - User: admin
        - Password: password
        - Port: 5432
    
    Replace `DATABASE_URL` in your .env
    ```
    DATABASE_URL=postgresql://admin:password@localhost:5432/postgres
    ```
4. **Install Dependencies:**
    ```bash
    bun install
    ```

5. **Initialize your Database:**
    ```bash
    bun run db:push
    ```

6. **Run a test to check if everything is working:**
    ```bash
    bun test
    ```

### Required VS Code Extensions

1. [BiomeJS](https://marketplace.visualstudio.com/items?itemName=biomejs.biome): A fast formatter and linter for JavaScript/TypeScript.
2. [Bun for VS Code](https://marketplace.visualstudio.com/items?itemName=antfu.bun-vscode): Adds support for Bun runtime.
3. [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma): Adds syntax highlighting and other features for Prisma ORM.
