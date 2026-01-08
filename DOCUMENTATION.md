# Khorcha AI - Documentation

## 🎯 প্রজেক্ট সম্পর্কে

**Khorcha AI** একটি স্মার্ট মানি ম্যানেজমেন্ট সিস্টেম যা AI চ্যাটবট ব্যবহার করে সহজেই লেনদেন এন্ট্রি করতে সাহায্য করে।

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | ^18.3.1 |
| **TypeScript** | Type Safety | Latest |
| **Vite** | Build Tool & Dev Server | Latest |
| **Tailwind CSS** | Styling | Latest |
| **shadcn/ui** | UI Components | Latest |
| **Framer Motion** | Animations | ^12.24.12 |
| **React Router** | Routing | ^6.30.1 |
| **TanStack Query** | Data Fetching & Caching | ^5.83.0 |
| **Recharts** | Charts & Graphs | ^2.15.4 |

### Backend
| Technology | Purpose |
|------------|---------|
| **Lovable Cloud (Supabase)** | Backend as a Service |
| **PostgreSQL** | Database |
| **Supabase Auth** | User Authentication |
| **Edge Functions (Deno)** | Serverless Functions |

### AI Integration
| Technology | Purpose |
|------------|---------|
| **Lovable AI Gateway** | AI API Gateway |
| **Google Gemini 2.5 Flash** | AI Model for Chat |

---

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── AIChatbot.tsx    # AI Chat interface
│   │   ├── BalanceCard.tsx  # Balance display
│   │   ├── TransactionList.tsx
│   │   ├── AccountsView.tsx
│   │   ├── BudgetView.tsx
│   │   ├── RecurringView.tsx
│   │   ├── ExportView.tsx
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom hooks
│   │   ├── useTransactions.ts
│   │   ├── useAccounts.ts
│   │   ├── useBudgets.ts
│   │   └── ...
│   ├── integrations/        # External integrations
│   │   └── supabase/
│   │       ├── client.ts    # Supabase client
│   │       └── types.ts     # Database types
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Main page
│   │   ├── Auth.tsx         # Login/Signup
│   │   └── NotFound.tsx
│   ├── types/               # TypeScript types
│   └── lib/                 # Utilities
├── supabase/
│   ├── functions/           # Edge Functions
│   │   └── chat/
│   │       └── index.ts     # AI Chat function
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase config
└── public/                  # Static files
```

---

## 🗄️ Database Schema

### Tables

#### `accounts`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| name | TEXT | Account name |
| type | TEXT | cash, bank, mobile_banking, card |
| balance | NUMERIC | Current balance |
| color | TEXT | Display color |
| icon | TEXT | Icon name |
| is_default | BOOLEAN | Default account flag |

#### `transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| account_id | UUID | Account reference |
| type | TEXT | income, expense |
| amount | NUMERIC | Transaction amount |
| category | TEXT | Category |
| description | TEXT | Description |
| transaction_date | DATE | Transaction date |

#### `budgets`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| category | TEXT | Budget category |
| amount | NUMERIC | Budget limit |
| period | TEXT | daily, weekly, monthly |

#### `recurring_transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| type | TEXT | income, expense |
| amount | NUMERIC | Amount |
| category | TEXT | Category |
| description | TEXT | Description |
| frequency | TEXT | daily, weekly, monthly |
| next_date | DATE | Next occurrence |
| is_active | BOOLEAN | Active status |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm or bun

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-git-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Variables**
   
   Create a `.env` file in the root (this is auto-configured in Lovable):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🤖 AI Features

### How AI Chat Works

1. User sends a message (text or image)
2. Message is sent to Edge Function (`/functions/v1/chat`)
3. Edge Function calls Lovable AI Gateway
4. AI parses the message and returns:
   - JSON for transactions
   - Confirmation for unclear inputs
   - Helpful response for queries

### Supported Commands

```
Simple:
- "ami 500 taka rikshaw vara diyechi"
- "uber 150"
- "khabar 300"

With Date:
- "gotokal 500 tk khoroj"
- "got masher 5 tarikh 1000 tk"

With Account:
- "bkash theke 500 tk diyechi"
- "card e 2000 tk khoroj"
```

---

## 📱 Features

- ✅ AI-powered transaction entry
- ✅ Manual transaction entry
- ✅ Multi-account management
- ✅ Account transfers
- ✅ Budget management with alerts
- ✅ Recurring transactions
- ✅ Transaction search & filter
- ✅ Data export (CSV/Text)
- ✅ Statistics & charts
- ✅ Mobile-friendly interface

---

## 🔐 Authentication

The app uses Supabase Auth with:
- Email/Password signup & login
- Auto-confirm enabled for development
- Row Level Security (RLS) on all tables

---

## 📞 API Endpoints

### Edge Functions

#### `POST /functions/v1/chat`
AI chat endpoint for transaction parsing.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "ami 500 taka khoroj korchi" }
  ]
}
```

**Response:** Server-Sent Events (SSE) stream

---

## 🛡️ Security

- All database tables have Row Level Security (RLS)
- Users can only access their own data
- API keys stored as environment variables
- Supabase Auth for user management

---

## 📝 License

This project is built with Lovable.

---

## 🆘 Support

For issues or feature requests, use the Lovable editor chat.
