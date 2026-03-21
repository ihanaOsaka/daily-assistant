"""FastAPI main application - Daily Assistant Web UI + Task Queue."""
from fastapi import FastAPI, Request, Depends, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
from datetime import datetime

from database import get_db, init_db
from models import TaskCreate, TaskResult, TaskResponse, LoginRequest
from auth import (
    hash_password, create_session, validate_session,
    delete_session, get_session_token, require_auth, PASSWORD_HASH,
)

app = FastAPI(title="Daily Assistant")

BASE_DIR = Path(__file__).parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


@app.on_event("startup")
def startup():
    init_db()


# ── Auth ──────────────────────────────────────────────

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    if not PASSWORD_HASH:
        return Response(status_code=302, headers={"Location": "/"})
    return templates.TemplateResponse("login.html", {"request": request})


@app.post("/api/auth/login")
async def login(body: LoginRequest, response: Response):
    if not PASSWORD_HASH:
        return {"ok": True}
    if hash_password(body.password) != PASSWORD_HASH:
        raise HTTPException(status_code=401, detail="Invalid password")
    token = create_session()
    response.set_cookie("session", token, httponly=True, samesite="lax", max_age=72*3600)
    return {"ok": True}


@app.post("/api/auth/logout")
async def logout(request: Request, response: Response):
    token = get_session_token(request)
    if token:
        delete_session(token)
    response.delete_cookie("session")
    return {"ok": True}


# ── Pages ─────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    if PASSWORD_HASH and not validate_session(get_session_token(request)):
        return Response(status_code=302, headers={"Location": "/login"})
    return templates.TemplateResponse("index.html", {"request": request})


# ── Task API ──────────────────────────────────────────

@app.get("/api/tasks")
async def list_tasks(
    request: Request,
    _=Depends(require_auth),
    status: str | None = None,
    limit: int = 50,
):
    db = get_db()
    try:
        query = "SELECT * FROM queue_tasks"
        params = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY priority DESC, created_at DESC LIMIT ?"
        params.append(limit)
        rows = db.execute(query, params).fetchall()
        tasks = [dict(r) for r in rows]
    finally:
        db.close()

    # If htmx request, return HTML partial
    if request.headers.get("HX-Request"):
        return templates.TemplateResponse(
            "_tasks.html", {"request": request, "tasks": tasks}
        )
    return tasks


@app.post("/api/tasks", status_code=201)
async def create_task(body: TaskCreate, _=Depends(require_auth)):
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO queue_tasks (command, category, priority) VALUES (?, ?, ?)",
            (body.command, body.category, body.priority),
        )
        db.commit()
        task_id = cursor.lastrowid
        row = db.execute("SELECT * FROM queue_tasks WHERE id = ?", (task_id,)).fetchone()
    finally:
        db.close()
    return dict(row)


@app.get("/api/tasks/poll")
async def poll_task():
    """Poller picks up the oldest pending task. No auth required (localhost only)."""
    db = get_db()
    try:
        row = db.execute(
            "SELECT * FROM queue_tasks WHERE status = 'pending' ORDER BY priority DESC, created_at ASC LIMIT 1"
        ).fetchone()
        if not row:
            return None
        db.execute(
            "UPDATE queue_tasks SET status = 'processing', started_at = datetime('now', 'localtime') WHERE id = ?",
            (row["id"],),
        )
        db.commit()
        return dict(row)
    finally:
        db.close()


@app.get("/api/tasks/{task_id}")
async def get_task(task_id: int, _=Depends(require_auth)):
    db = get_db()
    try:
        row = db.execute("SELECT * FROM queue_tasks WHERE id = ?", (task_id,)).fetchone()
    finally:
        db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    return dict(row)


@app.patch("/api/tasks/{task_id}/result")
async def update_result(task_id: int, body: TaskResult):
    """Poller reports execution result. No auth required (localhost only)."""
    if body.status not in ("completed", "failed"):
        raise HTTPException(status_code=400, detail="status must be completed or failed")
    db = get_db()
    try:
        db.execute(
            "UPDATE queue_tasks SET status = ?, result = ?, error = ?, completed_at = datetime('now', 'localtime') WHERE id = ?",
            (body.status, body.result, body.error, task_id),
        )
        db.commit()
    finally:
        db.close()
    return {"ok": True}


@app.delete("/api/tasks/{task_id}")
async def cancel_task(task_id: int, _=Depends(require_auth)):
    db = get_db()
    try:
        row = db.execute("SELECT status FROM queue_tasks WHERE id = ?", (task_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Task not found")
        if row["status"] != "pending":
            raise HTTPException(status_code=400, detail="Can only cancel pending tasks")
        db.execute("DELETE FROM queue_tasks WHERE id = ?", (task_id,))
        db.commit()
    finally:
        db.close()
    return {"ok": True}


@app.get("/api/status")
async def server_status(_=Depends(require_auth)):
    db = get_db()
    try:
        counts = {}
        for s in ("pending", "processing", "completed", "failed"):
            row = db.execute("SELECT COUNT(*) as c FROM queue_tasks WHERE status = ?", (s,)).fetchone()
            counts[s] = row["c"]
        last = db.execute(
            "SELECT completed_at FROM queue_tasks WHERE status IN ('completed','failed') ORDER BY completed_at DESC LIMIT 1"
        ).fetchone()
    finally:
        db.close()
    return {
        "status": "running",
        "counts": counts,
        "last_completed": last["completed_at"] if last else None,
        "server_time": datetime.now().isoformat(),
    }


# ── HTML Partials (htmx) ─────────────────────────────

@app.get("/partials/dashboard", response_class=HTMLResponse)
async def partial_dashboard(request: Request, _=Depends(require_auth)):
    db = get_db()
    try:
        recent = db.execute(
            "SELECT * FROM queue_tasks WHERE status IN ('completed','failed') ORDER BY completed_at DESC LIMIT 5"
        ).fetchall()
        pending_count = db.execute(
            "SELECT COUNT(*) as c FROM queue_tasks WHERE status = 'pending'"
        ).fetchone()["c"]
        processing = db.execute(
            "SELECT * FROM queue_tasks WHERE status = 'processing' ORDER BY started_at DESC LIMIT 1"
        ).fetchone()
    finally:
        db.close()
    return templates.TemplateResponse("_dashboard.html", {
        "request": request,
        "recent": [dict(r) for r in recent],
        "pending_count": pending_count,
        "processing": dict(processing) if processing else None,
    })


@app.get("/partials/queue", response_class=HTMLResponse)
async def partial_queue(request: Request, _=Depends(require_auth), status: str | None = None):
    db = get_db()
    try:
        query = "SELECT * FROM queue_tasks"
        params = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY created_at DESC LIMIT 50"
        tasks = [dict(r) for r in db.execute(query, params).fetchall()]
    finally:
        db.close()
    return templates.TemplateResponse("_queue.html", {"request": request, "tasks": tasks})
