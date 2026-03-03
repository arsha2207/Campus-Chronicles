from flask import Flask
from flask_cors import CORS
from models import db
import config
from routes.article_routes import article_bp
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp

app = Flask(__name__)
CORS(app)

app.config.from_object(config)
db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(article_bp, url_prefix="/api/article")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(auth_bp,  url_prefix="/api")

@app.route("/")
def home():
    return {"status": "Backend running"}
    
if __name__ == "__main__":
    app.run(debug=True)