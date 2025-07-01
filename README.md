# KitchenMate 🍳

A smart kitchen management system that helps restaurants optimize their operations using AI.

---

## 🚀 Demo

https://github.com/user-attachments/assets/2acdb22b-4c35-4356-b546-ea8d01f624a6

---

## What is KitchenMate?

KitchenMate is a modern web application that helps restaurant owners and kitchen managers make better decisions using artificial intelligence. It provides tools for menu optimization, cost management, and ingredient tracking.

## Key Features

### 1. Menu Optimization 🍽️
- Create and manage restaurant menus
- Get AI-powered suggestions for menu improvements
- Optimize dish combinations for better profitability

### 2. Daily Specials ✨
- AI-recommended special dishes based on:
  - Current inventory
  - Seasonal ingredients
  - Customer preferences

### 3. Cost Optimization 💰
- Track ingredient costs
- Analyze supplier prices
- Optimize portion sizes
- Find ways to reduce waste

### 4. Ingredient Scanner 📸
- Scan ingredients using your camera
- Get instant information about freshness
- Track inventory automatically

### 5. Demand Analysis 📊
- Analyze ingredient consumption patterns
- Predict future demand
- Reduce food waste

## Tech Stack

### Frontend
- Next.js (React framework)
- TypeScript
- Tailwind CSS
- Shadcn UI components

### Backend
- Python
- FastAPI
- MongoDB
- AI/ML models for predictions

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/KitchenMate.git
cd KitchenMate
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd ../server
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Create .env files in both client and server directories
# Add necessary environment variables
```

5. Start the development servers:
```bash
# Terminal 1 - Frontend
cd client
npm run dev

# Terminal 2 - Backend
cd server
python app.py
```

## Project Structure

```
KitchenMate/
├── client/                 # Frontend application
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable UI components
│   └── hooks/             # Custom React hooks
│
└── server/                # Backend application
    ├── api/               # API endpoints
    ├── models/            # Database models
    ├── services/          # Business logic
    └── utils/             # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
- Open an issue
- Contact the development team
- Check our documentation

## Acknowledgments

- Thanks to all contributors
- Special thanks to our AI/ML team
- Inspired by modern kitchen management needs

---

Made with ❤️ by the KitchenMate Team
