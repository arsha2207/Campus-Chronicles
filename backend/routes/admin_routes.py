from flask import Blueprint, jsonify, request
from models import Article, db, User
from flask_jwt_extended import jwt_required, get_jwt_identity  # ✅ added get_jwt_identity

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/pending")
@jwt_required()
def pending_articles():
    articles = Article.query.filter_by(status="pending").order_by(Article.created_at.desc()).all()
    return jsonify({
        "articles": [a.to_dict() for a in articles]
    })


@admin_bp.route("/approved")             # ✅ added — React fetchApproved() calls this
@jwt_required()
def approved_articles():
    articles = Article.query.filter_by(status="approved").order_by(Article.created_at.desc()).all()
    return jsonify({
        "articles": [a.to_dict() for a in articles]
    })


@admin_bp.route("/approve/<int:id>", methods=["POST"])
@jwt_required()
def approve_article(id):
    article = Article.query.get_or_404(id)
    article.status = "approved"
    article.remark = None
    db.session.commit()
    return jsonify({"message": "Article approved"})


@admin_bp.route("/reject/<int:id>", methods=["POST"])
@jwt_required()
def reject_article(id):
    article        = Article.query.get_or_404(id)
    data           = request.json or {}
    article.status = "rejected"
    article.remark = data.get("remark", "")
    db.session.commit()
    return jsonify({"message": "Article rejected"})


@admin_bp.route("/users")
@jwt_required()
def get_users():
    current_user_id = int(get_jwt_identity())
    current_user    = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    users = User.query.all()
    return jsonify({
        "users": [{
            "id":    u.id,
            "name":  u.name,
            "email": u.email,
            "role":  u.role,
            "dept":  u.dept,
            "year":  u.year,
        } for u in users]
    })                                   # ✅ function ends here


@admin_bp.route("/stats")               # ✅ no longer indented inside get_users
@jwt_required()
def get_stats():
    current_user_id = int(get_jwt_identity())
    current_user    = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    category_stats = db.session.query(
        Article.category,
        db.func.count(Article.id).label("count")
    ).filter_by(status="approved").group_by(Article.category).all()

    total_articles = Article.query.count()
    pending_count  = Article.query.filter_by(status="pending").count()
    approved_count = Article.query.filter_by(status="approved").count()
    rejected_count = Article.query.filter_by(status="rejected").count()
    total_users    = User.query.count()
    student_count  = User.query.filter_by(role="student").count()

    return jsonify({
        "stats": [{"category": cat, "count": count} for cat, count in category_stats],
        "summary": {
            "total_articles": total_articles,
            "pending":        pending_count,
            "approved":       approved_count,
            "rejected":       rejected_count,
            "total_users":    total_users,
            "total_students": student_count,
        }
    })