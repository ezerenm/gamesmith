# Backend Milestone 1

Requires Python 3.12 or newer. Run these PowerShell commands from the repository root:

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
# Optional: create local settings without overwriting an existing .env.
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload
```

CRUD does not need a Gemini key. `google-genai` and `python-dotenv` remain installed
for the existing `testCall.py` smoke test. The application never imports or runs it.
Do not commit `.env` or real API keys.

On macOS/Linux, replace `backend/.venv/Scripts/python.exe` with
`backend/.venv/bin/python`. The application imports use the `backend` package;
start Uvicorn from the repository root as shown above.

The default SQLite file is `backend/gamesmith.db`, independent of the current
directory. Override `GAMESMITH_DB_PATH` in `backend/.env` or the environment;
relative paths are resolved inside `backend/`. Its parent directory must exist.
Startup creates missing tables; it does not clear existing data. SQLite foreign
keys are enabled per connection. Schema migrations are outside this milestone.

Available endpoints:

| Endpoint | Result |
| --- | --- |
| `GET /health` | `{"status": "ok"}` |
| `POST /projects` | HTTP 201, flat Project with null concept fields |
| `GET /projects` | `{"projects": [...]}`, ordered by ID |
| `GET /projects/{id}` | `{"project": {...}, "characters": [], "scenes": []}` |
| `GET /docs` | Interactive API documentation |

Example:

```powershell
Invoke-RestMethod http://localhost:8000/projects -Method Post -ContentType application/json -Body '{"original_idea":"A dark fantasy RPG where magic costs memories."}'
Invoke-RestMethod http://localhost:8000/projects
Invoke-RestMethod http://localhost:8000/projects/1
```

Only `original_idea` is accepted on creation. It must be a nonblank string and is
saved unchanged, including user whitespace. Extra fields are rejected. Timestamps
are serialized in UTC. No AI request occurs during project creation.

API Contract v2 is authoritative. Invalid or malformed requests return HTTP 400
with `{"error":"invalid_input","message":"Please enter a game idea."}`;
invalid path IDs also return 400 with an appropriate message. Missing projects
return HTTP 404 with `{"error":"not_found","message":"Project not found."}`.
Unexpected server failures use a generic HTTP 500 `internal_error` response;
details remain in server logs. CORS allows the two Vite localhost origins only.

V2 does not specify the POST success code, health payload, or unexpected-error
code; this milestone uses 201, `{"status":"ok"}`, and 500 `internal_error`.
The roadmap's older concept-JSON storage and `/generate/concept` suggestions are
superseded by v2's flat fields and `/projects/{id}/concept`. No generation routes,
PATCH/deletion routes, character/scene tables, or frontend integration are added.

## Tests

```powershell
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements-dev.txt
backend/.venv/Scripts/python.exe -m pytest backend/tests -q
```

Tests use isolated temporary SQLite files and verify persistence across separate
Python processes. They do not write to the development database or call Gemini.
