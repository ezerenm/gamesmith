# GameSmith — API Contract (v2)

Agreed Week 1. **Do not change casually.** If something has to change,
raise it in a check-in so frontend and backend change together.

Base URL in development: `http://localhost:8000`

JSON uses snake_case to match Python.

> **Changed in v2** — concept generation now runs against an existing
> project instead of standalone; scenes record which choice produced
> them; `Project` tracks the current scene.

---

## Data shapes

### Project

```json
{
  "id": 1,
  "original_idea": "a poor boy with a dream of becoming the king of pirates",
  "title": "Crown of the Endless Sea",
  "premise": "A ragged dockhand steals a dead captain's compass and...",
  "genre": "action adventure",
  "tone": "hopeful, swashbuckling",
  "setting": "a scattered archipelago ruled by rival pirate lords",
  "current_scene_id": 7,
  "created_at": "2026-11-16T10:30:00Z",
  "updated_at": "2026-11-16T10:30:00Z"
}
```

- A project is created with **only** `original_idea`. Everything from
  `title` through `setting` is `null` until the concept is generated.
  The frontend must handle a project with no concept yet.
- `current_scene_id` is the scene the user was last looking at, so
  reopening a project lands them where they left off. `null` until the
  opening scene exists.

### Character

```json
{
  "id": 4,
  "project_id": 1,
  "name": "Kael Vance",
  "role": "first mate",
  "traits": ["loyal", "hot-tempered", "superstitious"],
  "backstory": "Sold into a shipping crew at nine, Kael learned to..."
}
```

`traits` is an array of short strings.

### Scene

```json
{
  "id": 7,
  "project_id": 1,
  "parent_scene_id": 4,
  "from_choice_index": 0,
  "text": "The harbor bell rings twice. Kael grabs your sleeve and...",
  "choices": [
    { "index": 0, "text": "Board the ship before the bell stops" },
    { "index": 1, "text": "Follow the stranger into the alley" }
  ],
  "selected_choice": null,
  "created_at": "2026-11-16T10:42:00Z"
}
```

Three fields do the branching work, and it's worth being precise about
which answers what:

- **`parent_scene_id`** — the scene this one follows. `null` for the
  opening scene.
- **`from_choice_index`** — *which of the parent's choices produced
  this scene.* `null` for the opening scene. This is what makes the
  tree unambiguous: a parent with two children has one child with
  `from_choice_index: 0` and one with `1`.
- **`selected_choice`** — which choice the user most recently took
  *from this scene*. `null` if they haven't picked yet. This is UI
  state for restoring the view, **not** structure. If the user backs up
  and picks the other option, this changes; the children don't.

Exactly 2 choices per scene for now.

**Why both `selected_choice` and `from_choice_index`?** Because a user
can go back and explore the other branch. The parent then has two
children, but `selected_choice` can only remember one pick. Reading the
tree from `selected_choice` alone would silently lose a branch.

---

## Endpoints

### Projects

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `/projects` | `{ "original_idea": "..." }` | Project (concept fields null) |
| GET | `/projects` | — | `{ "projects": [Project, ...] }` |
| GET | `/projects/{id}` | — | full workspace (below) |
| PATCH | `/projects/{id}` | any editable Project fields | Project |

`POST /projects` does **no** AI work. It writes a row and returns
immediately, so the UI has a real project to show a spinner inside.

`GET /projects/{id}` returns the whole workspace in one call so the
frontend can restore a project without a waterfall of requests:

```json
{
  "project": { ...Project... },
  "characters": [ ...Character... ],
  "scenes": [ ...Scene... ]
}
```

`scenes` is every scene in the project, including abandoned branches,
ordered by `id`. The frontend builds the path it displays by walking
from `current_scene_id` back up through `parent_scene_id`.

### Generation

Every one of these **saves what it generates** before returning.

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `/projects/{id}/concept` | `{}` | Project (now filled in) |
| POST | `/projects/{id}/characters` | `{ "count": 3 }` | `{ "characters": [Character, ...] }` |
| POST | `/projects/{id}/scenes` | `{}` | Scene (the opening scene) |
| POST | `/scenes/{id}/continue` | `{ "choice_index": 0 }` | Scene (the new child) |

**`POST /projects/{id}/concept`** generates title, premise, genre, tone
and setting from the project's stored `original_idea`, writes them onto
the project, and returns the updated Project. Calling it again
regenerates and overwrites — that's the Regenerate button.

**`POST /projects/{id}/characters`** generates `count` characters using
the project's concept as context and appends them. It does not replace
existing characters.

**`POST /projects/{id}/scenes`** creates the opening scene:
`parent_scene_id: null`, `from_choice_index: null`. Also sets the
project's `current_scene_id`. Returns 400 if an opening scene already
exists.

**`POST /scenes/{id}/continue`** is the branching call. Given a scene
and a `choice_index`, the backend:

1. validates `choice_index` is 0 or 1 and exists on that scene
2. checks whether a child already exists with that
   `parent_scene_id` + `from_choice_index` — **if so, returns the
   existing child instead of generating a new one** (going back and
   forth down a path you already walked shouldn't cost an API call or
   rewrite the story)
3. otherwise generates a new scene with the project canon, the parent
   scene text, and the chosen option as context
4. sets the parent's `selected_choice` to `choice_index`
5. sets the project's `current_scene_id` to the new scene
6. returns the new scene

Step 2 matters more than it looks. Without it, clicking back and
re-picking produces a different story each time, which reads as a bug.

### Editing

| Method | Route | Body |
|---|---|---|
| PATCH | `/characters/{id}` | any editable Character fields |
| PATCH | `/scenes/{id}` | `{ "text": "..." }` |

Editing a scene's text does **not** regenerate its children. They may
now contradict the edit; that's the user's business.

---

## A worked example

```
POST /projects            {"original_idea": "pirate boy"}  → project 1, concept null
POST /projects/1/concept  {}                               → project 1, concept filled
POST /projects/1/characters {"count": 3}                   → characters 1,2,3
POST /projects/1/scenes   {}                               → scene 4 (parent null, from null)
POST /scenes/4/continue   {"choice_index": 0}              → scene 5 (parent 4, from 0)
POST /scenes/5/continue   {"choice_index": 1}              → scene 6 (parent 5, from 1)
```

User backs up to scene 4 and tries the other door:

```
POST /scenes/4/continue   {"choice_index": 1}              → scene 7 (parent 4, from 1)
```

Scene 4 now has two children. Its `selected_choice` is `1`. Scenes 5
and 6 still exist, untouched, on the abandoned branch.

Back to the first path:

```
POST /scenes/4/continue   {"choice_index": 0}              → scene 5 again, not generated
```

---

## Errors

Every failure returns the same shape, never a raw stack trace:

```json
{
  "error": "generation_failed",
  "message": "The AI service is busy. Please try again in a moment."
}
```

`message` is safe to show the user directly.

| Code | `error` value | When |
|---|---|---|
| 400 | `invalid_input` | Empty idea, bad choice index, opening scene already exists |
| 404 | `not_found` | No project/character/scene with that id |
| 409 | `concept_required` | Generating characters or scenes before a concept exists |
| 503 | `generation_failed` | Gemini unavailable after retries |
| 422 | `invalid_generation` | Model returned content we couldn't parse |

---

## Database sketch

Four tables. `choices` lives as a JSON column — we never query inside
it, and two rows per scene isn't worth a join.

```
projects
  id INTEGER PRIMARY KEY, original_idea TEXT NOT NULL,
  title TEXT, premise TEXT, genre TEXT, tone TEXT, setting TEXT,
  current_scene_id INTEGER, created_at TEXT, updated_at TEXT

characters
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL,
  name TEXT, role TEXT, traits TEXT (JSON array), backstory TEXT

scenes
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL,
  parent_scene_id INTEGER, from_choice_index INTEGER,
  text TEXT, choices TEXT (JSON array), selected_choice INTEGER,
  created_at TEXT
```

Index `scenes(parent_scene_id, from_choice_index)` — that's the lookup
behind step 2 of `/continue`.

---

## Mock data for frontend

Until the real endpoints exist, build against the examples above. They
are the real shapes — if the backend returns something different,
that's a backend bug, not a frontend change.
