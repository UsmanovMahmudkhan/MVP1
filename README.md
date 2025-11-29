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

# CodeArena Production Deployment Guide

This guide covers deploying the CodeArena platform to production with separate hosting for frontend and backend.

## Architecture Overview

- **Frontend**: Next.js application (codearena-web)
- **Backend**: Express.js API server (codearena-server)
- **Database**: PostgreSQL
- **Code Execution**: Docker containers (requires Docker on backend server)

---

## Option 1: Vercel (Frontend) + Railway/Render (Backend) - Recommended

### Frontend Deployment (Vercel)

**1. Prepare the Frontend**

```bash
cd codearena-web

# Create vercel.json for configuration
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
EOF
```

**2. Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**3. Set Environment Variables in Vercel Dashboard**
- `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-api.railway.app`)

---

### Backend Deployment (Railway)

**1. Prepare the Backend**

Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**2. Deploy to Railway**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd codearena-server
railway init

# Add PostgreSQL database
railway add --database postgresql

# Deploy
railway up
```

**3. Set Environment Variables in Railway Dashboard**

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<auto-generated-by-railway>
JWT_SECRET=<generate-strong-secret>
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
GITHUB_CLIENT_ID=<your-github-oauth-client-id>
GITHUB_CLIENT_SECRET=<your-github-oauth-secret>
CALLBACK_URL=https://your-api.railway.app
FRONTEND_URL=https://your-app.vercel.app
GROQ_API_KEY=<your-groq-api-key>
```

**4. Docker Setup on Railway**

Railway doesn't support Docker-in-Docker by default. You have two options:

**Option A: Use Railway's Docker Support**
- Enable Docker in Railway project settings
- Ensure your Dockerfile is in the root of codearena-server

**Option B: Use External Code Execution Service**
- Deploy code execution to a separate VPS with Docker
- Update backend to call external execution API

---

## Option 2: VPS Deployment (DigitalOcean, AWS EC2, etc.)

### Prerequisites
- Ubuntu 22.04 LTS server
- Domain name (optional but recommended)
- SSH access

### 1. Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Nginx
apt install -y nginx

# Install PM2 for process management
npm install -g pm2
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE codearena;
CREATE USER codearena_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE codearena TO codearena_user;
\q
```

### 3. Clone and Setup Backend

```bash
# Create app directory
mkdir -p /var/www/codearena
cd /var/www/codearena

# Clone your repository
git clone <your-repo-url> .

# Setup backend
cd codearena-server
npm install --production

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://codearena_user:your_secure_password@localhost:5432/codearena
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
CALLBACK_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
GROQ_API_KEY=your_groq_api_key
EOF

# Run migrations
npx sequelize-cli db:migrate

# Build Docker sandbox image
cd ../docker
docker build -t codearena-sandbox .

# Start backend with PM2
cd ../codearena-server
pm2 start server.js --name codearena-api
pm2 save
pm2 startup
```

### 4. Setup Frontend

```bash
cd /var/www/codearena/codearena-web

# Install dependencies
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
EOF

# Build
npm run build

# Start with PM2
pm2 start npm --name codearena-web -- start
pm2 save
```

### 5. Nginx Configuration

```bash
# Create backend config
cat > /etc/nginx/sites-available/codearena-api << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Create frontend config
cat > /etc/nginx/sites-available/codearena-web << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable sites
ln -s /etc/nginx/sites-available/codearena-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/codearena-web /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t
systemctl reload nginx
```

### 6. SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificates
certbot --nginx -d yourdomain.com -d www.yourdomain.com
certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
```

---

## Option 3: Docker Compose Deployment

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: codearena
      POSTGRES_USER: codearena_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build: ./codearena-server
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://codearena_user:${DB_PASSWORD}@postgres:5432/codearena
      JWT_SECRET: ${JWT_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      CALLBACK_URL: ${CALLBACK_URL}
      FRONTEND_URL: ${FRONTEND_URL}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - postgres
    restart: always

  frontend:
    build: ./codearena-web
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Post-Deployment Checklist

- [ ] Update OAuth redirect URIs in Google/GitHub console
- [ ] Set up database backups
- [ ] Configure monitoring (e.g., UptimeRobot, Sentry)
- [ ] Set up logging (PM2 logs, CloudWatch, etc.)
- [ ] Enable CORS properly in backend
- [ ] Test all features in production
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure rate limiting
- [ ] Set up CDN for static assets (Cloudflare)

---

## Updating the Application

### Vercel + Railway
```bash
# Frontend
cd codearena-web
git push origin main  # Auto-deploys on Vercel

# Backend
cd codearena-server
railway up
```

### VPS
```bash
ssh root@your-server-ip
cd /var/www/codearena

# Pull latest changes
git pull

# Update backend
cd codearena-server
npm install
npx sequelize-cli db:migrate
pm2 restart codearena-api

# Update frontend
cd ../codearena-web
npm install
npm run build
pm2 restart codearena-web
```

---

## Monitoring & Maintenance

### Check Logs
```bash
# PM2 logs
pm2 logs codearena-api
pm2 logs codearena-web

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database Backup
```bash
# Backup
pg_dump -U codearena_user codearena > backup_$(date +%Y%m%d).sql

# Restore
psql -U codearena_user codearena < backup_20231121.sql
```

---

## Troubleshooting

### Docker Issues
- Ensure Docker socket is accessible: `ls -la /var/run/docker.sock`
- Check Docker permissions: `usermod -aG docker $USER`
- Verify sandbox image: `docker images | grep codearena-sandbox`

### Database Connection
- Test connection: `psql -U codearena_user -d codearena -h localhost`
- Check PostgreSQL status: `systemctl status postgresql`

### OAuth Issues
- Verify redirect URIs match exactly
- Check environment variables are set correctly
- Ensure HTTPS is enabled for production

---

## Recommended Services

- **Frontend**: Vercel (free tier available)
- **Backend**: Railway ($5/month) or Render (free tier)
- **Database**: Railway PostgreSQL or Supabase
- **Code Execution**: Separate VPS with Docker ($5-10/month)
- **Domain**: Namecheap, Google Domains
- **SSL**: Let's Encrypt (free)
- **Monitoring**: UptimeRobot (free), Sentry (free tier)
- **CDN**: Cloudflare (free)

---
  
## License

This project is licensed under the Apache License 2.0.  
See the LICENSE file for full details.

## Acknowledgements    
  
- [oclif](https://oclif.io) for simplifying CLI creation.    
- [Express](https://expressjs.com) for providing a robust server framework.    
- [Next.js](https://nextjs.org) for enabling a powerful React‑based front‑end.    
- The open source community for packages and resources that make development easier.    
  
We hope this README provides clarity on the purpose and layout of the CoreArenaCLI monorepo. Feel free to explore each component and contribute to the project!


##  Project Context & Collaboration (Deliverable 2 - OSS)

This project was developed as **Deliverable 2** for the Open Source Software (OSS) course, focusing on demonstrating proficiency in modern Git workflows and effective GitHub collaboration practices among the group members.

### Core Objectives Achieved:

* **Repository Management:** Established a public repository with necessary topics, a detailed description, and the **Apache License 2.0**.
* **Documentation Standards:** Included essential community documents (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`) to establish clear contribution guidelines.
* **Team Workflow:** Demonstrated effective collaboration through branching, meaningful commits, and pull requests, ensuring active participation from all designated collaborators.
* **Release Management:** Uploaded the initial code base and created the official **`v0.0.1`** release tag, marking the project's first stable state.

### Individual Contribution (Replace with Your Name or Student ID)

My required significant commit for this deliverable focused on enhancing the project's operational readiness and documentation:

* **Task:** Addition of the comprehensive **`CodeArena Production Deployment Guide`** (Options 1, 2, and 3) to the `README.md`.
* **Impact:** This contribution provides clear, multi-platform instructions for deploying the complex, multi-component CoreArena platform, significantly lowering the barrier to entry for production environments and ensuring long-term maintainability.
* **Fulfillment:** This extensive documentation effort satisfies the requirement for a mandatory, meaningful contribution while adding critical value to the project's user and maintainer documentation.
