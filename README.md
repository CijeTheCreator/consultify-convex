# Consultify - Multilingual Doctor Consultation Platform

Consultify is a sophisticated telemedicine platform that breaks down language barriers in healthcare by connecting patients with healthcare providers through AI-powered translation, medical triage, and automated workflows.

## 🌟 Key Features

### 🤖 AI-Powered Medical Triage
- **Intelligent Clerking System**: AI clerk conducts initial patient interviews
- **Symptom Analysis**: Automated assessment and categorization of patient symptoms
- **Specialist Routing**: AI determines appropriate medical specialty based on symptoms
- **Medical Research Integration**: Real-time medical database searches using Firecrawl

### 🌍 Multilingual Communication
- **Real-time Translation**: Automatic message translation between patient and doctor languages
- **Multi-language Support**: Comprehensive interface localization (English/French)
- **Medical Terminology**: Context-aware translations for healthcare-specific terms

### 👩‍⚕️ Smart Doctor Selection
- **Specialty Matching**: AI matches patients to appropriate specialists
- **Availability Management**: Real-time doctor availability tracking
- **Qualification Assessment**: Automated doctor-patient compatibility scoring

### 💊 Prescription Management
- **AI-Powered Prescriptions**: Automated prescription recommendations
- **Drug Information**: Integration with medical databases (British National Formulary)
- **Reminder System**: Automated medication reminders via scheduled tasks
- **Safety Checks**: Drug interaction and contraindication alerts

### 💬 Real-time Consultation Chat
- **Live Messaging**: Real-time communication between patients and healthcare providers
- **Translation Layer**: Transparent language barrier removal during conversations
- **State Management**: Consultation progress tracking (CLERKING → CONSULTING)
- **Message History**: Complete conversation archival with multilingual support

## 🛠 Tech Stack

### Frontend
- **Next.js 14.2.16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form handling and validation

### Backend & Database
- **Convex** - Real-time backend with built-in database, authentication, and functions
- **Convex Better Auth** - Secure authentication system
- **Real-time Subscriptions** - Live data synchronization for consultations

### AI & Machine Learning
- **Mistral AI (mistral-large-latest)** - Primary LLM for medical responses and translations
- **LangChain** - AI workflow orchestration
- **Firecrawl** - Medical research data retrieval
- **Zod Schemas** - Structured AI output parsing

## 🏗 Architecture

### Database Schema

The Convex schema defines five core entities:

1. **Users** - Multi-role support (patients, doctors, clerks) with language preferences
2. **Consultations** - Session management with state transitions
3. **Messages** - Multilingual message handling with translation support
4. **Prescriptions** - Medication management with dosing schedules
5. **Notifications** - System alerts and automated reminders

### AI Workflow System

**Message Processing Pipeline:**
1. **Route Determination** - Analyzes message context to determine next action
2. **Translation Service** - Converts messages between languages when needed
3. **Response Generation** - AI generates contextual medical responses
4. **Doctor Selection** - Automated specialist matching based on symptoms

**Automated Actions:**
- **Prescription Reminders** - Daily cron jobs for medication alerts
- **Consultation Routing** - Automatic doctor assignment
- **Medical Research** - Real-time information retrieval from medical databases

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Convex account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd consultify-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```

4. **Configure environment variables**
   Create a `.env.local` file with:
   ```env
   # Convex
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   
   # AI Services
   MISTRAL_API_KEY=your_mistral_api_key
   
   # Other integrations
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   RESEND_API_KEY=your_resend_api_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Deploy Convex functions**
   ```bash
   npx convex deploy
   ```

## 📁 Project Structure

```
consultify-frontend/
├── app/                          # Next.js App Router
│   ├── consultation/[id]/        # Individual consultation pages
│   ├── doctor-dashboard/         # Doctor interface
│   ├── patient-dashboard/        # Patient interface
│   └── hero/                     # Landing page
├── components/                   # React Components
│   ├── consultation-chat.tsx     # Core chat interface
│   ├── onboarding/              # User registration flow
│   ├── prescription-modal.tsx    # Prescription management
│   └── ui/                      # Reusable UI components
├── convex/                      # Backend Functions
│   ├── schema.ts                # Database schema
│   ├── consultations.ts         # Consultation management
│   ├── messages.ts              # Message handling
│   ├── users.ts                 # User management
│   ├── prescriptions.ts         # Prescription system
│   ├── generateResponseAction.ts # AI response generation
│   ├── translateMessageAction.ts # Translation service
│   ├── routeMessageAction.ts    # Message routing logic
│   ├── selectDoctorAction.ts    # Doctor selection AI
│   └── crons.ts                 # Scheduled tasks
├── contexts/                    # React Context Providers
├── lib/                        # Utility Functions
│   ├── convex-services.ts       # Convex type guards and utilities
│   └── types.ts                # TypeScript type definitions
└── workflows/                  # Business Logic Workflows
```

## 🔧 Key Components

### ConsultationChat Component
The core chat interface (`components/consultation-chat.tsx`) provides:
- Real-time messaging with automatic translation
- State-aware UI (CLERKING vs CONSULTING modes)
- Prescription sending for doctors
- Multi-language support with role-based translations
- Message status indicators and loading states

### Convex Functions
Located in `/convex/`, these handle:
- **Messages**: Real-time chat functionality with translation
- **Consultations**: Session state management and doctor assignment
- **Users**: Multi-role user management with language preferences
- **Prescriptions**: Medication management with automated reminders
- **AI Actions**: Translation, response generation, and routing logic

## 🔐 Authentication & Security

- **Convex Better Auth**: Secure authentication with session management
- **Role-based Access Control**: Patient, doctor, and clerk permissions
- **Data Encryption**: Secure handling of sensitive medical information
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🤖 AI Integration

### Language Translation
- Automatic detection of user languages
- Real-time message translation during consultations
- Context-aware medical terminology translation

### Medical Triage
- AI-powered symptom assessment
- Automatic specialist recommendation
- Integration with medical databases for research

### Response Generation
- Contextual medical advice generation
- Integration with medical knowledge bases
- Safety-first approach with appropriate disclaimers

## 🔄 Workflow States

### Consultation States
1. **CLERKING** - AI conducts initial patient interview
2. **CONSULTING** - Live consultation with assigned doctor

### Message Processing
1. Message received → Route determination
2. Translation (if needed) → Content delivery
3. AI response generation (for clerk mode)
4. Doctor notification and assignment

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx convex dev` - Start Convex development environment
- `npx convex deploy` - Deploy Convex functions

## 🌐 Deployment

The application is designed for deployment with:
- **Frontend**: Vercel, Netlify, or similar platforms
- **Backend**: Convex cloud platform
- **Database**: Convex built-in database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the documentation in `/docs`
- Review the Convex documentation at [docs.convex.dev](https://docs.convex.dev)
- Open an issue for bug reports or feature requests

---

**Note**: This platform handles sensitive medical information. Ensure compliance with relevant healthcare regulations (HIPAA, GDPR, etc.) when deploying to production.