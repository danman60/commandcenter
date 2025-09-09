# CommandCenter - Dance Studio CRM

A modern, elegant CRM web application designed for dance studios to unify StreamStage and StudioSage outreach. Built with React, TypeScript, and Netlify Functions, integrated with Airtable as the backend.

## Features

- **Dashboard**: KPIs, charts, and overdue client tracking
- **Lead Board**: Drag-and-drop client categorization with Kanban interface
- **Workbench**: Daily contact management with quick interaction logging
- **Real-time Updates**: React Query for optimistic updates and data synchronization
- **Responsive Design**: Accessible, keyboard-friendly interface
- **Automated Scheduling**: Daily overdue digest function

## Stack

- **Frontend**: React 18 + Vite + TypeScript
- **UI**: Minimal components with accessible semantics
- **Drag & Drop**: @hello-pangea/dnd
- **State Management**: React Query v4
- **Backend**: Netlify Functions (TypeScript)
- **Database**: Airtable
- **Deployment**: GitHub → Netlify
- **Timezone**: America/Toronto for scheduling

## Project Structure

```
/
├── netlify/
│   └── functions/          # Serverless API endpoints
│       ├── _lib/           # Shared utilities and types
│       ├── clients.ts      # Client data API
│       ├── contacts.ts     # Contact data API
│       ├── interactions.ts # Interaction logging API
│       └── overdueDigest.ts # Scheduled digest
├── src/
│   ├── api/               # Frontend API client
│   ├── components/        # Reusable React components
│   ├── hooks/            # React Query hooks
│   ├── pages/            # Main application pages
│   └── App.tsx           # Main application component
├── public/               # Static assets
├── netlify.toml         # Netlify configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your Airtable credentials:

```
AIRTABLE_BASE_ID=appWR1XtQy8PiiGlZ
AIRTABLE_API_URL=https://api.airtable.com/v0/appWR1XtQy8PiiGlZ
AIRTABLE_PAT=your_personal_access_token_here
```

### 3. Development

```bash
# Start development server
npm run dev

# Optional: Test with Netlify Dev (requires Netlify CLI)
netlify dev
```

### 4. Build

```bash
npm run build
```

## Deployment

### 1. GitHub Setup

Push your code to the GitHub repository:

```bash
git add .
git commit -m "Initial CommandCenter implementation"
git push -u origin main
```

### 2. Netlify Setup

1. Create a new site from GitHub at [netlify.com](https://netlify.com)
2. Connect your `commandcenter` repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### 3. Environment Variables

In Netlify dashboard → Site Settings → Environment Variables, add:

```
AIRTABLE_BASE_ID=appWR1XtQy8PiiGlZ
AIRTABLE_API_URL=https://api.airtable.com/v0/appWR1XtQy8PiiGlZ
AIRTABLE_PAT=your_personal_access_token_here
```

### 4. Deploy

Trigger deployment manually or push to main branch for automatic deployment.

## Airtable Schema

The application expects these tables in your Airtable base:

### Clients Table
- Client Name (primary)
- City, Province/State, Website
- Tags (multi-select)
- Owner (collaborator, required)
- Category (single select: Previous Client, Warm Lead, Cold Lead)
- Do Not Contact (checkbox)
- Client Notes (long text, rich text on)
- Last Outreach (rollup from Interactions.Timestamp, MAX)
- Days Since Last Outreach (formula)
- Alert Level (formula with thresholds 3d, 7d, 21d, 42d)
- Next Touch Date (formula based on Category and Last Outreach)

### Contacts Table
- Full Name (primary)
- Title, Email, Phone
- Linked Client (link to Clients, single)
- Inherited Category (lookup from Clients.Category)
- Owner (collaborator)
- Do Not Contact (checkbox)
- Quick Notes (long text, rich text on)
- Last Outreach (rollup from Interactions.Timestamp scoped to this Contact, MAX)
- Days Since Last Outreach (formula)

### Interactions Table
- Contact (link to Contacts)
- Client (link to Clients)
- Type (single select: Phone, Email, Meeting, Other)
- Notes (long text)
- Timestamp (created time)
- Created By (created by)

## API Endpoints

- `GET /api/clients` - Fetch clients with filtering
- `PATCH /api/clientUpdateCategory/:id` - Update client category
- `GET /api/contacts` - Fetch contacts with filtering
- `POST /api/interactions` - Create new interaction
- `GET /api/health` - Health check and Airtable connection test

## Features Detail

### Dashboard
- KPI tiles showing total clients and overdue counts by alert level
- Charts for clients by category and overdue by alert level
- Top 20 overdue clients table sorted by severity

### Lead Board
- Drag-and-drop Kanban interface for client categories
- Client detail panel with contacts and interaction logging
- Optimistic updates with automatic rollback on failure

### Workbench
- Table view of all contacts with inline actions
- Quick interaction logging (Phone, Email, Meeting)
- Mailto helper links with prefilled subject and body
- Respect "Do Not Contact" flags

### Scheduled Functions
- Daily overdue digest at 08:00 ET (12:00 UTC)
- Logs summary by alert level and owner
- Future hook point for Slack/email notifications

## Security

- Environment variables for all sensitive data
- No hardcoded tokens in source code
- CORS headers configured for function endpoints
- .env files excluded from git

## Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build
netlify dev       # Run with Netlify dev environment (optional)
```

## License

Private project for dance studio CRM use.