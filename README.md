# CoreArenaCLI Repository  
  
## Overview    
This repository serves as the monolithic home for the CoreArena ecosystem. It contains three primary components—**codearena-cli**, **codearena-server**, and **codearena-web**—as well as Docker configuration used to orchestrate these parts. Together these subprojects deliver a cohesive toolset for running competitive code arenas.    
  
The **codearena-cli** package provides a command‑line interface built with [oclif](https://oclif.io) that interacts with the server and orchestrates code arenas. The **codearena-server** package hosts the backend REST API and handles persistent data via database models, controllers, services, and migrations. The **codearena-web** package is a modern [Next.js](https://nextjs.org) application that serves as the web‑based user interface for the platform. Finally, the `docker` directory and root `docker-compose.yml` file enable containerisation and easy local deployment.  
  
This README describes each component in detail, explains the repository structure, and provides setup instructions for developers and contributors.    
  
## Repository Structure    
Below is a high‑level summary of the top‑level directories and files. Each subdirectory is explained in the following sections.    
  
| Path | Description |    
| --- | --- |    
| `/codearena-cli` | The command‑line interface package built with oclif. Offers commands to interact with CodeArena services. |    
| `/codearena-server` | The backend server built on Express. Contains controllers, models, migrations, routes, and services that form the REST API. |    
| `/codearena-web` | The web client built with Next.js. Provides the user‑facing interface and consumes the server API. |    
| `/docker` | Dockerfile used to build application images for deployment. |    
| `docker-compose.yml` | Compose file orchestrating multiple containers (CLI, server, database) for local development. |    
  
The repository currently lacks a root `README.md` (hence this file), but each subproject contains its own documentation.  
  
## codearena-cli    
  
### Purpose    
The **codearena-cli** package offers a command‑line interface that allows users to interact with CoreArena functionalities from a terminal. It wraps API calls to the backend and automates common tasks such as registering arenas, submitting solutions, and retrieving results.  
  
### Directory Layout    
Inside `/codearena-cli` you will find:    
  
- `.github/workflows/` – GitHub Actions workflow definitions for CI.    
- `.vscode/` – Editor configuration.    
- `bin/` – Executable script used by oclif when the CLI is run globally.    
- `src/` – Core CLI source code. This includes individual command definitions under the `commands` subdirectory, common utilities, and configuration.    
- `test/` – Mocha tests for the CLI commands.    
- `.gitignore`, `.mocharc.json`, `.prettierrc.json`, `eslint.config.mjs` – Configuration files for version control, testing, formatting, and linting.    
- `package.json`, `package-lock.json` – Package metadata and dependencies.    
- `README.md` – Internal documentation specific to the CLI.    
  
### Installation    
To install the CLI globally for use from anywhere:    
  
```  
npm install -g @your-scope/codearena-cli  
```    
  
Once installed, run the CLI with:    
  
```  
codearena-cli --help  
```    
  
This command outputs the available commands and options. Each command is documented within the code and discovered via `codearena-cli <command> --help`.    
  
### Development    
Local development can be performed by linking the package:    
  
```  
cd codearena-cli  
npm install  
npm run build  
npm link  
```    
  
After linking, the `codearena-cli` command will reference your local checkout. Tests live under the `test/` directory and are executed with:    
  
```  
npm test  
```    
  
## codearena-server    
  
### Purpose    
The **codearena-server** is the backend of the CoreArena platform. It is built on [Express](https://expressjs.com/) and uses an ORM (likely Sequelize) for database interactions. The server exposes RESTful endpoints consumed by the CLI and web client to manage arenas, problems, submissions, and other resources.  
  
### Directory Layout    
Key directories and files in `/codearena-server` include:    
  
- `config/` – Database configuration and environment‑specific settings.    
- `controllers/` – Express controllers that handle incoming requests and send responses.    
- `middleware/` – Custom middleware functions for authentication, error handling, logging, etc.    
- `migrations/` – Database schema migration scripts.    
- `models/` – ORM models defining database tables.    
- `routes/` – Express route definitions that map endpoints to controllers.    
- `services/` – Business logic and abstractions used by controllers.    
- `temp/` – Temporary or cached files.    
- `.env` – Environment variables for local development (do not commit secrets; a `.env.example` file is provided).    
- `list-models.js` – Utility script to list available models.    
  
### Setup and Running    
To run the server locally:    
  
1. Ensure you have Node.js and npm installed.    
2. Navigate to the server directory:    
  
   ```  
   cd codearena-server  
   npm install  
   ```    
  
3. Copy `.env.example` to `.env` and update environment variables (e.g., database connection, API keys).    
4. Run database migrations:    
  
   ```  
   npx sequelize-cli db:migrate  
   ```    
  
5. Start the server:    
  
   ```  
   npm start  
   ```    
  
The server should listen on a configurable port (default is often `3001` or set in `.env`). Use the `routes` directory to explore available API endpoints.  
  
### Development Notes    
- **Database**: The server uses a relational database via the ORM. Create the database before running migrations.    
- **Environment**: Keep secrets out of version control. The `.env.example` file outlines required variables.    
- **Testing**: Add unit/integration tests under a `test/` folder if not already present.    
  
## codearena-web    
  
### Purpose    
The **codearena-web** package provides a modern, responsive web interface built with [Next.js](https://nextjs.org). It allows users to browse arenas, register, submit solutions, and view rankings through a browser.  
  
### Directory Layout    
Important files and directories inside `/codearena-web` include:    
  
- `components/` – Reusable React components (cards, forms, layouts).    
- `pages/` – Next.js pages that correspond to routes. `index.js` is the landing page.    
- `public/` – Static assets such as images and icons.    
- `styles/` – Global and component‑level styles.    
- `.gitignore`, `jsconfig.json`, `next.config.mjs` – Configuration files for project setup and Next.js.    
- `package.json`, `package-lock.json` – Metadata and dependencies.    
- `README.md` – Next.js scaffold documentation.    
  
### Running the Web Client    
Follow these steps to start the development server:    
  
1. Navigate to the web directory:    
  
   ```  
   cd codearena-web  
   npm install  
   ```    
  
2. Start the development server:    
  
   ```  
   npm run dev  
   ```    
  
   By default the app runs on <http://localhost:3000>. Modify the port via environment variables if necessary.  
  
3. To build and start a production version:    
  
   ```  
   npm run build  
   npm start  
   ```  
  
The Next.js framework provides automatic page routing and API routes under `pages/api`. Use these features to extend the front‑end as needed.  
  
### Notes    
- **API Integration**: Ensure that the `NEXT_PUBLIC_API_BASE_URL` (or similar) environment variable points to your running server.    
- **TypeScript**: If migrating to TypeScript, update configurations accordingly.    
- **Testing**: Consider adding Jest or Cypress for component and end‑to‑end tests.    
  
## Docker and docker-compose    
  
### Purpose    
Containerisation ensures consistent environments across development, testing, and production. This repository includes a `Dockerfile` and a `docker-compose.yml` to build and orchestrate the server, CLI, and any supporting services (such as a database).  
  
### Dockerfile    
The `docker/Dockerfile` defines the instructions to build a Docker image for one of the components (likely the server). It sets up the runtime environment, installs dependencies, copies project files, and defines the entrypoint.  
  
### docker-compose.yml    
The root `docker-compose.yml` describes services such as the backend, database, and potentially the CLI. To start all services locally:    
  
```  
docker-compose up --build  
```    
  
This command builds the images (if not already built) and starts containers. Use `docker-compose down` to stop and remove them. Modify the compose file to map ports, volumes, and environment variables as needed.  
  
### Notes    
- Ensure Docker and Docker Compose are installed on your system.    
- When using Docker for local development, you may not need to install Node locally.    
  
## Contributing    
  
We welcome contributions from the community to improve CoreArena. To maintain quality and consistency, please read and follow the guidelines in **CONTRIBUTING.md** before submitting issues or pull requests. In summary:    
  
- **Issues**: Use the issue tracker to report bugs, propose new features, or request documentation improvements. Provide sufficient detail, reproduction steps, and environment information.    
- **Branches**: Create a feature branch from `main` (or the appropriate branch) and follow the naming convention `feature/short-description` or `bugfix/short-description`.    
- **Commits**: Write clear, concise commit messages.    
- **Pull Requests**: Submit a pull request referencing the issue number, provide a description of your changes, and ensure CI tests pass.    
- **Code Style**: Adhere to the established ESLint and Prettier configurations.    
  
## Code of Conduct    
  
This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org). By participating, you are expected to uphold our **Code of Conduct** (see `CODE_OF_CONDUCT.md`). In brief, we pledge to:    
  
- Foster a welcoming, inclusive, and harassment‑free environment.    
- Respect differing viewpoints and experiences.    
- Be kind and constructive in all interactions.    
- Accept responsibility for our words and actions.    
  
If you experience or witness unacceptable behavior, please report it through the channels described in the Code of Conduct.  
  
## License    
  
Currently this repository does not specify a license. Contributors should be aware that without a license the default copyright laws apply, which means others have limited rights to use and distribute the code. If you are the maintainer, consider adding an open source license such as MIT, Apache 2.0, or GPLv3 to clarify terms of use.  
  
## Acknowledgements    
  
- [oclif](https://oclif.io) for simplifying CLI creation.    
- [Express](https://expressjs.com) for providing a robust server framework.    
- [Next.js](https://nextjs.org) for enabling a powerful React‑based front‑end.    
- The open source community for packages and resources that make development easier.    
  
We hope this README provides clarity on the purpose and layout of the CoreArenaCLI monorepo. Feel free to explore each component and contribute to the project!
