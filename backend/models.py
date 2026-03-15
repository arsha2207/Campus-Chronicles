from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    role = db.Column(db.String(20),default='student')  
    dept = db.Column(db.String(100))
    year = db.Column(db.String(20))

class Article(db.Model):
    id               = db.Column(db.Integer, primary_key=True)
    title            = db.Column(db.String(200))
    content          = db.Column(db.Text)
    category         = db.Column(db.String(50))
    author_id        = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)  # ← links to User
    author           = db.relationship("User", backref="articles")  # ← lets you do article.author.name
    status           = db.Column(db.String(20), default="pending")
    remark = db.Column(db.String(300), nullable=True)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
    image_url        = db.Column(db.String(300), nullable=True)
    is_read   = db.Column(db.Boolean, default=False)
    dismissed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id":               self.id,
            "hl":               self.title,
            "body":             self.content, 
            "sm":               self.content[:150],
            "cat":              self.category,
            "au":               self.author.name,   # ← gets name from User table
            "dept":             self.author.dept,   # ← gets dept too
            "dt":               self.created_at.strftime("%B %d, %Y"),
            "mo":               self.created_at.strftime("%B %Y"),
            "status":           self.status,
            "remark":           self.remark,
            "image_url":        self.image_url,
            "img":              self.image_url,
            "is_read":         self.is_read,
            "dismissed":       self.dismissed,
        }