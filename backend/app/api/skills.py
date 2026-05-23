from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc
from app import db
from app.models.skill import Skill
from app.models.xp_log import XPLog
from app.utils.validators import validate_required_fields
from app.utils.pagination import paginate_query

skills_bp = Blueprint("skills", __name__)


@skills_bp.route("/", methods=["GET"])
@jwt_required()
def get_skills():
    user_id = int(get_jwt_identity())
    skills = Skill.query.filter_by(user_id=user_id, is_active=True).order_by(Skill.created_at.desc()).all()
    return jsonify({"skills": [s.to_dict() for s in skills]}), 200


@skills_bp.route("/<int:skill_id>", methods=["GET"])
@jwt_required()
def get_skill(skill_id):
    user_id = int(get_jwt_identity())
    skill = Skill.query.filter_by(id=skill_id, user_id=user_id).first_or_404()
    return jsonify({"skill": skill.to_dict()}), 200


@skills_bp.route("/", methods=["POST"])
@jwt_required()
def create_skill():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    err = validate_required_fields(data, ["name"])
    if err:
        return jsonify({"error": err}), 400

    skill = Skill(
        user_id=user_id,
        name=data["name"],
        description=data.get("description", ""),
        icon=data.get("icon", "sword"),
        color=data.get("color", "#4ade80"),
        decay_enabled=data.get("decay_enabled", False),
    )
    db.session.add(skill)
    db.session.commit()
    return jsonify({"skill": skill.to_dict()}), 201


@skills_bp.route("/<int:skill_id>", methods=["PUT"])
@jwt_required()
def update_skill(skill_id):
    user_id = int(get_jwt_identity())
    skill = Skill.query.filter_by(id=skill_id, user_id=user_id).first_or_404()
    data = request.get_json()

    allowed = ["name", "description", "icon", "color", "decay_enabled", "is_active"]
    for field in allowed:
        if field in data:
            setattr(skill, field, data[field])

    db.session.commit()
    return jsonify({"skill": skill.to_dict()}), 200


@skills_bp.route("/<int:skill_id>", methods=["DELETE"])
@jwt_required()
def delete_skill(skill_id):
    user_id = int(get_jwt_identity())
    skill = Skill.query.filter_by(id=skill_id, user_id=user_id).first_or_404()
    db.session.delete(skill)
    db.session.commit()
    return jsonify({"message": "Skill deleted"}), 200


@skills_bp.route("/<int:skill_id>/xp-logs", methods=["GET"])
@jwt_required()
def get_skill_xp_logs(skill_id):
    user_id = int(get_jwt_identity())
    skill = Skill.query.filter_by(id=skill_id, user_id=user_id).first_or_404()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    result = paginate_query(skill.xp_logs.order_by(desc(XPLog.created_at)), page, per_page)
    return jsonify(result), 200
