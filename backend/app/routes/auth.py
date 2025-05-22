"""
Routes for authentication and user management.
This module provides endpoints for user registration, login, and retrieving user information.
"""
from flask import Blueprint, request, jsonify
from app.models.user import User, db
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            payload = User.verify_jwt(token)
            if payload is None:
                return jsonify({'message': 'Token is invalid!'}), 401
            
            current_user = User.query.filter_by(id=payload['sub']).first()
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
            
            return f(current_user, *args, **kwargs)
            
        except Exception as e:
            return jsonify({'message': 'Token error'}), 401
        
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Route to register a new user.
    Data should be sent in JSON format with the following fields:
    - username: The username of the user.
    - email: The email of the user.
    - password: The password of the user.
        
    Returns:
        A JSON response with the registration information and a success message.
    """
    data = request.json
    
    if not data or not data.get('email') or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409
    
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email
        }
    }), 201
    
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Route to log in a user.
    Data should be sent in JSON format with the following fields:
    - email: The email of the user.
    - password: The password of the user.
    
    Returns:
        A JSON response with the login information, a success message, and a JWT token for the user.
    """
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = user.generate_jwt()
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200
    
@auth_bp.route('/user', methods=['GET'])
@token_required
def get_user(current_user):
    """
    Route to get the current user's information.
    Requires a valid JWT token in the Authorization header.
    
    Returns:
        A JSON response with the user's information.
    """
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'created_at': current_user.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }), 200