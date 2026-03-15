from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Article, User
import os
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # ← creates on startup

article_bp = Blueprint("article", __name__)

@article_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_article():
    current_user_id = int(get_jwt_identity())

    title    = request.form.get("title")
    content  = request.form.get("content")
    category = request.form.get("category")

    if not title or not content or not category:
        return jsonify({"message": "Title, content and category are required"}), 400

    image     = request.files.get("image")
    image_url = None
    if image:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = f"{current_user_id}_{image.filename}"
        image.save(os.path.join(UPLOAD_FOLDER, filename))
        image_url = f"/uploads/{filename}"

    article = Article(
        title     = title,
        content   = content,
        category  = category,
        author_id = current_user_id,   # ✅ matches model
        image_url = image_url,         # ✅ matches model
    )
    db.session.add(article)
    db.session.commit()

    return jsonify({"message": "Submitted for review", "id": article.id}), 201


@article_bp.route("/approved")           # ✅ matches React fetchArticles()
@jwt_required()
def get_articles():
    cat      = request.args.get("cat",  "All")
    page     = request.args.get("page", 1, type=int)
    per_page = 10

    query = Article.query.filter_by(status="approved")

    if cat != "All":
        query = query.filter_by(category=cat)

    total    = query.count()
    articles = query.order_by(Article.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        "articles": [a.to_dict() for a in articles],
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "has_more": (page * per_page) < total
    })

@article_bp.route("/<int:id>")
@jwt_required()
def get_article(id):
    article = Article.query.get_or_404(id)
    return jsonify({ "article": article.to_dict() })


@article_bp.route("/search")             # ✅ matches React searchArticles()
@jwt_required()
def search_articles():
    q     = request.args.get("q",     "")
    cat   = request.args.get("cat",   "")
    date = request.args.get("date", "")
    
    query = Article.query.filter_by(status="approved")

    if q:
        query = query.filter(
            db.or_(
                Article.title.ilike(f"%{q}%"),
                Article.content.ilike(f"%{q}%"),
                Article.author.has(User.name.ilike(f"%{q}%"))  # ✅ search by author name via relationship
            )
        )

    if cat:
        query = query.filter_by(category=cat)

    if date:
        try:
            from datetime import datetime
            parsed = datetime.strptime(date, "%Y-%m-%d").date()
            query  = query.filter(db.func.date(Article.created_at) == parsed)
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400

    results = query.order_by(Article.created_at.desc()).all()

    return jsonify({
        "results": [a.to_dict() for a in results]
    })