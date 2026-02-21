"""
Leo Command Center — FastAPI server.

Push-based architecture: OpenClaw agent pushes data to the API.
Server stores it and broadcasts via WebSocket. No local file access needed.

Auth: write endpoints require  Authorization: Bearer <API_TOKEN>
"""

import json
import os
import time as _time
from pathlib import Path
from typing import Any, Optional

import psutil
from fastapi import Depends, FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ─── Config ───────────────────────────────────────────────────────────────────

DATA_DIR = Path(os.environ.get("DATA_DIR", "/app/data"))
STATIC_DIR = Path(os.environ.get("STATIC_DIR", "/app/static"))
API_TOKEN = os.environ.get("API_TOKEN", "")

DATA_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Leo Command Center", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Auth ─────────────────────────────────────────────────────────────────────

def require_token(authorization: str = Header(default="")) -> None:
    """Dependency: require valid Bearer token on write endpoints."""
    if not API_TOKEN:
        return  # No token configured → open (dev mode)
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ─── Canvas System ─────────────────────────────────────────────────────────────

_canvas_surfaces: dict[str, dict[str, Any]] = {}
_canvas_clients: set[WebSocket] = set()
_canvas_callbacks: list[dict[str, Any]] = []
_CANVAS_FILE = DATA_DIR / "canvas-surfaces.json"


def _load_canvas() -> None:
    global _canvas_surfaces
    try:
        with open(_CANVAS_FILE) as f:
            _canvas_surfaces = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        _canvas_surfaces = {}


def _save_canvas() -> None:
    with open(_CANVAS_FILE, "w") as f:
        json.dump(_canvas_surfaces, f, indent=2)


_load_canvas()


class CanvasRenderRequest(BaseModel):
    id: str
    component: str
    props: dict[str, Any] = {}
    callbackUrl: Optional[str] = None


class CanvasCallbackRequest(BaseModel):
    surfaceId: str
    action: str
    data: dict[str, Any] = {}


async def _canvas_broadcast(message: dict[str, Any]) -> None:
    payload = json.dumps(message)
    dead: list[WebSocket] = []
    for ws in _canvas_clients:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _canvas_clients.discard(ws)


@app.websocket("/ws/canvas")
async def canvas_ws(ws: WebSocket) -> None:
    await ws.accept()
    _canvas_clients.add(ws)
    try:
        await ws.send_text(json.dumps({
            "type": "init",
            "surfaces": list(_canvas_surfaces.values()),
        }))
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        _canvas_clients.discard(ws)


@app.get("/api/canvas")
def list_canvas_surfaces() -> list[dict[str, Any]]:
    return list(_canvas_surfaces.values())


@app.post("/api/canvas/render")
async def render_canvas_surface(
    req: CanvasRenderRequest,
    _auth: None = Depends(require_token),
) -> dict[str, Any]:
    surface: dict[str, Any] = {
        "id": req.id,
        "component": req.component,
        "props": req.props,
        "callbackUrl": req.callbackUrl,
        "updatedAt": _time.strftime("%Y-%m-%dT%H:%M:%SZ", _time.gmtime()),
    }
    _canvas_surfaces[req.id] = surface
    _save_canvas()
    await _canvas_broadcast({"type": "render", "surface": surface})
    return {"ok": True, "id": req.id}


@app.delete("/api/canvas/{surface_id}")
async def delete_canvas_surface(
    surface_id: str,
    _auth: None = Depends(require_token),
) -> dict[str, Any]:
    removed = _canvas_surfaces.pop(surface_id, None)
    if removed is None:
        return {"error": "Not found"}
    _save_canvas()
    await _canvas_broadcast({"type": "delete", "id": surface_id})
    return {"ok": True, "id": surface_id}


@app.post("/api/canvas/callback")
async def canvas_callback(req: CanvasCallbackRequest) -> dict[str, Any]:
    """Browser-fired callbacks — no auth required (browser has no token)."""
    entry = {
        "surfaceId": req.surfaceId,
        "action": req.action,
        "data": req.data,
        "time": _time.strftime("%Y-%m-%dT%H:%M:%SZ", _time.gmtime()),
    }
    _canvas_callbacks.append(entry)
    if len(_canvas_callbacks) > 100:
        del _canvas_callbacks[: len(_canvas_callbacks) - 100]
    return {"ok": True}


@app.get("/api/canvas/callbacks")
def list_canvas_callbacks() -> list[dict[str, Any]]:
    return _canvas_callbacks[-20:]


# ─── System Stats (container self-reporting) ──────────────────────────────────

@app.get("/api/stats")
def get_stats() -> dict[str, Any]:
    """Reports container's own CPU/RAM — always available."""
    cpu = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory()
    return {
        "cpu": round(cpu),
        "memUsed": mem.used,
        "memTotal": mem.total,
    }


@app.get("/api/disk")
def get_disk() -> dict[str, Any]:
    disk = psutil.disk_usage("/")
    return {"total": disk.total, "used": disk.used}


# ─── Push-Based Leo Data ───────────────────────────────────────────────────────
# Agent pushes status; server caches and returns on GET.
# No ~/.openclaw access needed.

def _read_store(name: str, default: Any) -> Any:
    path = DATA_DIR / f"{name}.json"
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def _write_store(name: str, data: Any) -> None:
    path = DATA_DIR / f"{name}.json"
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# — Leo agent status —

@app.get("/api/leo/status")
def leo_status_get() -> dict[str, Any]:
    return _read_store("leo-status", {
        "gatewayRunning": None,
        "currentModel": None,
        "activeSession": None,
        "sessionUpdatedAt": None,
        "pushedAt": None,
    })


@app.post("/api/leo/status")
def leo_status_push(
    payload: dict[str, Any],
    _auth: None = Depends(require_token),
) -> dict[str, Any]:
    payload["pushedAt"] = _time.strftime("%Y-%m-%dT%H:%M:%SZ", _time.gmtime())
    _write_store("leo-status", payload)
    return {"ok": True}


# — Ollama model info —

@app.get("/api/leo/ollama")
def leo_ollama_get() -> dict[str, Any]:
    return _read_store("leo-ollama", {"loaded": False, "pushedAt": None})


@app.post("/api/leo/ollama")
def leo_ollama_push(
    payload: dict[str, Any],
    _auth: None = Depends(require_token),
) -> dict[str, Any]:
    payload["pushedAt"] = _time.strftime("%Y-%m-%dT%H:%M:%SZ", _time.gmtime())
    _write_store("leo-ollama", payload)
    return {"ok": True}


# — Gateway logs —

@app.get("/api/leo/logs")
def leo_logs_get() -> list[dict[str, Any]]:
    return _read_store("leo-logs", [])


@app.post("/api/leo/logs")
def leo_logs_push(
    payload: list[dict[str, Any]],
    _auth: None = Depends(require_token),
) -> dict[str, Any]:
    _write_store("leo-logs", payload[-50:])  # keep last 50 entries
    return {"ok": True}


# — Cost tracking —

@app.get("/api/leo/cost")
def leo_cost_get() -> dict[str, Any]:
    return _read_store("cost", {
        "daily": 0.0,
        "monthly": 0.0,
        "dailyLimit": 5.0,
        "monthlyLimit": 200.0,
        "updatedAt": None,
    })


class CostUpdateRequest(BaseModel):
    daily: float
    monthly: float


@app.post("/api/leo/cost")
def leo_cost_push(
    req: CostUpdateRequest,
    _auth: None = Depends(require_token),
) -> dict[str, Any]:
    data = leo_cost_get()
    data["daily"] = req.daily
    data["monthly"] = req.monthly
    data["updatedAt"] = _time.strftime("%Y-%m-%dT%H:%M:%SZ", _time.gmtime())
    _write_store("cost", data)
    return {"ok": True}


# — Cron jobs —

@app.get("/api/cronjobs")
def get_cronjobs() -> dict[str, Any]:
    return _read_store("cronjobs", {"jobs": []})


@app.post("/api/cronjobs")
def push_cronjobs(
    payload: dict[str, Any],
    _auth: None = Depends(require_token),
) -> dict[str, Any]:
    _write_store("cronjobs", payload)
    return {"ok": True}


# ─── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "surfaces": len(_canvas_surfaces)}


# ─── Static Files (React App) ─────────────────────────────────────────────────

if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
