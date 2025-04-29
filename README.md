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

- Frontend: Next.js + React
- Backend: Python + FastAPI
- Database: PostgreSQL
- Blockchain Access: Mempool.space API

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
- PostgreSQL
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

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server:
```bash
uvicorn main:app --reload
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
# Edit .env.local with your configuration
```

3. Run the development server:
```bash
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 