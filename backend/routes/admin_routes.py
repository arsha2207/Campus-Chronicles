from flask import Blueprint, jsonify, request
from models import Article, db

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/pending")
def pending_articles():
    articles = Article.query.filter_by(status="pending").all()
    return jsonify([{
        "id": a.id,
        "title": a.title,
        "content": a.content
    } for a in articles])

@admin_bp.route("/approve/<int:id>", methods=["POST"])
def approve_article(id):
    article = Article.query.get(id)
    if not article:
        return {"error": "Article not found"}, 404
    article.status = "approved"
    article.remark = None
    db.session.commit()
    return {"message": "Article approved"}

@admin_bp.route("/reject/<int:id>", methods=["POST"])
def reject_article(id):
    data = request.get_json()

    article = Article.query.get(id)
    if not article:
        return {"error": "Article not found"}, 404

    article.status = "rejected"
    article.remark = data.get("remark")

    db.session.commit()
    return {"message": "Article rejected"}
