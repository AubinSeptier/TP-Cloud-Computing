from flask import Blueprint, request, jsonify
from app.models.imc_record import IMCRecord, db
from app.routes.auth import token_required

imc_bp = Blueprint('imc', __name__)

@imc_bp.route('/calculate_imc', methods=['POST'])
@token_required
def calculate_imc(current_user):
    data = request.json
    
    if not data or not data.get('weight') or not data.get('height'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        weight = float(data['weight'])
        height = float(data['height'])
        
        if weight < 20 or weight > 500:
            return jsonify({'message': 'Invalid weight value (must be between 20 and 500 kg)'}), 400
        
        if height < 50 or height > 300:
            return jsonify({'message': 'Invalid height value (must be between 50 and 300 cm)'}), 400
        
        imc_record = IMCRecord(
            user_id=current_user.id,
            weight=weight,
            height=height
        )
        
        db.session.add(imc_record)
        db.session.commit()
        return jsonify({
            'message': 'IMC calculated successfully',
            'imc_record': imc_record.to_dict()
        }), 201
        
    except ValueError:
        return jsonify({'message': 'Invalid weight or height value'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'An error occurred while calculating IMC: {str(e)}'}), 500
    
@imc_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    try:
        records = IMCRecord.query.filter_by(user_id=current_user.id).order_by(IMCRecord.created_at.desc()).all()
        
        history = [record.to_dict() for record in records]
        
        return jsonify({
            'message': 'IMC history retrieved successfully',
            'history': history,
            'count': len(history)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'An error occurred while retrieving IMC history: {str(e)}'}), 500
    
@imc_bp.route('/record/<int:record_id>', methods=['GET'])
@token_required
def get_record(current_user, record_id):
    try:
        record = IMCRecord.query.filter_by(id=record_id, user_id=current_user.id).first()
        
        if not record:
            return jsonify({'message': f'Record {str(record_id)} not found'}), 404
        
        return jsonify({
            'message': 'IMC record retrieved successfully',
            'record': record.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'An error occurred while retrieving IMC record: {str(e)}'}), 500
    
