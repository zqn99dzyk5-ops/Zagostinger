from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'continental_academy_secret_2024')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 1440))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

app = FastAPI(title="Continental Academy API")
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: str
    subscriptions: List[str] = []
    courses: List[str] = []

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ProgramCreate(BaseModel):
    name: str
    description: str
    price: float
    currency: str = "EUR"
    features: List[str] = []
    stripe_price_id: Optional[str] = None
    is_active: bool = True

class ProgramResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    currency: str
    features: List[str]
    stripe_price_id: Optional[str]
    is_active: bool

class CourseCreate(BaseModel):
    title: str
    description: str
    program_id: str
    thumbnail_url: Optional[str] = None
    duration_hours: Optional[int] = None  # Trajanje kursa u satima
    order: int = 0
    is_active: bool = True

class LessonCreate(BaseModel):
    title: str
    description: str
    course_id: str
    video_url: Optional[str] = None  # MUX playback URL ili embed URL
    mux_playback_id: Optional[str] = None
    duration_minutes: Optional[int] = None  # Trajanje lekcije u minutama
    order: int = 0
    is_free: bool = False  # Da li je lekcija besplatna za pregled

class ModuleCreate(BaseModel):
    title: str
    description: str
    course_id: str
    order: int = 0

class VideoCreate(BaseModel):
    title: str
    description: str
    module_id: str
    mux_playback_id: Optional[str] = None
    mux_asset_id: Optional[str] = None
    duration: Optional[int] = None
    order: int = 0

class UserCourseAssign(BaseModel):
    user_id: str
    course_ids: List[str]

class ShopProductCreate(BaseModel):
    title: str
    description: str
    category: str  # tiktok, youtube, facebook
    price: float
    currency: str = "EUR"
    stats: Dict[str, Any] = {}
    images: List[str] = []
    is_available: bool = True

class FAQCreate(BaseModel):
    question: str
    answer: str
    order: int = 0

class ResultCreate(BaseModel):
    image_url: str
    caption: str
    order: int = 0

class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_headline: Optional[str] = None
    hero_subheadline: Optional[str] = None
    discord_invite_url: Optional[str] = None
    theme: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    contact_email: Optional[str] = None

class AnalyticsEvent(BaseModel):
    event_type: str
    page: str
    metadata: Dict[str, Any] = {}

# ============== AUTH HELPERS ==============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Niste prijavljeni")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Nevažeći token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Korisnik nije pronađen")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Nevažeći token")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Nemate admin ovlaštenja")
    return current_user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            user = await db.users.find_one({"id": user_id}, {"_id": 0})
            return user
    except JWTError:
        pass
    return None

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email je već registrovan")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "role": "user",
        "subscriptions": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    
    access_token = create_access_token(data={"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"],
            subscriptions=user["subscriptions"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Pogrešan email ili lozinka")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"],
            subscriptions=user.get("subscriptions", [])
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        created_at=current_user["created_at"],
        subscriptions=current_user.get("subscriptions", [])
    )

# ============== PROGRAMS ROUTES ==============

@api_router.get("/programs")
async def get_programs():
    programs = await db.programs.find({"is_active": True}, {"_id": 0}).to_list(100)
    return programs

@api_router.post("/admin/programs")
async def create_program(program: ProgramCreate, admin: dict = Depends(get_admin_user)):
    program_dict = program.model_dump()
    program_dict["id"] = str(uuid.uuid4())
    program_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.programs.insert_one(program_dict)
    program_dict.pop("_id", None)  # Remove MongoDB _id
    return program_dict

@api_router.put("/admin/programs/{program_id}")
async def update_program(program_id: str, program: ProgramCreate, admin: dict = Depends(get_admin_user)):
    result = await db.programs.update_one(
        {"id": program_id},
        {"$set": program.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Program nije pronađen")
    return {"success": True}

@api_router.delete("/admin/programs/{program_id}")
async def delete_program(program_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.programs.delete_one({"id": program_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Program nije pronađen")
    return {"success": True}

# ============== COURSES ROUTES ==============

@api_router.get("/courses")
async def get_courses(program_id: Optional[str] = None):
    query = {}
    if program_id:
        query["program_id"] = program_id
    courses = await db.courses.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Add lesson count for each course
    for course in courses:
        lesson_count = await db.lessons.count_documents({"course_id": course["id"]})
        course["lesson_count"] = lesson_count
    
    return courses

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    
    # Check subscription access OR direct course access
    user_courses = current_user.get("courses", [])
    user_subs = current_user.get("subscriptions", [])
    
    has_access = (
        current_user.get("role") == "admin" or
        course_id in user_courses or
        course.get("program_id") in user_subs
    )
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Nemate pristup ovom kursu")
    
    # Get lessons for this course
    lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)
    course["lessons"] = lessons
    
    return course

@api_router.get("/admin/courses")
async def admin_get_courses(admin: dict = Depends(get_admin_user)):
    courses = await db.courses.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    for course in courses:
        lesson_count = await db.lessons.count_documents({"course_id": course["id"]})
        course["lesson_count"] = lesson_count
        # Get program name
        program = await db.programs.find_one({"id": course.get("program_id")}, {"_id": 0, "name": 1})
        course["program_name"] = program.get("name", "N/A") if program else "N/A"
    
    return courses

@api_router.post("/admin/courses")
async def create_course(course: CourseCreate, admin: dict = Depends(get_admin_user)):
    course_dict = course.model_dump()
    course_dict["id"] = str(uuid.uuid4())
    course_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.courses.insert_one(course_dict)
    course_dict.pop("_id", None)
    return course_dict

@api_router.put("/admin/courses/{course_id}")
async def update_course(course_id: str, course: CourseCreate, admin: dict = Depends(get_admin_user)):
    result = await db.courses.update_one({"id": course_id}, {"$set": course.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    return {"success": True}

@api_router.delete("/admin/courses/{course_id}")
async def delete_course(course_id: str, admin: dict = Depends(get_admin_user)):
    await db.courses.delete_one({"id": course_id})
    await db.lessons.delete_many({"course_id": course_id})
    return {"success": True}

# ============== LESSONS ROUTES ==============

@api_router.get("/lessons/{course_id}")
async def get_lessons(course_id: str, current_user: dict = Depends(get_current_user)):
    lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)
    return lessons

@api_router.get("/lesson/{lesson_id}")
async def get_lesson(lesson_id: str, current_user: dict = Depends(get_current_user)):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lekcija nije pronađena")
    return lesson

@api_router.post("/admin/lessons")
async def create_lesson(lesson: LessonCreate, admin: dict = Depends(get_admin_user)):
    lesson_dict = lesson.model_dump()
    lesson_dict["id"] = str(uuid.uuid4())
    lesson_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    # Auto-set order if not provided
    if lesson_dict.get("order", 0) == 0:
        count = await db.lessons.count_documents({"course_id": lesson.course_id})
        lesson_dict["order"] = count + 1
    
    await db.lessons.insert_one(lesson_dict)
    lesson_dict.pop("_id", None)
    return lesson_dict

@api_router.put("/admin/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, lesson: LessonCreate, admin: dict = Depends(get_admin_user)):
    result = await db.lessons.update_one({"id": lesson_id}, {"$set": lesson.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lekcija nije pronađena")
    return {"success": True}

@api_router.delete("/admin/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.lessons.delete_one({"id": lesson_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lekcija nije pronađena")
    return {"success": True}

@api_router.put("/admin/lessons/reorder")
async def reorder_lessons(lesson_orders: List[Dict[str, Any]], admin: dict = Depends(get_admin_user)):
    for item in lesson_orders:
        await db.lessons.update_one(
            {"id": item["id"]},
            {"$set": {"order": item["order"]}}
        )
    return {"success": True}

# ============== USER COURSE ASSIGNMENT ==============

@api_router.get("/admin/users/{user_id}/courses")
async def get_user_courses(user_id: str, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    user_course_ids = user.get("courses", [])
    courses = await db.courses.find({"id": {"$in": user_course_ids}}, {"_id": 0}).to_list(100)
    return courses

@api_router.put("/admin/users/{user_id}/courses")
async def assign_courses_to_user(user_id: str, course_ids: List[str], admin: dict = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"courses": course_ids}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return {"success": True}

@api_router.post("/admin/users/{user_id}/courses/add")
async def add_course_to_user(user_id: str, course_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$addToSet": {"courses": course_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return {"success": True}

@api_router.post("/admin/users/{user_id}/courses/remove")
async def remove_course_from_user(user_id: str, course_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$pull": {"courses": course_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return {"success": True}

# ============== MODULES ROUTES ==============

@api_router.post("/admin/modules")
async def create_module(module: ModuleCreate, admin: dict = Depends(get_admin_user)):
    module_dict = module.model_dump()
    module_dict["id"] = str(uuid.uuid4())
    module_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.modules.insert_one(module_dict)
    module_dict.pop("_id", None)  # Remove MongoDB _id
    return module_dict

@api_router.put("/admin/modules/{module_id}")
async def update_module(module_id: str, module: ModuleCreate, admin: dict = Depends(get_admin_user)):
    result = await db.modules.update_one({"id": module_id}, {"$set": module.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Modul nije pronađen")
    return {"success": True}

@api_router.delete("/admin/modules/{module_id}")
async def delete_module(module_id: str, admin: dict = Depends(get_admin_user)):
    await db.modules.delete_one({"id": module_id})
    await db.videos.delete_many({"module_id": module_id})
    return {"success": True}

# ============== VIDEOS ROUTES ==============

@api_router.get("/videos/{video_id}")
async def get_video(video_id: str, current_user: dict = Depends(get_current_user)):
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video nije pronađen")
    return video

@api_router.post("/admin/videos")
async def create_video(video: VideoCreate, admin: dict = Depends(get_admin_user)):
    video_dict = video.model_dump()
    video_dict["id"] = str(uuid.uuid4())
    video_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.videos.insert_one(video_dict)
    video_dict.pop("_id", None)  # Remove MongoDB _id
    return video_dict

@api_router.put("/admin/videos/{video_id}")
async def update_video(video_id: str, video: VideoCreate, admin: dict = Depends(get_admin_user)):
    result = await db.videos.update_one({"id": video_id}, {"$set": video.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video nije pronađen")
    return {"success": True}

@api_router.delete("/admin/videos/{video_id}")
async def delete_video(video_id: str, admin: dict = Depends(get_admin_user)):
    await db.videos.delete_one({"id": video_id})
    return {"success": True}

# ============== SHOP ROUTES ==============

@api_router.get("/shop/products")
async def get_shop_products(category: Optional[str] = None):
    query = {"is_available": True}
    if category:
        query["category"] = category
    products = await db.shop_products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/shop/products/{product_id}")
async def get_shop_product(product_id: str):
    product = await db.shop_products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Proizvod nije pronađen")
    return product

@api_router.post("/admin/shop/products")
async def create_shop_product(product: ShopProductCreate, admin: dict = Depends(get_admin_user)):
    product_dict = product.model_dump()
    product_dict["id"] = str(uuid.uuid4())
    product_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.shop_products.insert_one(product_dict)
    product_dict.pop("_id", None)  # Remove MongoDB _id
    return product_dict

@api_router.put("/admin/shop/products/{product_id}")
async def update_shop_product(product_id: str, product: ShopProductCreate, admin: dict = Depends(get_admin_user)):
    result = await db.shop_products.update_one({"id": product_id}, {"$set": product.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Proizvod nije pronađen")
    return {"success": True}

@api_router.delete("/admin/shop/products/{product_id}")
async def delete_shop_product(product_id: str, admin: dict = Depends(get_admin_user)):
    await db.shop_products.delete_one({"id": product_id})
    return {"success": True}

# ============== FAQ ROUTES ==============

@api_router.get("/faqs")
async def get_faqs():
    faqs = await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return faqs

@api_router.post("/admin/faqs")
async def create_faq(faq: FAQCreate, admin: dict = Depends(get_admin_user)):
    faq_dict = faq.model_dump()
    faq_dict["id"] = str(uuid.uuid4())
    await db.faqs.insert_one(faq_dict)
    faq_dict.pop("_id", None)  # Remove MongoDB _id
    return faq_dict

@api_router.put("/admin/faqs/{faq_id}")
async def update_faq(faq_id: str, faq: FAQCreate, admin: dict = Depends(get_admin_user)):
    result = await db.faqs.update_one({"id": faq_id}, {"$set": faq.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="FAQ nije pronađen")
    return {"success": True}

@api_router.delete("/admin/faqs/{faq_id}")
async def delete_faq(faq_id: str, admin: dict = Depends(get_admin_user)):
    await db.faqs.delete_one({"id": faq_id})
    return {"success": True}

# ============== RESULTS GALLERY ROUTES ==============

@api_router.get("/results")
async def get_results():
    results = await db.results.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return results

@api_router.post("/admin/results")
async def create_result(result: ResultCreate, admin: dict = Depends(get_admin_user)):
    result_dict = result.model_dump()
    result_dict["id"] = str(uuid.uuid4())
    await db.results.insert_one(result_dict)
    result_dict.pop("_id", None)  # Remove MongoDB _id
    return result_dict

@api_router.delete("/admin/results/{result_id}")
async def delete_result(result_id: str, admin: dict = Depends(get_admin_user)):
    await db.results.delete_one({"id": result_id})
    return {"success": True}

# ============== SITE SETTINGS ROUTES ==============

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"type": "site"}, {"_id": 0})
    if not settings:
        # Create default settings in database
        default_settings = {
            "type": "site",
            "site_name": "Continental Academy",
            "hero_video_url": "",
            "hero_headline": "Monetizuj svoj sadržaj. Pretvori znanje u prihod.",
            "hero_subheadline": "Nauči kako da zaradiš na TikTok, YouTube i Facebook platformama sa našim ekspertnim vodičima.",
            "discord_invite_url": "https://discord.gg/placeholder",
            "theme": "dark-luxury",
            "social_links": {},
            "contact_email": "info@continentalacademy.com",
            "available_themes": ["dark-luxury", "clean-light", "midnight-purple", "education-classic"]
        }
        await db.settings.insert_one(default_settings)
        default_settings.pop("_id", None)
        return default_settings
    return settings

@api_router.put("/admin/settings")
async def update_settings(settings: SiteSettingsUpdate, admin: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
    
    # Ensure we have a settings document first
    existing = await db.settings.find_one({"type": "site"})
    if not existing:
        # Create default settings first
        default_settings = {
            "type": "site",
            "site_name": "Continental Academy",
            "hero_video_url": "",
            "hero_headline": "Monetizuj svoj sadržaj. Pretvori znanje u prihod.",
            "hero_subheadline": "Nauči kako da zaradiš na TikTok, YouTube i Facebook platformama sa našim ekspertnim vodičima.",
            "discord_invite_url": "https://discord.gg/placeholder",
            "theme": "dark-luxury",
            "social_links": {},
            "contact_email": "info@continentalacademy.com",
            "available_themes": ["dark-luxury", "clean-light", "midnight-purple", "education-classic"]
        }
        await db.settings.insert_one(default_settings)
    
    # Now update with new values
    result = await db.settings.update_one(
        {"type": "site"},
        {"$set": update_data}
    )
    
    # Return updated settings
    updated = await db.settings.find_one({"type": "site"}, {"_id": 0})
    return updated

# ============== ANALYTICS ROUTES ==============

@api_router.post("/analytics/event")
async def track_event(event: AnalyticsEvent):
    event_dict = event.model_dump()
    event_dict["id"] = str(uuid.uuid4())
    event_dict["timestamp"] = datetime.now(timezone.utc).isoformat()
    await db.analytics.insert_one(event_dict)
    return {"success": True}

@api_router.get("/admin/analytics")
async def get_analytics(admin: dict = Depends(get_admin_user)):
    # Get basic stats
    total_users = await db.users.count_documents({})
    total_subscriptions = await db.users.count_documents({"subscriptions": {"$ne": []}})
    
    # Page views last 7 days
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    page_views = await db.analytics.count_documents({
        "event_type": "page_view",
        "timestamp": {"$gte": week_ago}
    })
    
    # Recent events
    recent_events = await db.analytics.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)
    
    return {
        "total_users": total_users,
        "total_subscriptions": total_subscriptions,
        "page_views_7d": page_views,
        "recent_events": recent_events
    }

# ============== ADMIN USER MANAGEMENT ==============

@api_router.get("/admin/users")
async def get_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, admin: dict = Depends(get_admin_user)):
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Nevažeća uloga")
    result = await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return {"success": True}

@api_router.put("/admin/users/{user_id}/subscriptions")
async def update_user_subscriptions(user_id: str, program_ids: List[str], admin: dict = Depends(get_admin_user)):
    result = await db.users.update_one({"id": user_id}, {"$set": {"subscriptions": program_ids}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return {"success": True}

# ============== STRIPE PAYMENT ROUTES ==============

@api_router.post("/payments/checkout/subscription")
async def create_subscription_checkout(
    request: Request,
    program_id: str,
    origin_url: str,
    current_user: dict = Depends(get_current_user)
):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    program = await db.programs.find_one({"id": program_id}, {"_id": 0})
    if not program:
        raise HTTPException(status_code=404, detail="Program nije pronađen")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/dashboard?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/programs"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(program["price"]),
        currency=program.get("currency", "eur").lower(),
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["id"],
            "program_id": program_id,
            "type": "subscription"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user["id"],
        "program_id": program_id,
        "amount": program["price"],
        "currency": program.get("currency", "EUR"),
        "type": "subscription",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.post("/payments/checkout/product")
async def create_product_checkout(
    request: Request,
    product_id: str,
    origin_url: str,
    current_user: dict = Depends(get_current_user)
):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    product = await db.shop_products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Proizvod nije pronađen")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/shop/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/shop"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(product["price"]),
        currency=product.get("currency", "eur").lower(),
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["id"],
            "product_id": product_id,
            "type": "product"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user["id"],
        "product_id": product_id,
        "amount": product["price"],
        "currency": product.get("currency", "EUR"),
        "type": "product",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: dict = Depends(get_current_user)):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction if paid
    if status.payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if transaction and transaction["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # If subscription, add to user subscriptions
            if transaction.get("type") == "subscription" and transaction.get("program_id"):
                await db.users.update_one(
                    {"id": transaction["user_id"]},
                    {"$addToSet": {"subscriptions": transaction["program_id"]}}
                )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.environ.get('STRIPE_API_KEY')
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            
            if transaction and transaction["payment_status"] != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                
                if transaction.get("type") == "subscription" and transaction.get("program_id"):
                    await db.users.update_one(
                        {"id": transaction["user_id"]},
                        {"$addToSet": {"subscriptions": transaction["program_id"]}}
                    )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

# ============== SEED DATA ==============

@api_router.post("/admin/seed")
async def seed_data(admin: dict = Depends(get_admin_user)):
    # Seed programs
    programs = [
        {
            "id": str(uuid.uuid4()),
            "name": "TikTok Monetizacija",
            "description": "Naučite kako monetizirati TikTok sadržaj",
            "price": 29.99,
            "currency": "EUR",
            "features": ["Video lekcije", "Live sesije", "Discord pristup", "Certifikat"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "YouTube Monetizacija",
            "description": "Kompletni vodič za YouTube zaradu",
            "price": 39.99,
            "currency": "EUR",
            "features": ["50+ video lekcija", "Analitika", "SEO strategije", "Discord pristup"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Facebook Monetizacija",
            "description": "Facebook stranice i grupe za profit",
            "price": 34.99,
            "currency": "EUR",
            "features": ["Reels strategije", "Stranice setup", "Oglašavanje", "Discord pristup"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "YouTube + TikTok Bundle",
            "description": "Kompletni paket za obje platforme",
            "price": 59.99,
            "currency": "EUR",
            "features": ["Svi YouTube i TikTok kursevi", "Prioritetna podrška", "1-on-1 sesija", "Doživotni pristup"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for p in programs:
        await db.programs.update_one({"name": p["name"]}, {"$set": p}, upsert=True)
    
    # Seed FAQs
    faqs = [
        {"id": str(uuid.uuid4()), "question": "Kako mogu pristupiti kursevima?", "answer": "Nakon kupovine, pristup kursevima dobijate odmah putem vašeg dashboard-a.", "order": 1},
        {"id": str(uuid.uuid4()), "question": "Da li mogu otkazati pretplatu?", "answer": "Da, otkazivanje je moguće putem naše support službe na Discord-u.", "order": 2},
        {"id": str(uuid.uuid4()), "question": "Koje platforme za plaćanje prihvatate?", "answer": "Prihvatamo kartice (Visa, Mastercard) putem sigurnog Stripe sistema.", "order": 3},
        {"id": str(uuid.uuid4()), "question": "Da li dobijam certifikat?", "answer": "Da, po završetku svakog programa dobijate digitalni certifikat.", "order": 4}
    ]
    
    for f in faqs:
        await db.faqs.update_one({"question": f["question"]}, {"$set": f}, upsert=True)
    
    # Seed results
    results = [
        {"id": str(uuid.uuid4()), "image_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400", "caption": "+50K pratilaca za 30 dana", "order": 1},
        {"id": str(uuid.uuid4()), "image_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400", "caption": "€5,000 mjesečno sa YouTube", "order": 2},
        {"id": str(uuid.uuid4()), "image_url": "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400", "caption": "TikTok Creator Fund aktiviran", "order": 3}
    ]
    
    for r in results:
        await db.results.update_one({"caption": r["caption"]}, {"$set": r}, upsert=True)
    
    # Seed settings
    settings = {
        "type": "site",
        "site_name": "Continental Academy",
        "hero_video_url": "",
        "hero_headline": "Monetizuj svoj sadržaj. Pretvori znanje u prihod.",
        "hero_subheadline": "Nauči kako da zaradiš na TikTok, YouTube i Facebook platformama sa našim ekspertnim vodičima.",
        "discord_invite_url": "https://discord.gg/placeholder",
        "theme": "dark-luxury",
        "social_links": {"instagram": "", "youtube": "", "tiktok": ""},
        "contact_email": "info@continentalacademy.com",
        "available_themes": ["dark-luxury", "clean-light", "midnight-purple", "education-classic"]
    }
    await db.settings.update_one({"type": "site"}, {"$set": settings}, upsert=True)
    
    return {"success": True, "message": "Podaci uspješno dodani"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
