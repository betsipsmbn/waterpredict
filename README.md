# IoT Water Quality Monitoring System

A comprehensive full-stack application for real-time water quality monitoring, prediction, and management using IoT sensors. The system features machine learning-based water quality prediction, real-time sensor data collection, user management, and intelligent alerting.

## 🚀 Features

- **Real-time Sensor Monitoring**: Live data collection from IoT water quality sensors
- **Machine Learning Predictions**: AI-powered water quality assessment and forecasting
- **User Management System**: Multi-role user authentication and management
- **Interactive Dashboard**: Real-time visualization of sensor data and analytics
- **Alert System**: Automated notifications for water quality issues
- **Data Analytics**: Comprehensive sensor data analysis and reporting
- **Antares IoT Integration**: Direct integration with Antares IoT platform
- **Export Capabilities**: Data export functionality for reporting

## 🏗️ Project Structure

```
Water_Pred/
├── backend/                    # FastAPI backend server
│   ├── main.py                # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── database.py           # Database configuration
│   ├── models.py             # Pydantic data models
│   ├── routes/               # API route handlers
│   │   ├── antares.py        # Antares IoT integration
│   │   ├── datasensor.py     # Sensor data management
│   │   ├── health.py         # Health check endpoints
│   │   ├── manageuser.py     # User management
│   │   ├── ml.py             # Machine learning endpoints
│   │   └── upload.py         # File upload handling
│   └── ml/                   # Machine learning services
│       ├── antares_client.py # Antares API client
│       ├── db_client.py      # Database client
│       ├── scheduler.py      # ML training scheduler
│       ├── scheduler_antares.py # Antares data polling
│       └── training_service.py # ML model training
├── frontend/                 # React frontend application
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite build configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── src/
│   │   ├── App.jsx          # Main application component
│   │   ├── components/      # React components
│   │   │   ├── MainDashboard.jsx    # Main dashboard view
│   │   │   ├── SensorAnalytics.jsx  # Sensor analytics
│   │   │   ├── UserManagement.jsx   # User management interface
│   │   │   ├── LoginPage.jsx        # Authentication
│   │   │   ├── SettingsPage.jsx     # System settings
│   │   │   ├── AlertsSection.jsx    # Alert management
│   │   │   └── ...                  # Other components
│   │   ├── context/         # React context providers
│   │   └── utils/           # Utility functions
│   └── public/             # Static assets
├── .gitignore              # Git ignore rules
└── README.md              # This file
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **Pydantic**: Data validation and parsing
- **SQLAlchemy/cx-Oracle**: Database ORM and Oracle integration
- **scikit-learn**: Machine learning algorithms
- **NumPy/Pandas**: Data processing and analysis
- **APScheduler**: Background task scheduling
- **MQTT**: IoT device communication

### Frontend
- **React 19**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: React charting library
- **Lucide React**: Icon library

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- Oracle Database (for data storage)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (create `.env` file):
   ```env
   # Database Configuration
   DATABASE_URL=your_oracle_database_url
   
   # Antares IoT Platform
   ANTARES_ACCESS_KEY=your_antares_access_key
   ANTARES_PROJECT=your_project_name
   ANTARES_DEVICE=your_device_name
   
   # API Configuration
   SECRET_KEY=your_secret_key
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Access Points

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API Explorer**: http://localhost:8000/redoc

## 📊 API Endpoints

### Health & Status
- `GET /health` - System health check

### User Management
- `POST /users/register` - User registration
- `POST /users/login` - User authentication
- `GET /users/profile` - User profile information

### Sensor Data
- `GET /sensors/data` - Retrieve sensor readings
- `POST /sensors/upload` - Upload sensor data
- `GET /sensors/analytics` - Sensor data analytics

### Machine Learning
- `POST /ml/train` - Train water quality prediction model
- `POST /ml/predict` - Get water quality predictions

### Antares IoT
- `GET /antares/data` - Fetch data from Antares platform
- `POST /antares/sync` - Synchronize with Antares devices

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL=oracle://username:password@host:port/service_name

# Antares IoT Platform
ANTARES_ACCESS_KEY=your_access_key
ANTARES_PROJECT=your_project_name
ANTARES_DEVICE=your_device_name

# Security
SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Machine Learning
MODEL_UPDATE_INTERVAL=3600  # seconds
PREDICTION_THRESHOLD=0.8
```

## 📱 Usage

1. **Login**: Access the application through the web interface and log in with your credentials
2. **Dashboard**: View real-time sensor data, alerts, and system status
3. **Analytics**: Explore historical data trends and patterns
4. **Predictions**: Get AI-powered water quality predictions
5. **User Management**: Manage system users and permissions (admin only)
6. **Settings**: Configure system parameters and preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for water quality monitoring applications. Please ensure compliance with local regulations and data privacy requirements.

## 🆘 Support

For technical support or questions:
- Check the API documentation at `/docs`
- Review the codebase and comments
- Create an issue for bugs or feature requests