from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.quest import SideQuest
from app.models.skill import Skill
from app.models.user import User
from app.services.quest_service import complete_quest, fail_quest
from app.utils.validators import validate_required_fields
from app.utils.pagination import paginate_query

quests_bp = Blueprint("quests", __name__)


def _get_user_quest(quest_id, user_id):
    return SideQuest.query.filter_by(id=quest_id, user_id=user_id).first_or_404()


@quests_bp.route("/", methods=["GET"])
@jwt_required()
def get_quests():
    user_id = int(get_jwt_identity())
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    skill_id = request.args.get("skill_id", type=int)
    status = request.args.get("status")
    due_today = request.args.get("due_today", type=bool)

    query = SideQuest.query.filter_by(user_id=user_id)
    if skill_id:
        query = query.filter_by(skill_id=skill_id)
    if status:
        query = query.filter_by(status=status)
    if due_today:
        query = query.filter_by(due_date=date.today())

    query = query.order_by(SideQuest.sort_order.asc(), SideQuest.created_at.desc())
    result = paginate_query(query, page, per_page)
    return jsonify(result), 200


@quests_bp.route("/today", methods=["GET"])
@jwt_required()
def get_today_quests():
    user_id = int(get_jwt_identity())
    quests = SideQuest.query.filter_by(
        user_id=user_id, due_date=date.today()
    ).filter(SideQuest.status.in_(["pending", "completed"])).order_by(
        SideQuest.sort_order.asc()
    ).all()
    return jsonify({"quests": [q.to_dict() for q in quests]}), 200


@quests_bp.route("/<int:quest_id>", methods=["GET"])
@jwt_required()
def get_quest(quest_id):
    user_id = int(get_jwt_identity())
    quest = _get_user_quest(quest_id, user_id)
    return jsonify({"quest": quest.to_dict()}), 200


@quests_bp.route("/", methods=["POST"])
@jwt_required()
def create_quest():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    err = validate_required_fields(data, ["title", "skill_id"])
    if err:
        return jsonify({"error": err}), 400

    # Verify skill belongs to user
    skill = Skill.query.filter_by(id=data["skill_id"], user_id=user_id).first_or_404()

    due_date = None
    if data.get("due_date"):
        due_date = date.fromisoformat(data["due_date"])

    quest = SideQuest(
        user_id=user_id,
        skill_id=skill.id,
        title=data["title"],
        description=data.get("description", ""),
        xp_reward=data.get("xp_reward", 50),
        difficulty=data.get("difficulty", "normal"),
        due_date=due_date,
        estimated_duration=data.get("estimated_duration", 30),
        is_recurring=data.get("is_recurring", False),
        recurrence_type=data.get("recurrence_type"),
        recurrence_days=data.get("recurrence_days"),
        is_boss_battle=data.get("is_boss_battle", False),
        sort_order=data.get("sort_order", 0),
    )
    db.session.add(quest)
    db.session.commit()
    return jsonify({"quest": quest.to_dict()}), 201


@quests_bp.route("/<int:quest_id>", methods=["PUT"])
@jwt_required()
def update_quest(quest_id):
    user_id = int(get_jwt_identity())
    quest = _get_user_quest(quest_id, user_id)
    data = request.get_json()

    allowed = ["title", "description", "xp_reward", "difficulty", "due_date",
               "estimated_duration", "is_recurring", "recurrence_type",
               "recurrence_days", "is_boss_battle", "sort_order"]
    for field in allowed:
        if field in data:
            if field == "due_date" and data[field]:
                setattr(quest, field, date.fromisoformat(data[field]))
            else:
                setattr(quest, field, data[field])

    db.session.commit()
    return jsonify({"quest": quest.to_dict()}), 200


@quests_bp.route("/<int:quest_id>", methods=["DELETE"])
@jwt_required()
def delete_quest(quest_id):
    user_id = int(get_jwt_identity())
    quest = _get_user_quest(quest_id, user_id)
    db.session.delete(quest)
    db.session.commit()
    return jsonify({"message": "Quest deleted"}), 200


@quests_bp.route("/<int:quest_id>/complete", methods=["POST"])
@jwt_required()
def complete_quest_route(quest_id):
    user_id = int(get_jwt_identity())
    quest = _get_user_quest(quest_id, user_id)
    skill = db.get_or_404(Skill, quest.skill_id)
    user = db.get_or_404(User, user_id)

    result = complete_quest(user, skill, quest)
    if "error" in result:
        return jsonify(result), 400

    return jsonify(result), 200


@quests_bp.route("/<int:quest_id>/fail", methods=["POST"])
@jwt_required()
def fail_quest_route(quest_id):
    user_id = int(get_jwt_identity())
    quest = _get_user_quest(quest_id, user_id)
    skill = db.get_or_404(Skill, quest.skill_id)
    user = db.get_or_404(User, user_id)

    result = fail_quest(user, skill, quest)
    if "error" in result:
        return jsonify(result), 400

    return jsonify(result), 200


@quests_bp.route("/reorder", methods=["POST"])
@jwt_required()
def reorder_quests():
    """Drag-and-drop reorder: expects [{id, sort_order}, ...]"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    items = data.get("items", [])

    for item in items:
        quest = SideQuest.query.filter_by(id=item["id"], user_id=user_id).first()
        if quest:
            quest.sort_order = item["sort_order"]

    db.session.commit()
    return jsonify({"message": "Reordered"}), 200
