# Water Quality Prediction Backend

A FastAPI service for IoT water quality prediction with file upload capabilities.

## Features

- **Health Check**: GET `/health` endpoint for service monitoring
- **File Upload**: POST `/upload` endpoint for multipart/form-data file uploads
- **ML Prediction**: POST `/predict` endpoint for water quality predictions
- **Model Training**: POST `/train` endpoint for retraining the ML model
- **CORS Support**: Cross-origin requests enabled for frontend integration

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── routes/              # Route modules
│   ├── __init__.py
│   ├── health.py        # Health check endpoint
│   └── upload.py        # File upload endpoint
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Prerequisites

- Python 3.8 or higher
- [uv](https://github.com/astral-sh/uv) package manager

### Install uv

If you don't have uv installed, install it using:

**Windows (PowerShell):**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Installation

1. **Navigate to the backend directory:**
   ```powershell
   cd backend
   ```

2. **Create a virtual environment and install dependencies:**
   ```powershell
   uv venv
   uv pip install -r requirements.txt
   ```

3. **Activate the virtual environment:**
   
   **Windows:**
   ```powershell
   .venv\Scripts\Activate.ps1
   ```
   
   **macOS/Linux:**
   ```bash
   source .venv/bin/activate
   ```

## Running the Application

1. **Start the FastAPI server:**
   ```powershell
   uv run uvicorn main:main --reload --host 0.0.0.0 --port 8000
   ```

   Or with the virtual environment activated:
   ```powershell
   uvicorn main:main --reload --host 0.0.0.0 --port 8000
   ```

2. **The API will be available at:**
   - Main API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Health Check
- **GET** `/health`
- Returns: `{"status": "ok"}`

### File Upload
- **POST** `/upload`
- Content-Type: `multipart/form-data`
- Body: File upload
- Returns: `{"message": "File uploaded successfully", "filename": "...", "size": ..., "content_type": "..."}`

### Water Quality Prediction (Existing)
- **POST** `/predict`
- Body: `{"ph": float, "tds": float, "temperature": float}`
- Returns: `{"prediction": int}`

### Model Training (Existing)
- **POST** `/train`
- Returns: `{"message": "Training completed", "accuracy": float}`

## Development

### Adding Dependencies

Add new dependencies using uv:
```powershell
uv add package-name
```

### Running Tests

```powershell
uv run pytest
```

### Code Formatting

```powershell
uv run black .
uv run isort .
```

## Database Configuration

The application connects to an Oracle database for training data. Update the connection parameters in `main.py`:

```python
dsn = cx_Oracle.makedsn("localhost", 1521, service_name="ORCLPDB1")
conn = cx_Oracle.connect("user", "password", dsn)
```

## Environment Variables

Create a `.env` file for environment-specific configurations:

```env
DATABASE_HOST=localhost
DATABASE_PORT=1521
DATABASE_SERVICE=ORCLPDB1
DATABASE_USER=user
DATABASE_PASSWORD=password
```

## Production Deployment

For production deployment, consider:

1. **Use a production ASGI server:**
   ```powershell
   uv run gunicorn main:main -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Set environment to production:**
   ```powershell
   $env:ENVIRONMENT="production"
   ```

3. **Configure proper CORS origins** (update `main.py`)

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure you're in the backend directory and the virtual environment is activated
2. **Database connection**: Verify Oracle database is running and credentials are correct
3. **Port conflicts**: Use a different port with `--port 8001`

### Logs

The FastAPI server provides detailed logs. Use `--log-level debug` for more verbose output:

```powershell
uv run uvicorn main:main --reload --log-level debug
```

## Contributing

1. Follow PEP 8 style guidelines
2. Add docstrings to all functions
3. Update this README when adding new features
4. Test all endpoints before committing