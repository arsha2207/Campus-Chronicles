from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Article, User

notif_bp = Blueprint("notifications", __name__)

@notif_bp.route("/notifications")
@jwt_required()
def get_notifications():
    current_user_id = int(get_jwt_identity())

    articles = Article.query.filter(
        Article.author_id == current_user_id,
        Article.status.in_(["approved", "rejected"]),
        Article.dismissed == False
    ).order_by(Article.created_at.desc()).all()

    notifications = []
    for a in articles:
        notifications.append({
            "id":      a.id,
            "type":    a.status,
            "title":   a.title,
            "message": "Your article has been approved and published." if a.status == "approved"
                       else (a.remark or "Your article was not accepted."),
            "dt":      a.created_at.strftime("%B %d, %Y"),
            "is_read": a.is_read,
            "article": a.to_dict(),
        })

    return jsonify({"notifications": notifications})


@notif_bp.route("/notifications/<int:id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(id):
    current_user_id = int(get_jwt_identity())
    article = Article.query.filter_by(id=id, author_id=current_user_id).first_or_404()
    article.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"})


@notif_bp.route("/notifications/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_read():
    current_user_id = int(get_jwt_identity())
    Article.query.filter(
        Article.author_id == current_user_id,
        Article.status.in_(["approved", "rejected"])
    ).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All marked as read"})


@notif_bp.route("/notifications/<int:id>", methods=["DELETE"])
@jwt_required()
def dismiss_notif(id):
    current_user_id = int(get_jwt_identity())
    article = Article.query.filter_by(id=id, author_id=current_user_id).first_or_404()
    article.dismissed = True
    db.session.commit()
    return jsonify({"message": "Dismissed"})