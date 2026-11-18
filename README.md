# StudyFlow | Student Task Manager

Mini Project: Full-stack REST API with Node.js, Express.js, HTML, CSS, JavaScript.

## Features
- Create, read, update, delete student tasks (CRUD)
- Filter tasks by `done=true` or `done=false`
- Edit task details and toggle completion without reloading the page
- JSON file persistence (`server/tasks.json`)
- Server-side validation and HTTP error handling
- Responsive Thai-language UI; no external data API

## Requirements
Node.js 18+ and npm.

## Install and run
```bash
npm install
npm run dev
```
Open **http://localhost:3000**. To stop, press `Ctrl+C`.

## Automated API tests
```bash
npm test
```

## REST API
| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/tasks` | Get all tasks | 200 | 500 |
| GET | `/api/tasks?done=true` | Filter by completed status (also `false`) | 200 | 400 invalid filter |
| GET | `/api/tasks/:id` | Get one task | 200 | 404 |
| POST | `/api/tasks` | Create task | 201 | 400 invalid input |
| PATCH | `/api/tasks/:id` | Update task | 200 | 400, 404 |
| DELETE | `/api/tasks/:id` | Delete task | 204 no body | 404 |

### JSON body for POST
```json
{"title":"ทำรายงาน","subject":"Web Programming","dueDate":"2026-12-01","done":false}
```
`title`, `subject`, `dueDate` are required. `done` is optional (default `false`). Date format: `YYYY-MM-DD`. PATCH accepts one or more of these fields.

### Test with curl
```bash
curl http://localhost:3000/api/tasks
curl -i -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"ทำรายงาน","subject":"Web Programming","dueDate":"2026-12-01"}'
curl -i http://localhost:3000/api/tasks/not-found
```

## Project structure
```text
studyflow/
├── public/           # HTML CSS JavaScript client
├── server/           # Express REST API and tasks.json
├── tests/            # Automated API test
├── screenshots/      # Debugging and UI evidence
├── report.pdf        # API design and project report
├── package.json
└── README.md
```

## Debugging evidence (add real screenshots before submission)
**Debugging screenshot 1: Browser DevTools → Network**. Open the app, create a task, select the `POST /api/tasks` request, and capture its **201** status. Save as `screenshots/debug-network.png`.

![Network debugging evidence - replace with real capture](screenshots/debug-network.png)

**Debugging screenshot 2: Terminal / API tests**. Run `npm test`, capture the terminal showing tests passed, and save as `screenshots/debug-tests.png`.

![Terminal debugging evidence - replace with real capture](screenshots/debug-tests.png)

> The two files above must be actual screenshots captured on your computer before submitting. They are intentionally not fabricated.

## GitHub submission
Create one public or private repository as instructed by your teacher, upload this project (do not upload `node_modules`), and submit the repository URL in Microsoft Teams. No hosting required.


## Debugging Evidence

### 1. GET /api/tasks — 200 OK
![GET API Debugging](screenshots/debug-get.png)

### 2. POST /api/tasks — 201 Created
![POST API Debugging](screenshots/debug-post.png)