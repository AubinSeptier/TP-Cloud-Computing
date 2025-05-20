import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from app.models import db
from app.routes import auth_bp, imc_bp

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'dev_key'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///imc.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'dev_key'),
        JWT_ACCESS_TOKEN_EXPIRES=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    db.init_app(app)
    
    migrate = Migrate(app, db)
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(imc_bp, url_prefix='/api/imc')
    
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'message': 'IMC API is running'}
    
    return app