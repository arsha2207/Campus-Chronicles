from flask import Blueprint, request, jsonify
from models import User,db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(
        username=data["username"],
        password=data["password"]
    ).first()

    if user:
        return {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }

    return {"message": "Invalid credentials"}, 401

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    
    existing_user = User.query.filter_by(username=data["username"]).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    user = User(
        username=data["username"],
        password=data["password"],
        role=data["role"]
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "signed up"})