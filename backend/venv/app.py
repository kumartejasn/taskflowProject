from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS

# --- App Initialization ---
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this'

# --- Service Initialization ---
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='todo')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# --- API Endpoints ---
@app.route("/")
def home():
    return "Backend is running!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(username=data.get('username'), password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    new_task = Task(content=data.get('content'), user_id=current_user_id)
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"task": {'id': new_task.id, 'content': new_task.content, 'status': new_task.status}}), 201

@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user_id = int(get_jwt_identity())
    tasks = Task.query.filter_by(user_id=current_user_id).all()
    output = []
    for task in tasks:
        task_data = {'id': task.id, 'content': task.content, 'status': task.status}
        output.append(task_data)
    return jsonify({'tasks': output})

@app.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    if task.user_id != current_user_id:
        return jsonify({"message": "Unauthorized"}), 403
    data = request.get_json()
    new_status = data.get('status')
    if new_status:
        task.status = new_status
        db.session.commit()
        return jsonify({"message": "Task updated successfully"})
    return jsonify({"message": "No new status provided"}), 400

# NEW: Define an endpoint to delete a task
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.get(task_id)

    # Check if the task exists
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    # Check if the task belongs to the current user
    if task.user_id != current_user_id:
        return jsonify({"message": "Unauthorized"}), 403
        
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({"message": "Task deleted successfully"})

# --- Server Start ---
if __name__ == "__main__":
    app.run(debug=True)