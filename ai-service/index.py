import sys
import os

# Add the current directory to sys.path to handle imports correctly on Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

# For Vercel, the entry point should be 'app'
# This file serves as a bridge between Vercel and the FastAPI app in the app/ folder
