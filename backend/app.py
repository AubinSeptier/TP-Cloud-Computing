"""
Application entry point for the Flask application.
This file initializes the Flask application and runs the server.
"""
from app import create_app

app = create_app()
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)