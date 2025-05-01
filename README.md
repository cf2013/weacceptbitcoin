# We Accept Bitcoin - Store Directory 

A directory of Bitcoin-accepting stores with verified reviews based on on-chain transactions.

## Features

- Store onboarding using Bitcoin transaction
    -Verify a store by sending the exact small amount to store owner address.
    -sign your review with LN.
    -sign your review with Nostr.

- Display verified stores in a store directory
    -Search box available to filter stores by different criteria
    -Display store details

- Verified customer reviews
    -Review and rate a verified store directly.
        rate and write your review, send exact number of sats.
    -As people consume and pay in a verified store transactions are monitored for rating and comments.
    -sign your review with LN.
    -sign your review with Nostr.

## Tech Stack

- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Backend: Python + FastAPI
- Database: Supabase (PostgreSQL)
- Authentication: LNURL-auth (Lightning Network authentication)
- Blockchain Access: Mempool.space API
- Additional Tools: QR Code generation, LNURL support

## Project Structure

```
weacceptbitcoin/
├── frontend/           # Next.js frontend application
├── backend/           # FastAPI backend server
├── docs/             # Documentation
└── README.md         # This file
```

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase account
- Bitcoin Core (optional, for local development)

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up Supabase:
   - Create a new project in Supabase
   - Run the schema.sql and supabase_setup.sql scripts
   - Copy the Supabase URL and anon key

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL
# - MEMPOOL_API_URL
# - DOMAIN
# - SECRET_KEY
# - CORS_ORIGINS
# - SUPABASE_URL
# - SUPABASE_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - API_HOST
# - API_PORT
# - BITCOIN_NETWORK
```

5. Run the development server:
```bash
uvicorn main:app --reload
```

6. Run tests:
```bash
pytest
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration:
# - NEXT_PUBLIC_BACKEND_URL
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

3. Run the development server:
```bash
npm run dev
```

4. Run linting:
```bash
npm run lint
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 