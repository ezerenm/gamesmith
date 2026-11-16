# GameSmith — File Structure

Every file we know we need, who owns it, and which week it appears.
Scope is the MVP from the roadmap: concept → characters → scene →
choice → continue → save/reopen. No story tree, no code generation,
no embeddings.

Owners: **AI** = Ezeren · **BE** = backend owner · **FE** = frontend owner

---

## Repo root

```
gamesmith/
├── README.md             what this is, how to run it          BE   wk3
├── SETUP.md              dev setup (done)                     AI   ✓
├── API_CONTRACT.md       the data shapes (done)               AI   ✓
├── STRUCTURE.md          this file                            AI   ✓
├── .gitignore            (done)                               AI   ✓
├── backend/
└── frontend/
```

`README.md` matters more than it sounds — the Week 3 acceptance test
is "a teammate who didn't build it can follow the README and run it."
Write it as you go, not the night before.

---

## backend/

```
backend/
├── .env                  API key — gitignored, never committed
├── .env.example          GEMINI_API_KEY=your_key_here          BE   wk1
├── requirements.txt      pinned deps so we all match           BE   wk1
├── venv/                 gitignored
│
├── main.py               FastAPI app, CORS, mounts routers     BE   wk1
├── config.py             reads .env, model name, settings      AI   wk1
├── database.py           SQLite connection + createTables()    BE   wk1
├── models.py             Pydantic request/response shapes      BE   wk1
├── errors.py             the {error, message} shape + handlers BE   wk1
├── crud.py               every DB read/write lives here        BE   wk1
│
├── geminiService.py      client + retry loop + JSON validation AI   wk1
├── prompts.py            prompt text + Gemini response schemas AI   wk1
├── contextBuilder.py     assembles project canon for a prompt  AI   wk2
│
├── routers/
│   ├── projects.py       /projects CRUD                        BE   wk1
│   └── generate.py       /generate/* and /projects/{id}/*      BE   wk1-2
│
├── testCall.py           scratch file — keep, it's our smoke test
│
└── evaluation/
    ├── testIdeas.json    20–30 game ideas, fixed early         AI   wk1
    ├── runEval.py        runs the set, logs results            AI   wk2
    └── results/          generated output, gitignored
```

### What each one actually holds

**`config.py`** — one place for the model name. When Google retires a
model (it already happened once), we change one line, not six.

**`models.py`** — Pydantic classes matching API_CONTRACT.md exactly:
`ProjectResponse`, `CharacterResponse`, `SceneResponse`, `ChoiceItem`,
plus request bodies like `CreateProjectRequest`. FastAPI validates
against these automatically, which is half our "invalid output"
protection for free.

**`crud.py`** — `createProject`, `getProject`, `listProjects`,
`updateProject`, `saveCharacters`, `saveScene`, `getProjectCanon`.
Routers never write SQL directly; they call these. Keeps the routers
readable and means DB changes touch one file.

**`geminiService.py`** — the retry loop you already wrote, plus
`generateJson(prompt, responseSchema)` that returns a validated dict
or raises. Every generation route goes through this one function.

**`prompts.py`** — prompt strings as functions (`conceptPrompt(idea)`,
`charactersPrompt(concept, count)`, `scenePrompt(canon)`,
`continuePrompt(canon, previousScene, choice)`) plus the JSON schema
dicts we hand Gemini. Having them in one file makes the Week 2 prompt
iteration much less painful.

**`contextBuilder.py`** — the consistency feature. Takes a project id,
returns a compact text block of established canon (premise, character
names and roles, settings, last scene). Week 2's whole "AI doesn't
contradict itself" claim lives here.

**`errors.py`** — maps exceptions to the contract's error shape. A
`ServerError` from Gemini becomes a 503 `generation_failed` with a
friendly message, never a stack trace in the UI.

---

## frontend/

Created by `npm create vite@latest frontend -- --template react`.

```
frontend/
├── package.json
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx          entry point (Vite makes this)
    ├── App.jsx           routes: list / landing / workspace    FE   wk1
    │
    ├── api/
    │   ├── client.js     fetch wrappers, one per endpoint      FE   wk1
    │   └── mockData.js   the examples from API_CONTRACT.md     FE   wk1
    │
    ├── pages/
    │   ├── LandingPage.jsx     idea input + Generate           FE   wk1
    │   ├── ProjectListPage.jsx saved projects                  FE   wk1
    │   └── WorkspacePage.jsx   the main screen                 FE   wk1-2
    │
    ├── components/
    │   ├── TopBar.jsx          logo, title, save state         FE   wk1
    │   ├── IdeaForm.jsx        textarea + submit               FE   wk1
    │   ├── ConceptPanel.jsx    premise/genre/tone/setting      FE   wk1
    │   ├── CharacterCard.jsx   one character                   FE   wk2
    │   ├── CharacterList.jsx   the row of them + Generate      FE   wk2
    │   ├── SceneView.jsx       scene text                      FE   wk2
    │   ├── ChoiceButtons.jsx   the two options                 FE   wk2
    │   ├── SceneHistory.jsx    the path so far                 FE   wk2
    │   ├── EditableText.jsx    click to edit, save on blur     FE   wk2
    │   ├── LoadingState.jsx    shown during generation         FE   wk1
    │   └── ErrorMessage.jsx    renders the error shape         FE   wk1
    │
    ├── hooks/
    │   └── useProject.js  loads a project, exposes refresh     FE   wk2
    │
    └── styles/
        ├── theme.css      color + font tokens from the mockup  FE   wk1
        └── global.css     resets, base type                    FE   wk1
```

### Two notes on the frontend

**`mockData.js` is the unblocking file.** Build every component against
it in Week 1. Swapping to real data later means changing `client.js`,
not the components.

**`theme.css` holds the aesthetic as variables** (`--bg`, `--panel`,
`--border`, `--accent`, `--text`, `--muted`). Components reference the
variables. If we change our minds about the look, we change one file.

---

## Build order

**Week 1 — the spine**
Backend: `main.py`, `config.py`, `database.py`, `models.py`,
`errors.py`, `crud.py`, `routers/projects.py`
AI: `geminiService.py`, `prompts.py` (concept only), `testIdeas.json`
Frontend: `App.jsx`, `client.js`, `mockData.js`, `LandingPage.jsx`,
`ConceptPanel.jsx`, `theme.css`, loading + error states

Acceptance: submit an idea → structured concept → save → reload → same
content. No hardcoded AI response left in the flow.

**Week 2 — the content**
Backend: `routers/generate.py` characters + scenes, PATCH routes
AI: `prompts.py` characters/scene/continue, `contextBuilder.py`,
`runEval.py`
Frontend: character components, `SceneView`, `ChoiceButtons`,
`EditableText`, `useProject.js`

Acceptance: concept → characters → scene → pick → continue → reopen,
with canon intact.

**Week 3 — make it hold up**
`README.md`, `.env.example`, bug fixes, eval results, slides.
Feature freeze Friday.

---

## Conventions

- **camelCase** for functions and variables, in both languages. Python
  normally uses snake_case — we're going against that deliberately, so
  be consistent or it looks like an accident.
- **snake_case in JSON**, because that's what API_CONTRACT.md says.
- **No SQL outside `crud.py`.**
- **No Gemini calls outside `geminiService.py`.**
- **Every new file gets its own small commit** with a message saying
  what it does.
