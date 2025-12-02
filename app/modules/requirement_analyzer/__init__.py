"""
Requirement Analyzer Module

This module handles the analysis of university admission circulars,
extracting structured data using AI/OCR capabilities.
"""

from app.modules.requirement_analyzer.routers import router as analyze_router
from app.modules.requirement_analyzer.results_router import router as results_router

__all__ = ["analyze_router", "results_router"]

