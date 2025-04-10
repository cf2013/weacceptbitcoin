# We Accept Bitcoin - Store Directory

A directory of Bitcoin-accepting stores with verified reviews based on on-chain transactions.

## Features

- Store verification using Bitcoin transactions
- Verified customer reviews tied to Bitcoin payments
- Modern, responsive UI for store discovery
- Real-time transaction monitoring

## Tech Stack

- Frontend: Next.js + React
- Backend: Python + FastAPI
- Database: PostgreSQL (Supabase)
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

## API Documentation

Once the backend server is running, visit `/docs` for the interactive API documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 