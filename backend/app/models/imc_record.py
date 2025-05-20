"""
IMCRecord model for the application.
This module defines the IMCRecord class, which represents an IMC record in the application.
"""
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
        """
        Initialize a new IMCRecord instance.
        
        Args:
            user_id (int): The ID of the user associated with this record.
            weight (float): The weight of the user in kilograms.
            height (float): The height of the user in centimeters.
        """
        self.user_id = user_id
        self.weight = weight
        self.height = height
        self.calculate_imc()
        
    def calculate_imc(self):
        """
        Calculate the IMC (Body Mass Index) value based on weight and height.
        The IMC is calculated using the formula: weight (kg) / (height (m) ^ 2), rounded to 2 decimal places.
        """
        height_in_meters = self.height / 100  # Convert height from cm to m
        self.imc_value = round(self.weight / (height_in_meters ** 2), 2)
        
    def get_status(self):
        """
        Determine the IMC status based on the calculated IMC value.
        The status is categorized as follows:
        - Underweight: IMC < 18.5
        - Normal weight: 18.5 <= IMC < 25
        - Overweight: 25 <= IMC < 30
        - Obesity (Class I): 30 <= IMC < 35
        - Obesity (Class II): 35 <= IMC < 40
        - Obesity (Class III): IMC >= 40
        
        Returns:
            str: The IMC status based on the calculated IMC value.
        """
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
        """
        Convert the IMCRecord instance to a dictionary representation.
        
        Returns:
            dict: A dictionary containing the IMC record details.
        """
        return {
            'id': self.id,
            'height': self.height,
            'weight': self.weight,
            'imc_value': self.imc_value,
            'status': self.get_status(),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
    def __repr__(self):
        """
        Return a string representation of the IMCRecord object.
        
        Returns:
            str: A string representation of the IMCRecord object.
        """
        return f'<IMCRecord id={self.id} imc={self.imc_value}>'