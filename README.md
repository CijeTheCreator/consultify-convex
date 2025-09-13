# Consultify

A multilingual healthcare consultation platform with AI-powered triage and real-time translation.

## Features

- **AI Triage System**: Automated patient symptom assessment and doctor selection
- **Real-time Translation**: Multi-language support for patient-doctor communication
- **Prescription Management**: Digital prescriptions with automated email reminders
- **Secure Authentication**: BetterAuth + Convex integration
- **Real-time Chat**: Live consultation interface with translation indicators

## Tech Stack

- **Backend**: [Convex](https://convex.dev) - Real-time backend with database, auth, and functions
- **Authentication**: [BetterAuth](https://better-auth.com) + Convex for secure user management
- **AI/LLM**: [OpenAI](https://openai.com) for symptom analysis and response generation
- **Web Scraping**: [FireCrawl](https://firecrawl.dev) for medical information retrieval
- **Email**: [Resend](https://resend.com) for prescription reminders and notifications
- **Frontend**: Next.js with TypeScript and Tailwind CSS

## Convex Actions

Key backend actions in `convex/`:

- **`routeMessageAction`**: Determines message routing (translate, select doctor, generate response)
- **`selectDoctorAction`**: AI-powered doctor selection based on symptoms
- **`translateMessageAction`**: Real-time message translation for cross-language communication
- **`generateResponseAction`**: AI-generated medical responses and guidance
- **`prescriptionReminderAction`**: Automated daily prescription reminders via email (runs on cron)

## Consultation Chat Component

`components/consultation-chat.tsx` provides:
- Real-time messaging with translation status indicators
- Multi-language UI (English/French)
- Prescription sending interface for doctors
- Message routing based on consultation state (CLERKING → CONSULTING)
- Live translation with visual feedback

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Convex**:
   ```bash
   npx convex dev
   ```

3. **Configure environment variables** using Convex:
   ```bash
   npx convex env set OPENAI_API_KEY your_openai_key
   npx convex env set RESEND_API_KEY your_resend_key
   npx convex env set FIRECRAWL_API_KEY your_firecrawl_key
   npx convex env set BETTER_AUTH_SECRET your_auth_secret
   npx convex env set BETTER_AUTH_URL your_app_url
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

## Cron Jobs

- **Prescription Reminders**: `prescriptionReminderAction` runs daily at scheduled intervals to send medication reminders via email
