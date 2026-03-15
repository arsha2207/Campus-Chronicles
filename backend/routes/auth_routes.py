from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing email or password"}), 400

    email    = data.get("email")      # ✅ BUG 1 & 2 fixed — extract first, then use
    password = data.get("password")

    user = User.query.filter_by(email=email).first()  # ✅ correct indentation

    if not user or not check_password_hash(user.password, password):  # ✅ proper password check
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    print(user.name, token)           # ✅ BUG 3 fixed — print() not console.log()
    return jsonify({
        "user":  { "id": user.id, "name": user.name, "role": user.role, "dept": user.dept },
        "token": token
    })


@auth_bp.route("/register", methods=["POST"])
def signup():
    data = request.json

    email    = data.get("email")      # ✅ BUG 4 fixed — extract email first
    password = data.get("password")
    name     = data.get("name")
    role     = data.get("role")
    dept     = data.get("dept")

    if not email or not email.endswith("@rit.ac.in"):
        return jsonify({"message": "Only @rit.ac.in email addresses are allowed"}), 400

    if not name or not password or not role or not dept:
        return jsonify({"message": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 400

    user = User(
        name     = name,
        email    = email,
        password = generate_password_hash(password),  # ✅ BUG 5 fixed — hashed
        role     = role,
        dept     = dept,
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "user": {
            "id":   user.id,
            "name": user.name,
            "role": user.role,
            "dept": user.dept,
        },
        "token": token
    }), 201