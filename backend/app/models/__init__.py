"""
Models initialization file.
This file initializes the SQLAlchemy instance and imports the user and IMCRecord models.
"""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .imc_record import IMCRecord

__all__ = ['db', 'User', 'IMCRecord']