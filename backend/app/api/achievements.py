from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.achievement import Achievement, UserAchievement
from app.models.user import User

achievements_bp = Blueprint("achievements", __name__)


@achievements_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_achievements():
    """All achievements with earned status for current user."""
    user_id = int(get_jwt_identity())
    all_achievements = Achievement.query.all()
    earned_ids = {
        ua.achievement_id
        for ua in UserAchievement.query.filter_by(user_id=user_id).all()
    }

    result = []
    for ach in all_achievements:
        d = ach.to_dict()
        d["earned"] = ach.id in earned_ids
        result.append(d)

    return jsonify({"achievements": result}), 200


@achievements_bp.route("/earned", methods=["GET"])
@jwt_required()
def get_earned_achievements():
    user_id = int(get_jwt_identity())
    earned = UserAchievement.query.filter_by(user_id=user_id).all()
    return jsonify({"achievements": [ua.to_dict() for ua in earned]}), 200
