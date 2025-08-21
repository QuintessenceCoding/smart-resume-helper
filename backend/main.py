from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import io
import traceback
import json

# --- AI and File Processing Imports ---
from dotenv import load_dotenv
import google.generativeai as genai
import docx
import fitz

# --- Database Imports ---
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

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
# SQLAlchemy Database Model
# ===================================================================
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
origins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)
# ------------------------

# ===================================================================
# CORRECTED: Pydantic Models are now defined at the top
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


# --- API Endpoints ---
@app.post("/resume/enhance")
async def enhance_resume(resume_file: UploadFile = File(...)):
    # ... (This function remains unchanged)
    resume_text = extract_text(resume_file)
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = (
            "You are a world-class professional resume writing assistant..."
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
            # EDITED: Replaced the old prompt with a much stricter one
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


@app.post("/portfolio/save")
def save_portfolio(portfolio: PortfolioData, db: Session = Depends(get_db)):
    projects_json = json.dumps([p.model_dump() for p in portfolio.projects])
    db_portfolio = PortfolioDB(
        fullName=portfolio.fullName, professionalTitle=portfolio.professionalTitle,
        email=portfolio.email, phone=portfolio.phone, aboutMe=portfolio.aboutMe,
        skills=portfolio.skills, projects=projects_json
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return portfolio

@app.get("/portfolios/", response_model=List[PortfolioInfo])
def get_portfolios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    portfolios = db.query(PortfolioDB).offset(skip).limit(limit).all()
    return portfolios

@app.get("/portfolios/{portfolio_id}", response_model=PortfolioData)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    db_portfolio = db.query(PortfolioDB).filter(PortfolioDB.id == portfolio_id).first()
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
