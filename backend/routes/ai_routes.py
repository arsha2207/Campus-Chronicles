from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import google.generativeai as genai
import os

ai_bp = Blueprint("ai", __name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@ai_bp.route("/format", methods=["POST"])
@jwt_required()
def format_article():
    data    = request.json
    title   = data.get("title",   "")
    content = data.get("content", "")

    if not content.strip():
        return jsonify({"message": "Content is required"}), 400

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""You are a professional newspaper editor for a college newspaper.

Your job is to enhance and format the following article submission:
- Improve and sharpen the headline
- Add a compelling subheading (one line summary)
- Fix grammar, spelling, and punctuation
- Improve sentence structure and flow
- Use formal newspaper style
- Keep the original meaning and facts intact

Return the result in this exact format:
HEADLINE: <improved headline>
SUBHEADING: <one line subheading>
CONTENT:
<improved article body>

Article to format:
Title: {title}

Content:
{content}"""

        response = model.generate_content(prompt)
        formatted = response.text
        return jsonify({"formatted": formatted})

    except Exception as e:
        return jsonify({"message": f"AI formatting failed: {str(e)}"}), 500