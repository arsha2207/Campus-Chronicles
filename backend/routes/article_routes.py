from flask import Blueprint, request, jsonify
from models import db, Article

article_bp = Blueprint("article", __name__)

@article_bp.route("/submit", methods=["POST"])
def submit_article():
    data = request.json

    article = Article(
        title=data["title"],
        content=data["content"],
        user_id=data["user_id"]
    )

    db.session.add(article)
    db.session.commit()

    return jsonify({"message": "Article submitted for approval"})

@article_bp.route("/approved")
def approved_articles():
    articles = Article.query.filter_by(status="approved").all()
    return jsonify([{
        "id": a.id,
        "title": a.title,
        "content": a.content
    } for a in articles])

@article_bp.route("/myarticles/<int:user_id>")
def my_articles(user_id):
    articles = Article.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": a.id,
            "title": a.title,
            "status": a.status,
            "remark": a.remark
        }
        for a in articles
    ])
