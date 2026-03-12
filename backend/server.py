from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from supabase import create_client
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import secrets
import re
import asyncio
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Supabase
SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_KEY']
SUPABASE_SERVICE_ROLE_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Resend
resend.api_key = os.environ['RESEND_API_KEY']
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Create the main app
app = FastAPI(title="CloseLoop API", version="2.0.0")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
calls_router = APIRouter(prefix="/calls", tags=["Calls"])
vault_router = APIRouter(prefix="/vault", tags=["Data Vault"])
admin_router = APIRouter(prefix="/admin", tags=["Admin"])
user_router = APIRouter(prefix="/user", tags=["User"])
tasks_router = APIRouter(prefix="/tasks", tags=["Tasks"])
platform_router = APIRouter(prefix="/platform", tags=["Platform"])

security = HTTPBearer()

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    workspace_id: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class CallCreate(BaseModel):
    title: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_company: Optional[str] = None
    contact_role: Optional[str] = None
    duration_seconds: Optional[int] = None
    transcript_text: Optional[str] = None

class CallUpdate(BaseModel):
    title: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_company: Optional[str] = None

class CallResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    workspace_id: str
    user_id: str
    title: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_company: Optional[str] = None
    contact_role: Optional[str] = None
    status: str
    duration_seconds: Optional[int] = None
    created_at: str
    processed_at: Optional[str] = None

class TranscriptSegment(BaseModel):
    speaker: str
    timestamp: str
    text: str

class KeyMoment(BaseModel):
    timestamp: str
    type: str
    text: str
    confidence: str

class TaskItem(BaseModel):
    id: str
    text: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "medium"
    completed: bool = False
    source_timestamp: Optional[str] = None

class CRMNote(BaseModel):
    point: str
    category: str

class AIOutput(BaseModel):
    email_draft: Optional[Dict[str, Any]] = None
    documents: Optional[List[Dict[str, Any]]] = None
    crm_updates: Optional[Dict[str, Any]] = None
    crm_notes: Optional[List[CRMNote]] = None
    tasks: Optional[List[TaskItem]] = None
    key_moments: Optional[List[KeyMoment]] = None
    summary: Optional[str] = None

class CallDetailResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    workspace_id: str
    user_id: str
    title: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_company: Optional[str] = None
    contact_role: Optional[str] = None
    status: str
    duration_seconds: Optional[int] = None
    created_at: str
    processed_at: Optional[str] = None
    transcript: Optional[List[TranscriptSegment]] = None
    ai_outputs: Optional[AIOutput] = None
    approvals: Optional[Dict[str, Any]] = None

class ApprovalRequest(BaseModel):
    item_type: str
    approved: bool
    edited_content: Optional[Dict[str, Any]] = None

class DocumentCreate(BaseModel):
    filename: str
    tags: List[str] = []
    intent_triggers: List[str] = []
    file_url: Optional[str] = None
    content_preview: Optional[str] = None

class DocumentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    workspace_id: str
    filename: str
    tags: List[str]
    intent_triggers: List[str]
    enabled: bool
    file_url: Optional[str] = None
    content_preview: Optional[str] = None
    uploaded_at: str
    uploaded_by: str

class TeamMemberInvite(BaseModel):
    email: EmailStr
    role: str = "rep"

class TeamMemberResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    status: str
    joined_at: Optional[str] = None

class WorkspaceSettings(BaseModel):
    company_name: Optional[str] = None
    logo_url: Optional[str] = None

class DemoRequest(BaseModel):
    full_name: str
    work_email: EmailStr
    company_name: str
    company_size: str
    role: str
    crm_used: str
    message: Optional[str] = None

class TaskUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None

class CreateWorkspaceRequest(BaseModel):
    company_name: str
    admin_email: EmailStr
    admin_name: str
    admin_password: str

class CreateSuperuserRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class NotificationSettings(BaseModel):
    email_on_new_call: bool = True
    email_on_approval: bool = True
    email_on_task_due: bool = False
    email_weekly_digest: bool = True

class OnboardingData(BaseModel):
    company_size: Optional[str] = None
    crm_used: Optional[str] = None
    calls_per_week: Optional[str] = None
    onboarding_completed: bool = False

# ============== AUTH HELPERS ==============

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        response = await asyncio.to_thread(supabase_admin.auth.get_user, token)
        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        supabase_id = response.user.id
        user = await db.users.find_one({"supabase_id": supabase_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("superadmin", "superuser"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def require_superuser(user: dict = Depends(get_current_user)):
    if user.get("role") != "superuser":
        raise HTTPException(status_code=403, detail="Superuser access required")
    return user

# ============== AUTH ROUTES ==============

@auth_router.post("/signup", response_model=TokenResponse)
async def signup(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        sb_response = await asyncio.to_thread(
            supabase_admin.auth.admin.create_user,
            {
                "email": data.email,
                "password": data.password,
                "email_confirm": True,
                "user_metadata": {"name": data.name}
            }
        )
        supabase_id = sb_response.user.id
    except Exception as e:
        logging.error(f"Supabase signup error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create account: {str(e)}")

    try:
        login_response = await asyncio.to_thread(
            supabase_client.auth.sign_in_with_password,
            {"email": data.email, "password": data.password}
        )
        access_token = login_response.session.access_token
    except Exception as e:
        logging.error(f"Supabase login after signup error: {e}")
        raise HTTPException(status_code=400, detail="Account created but login failed")

    workspace_id = str(uuid.uuid4())
    workspace = {
        "id": workspace_id,
        "name": data.company_name or f"{data.name}'s Workspace",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.workspaces.insert_one(workspace)

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    user = {
        "id": user_id,
        "supabase_id": supabase_id,
        "email": data.email,
        "name": data.name,
        "role": "superadmin",
        "workspace_id": workspace_id,
        "created_at": now,
        "onboarding": {"onboarding_completed": False},
        "notifications": {
            "email_on_new_call": True,
            "email_on_approval": True,
            "email_on_task_due": False,
            "email_weekly_digest": True
        }
    }
    await db.users.insert_one(user)

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id, email=data.email, name=data.name,
            role="superadmin", workspace_id=workspace_id, created_at=now
        )
    )

@auth_router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    try:
        login_response = await asyncio.to_thread(
            supabase_client.auth.sign_in_with_password,
            {"email": data.email, "password": data.password}
        )
        access_token = login_response.session.access_token
        supabase_id = login_response.user.id
    except Exception as e:
        logging.error(f"Supabase login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = await db.users.find_one({"supabase_id": supabase_id}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"email": data.email}, {"_id": 0})
        if user:
            await db.users.update_one({"email": data.email}, {"$set": {"supabase_id": supabase_id}})
            user["supabase_id"] = supabase_id
        else:
            raise HTTPException(status_code=401, detail="User profile not found")

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"], email=user["email"], name=user["name"],
            role=user["role"], workspace_id=user.get("workspace_id"),
            created_at=user["created_at"]
        )
    )

@auth_router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"], email=user["email"], name=user["name"],
        role=user["role"], workspace_id=user.get("workspace_id"),
        created_at=user["created_at"]
    )

@auth_router.post("/forgot-password")
async def forgot_password(email: EmailStr):
    try:
        await asyncio.to_thread(
            supabase_client.auth.reset_password_for_email, email
        )
    except Exception as e:
        logging.error(f"Password reset error: {e}")
    return {"message": "If this email exists, a reset link has been sent"}

# ============== CALLS ROUTES ==============

@calls_router.get("", response_model=List[CallResponse])
async def get_calls(status: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"workspace_id": user["workspace_id"]}
    if status:
        query["status"] = status
    calls = await db.calls.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [CallResponse(**c) for c in calls]

@calls_router.post("", response_model=CallResponse)
async def create_call(data: CallCreate, user: dict = Depends(get_current_user)):
    call_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    call = {
        "id": call_id,
        "workspace_id": user["workspace_id"],
        "user_id": user["id"],
        "title": data.title,
        "contact_name": data.contact_name,
        "contact_email": data.contact_email,
        "contact_company": data.contact_company,
        "contact_role": data.contact_role,
        "status": "processing",
        "duration_seconds": data.duration_seconds,
        "created_at": now,
        "processed_at": None,
        "transcript": None,
        "ai_outputs": None,
        "approvals": {
            "email": {"approved": False, "approved_at": None, "approved_by": None},
            "documents": {"approved": False, "approved_at": None, "approved_by": None},
            "crm": {"approved": False, "approved_at": None, "approved_by": None},
            "tasks": {"approved": False, "approved_at": None, "approved_by": None}
        }
    }
    if data.transcript_text:
        call["transcript"] = parse_transcript(data.transcript_text)
        call["ai_outputs"] = await generate_ai_outputs(call, user["workspace_id"])
        call["status"] = "pending"
        call["processed_at"] = datetime.now(timezone.utc).isoformat()
    await db.calls.insert_one(call)
    return CallResponse(**call)

@calls_router.get("/{call_id}", response_model=CallDetailResponse)
async def get_call(call_id: str, user: dict = Depends(get_current_user)):
    call = await db.calls.find_one(
        {"id": call_id, "workspace_id": user["workspace_id"]}, {"_id": 0}
    )
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return CallDetailResponse(**call)

@calls_router.put("/{call_id}", response_model=CallResponse)
async def update_call(call_id: str, data: CallUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.calls.update_one(
        {"id": call_id, "workspace_id": user["workspace_id"]}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Call not found")
    call = await db.calls.find_one({"id": call_id}, {"_id": 0})
    return CallResponse(**call)

@calls_router.post("/{call_id}/transcript")
async def upload_transcript(call_id: str, transcript_text: str, user: dict = Depends(get_current_user)):
    call = await db.calls.find_one(
        {"id": call_id, "workspace_id": user["workspace_id"]}, {"_id": 0}
    )
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    transcript = parse_transcript(transcript_text)
    call["transcript"] = transcript
    ai_outputs = await generate_ai_outputs(call, user["workspace_id"])
    await db.calls.update_one(
        {"id": call_id},
        {"$set": {
            "transcript": transcript, "ai_outputs": ai_outputs,
            "status": "pending", "processed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Transcript processed successfully"}

@calls_router.post("/{call_id}/approve")
async def approve_item(call_id: str, data: ApprovalRequest, user: dict = Depends(get_current_user)):
    call = await db.calls.find_one(
        {"id": call_id, "workspace_id": user["workspace_id"]}, {"_id": 0}
    )
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    now = datetime.now(timezone.utc).isoformat()
    approval_key = f"approvals.{data.item_type}"
    update_data = {
        f"{approval_key}.approved": data.approved,
        f"{approval_key}.approved_at": now if data.approved else None,
        f"{approval_key}.approved_by": user["name"] if data.approved else None
    }
    if data.edited_content:
        if data.item_type == "email":
            update_data["ai_outputs.email_draft"] = data.edited_content
        elif data.item_type == "crm":
            update_data["ai_outputs.crm_updates"] = data.edited_content
        elif data.item_type == "tasks":
            update_data["ai_outputs.tasks"] = data.edited_content.get("tasks", [])

    await db.calls.update_one({"id": call_id}, {"$set": update_data})

    call = await db.calls.find_one({"id": call_id}, {"_id": 0})
    approvals = call.get("approvals", {})
    all_approved = all(
        approvals.get(key, {}).get("approved", False) for key in ["email", "documents", "crm", "tasks"]
    )

    if all_approved:
        await db.calls.update_one({"id": call_id}, {"$set": {"status": "sent"}})
        tasks = call.get("ai_outputs", {}).get("tasks", [])
        if tasks:
            for task in tasks:
                task_doc = {
                    "id": task.get("id", str(uuid.uuid4())),
                    "workspace_id": user["workspace_id"],
                    "call_id": call_id,
                    "text": task["text"],
                    "assignee": task.get("assignee"),
                    "due_date": task.get("due_date"),
                    "priority": task.get("priority", "medium"),
                    "completed": False,
                    "created_at": now,
                    "approved_by": user["name"]
                }
                await db.tasks.update_one({"id": task_doc["id"]}, {"$set": task_doc}, upsert=True)

        # Send real follow-up email via Resend
        await send_follow_up_email(call, user)

    return {"message": f"{data.item_type} {'approved' if data.approved else 'unapproved'}", "all_approved": all_approved}

@calls_router.post("/{call_id}/approve-all")
async def approve_all(call_id: str, user: dict = Depends(get_current_user)):
    call = await db.calls.find_one(
        {"id": call_id, "workspace_id": user["workspace_id"]}, {"_id": 0}
    )
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    now = datetime.now(timezone.utc).isoformat()
    await db.calls.update_one(
        {"id": call_id},
        {"$set": {
            "status": "sent",
            "approvals.email.approved": True, "approvals.email.approved_at": now, "approvals.email.approved_by": user["name"],
            "approvals.documents.approved": True, "approvals.documents.approved_at": now, "approvals.documents.approved_by": user["name"],
            "approvals.crm.approved": True, "approvals.crm.approved_at": now, "approvals.crm.approved_by": user["name"],
            "approvals.tasks.approved": True, "approvals.tasks.approved_at": now, "approvals.tasks.approved_by": user["name"]
        }}
    )

    tasks = call.get("ai_outputs", {}).get("tasks", [])
    if tasks:
        for task in tasks:
            task_doc = {
                "id": task.get("id", str(uuid.uuid4())),
                "workspace_id": user["workspace_id"],
                "call_id": call_id,
                "text": task["text"],
                "assignee": task.get("assignee"),
                "due_date": task.get("due_date"),
                "priority": task.get("priority", "medium"),
                "completed": False,
                "created_at": now,
                "approved_by": user["name"]
            }
            await db.tasks.update_one({"id": task_doc["id"]}, {"$set": task_doc}, upsert=True)

    # Send real follow-up email via Resend
    await send_follow_up_email(call, user)

    return {"message": "All items approved and sent", "status": "sent"}

@calls_router.delete("/{call_id}")
async def delete_call(call_id: str, user: dict = Depends(get_current_user)):
    result = await db.calls.delete_one({"id": call_id, "workspace_id": user["workspace_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Call not found")
    return {"message": "Call deleted"}

# ============== TASKS ROUTES ==============

@tasks_router.get("")
async def get_tasks(completed: Optional[bool] = None, user: dict = Depends(get_current_user)):
    query = {"workspace_id": user["workspace_id"]}
    if completed is not None:
        query["completed"] = completed
    tasks = await db.tasks.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return tasks

@tasks_router.patch("/{task_id}")
async def update_task(task_id: str, data: TaskUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.tasks.update_one(
        {"id": task_id, "workspace_id": user["workspace_id"]}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return task

@tasks_router.delete("/{task_id}")
async def delete_task(task_id: str, user: dict = Depends(get_current_user)):
    result = await db.tasks.delete_one({"id": task_id, "workspace_id": user["workspace_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# ============== VAULT ROUTES ==============

@vault_router.get("", response_model=List[DocumentResponse])
async def get_documents(user: dict = Depends(get_current_user)):
    docs = await db.documents.find({"workspace_id": user["workspace_id"]}, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    return [DocumentResponse(**d) for d in docs]

@vault_router.post("", response_model=DocumentResponse)
async def create_document(data: DocumentCreate, user: dict = Depends(require_admin)):
    doc_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": doc_id, "workspace_id": user["workspace_id"],
        "filename": data.filename, "tags": data.tags,
        "intent_triggers": data.intent_triggers, "enabled": True,
        "file_url": data.file_url, "content_preview": data.content_preview,
        "uploaded_at": now, "uploaded_by": user["name"]
    }
    await db.documents.insert_one(doc)
    return DocumentResponse(**doc)

@vault_router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(doc_id: str, data: DocumentCreate, user: dict = Depends(require_admin)):
    result = await db.documents.update_one(
        {"id": doc_id, "workspace_id": user["workspace_id"]},
        {"$set": {
            "filename": data.filename, "tags": data.tags,
            "intent_triggers": data.intent_triggers,
            "file_url": data.file_url, "content_preview": data.content_preview
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = await db.documents.find_one({"id": doc_id}, {"_id": 0})
    return DocumentResponse(**doc)

@vault_router.patch("/{doc_id}/toggle")
async def toggle_document(doc_id: str, user: dict = Depends(require_admin)):
    doc = await db.documents.find_one({"id": doc_id, "workspace_id": user["workspace_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    new_status = not doc.get("enabled", True)
    await db.documents.update_one({"id": doc_id}, {"$set": {"enabled": new_status}})
    return {"enabled": new_status}

@vault_router.delete("/{doc_id}")
async def delete_document(doc_id: str, user: dict = Depends(require_admin)):
    result = await db.documents.delete_one({"id": doc_id, "workspace_id": user["workspace_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted"}

# ============== ADMIN ROUTES ==============

@admin_router.get("/team", response_model=List[TeamMemberResponse])
async def get_team(user: dict = Depends(require_admin)):
    members = await db.users.find(
        {"workspace_id": user["workspace_id"]}, {"_id": 0, "supabase_id": 0}
    ).to_list(100)
    invites = await db.invites.find(
        {"workspace_id": user["workspace_id"], "status": "pending"}, {"_id": 0}
    ).to_list(100)
    result = []
    for m in members:
        result.append(TeamMemberResponse(
            id=m["id"], email=m["email"], name=m["name"],
            role=m["role"], status="active", joined_at=m.get("created_at")
        ))
    for inv in invites:
        result.append(TeamMemberResponse(
            id=inv["id"], email=inv["email"], name="Pending",
            role=inv["role"], status="pending", joined_at=None
        ))
    return result

@admin_router.post("/team/invite")
async def invite_member(data: TeamMemberInvite, user: dict = Depends(require_admin)):
    existing = await db.users.find_one({"email": data.email, "workspace_id": user["workspace_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="User already in workspace")

    if data.role not in ("superadmin", "rep"):
        raise HTTPException(status_code=400, detail="Invalid role. Use 'superadmin' or 'rep'")

    invite_id = str(uuid.uuid4())
    invite_token = secrets.token_urlsafe(32)
    invite = {
        "id": invite_id, "workspace_id": user["workspace_id"],
        "email": data.email, "role": data.role, "token": invite_token,
        "status": "pending", "invited_by": user["name"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.invites.insert_one(invite)

    # Send invite email via Resend
    try:
        workspace = await db.workspaces.find_one({"id": user["workspace_id"]}, {"_id": 0})
        company_name = workspace.get("name", "CloseLoop") if workspace else "CloseLoop"
        params = {
            "from": SENDER_EMAIL,
            "to": [data.email],
            "subject": f"You've been invited to join {company_name} on CloseLoop",
            "html": f"""<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                <h2>You're invited!</h2>
                <p>{user['name']} has invited you to join <strong>{company_name}</strong> on CloseLoop as a <strong>{data.role}</strong>.</p>
                <p>Sign up to get started and join your team.</p>
                <p style="color: #666; font-size: 13px;">Invite code: {invite_token}</p>
            </div>"""
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Invite email sent to {data.email}")
    except Exception as e:
        logging.error(f"Failed to send invite email: {e}")

    return {"message": f"Invite sent to {data.email}", "invite_id": invite_id}

@admin_router.delete("/team/{member_id}")
async def remove_member(member_id: str, user: dict = Depends(require_admin)):
    if member_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    result = await db.users.delete_one({"id": member_id, "workspace_id": user["workspace_id"]})
    if result.deleted_count == 0:
        result = await db.invites.delete_one({"id": member_id, "workspace_id": user["workspace_id"]})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member removed"}

@admin_router.patch("/team/{member_id}/role")
async def update_member_role(member_id: str, role: str, user: dict = Depends(require_admin)):
    if member_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    if role not in ("superadmin", "rep"):
        raise HTTPException(status_code=400, detail="Invalid role")
    result = await db.users.update_one(
        {"id": member_id, "workspace_id": user["workspace_id"]}, {"$set": {"role": role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": f"Role updated to {role}"}

@admin_router.get("/settings")
async def get_workspace_settings(user: dict = Depends(require_admin)):
    workspace = await db.workspaces.find_one({"id": user["workspace_id"]}, {"_id": 0})
    return workspace

@admin_router.put("/settings")
async def update_workspace_settings(data: WorkspaceSettings, user: dict = Depends(require_admin)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.workspaces.update_one({"id": user["workspace_id"]}, {"$set": update_data})
    workspace = await db.workspaces.find_one({"id": user["workspace_id"]}, {"_id": 0})
    return workspace

@admin_router.get("/performance")
async def get_team_performance(user: dict = Depends(require_admin)):
    workspace_id = user["workspace_id"]
    members = await db.users.find(
        {"workspace_id": workspace_id, "role": "rep"},
        {"_id": 0, "supabase_id": 0, "onboarding": 0, "notifications": 0}
    ).to_list(100)

    performance = []
    for member in members:
        total_calls = await db.calls.count_documents({"user_id": member["id"], "workspace_id": workspace_id})
        sent_calls = await db.calls.count_documents({"user_id": member["id"], "workspace_id": workspace_id, "status": "sent"})
        pending_calls = await db.calls.count_documents({"user_id": member["id"], "workspace_id": workspace_id, "status": "pending"})
        completed_tasks = await db.tasks.count_documents({"workspace_id": workspace_id, "approved_by": member["name"], "completed": True})
        performance.append({
            "id": member["id"],
            "name": member["name"],
            "email": member["email"],
            "total_calls": total_calls,
            "sent_calls": sent_calls,
            "pending_calls": pending_calls,
            "completed_tasks": completed_tasks,
            "follow_through_rate": round((sent_calls / total_calls * 100), 1) if total_calls > 0 else 0
        })
    return performance

# ============== PLATFORM ROUTES (SUPERUSER ONLY) ==============

@platform_router.get("/workspaces")
async def list_workspaces(user: dict = Depends(require_superuser)):
    workspaces = await db.workspaces.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    result = []
    for ws in workspaces:
        member_count = await db.users.count_documents({"workspace_id": ws["id"]})
        call_count = await db.calls.count_documents({"workspace_id": ws["id"]})
        result.append({**ws, "member_count": member_count, "call_count": call_count})
    return result

@platform_router.post("/workspaces")
async def create_workspace(data: CreateWorkspaceRequest, user: dict = Depends(require_superuser)):
    existing = await db.users.find_one({"email": data.admin_email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin email already registered")

    try:
        sb_response = await asyncio.to_thread(
            supabase_admin.auth.admin.create_user,
            {
                "email": data.admin_email,
                "password": data.admin_password,
                "email_confirm": True,
                "user_metadata": {"name": data.admin_name}
            }
        )
        supabase_id = sb_response.user.id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create admin account: {str(e)}")

    workspace_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    workspace = {
        "id": workspace_id,
        "name": data.company_name,
        "created_at": now,
        "created_by": user["id"]
    }
    await db.workspaces.insert_one(workspace)

    admin_user = {
        "id": str(uuid.uuid4()),
        "supabase_id": supabase_id,
        "email": data.admin_email,
        "name": data.admin_name,
        "role": "superadmin",
        "workspace_id": workspace_id,
        "created_at": now,
        "onboarding": {"onboarding_completed": False},
        "notifications": {
            "email_on_new_call": True, "email_on_approval": True,
            "email_on_task_due": False, "email_weekly_digest": True
        }
    }
    await db.users.insert_one(admin_user)

    # Send welcome email
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [data.admin_email],
            "subject": f"Welcome to CloseLoop - {data.company_name}",
            "html": f"""<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                <h2>Welcome to CloseLoop!</h2>
                <p>Hi {data.admin_name},</p>
                <p>Your workspace <strong>{data.company_name}</strong> has been created. You can now log in and start setting up your team.</p>
                <p><strong>Email:</strong> {data.admin_email}<br/><strong>Password:</strong> (as provided by your administrator)</p>
            </div>"""
        }
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logging.error(f"Failed to send welcome email: {e}")

    return {
        "message": f"Workspace '{data.company_name}' created",
        "workspace_id": workspace_id,
        "admin_id": admin_user["id"]
    }

@platform_router.post("/superusers")
async def create_superuser(data: CreateSuperuserRequest, user: dict = Depends(require_superuser)):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        sb_response = await asyncio.to_thread(
            supabase_admin.auth.admin.create_user,
            {
                "email": data.email,
                "password": data.password,
                "email_confirm": True,
                "user_metadata": {"name": data.name}
            }
        )
        supabase_id = sb_response.user.id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create account: {str(e)}")

    now = datetime.now(timezone.utc).isoformat()
    new_superuser = {
        "id": str(uuid.uuid4()),
        "supabase_id": supabase_id,
        "email": data.email,
        "name": data.name,
        "role": "superuser",
        "workspace_id": None,
        "created_at": now,
        "created_by": user["id"],
        "onboarding": {"onboarding_completed": True},
        "notifications": {
            "email_on_new_call": False, "email_on_approval": False,
            "email_on_task_due": False, "email_weekly_digest": True
        }
    }
    await db.users.insert_one(new_superuser)
    return {"message": f"Superuser '{data.name}' created", "id": new_superuser["id"]}

@platform_router.get("/superusers")
async def list_superusers(user: dict = Depends(require_superuser)):
    superusers = await db.users.find(
        {"role": "superuser"}, {"_id": 0, "supabase_id": 0}
    ).to_list(100)
    return superusers

@platform_router.get("/stats")
async def platform_stats(user: dict = Depends(require_superuser)):
    total_workspaces = await db.workspaces.count_documents({})
    total_users = await db.users.count_documents({"role": {"$ne": "superuser"}})
    total_calls = await db.calls.count_documents({})
    total_sent = await db.calls.count_documents({"status": "sent"})
    total_pending = await db.calls.count_documents({"status": "pending"})
    return {
        "total_workspaces": total_workspaces,
        "total_users": total_users,
        "total_calls": total_calls,
        "total_sent": total_sent,
        "total_pending": total_pending
    }

@platform_router.post("/setup")
async def initial_setup(data: CreateSuperuserRequest):
    """Create the first superuser. Only works if no superusers exist."""
    existing_superuser = await db.users.find_one({"role": "superuser"})
    if existing_superuser:
        raise HTTPException(status_code=400, detail="Platform already initialized")

    try:
        sb_response = await asyncio.to_thread(
            supabase_admin.auth.admin.create_user,
            {
                "email": data.email,
                "password": data.password,
                "email_confirm": True,
                "user_metadata": {"name": data.name}
            }
        )
        supabase_id = sb_response.user.id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create account: {str(e)}")

    now = datetime.now(timezone.utc).isoformat()
    superuser = {
        "id": str(uuid.uuid4()),
        "supabase_id": supabase_id,
        "email": data.email,
        "name": data.name,
        "role": "superuser",
        "workspace_id": None,
        "created_at": now,
        "onboarding": {"onboarding_completed": True},
        "notifications": {
            "email_on_new_call": False, "email_on_approval": False,
            "email_on_task_due": False, "email_weekly_digest": True
        }
    }
    await db.users.insert_one(superuser)

    login_response = await asyncio.to_thread(
        supabase_client.auth.sign_in_with_password,
        {"email": data.email, "password": data.password}
    )

    return TokenResponse(
        access_token=login_response.session.access_token,
        user=UserResponse(
            id=superuser["id"], email=data.email, name=data.name,
            role="superuser", workspace_id=None, created_at=now
        )
    )

# ============== USER ROUTES ==============

@user_router.get("/stats")
async def get_user_stats(user: dict = Depends(get_current_user)):
    workspace_id = user["workspace_id"]
    if not workspace_id:
        return {"pending_count": 0, "sent_count": 0, "total_calls": 0, "pending_tasks": 0, "completed_tasks": 0}
    pending_count = await db.calls.count_documents({"workspace_id": workspace_id, "status": "pending"})
    sent_count = await db.calls.count_documents({"workspace_id": workspace_id, "status": "sent"})
    total_calls = await db.calls.count_documents({"workspace_id": workspace_id})
    pending_tasks = await db.tasks.count_documents({"workspace_id": workspace_id, "completed": False})
    completed_tasks = await db.tasks.count_documents({"workspace_id": workspace_id, "completed": True})
    return {
        "pending_count": pending_count, "sent_count": sent_count,
        "total_calls": total_calls, "pending_tasks": pending_tasks,
        "completed_tasks": completed_tasks
    }

@user_router.get("/notifications")
async def get_notification_settings(user: dict = Depends(get_current_user)):
    return user.get("notifications", {
        "email_on_new_call": True, "email_on_approval": True,
        "email_on_task_due": False, "email_weekly_digest": True
    })

@user_router.put("/notifications")
async def update_notification_settings(data: NotificationSettings, user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": user["id"]}, {"$set": {"notifications": data.model_dump()}}
    )
    return data.model_dump()

@user_router.get("/onboarding")
async def get_onboarding(user: dict = Depends(get_current_user)):
    return user.get("onboarding", {"onboarding_completed": False})

@user_router.put("/onboarding")
async def update_onboarding(data: OnboardingData, user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": user["id"]}, {"$set": {"onboarding": data.model_dump()}}
    )
    return data.model_dump()

@user_router.put("/profile")
async def update_profile(name: Optional[str] = None, user: dict = Depends(get_current_user)):
    if name:
        await db.users.update_one({"id": user["id"]}, {"$set": {"name": name}})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "supabase_id": 0})
    return updated

# ============== PUBLIC ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "CloseLoop API v2.0", "status": "operational"}

@api_router.post("/demo-request")
async def submit_demo_request(data: DemoRequest):
    request_id = str(uuid.uuid4())
    demo_request = {
        "id": request_id, "full_name": data.full_name,
        "work_email": data.work_email, "company_name": data.company_name,
        "company_size": data.company_size, "role": data.role,
        "crm_used": data.crm_used, "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat(), "status": "new"
    }
    await db.demo_requests.insert_one(demo_request)
    return {"message": "Demo request submitted successfully", "request_id": request_id}

# ============== EMAIL HELPER ==============

async def send_follow_up_email(call: dict, user: dict):
    """Send the approved follow-up email via Resend"""
    ai_outputs = call.get("ai_outputs", {})
    email_draft = ai_outputs.get("email_draft", {})
    contact_email = call.get("contact_email")

    if not email_draft or not contact_email:
        logging.info(f"[SKIP EMAIL] No email draft or contact email for call {call.get('id')}")
        return

    subject = email_draft.get("subject", "Following up on our call")
    body_text = email_draft.get("body", "")

    # Build HTML email
    body_html = body_text.replace("\n", "<br/>")
    docs = ai_outputs.get("documents", [])
    doc_section = ""
    if docs:
        doc_names = [d["filename"] for d in docs]
        doc_section = f"<br/><hr style='border:none;border-top:1px solid #eee;margin:16px 0'/><p style='color:#666;font-size:13px;'>Attached documents: {', '.join(doc_names)}</p>"

    html_content = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
        {body_html}
        {doc_section}
        <p style="color: #999; font-size: 11px; margin-top: 24px;">Sent via CloseLoop</p>
    </div>"""

    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [contact_email],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"[EMAIL SENT] Follow-up to {contact_email} for call {call.get('id')}, email_id: {result.get('id')}")

        await db.calls.update_one(
            {"id": call["id"]},
            {"$set": {"email_sent_at": datetime.now(timezone.utc).isoformat(), "email_id": result.get("id")}}
        )
    except Exception as e:
        logging.error(f"[EMAIL FAILED] Failed to send to {contact_email}: {e}")

# ============== AI HELPERS ==============

def parse_transcript(text: str) -> List[Dict[str, str]]:
    segments = []
    lines = text.strip().split('\n')
    current_speaker = "Unknown"
    current_time = "00:00:00"
    for line in lines:
        line = line.strip()
        if not line:
            continue
        time_match = re.match(r'\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.+)', line)
        if time_match:
            current_time = time_match.group(1)
            line = time_match.group(2)
        speaker_match = re.match(r'^([A-Za-z\s]+):\s*(.+)', line)
        if speaker_match:
            current_speaker = speaker_match.group(1).strip()
            text_content = speaker_match.group(2).strip()
        else:
            text_content = line
        if text_content:
            segments.append({"speaker": current_speaker, "timestamp": current_time, "text": text_content})
    return segments

def match_documents_from_transcript(transcript: List[Dict], docs: List[Dict]) -> List[Dict]:
    matched_docs = []
    transcript_text = " ".join([s["text"].lower() for s in transcript])
    for doc in docs:
        if not doc.get("enabled", True):
            continue
        triggers = doc.get("intent_triggers", [])
        matched_triggers = []
        for trigger in triggers:
            if trigger.lower() in transcript_text:
                matched_triggers.append(trigger)
        if matched_triggers:
            context = ""
            for segment in transcript:
                for trigger in matched_triggers:
                    if trigger.lower() in segment["text"].lower():
                        context = f"[{segment['timestamp']}] {segment['text']}"
                        break
                if context:
                    break
            matched_docs.append({
                "id": doc["id"], "filename": doc["filename"],
                "tags": doc.get("tags", []), "matched_triggers": matched_triggers,
                "context": context,
                "confidence": "high" if len(matched_triggers) >= 2 else "medium"
            })
    return matched_docs

def extract_tasks_from_transcript(transcript: List[Dict], contact_name: str) -> List[Dict]:
    tasks = []
    task_id = 0
    action_keywords = [
        "send", "share", "schedule", "follow up", "get back", "prepare",
        "review", "check", "confirm", "update", "create", "set up",
        "call", "email", "reach out", "provide", "demo", "meeting"
    ]
    commitment_patterns = [
        r"i'?ll\s+(.+)", r"we'?ll\s+(.+)", r"let me\s+(.+)",
        r"i will\s+(.+)", r"we will\s+(.+)", r"i can\s+(.+)", r"we can\s+(.+)"
    ]
    request_patterns = [
        r"can you\s+(.+)", r"could you\s+(.+)", r"please\s+(.+)", r"would you\s+(.+)"
    ]
    for segment in transcript:
        text = segment["text"].lower()
        for pattern in commitment_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if any(kw in match.lower() for kw in action_keywords):
                    task_id += 1
                    tasks.append({
                        "id": f"task_{task_id}", "text": f"{match.strip().capitalize()}",
                        "assignee": "You", "priority": "high",
                        "source_timestamp": segment["timestamp"], "completed": False
                    })
        for pattern in request_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if any(kw in match.lower() for kw in action_keywords):
                    task_id += 1
                    tasks.append({
                        "id": f"task_{task_id}",
                        "text": f"{match.strip().capitalize()} (requested by {contact_name})",
                        "assignee": "You", "priority": "medium",
                        "source_timestamp": segment["timestamp"], "completed": False
                    })
    unique_tasks = []
    seen_texts = set()
    for task in tasks:
        normalized = task["text"].lower()[:50]
        if normalized not in seen_texts:
            seen_texts.add(normalized)
            unique_tasks.append(task)
    return unique_tasks[:10]

def extract_crm_notes(transcript: List[Dict], contact_name: str, company: str) -> List[Dict]:
    notes = []
    categories = {
        "pain_point": ["problem", "challenge", "struggle", "issue", "difficult", "pain", "frustrat", "mess", "broken"],
        "requirement": ["need", "require", "must have", "important", "essential", "looking for", "want"],
        "timeline": ["timeline", "deadline", "when", "by next", "this quarter", "this month", "asap", "urgent"],
        "budget": ["budget", "cost", "price", "afford", "spend", "invest"],
        "decision_maker": ["decide", "approval", "sign off", "ceo", "cto", "vp", "head of", "director", "manager"],
        "next_step": ["next step", "follow up", "schedule", "demo", "meeting", "call back"]
    }
    transcript_by_speaker = {}
    for segment in transcript:
        speaker = segment["speaker"]
        if speaker not in transcript_by_speaker:
            transcript_by_speaker[speaker] = []
        transcript_by_speaker[speaker].append(segment)
    contact_segments = []
    for speaker, segments in transcript_by_speaker.items():
        if "rep" not in speaker.lower() and speaker.lower() != "you":
            contact_segments.extend(segments)
    for segment in contact_segments:
        text = segment["text"].lower()
        for category, keywords in categories.items():
            for keyword in keywords:
                if keyword in text:
                    note_text = segment["text"]
                    if len(note_text) > 100:
                        note_text = note_text[:100] + "..."
                    notes.append({"point": note_text, "category": category})
                    break
    unique_notes = []
    seen = set()
    for note in notes:
        key = note["point"][:30]
        if key not in seen:
            seen.add(key)
            unique_notes.append(note)
    return unique_notes[:8]

async def generate_ai_outputs(call: dict, workspace_id: str) -> Dict[str, Any]:
    transcript = call.get("transcript", [])
    transcript_text = "\n".join([f"[{s['timestamp']}] {s['speaker']}: {s['text']}" for s in transcript])
    contact_name = call.get("contact_name", "there")
    contact_company = call.get("contact_company", "your company")
    contact_email = call.get("contact_email", "")

    docs = await db.documents.find({"workspace_id": workspace_id, "enabled": True}, {"_id": 0}).to_list(50)
    matched_docs = match_documents_from_transcript(transcript, docs)
    tasks = extract_tasks_from_transcript(transcript, contact_name)
    crm_notes = extract_crm_notes(transcript, contact_name, contact_company)

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return generate_mock_ai_outputs(call, matched_docs, tasks, crm_notes)

        chat = LlmChat(
            api_key=api_key,
            session_id=f"call-{call['id']}-{uuid.uuid4().hex[:6]}",
            system_message="You are CloseLoop AI, a concise sales follow-up assistant. Output valid JSON only, no markdown."
        )
        chat.with_model("gemini", "gemini-3-flash-preview")

        docs_context = "No documents matched from Data Vault."
        if matched_docs:
            docs_context = "AVAILABLE DOCUMENTS FROM DATA VAULT (only include in email if EXPLICITLY requested or promised during the call):\n"
            for doc in matched_docs:
                docs_context += f"- {doc['filename']} (triggered by: {', '.join(doc['matched_triggers'])})\n"

        prompt = f"""Analyze this sales call and generate follow-up content.

CALL DETAILS:
- Contact: {contact_name} ({call.get('contact_role', 'Unknown')}) at {contact_company}
- Email: {contact_email}

{docs_context}

TRANSCRIPT:
{transcript_text}

Generate JSON with:

1. "email_draft": A SHORT professional follow-up email (4-6 sentences MAX). Only reference documents that were EXPLICITLY requested or promised in the call. If a follow-up meeting/demo was scheduled, mention the date/time. End with a clear next step. Keep it scannable.

2. "crm_notes": Concise CRM bullet points. Each: {{"point": "max 80 chars", "category": "pain_point|requirement|decision_maker|timeline|budget|next_step"}}

3. "tasks": Post-call action items. Each: {{"text": "clear action", "assignee": "You", "priority": "high|medium|low", "due_date": "Tomorrow|This week|Next week|null"}}

4. "key_moments": Call highlights. Each: {{"timestamp": "string", "type": "document_request|next_step|scheduling|action_item", "text": "string", "confidence": "high|medium"}}

5. "summary": 2 sentence executive summary.

Return ONLY valid JSON:
{{
  "email_draft": {{"subject": "string", "body": "string", "confidence": "high|medium"}},
  "crm_notes": [{{"point": "string", "category": "string"}}],
  "tasks": [{{"text": "string", "assignee": "You", "priority": "high|medium|low", "due_date": "string|null"}}],
  "key_moments": [{{"timestamp": "string", "type": "string", "text": "string", "confidence": "high|medium"}}],
  "summary": "string"
}}"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)

        import json
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                ai_result = json.loads(response[json_start:json_end])

                ai_tasks = ai_result.get("tasks", [])
                final_tasks = []
                for i, t in enumerate(ai_tasks):
                    final_tasks.append({
                        "id": f"task_{i+1}", "text": t.get("text", ""),
                        "assignee": t.get("assignee", "You"),
                        "priority": t.get("priority", "medium"),
                        "due_date": t.get("due_date"), "completed": False,
                        "source_timestamp": t.get("source_timestamp")
                    })
                if not final_tasks and tasks:
                    final_tasks = tasks

                ai_crm_notes = ai_result.get("crm_notes", [])
                final_crm_notes = ai_crm_notes if ai_crm_notes else crm_notes

                has_budget = any(n.get("category") == "budget" for n in final_crm_notes)
                has_timeline = any(n.get("category") == "timeline" for n in final_crm_notes)
                deal_stage = "Proposal" if has_budget and has_timeline else ("Qualified" if has_budget or has_timeline else "Discovery")
                next_step = final_tasks[0]["text"] if final_tasks else "Schedule follow-up"
                crm_summary = "; ".join([n["point"][:60] for n in final_crm_notes[:3]]) if final_crm_notes else "Discovery call completed"

                return {
                    "email_draft": ai_result.get("email_draft"),
                    "documents": matched_docs,
                    "crm_updates": {
                        "deal_stage": deal_stage, "next_step": next_step,
                        "notes": crm_summary, "confidence": "high"
                    },
                    "crm_notes": final_crm_notes,
                    "tasks": final_tasks,
                    "key_moments": ai_result.get("key_moments", []),
                    "summary": ai_result.get("summary")
                }
        except json.JSONDecodeError:
            logging.warning("Failed to parse AI JSON response, using mock")

    except Exception as e:
        logging.error(f"AI generation error: {e}")

    return generate_mock_ai_outputs(call, matched_docs, tasks, crm_notes)

def generate_mock_ai_outputs(call: dict, matched_docs: list, tasks: list, crm_notes: list) -> Dict[str, Any]:
    contact_name = call.get("contact_name", "there")
    contact_company = call.get("contact_company", "your company")
    title = call.get("title", "our call")
    transcript = call.get("transcript", [])
    key_moments = []

    doc_keywords = ["document", "doc", "send", "share", "compliance", "pricing", "case study", "deck", "pdf"]
    schedule_keywords = ["schedule", "meeting", "call", "next week", "tomorrow", "demo", "tuesday", "wednesday"]
    next_step_keywords = ["follow up", "get back", "review", "discuss", "next steps"]
    action_keywords_list = ["will", "can you", "please", "need to", "let me"]

    for segment in transcript:
        text_lower = segment["text"].lower()
        if any(kw in text_lower for kw in doc_keywords):
            key_moments.append({"timestamp": segment["timestamp"], "type": "document_request", "text": segment["text"], "confidence": "high"})
        elif any(kw in text_lower for kw in schedule_keywords):
            key_moments.append({"timestamp": segment["timestamp"], "type": "scheduling", "text": segment["text"], "confidence": "medium"})
        elif any(kw in text_lower for kw in next_step_keywords):
            key_moments.append({"timestamp": segment["timestamp"], "type": "next_step", "text": segment["text"], "confidence": "medium"})
        elif any(kw in text_lower for kw in action_keywords_list):
            key_moments.append({"timestamp": segment["timestamp"], "type": "action_item", "text": segment["text"], "confidence": "medium"})

    doc_mention = ""
    if matched_docs:
        doc_names = [d["filename"] for d in matched_docs]
        doc_mention = f" As discussed, I've attached: {', '.join(doc_names)}."

    next_step = tasks[0]["text"] if tasks else "Schedule follow-up call"

    return {
        "email_draft": {
            "subject": f"Following up: {title}",
            "body": f"Hi {contact_name},\n\nGreat speaking with you about {contact_company}'s needs.{doc_mention}\n\nNext step: {next_step}. Let me know if you have any questions.\n\nBest regards",
            "confidence": "high"
        },
        "documents": matched_docs,
        "crm_updates": {
            "deal_stage": "Discovery" if not crm_notes else "Qualified",
            "next_step": next_step,
            "notes": "; ".join([n["point"][:50] for n in crm_notes[:3]]) if crm_notes else f"Discovery call with {contact_name} at {contact_company}",
            "confidence": "medium"
        },
        "crm_notes": crm_notes,
        "tasks": tasks,
        "key_moments": key_moments[:5],
        "summary": f"Discovery call with {contact_name} from {contact_company}. Discussed product capabilities and requirements."
    }

# ============== INCLUDE ROUTERS ==============

api_router.include_router(auth_router)
api_router.include_router(calls_router)
api_router.include_router(vault_router)
api_router.include_router(admin_router)
api_router.include_router(user_router)
api_router.include_router(tasks_router)
api_router.include_router(platform_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
