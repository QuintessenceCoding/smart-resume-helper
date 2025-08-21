# backend/main.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import os
import docx
import fitz
import io
import traceback
# CHANGED: Import Pydantic for data validation
from pydantic import BaseModel
from typing import List, Optional

# --- Load environment variables and configure API ---
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
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------------

# --- Helper function for text extraction (from resume feature) ---
def extract_text(file: UploadFile):
    # ... (This function remains exactly the same as before)
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
# ----------------------------------------------------------------

# --- Resume Enhancer Endpoint ---
@app.post("/resume/enhance")
async def enhance_resume(resume_file: UploadFile = File(...)):
    # ... (This function remains exactly the same as before)
    resume_text = extract_text(resume_file)
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
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
        print("--- DETAILED ERROR ---")
        traceback.print_exc()
        print("----------------------")
        raise HTTPException(status_code=500, detail=f"Error during AI enhancement: {e}")
    return {
        "filename": resume_file.filename,
        "original_text": resume_text,
        "enhanced_text": enhanced_text
    }
# ---------------------------------

# ===================================================================
# NEW: Pydantic Models for Portfolio Data
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

# ===================================================================
# NEW: Portfolio Enhancer Endpoint
# ===================================================================
@app.post("/portfolio/enhance")
async def enhance_portfolio(data: PortfolioData):
    """
    Receives portfolio data, enhances each project description using the Gemini API,
    and returns the full, enhanced portfolio data.
    """
    enhanced_projects = []
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        for project in data.projects:
            prompt = (
                "You are an expert portfolio writing assistant for software developers. "
                "Rewrite the following project description to be more professional, concise, and results-oriented. "
                "Focus on the technical challenges, the solutions implemented, and the impact of the project. "
                "Use strong, active verbs. The technologies used were: " + project.technologies + ".\n\n"
                f"--- START OF DESCRIPTION ---\n{project.projectDescription}\n--- END OF DESCRIPTION ---\n\n"
                "Your response must contain ONLY the rewritten project description and nothing else. Do not include any introductory phrases or explanations."
            )
            
            response = model.generate_content(prompt)
            enhanced_description = response.text.strip()
            
            # Create a new project object with the enhanced description
            enhanced_project = project.model_copy()
            enhanced_project.projectDescription = enhanced_description
            enhanced_projects.append(enhanced_project)

    except Exception as e:
        print("--- DETAILED PORTFOLIO ERROR ---")
        traceback.print_exc()
        print("--------------------------------")
        raise HTTPException(status_code=500, detail=f"Error during portfolio enhancement: {e}")

    # Create a copy of the original data and replace the projects list
    enhanced_portfolio_data = data.model_copy()
    enhanced_portfolio_data.projects = enhanced_projects
    
    return enhanced_portfolio_data
    