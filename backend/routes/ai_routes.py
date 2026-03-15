from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import anthropic 
import os

ai_bp = Blueprint("ai", __name__)

# client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@ai_bp.route("/format", methods=["POST"])
@jwt_required()
def format_article():
    data    = request.json
    title   = data.get("title",   "")
    content = data.get("content", "")

    if not content.strip():
        return jsonify({"message": "Content is required"}), 400

    try:
        message = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 1000,
            messages   = [{
                "role":    "user",
                "content": f"""You are a professional newspaper editor. Format and improve this article for a college newspaper. Fix grammar, improve structure, use formal newspaper style. Return only the formatted article starting with the headline.

Title: {title}
Content: {content}"""
            }]
        )
        formatted = message.content[0].text
        return jsonify({"formatted": formatted})

    except Exception as e:
        return jsonify({"message": f"AI formatting failed: {str(e)}"}), 500