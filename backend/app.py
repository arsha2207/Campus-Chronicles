from dotenv import load_dotenv
load_dotenv()   # ← must be FIRST before everything else

from flask import Flask, send_from_directory, jsonify
import os
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from models import db
import config
from routes.article_routes import article_bp
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp
from routes.notif_routes import notif_bp
from routes.ai_routes import ai_bp
from datetime import timedelta

app = Flask(__name__)
app.config["JWT_SECRET_KEY"]           = "#key#"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)
app.config.from_object(config)

jwt  = JWTManager(app)   # ← only once
CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(article_bp, url_prefix="/articles")
app.register_blueprint(admin_bp,   url_prefix="/admin")
app.register_blueprint(auth_bp,    url_prefix="")
app.register_blueprint(notif_bp,   url_prefix="")
app.register_blueprint(ai_bp,      url_prefix="/ai")

@app.route("/")
def home():
    return {"status": "Backend running"}

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired", "error": "token_expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"message": "Invalid token", "error": str(error)}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"message": "No token provided", "error": str(error)}), 401

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    return send_from_directory(upload_folder, filename)

if __name__ == "__main__":
    app.run(debug=True)