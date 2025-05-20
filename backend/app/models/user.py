"""
User model for the application.
This module defines the User class, which represents a user in the application.
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
import os
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    # Define the name of the table in the database
    __tablename__ = 'users'
    
    # Define the columns for the User table
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define the relationship with the IMCRecord table
    imc_records = db.relationship('IMCRecord', backref='user', lazy=True, cascade="all, delete")
    
    def __init__(self, username: str, email: str, password: str):
        """
        Initialize a new User instance. Password is hashed before storing.
        
        Args:
            username (str): The username of the user.
            email (str): The email of the user.
            password (str): The password of the user. 
        """
        self.username = username
        self.email = email
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password: str) -> bool:
        """
        Check if the provided password matches the stored password hash.
        
        Args:
            password (str): The password to check.
        
        Returns:
            bool: True if the password matches, False otherwise.
        """
        return check_password_hash(self.password_hash, password)
    
    def generate_jwt(self) -> str:
        """
        Generate a JWT token for the user.
        
        Returns:
            str: The generated JWT token.
        """
        payload = {
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow(),
            'sub': self.id,
            'username': self.username
        }
        
        return jwt.encode(
            payload,
            os.environ.get('JWT_SECRET_KEY'),
            algorithm='HS256'
        )
        
    @staticmethod
    def verify_jwt(token: str) -> dict:
        """
        Check if the provided JWT token is valid.
        
        Args:
            token (str): The JWT token to verify.
        
        Returns:
            dict: The decoded payload if the token is valid, None otherwise.
        """
        try:
            payload = jwt.decode(
                token,
                os.environ.get('JWT_SECRET_KEY'),
                algorithms=["HS256"]
            )
            
            return payload
        
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        
    def __repr__(self):
        """
        Return a string representation of the User object.
        
        Returns:
            str: A string representation of the User object.
        """
        return f'<User {self.username}>'