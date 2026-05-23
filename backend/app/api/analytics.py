from datetime import date, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models.daily_stat import DailyStat
from app.models.xp_log import XPLog
from app.models.quest import SideQuest
from app.models.skill import Skill
from app.models.user import User

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    user_id = int(get_jwt_identity())
    user = db.get_or_404(User, user_id)
    today = date.today()

    # Today's stats
    today_stat = DailyStat.query.filter_by(user_id=user_id, date=today).first()

    # Today's quests
    today_quests = SideQuest.query.filter_by(
        user_id=user_id, due_date=today
    ).filter(SideQuest.status.in_(["pending", "completed"])).all()

    # Active skills
    skills = Skill.query.filter_by(user_id=user_id, is_active=True).all()

    # Weekly XP (last 7 days)
    week_ago = today - timedelta(days=6)
    weekly_stats = DailyStat.query.filter(
        DailyStat.user_id == user_id,
        DailyStat.date >= week_ago,
        DailyStat.date <= today
    ).order_by(DailyStat.date.asc()).all()

    # Build 7-day chart data (fill missing days with 0)
    weekly_chart = []
    for i in range(7):
        d = week_ago + timedelta(days=i)
        stat = next((s for s in weekly_stats if s.date == d), None)
        weekly_chart.append({
            "date": d.isoformat(),
            "xp_earned": stat.xp_earned if stat else 0,
            "quests_completed": stat.quests_completed if stat else 0,
        })

    # Heatmap: last 90 days
    ninety_ago = today - timedelta(days=89)
    heatmap_stats = DailyStat.query.filter(
        DailyStat.user_id == user_id,
        DailyStat.date >= ninety_ago,
    ).all()
    heatmap = {s.date.isoformat(): s.quests_completed for s in heatmap_stats}

    return jsonify({
        "user": user.to_dict(),
        "today": {
            "xp_earned": today_stat.xp_earned if today_stat else 0,
            "quests_completed": today_stat.quests_completed if today_stat else 0,
            "quests_failed": today_stat.quests_failed if today_stat else 0,
        },
        "today_quests": [q.to_dict() for q in today_quests],
        "skills": [s.to_dict() for s in skills],
        "weekly_chart": weekly_chart,
        "heatmap": heatmap,
        "total_skills": len(skills),
    }), 200


@analytics_bp.route("/xp-history", methods=["GET"])
@jwt_required()
def xp_history():
    user_id = int(get_jwt_identity())
    days = request.args.get("days", 30, type=int)
    since = date.today() - timedelta(days=days)

    logs = XPLog.query.filter(
        XPLog.user_id == user_id,
        XPLog.created_at >= since
    ).order_by(XPLog.created_at.desc()).limit(100).all()

    return jsonify({"xp_logs": [l.to_dict() for l in logs]}), 200


@analytics_bp.route("/skill-breakdown", methods=["GET"])
@jwt_required()
def skill_breakdown():
    user_id = int(get_jwt_identity())

    # XP per skill
    breakdown = db.session.query(
        Skill.id, Skill.name, Skill.icon, Skill.color,
        Skill.current_level, Skill.total_xp_earned,
        Skill.total_quests_completed
    ).filter_by(user_id=user_id, is_active=True).all()

    return jsonify({
        "skills": [
            {
                "id": row.id,
                "name": row.name,
                "icon": row.icon,
                "color": row.color,
                "level": row.current_level,
                "total_xp": row.total_xp_earned,
                "quests_completed": row.total_quests_completed,
            }
            for row in breakdown
        ]
    }), 200
