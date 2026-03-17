from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from groq import Groq
import os

ai_bp = Blueprint("ai", __name__)


client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@ai_bp.route("/format", methods=["POST"])
@jwt_required()
def format_article():
    data    = request.json
    title   = data.get("title",   "")
    content = data.get("content", "")

    if not content.strip():
        return jsonify({"message": "Content is required"}), 400

    try:
        response = client.chat.completions.create(
            model      = "llama3-8b-8192",   # free, fast Llama 3 model on Groq
            max_tokens = 1000,
            messages   = [
                {
                    "role": "system",
                    "content": "You are a professional newspaper editor. Format and improve articles for a college newspaper. Fix grammar, improve structure, use formal newspaper style. Return only the formatted article starting with the headline."
                },
                {
                    "role": "user",
                    "content": f"Title: {title}\n\nContent: {content}"
                }
            ]
        )
        formatted = response.choices[0].message.content
        return jsonify({"formatted": formatted})

    except Exception as e:
        return jsonify({"message": f"AI formatting failed: {str(e)}"}), 500