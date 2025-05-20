from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .imc_record import IMCRecord

__all__ = ['db', 'User', 'IMCRecord']