"""
Routes initialization file.
This file imports the authentication and IMC routes and makes them available for use in the application.
"""
from .auth import auth_bp
from .imc import imc_bp

__all__ = ['auth_bp', 'imc_bp']