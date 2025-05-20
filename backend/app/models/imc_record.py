from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class IMCRecord(db.Model):
    __tablename__ = 'imc_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)
    imc_value = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, user_id, weight, height):
        self.user_id = user_id
        self.weight = weight
        self.height = height
        self.calculate_imc()
        
    def calculate_imc(self):
        height_in_meters = self.height / 100  # Convert height from cm to m
        self.imc_value = round(self.weight / (height_in_meters ** 2), 2)
        
    def get_status(self):
        if self.imc_value < 18.5:
            return "Underweight"
        elif self.imc_value < 25:
            return "Normal weight"
        elif self.imc_value < 30:
            return "Overweight"
        elif self.imc_value < 35:
            return "Obesity (Class I)"
        elif self.imc_value < 40:
            return "Obesity (Class II)"
        else:
            return "Obesity (Class III)"
        
    def to_dict(self):
        return {
            'id': self.id,
            'height': self.height,
            'weight': self.weight,
            'imc_value': self.imc_value,
            'status': self.get_status(),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
    def __repr__(self):
        return f'<IMCRecord id={self.id} imc={self.imc_value}>'