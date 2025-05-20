"""
Application entry point for the Flask application.
This file initializes the Flask application, sets up the database, and creates the necessary tables.
"""
from app import create_app
from app.models import db

app = create_app()

@app.before_first_request
def create_tables():
    db.create_all()
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)