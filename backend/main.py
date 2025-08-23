# backend/main.py

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import io
import traceback
import json
from datetime import timedelta, datetime

# --- AI and File Processing Imports ---
from dotenv import load_dotenv
import google.generativeai as genai
import docx
import fitz

# --- Database Imports ---
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base

# --- Authentication Imports ---
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# ===================================================================
# Security & JWT Configuration
# ===================================================================
SECRET_KEY = "your-super-secret-key-that-should-be-in-an-env-file"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ===================================================================
# Database Configuration
# ===================================================================
DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===================================================================
# SQLAlchemy Database Models
# ===================================================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    portfolios = relationship("PortfolioDB", back_populates="owner")

class PortfolioDB(Base):
    __tablename__ = "portfolios"
    id = Column(Integer, primary_key=True, index=True)
    fullName = Column(String, index=True)
    professionalTitle = Column(String)
    email = Column(String)
    phone = Column(String)
    aboutMe = Column(Text)
    skills = Column(Text)
    projects = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="portfolios")

Base.metadata.create_all(bind=engine)

# --- Load environment variables and configure AI ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)
# ----------------------------------------------------

app = FastAPI()

# --- CORS Middleware ---
origins = [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "http://localhost:8080",
    "smart-resume-helper-r5nx7cowr-ishika-vashishts-projects.vercel.app" 
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)
# ------------------------

# ===================================================================
# Pydantic Models
# ===================================================================
class Project(BaseModel):
    projectName: str
    projectURL: Optional[str] = None
    projectDescription: str
    technologies: str

class PortfolioData(BaseModel):
    fullName: str
    professionalTitle: str
    email: str
    phone: str
    aboutMe: str
    skills: str
    projects: List[Project]

class PortfolioInfo(BaseModel):
    id: int
    fullName: str

class UserCreate(BaseModel):
    email: str
    password: str

class UserInDB(BaseModel):
    id: int
    email: str
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# ===================================================================
# Security Helper Functions
# ===================================================================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# --- Helper function for text extraction ---
def extract_text(file: UploadFile):
    filename = file.filename
    file_contents = file.file.read()
    if filename.endswith(".docx"):
        try:
            doc = docx.Document(io.BytesIO(file_contents))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing DOCX file: {e}")
    elif filename.endswith(".pdf"):
        try:
            pdf_doc = fitz.open(stream=io.BytesIO(file_contents), filetype="pdf")
            text = ""
            for page in pdf_doc:
                text += page.get_text()
            return text
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing PDF file: {e}")
    elif filename.endswith(".txt"):
        try:
            return file_contents.decode("utf-8")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing TXT file: {e}")
    raise HTTPException(status_code=400, detail="Unsupported file type.")

# ===================================================================
# Public API Endpoints
# ===================================================================
@app.post("/resume/enhance")
async def enhance_resume(resume_file: UploadFile = File(...)):
    resume_text = extract_text(resume_file)
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        # CORRECTED: Using the full, strict prompt
        prompt = (
            "You are a world-class professional resume writing assistant. "
            "Your task is to rewrite the following resume text to be more impactful, professional, and friendly to Applicant Tracking Systems (ATS). "
            "Focus on using strong action verbs, quantifying achievements with numbers where possible, and ensuring a clean, readable format in markdown. "
            "Do not add any information that is not present in the original text. Maintain a professional tone. "
            "Here is the resume text:\n\n"
            f"--- START OF RESUME ---\n{resume_text}\n--- END OF RESUME ---\n\n"
            "Your response must contain ONLY the rewritten resume text in markdown format and nothing else. Do not include any introductory phrases, explanations, or conclusions."
        )
        response = model.generate_content(prompt)
        enhanced_text = response.text
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error during AI enhancement: {e}")
    return {"enhanced_text": enhanced_text}

@app.post("/portfolio/enhance")
async def enhance_portfolio(data: PortfolioData):
    enhanced_projects = []
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        for project in data.projects:
            # CORRECTED: Using the full, strict prompt
            prompt = (
                "You are an expert technical writer who creates concise project descriptions for software developer portfolios. "
                "Rewrite the following project description to be professional and impactful. "
                "The new description must be exactly two sentences long. "
                "The first sentence should start with a strong action verb and describe what the project is. "
                "The second sentence should describe the key technologies used and the positive outcome or result of the project. "
                "Original technologies listed were: " + project.technologies + ".\n\n"
                f"--- START OF DESCRIPTION ---\n{project.projectDescription}\n--- END OF DESCRIPTION ---\n\n"
                "Your response must contain ONLY the rewritten two-sentence project description and nothing else."
            )
            response = model.generate_content(prompt)
            enhanced_description = response.text.strip()
            enhanced_project = project.model_copy()
            enhanced_project.projectDescription = enhanced_description
            enhanced_projects.append(enhanced_project)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error during portfolio enhancement: {e}")
    enhanced_portfolio_data = data.model_copy()
    enhanced_portfolio_data.projects = enhanced_projects
    return enhanced_portfolio_data

# ===================================================================
# Authentication Endpoints
# ===================================================================
@app.post("/register", response_model=UserInDB)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ===================================================================
# Secured Portfolio Endpoints
# ===================================================================
@app.post("/portfolio/save")
def save_portfolio(portfolio: PortfolioData, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects_json = json.dumps([p.model_dump() for p in portfolio.projects])
    db_portfolio = PortfolioDB(
        **portfolio.model_dump(exclude={"projects"}),
        projects=projects_json,
        owner_id=current_user.id
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return portfolio

@app.get("/portfolios/", response_model=List[PortfolioInfo])
def get_portfolios(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolios = db.query(PortfolioDB).filter(PortfolioDB.owner_id == current_user.id).all()
    return portfolios

@app.get("/portfolios/{portfolio_id}", response_model=PortfolioData)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_portfolio = db.query(PortfolioDB).filter(PortfolioDB.id == portfolio_id, PortfolioDB.owner_id == current_user.id).first()
    if db_portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    projects_list = json.loads(db_portfolio.projects)
    
    return PortfolioData(
        fullName=db_portfolio.fullName,
        professionalTitle=db_portfolio.professionalTitle,
        email=db_portfolio.email,
        phone=db_portfolio.phone,
        aboutMe=db_portfolio.aboutMe,
        skills=db_portfolio.skills,
        projects=projects_list
    )