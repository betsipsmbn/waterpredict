## Module 1.1 - Create FASTAPI

Total time about 30 mins

Prompt:
```
Scaffold a monorepo project with backend and frontend directories.

* [ ] Clicking "Upload" triggers backend call and animates progress.
* [ ] Success toast shown; files/progress reset.
* [ ] Failure toast shown; UI re-enabled for retry.
* [ ] Duplicate submissions prevented during in-flight uploads.h backend and frontend directories.

Requirements:
- Backend should be a FastAPI service (latest version).
- Use "uv" as the dependency manager and package installer for Python.
- Include two endpoints:
  - GET /health → returns {"status": "ok"}
  - POST /upload → accepts a file upload (e.g., multipart/form-data) and returns filename + size.
- Place the FastAPI service inside the `backend` directory with proper project structure:
  - backend/
    - main.py
    - routes/
    - README.md
- Frontend directory can remain empty for now (placeholder).
- Add clear instructions in the README.md for installing dependencies with uv and running the FastAPI app.
- Use context7 to fetch the latest FastAPI documentation and best practices.
```