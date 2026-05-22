"""
Quest service — handles quest completion, failure, and recurrence logic.
"""
from __future__ import annotations
from datetime import datetime, date, timedelta
from app import db
from app.models.quest import SideQuest
from app.services.xp_engine import award_xp, update_streak
from app.services.achievement_service import check_and_award_achievements


def complete_quest(user, skill, quest) -> dict:
    """
    Mark a quest as completed, award XP, update streaks, check achievements.
    Returns full result payload for frontend animations.
    """
    if quest.status == "completed":
        return {"error": "Quest already completed"}

    quest.status = "completed"
    quest.completed_at = datetime.utcnow()

    # Update skill + user quest counts
    skill.total_quests_completed += 1
    user.total_quests_completed += 1

    # Update streaks
    streak_result = update_streak(user, skill)

    # Apply streak multiplier to quest
    quest.xp_multiplier = streak_result["streak_multiplier"]

    # Award XP
    xp_result = award_xp(user, skill, quest)

    # Check achievements
    new_achievements = check_and_award_achievements(user, skill, quest, xp_result)

    # Handle recurring quest — spawn next occurrence
    next_quest = None
    if quest.is_recurring:
        next_quest = _spawn_recurring_quest(quest)
        if next_quest:
            db.session.add(next_quest)

    db.session.commit()

    return {
        "quest": quest.to_dict(),
        "xp_result": xp_result,
        "streak_result": streak_result,
        "new_achievements": new_achievements,
        "next_quest": next_quest.to_dict() if next_quest else None,
    }


def fail_quest(user, skill, quest) -> dict:
    """Mark a quest as failed and apply penalties if enabled."""
    if quest.status in ("completed", "failed"):
        return {"error": f"Quest already {quest.status}"}

    quest.status = "failed"
    skill.total_quests_failed += 1

    # Break streak if penalty enabled
    if user.streak_penalty_enabled:
        skill.current_streak = 0
        user.current_streak = 0

    db.session.commit()

    return {"quest": quest.to_dict(), "streak_broken": user.streak_penalty_enabled}


def _spawn_recurring_quest(quest: SideQuest) -> SideQuest | None:
    """Create the next occurrence of a recurring quest."""
    if not quest.due_date:
        return None

    next_due = None
    if quest.recurrence_type == "daily":
        next_due = quest.due_date + timedelta(days=1)
    elif quest.recurrence_type == "weekly":
        next_due = quest.due_date + timedelta(weeks=1)
    elif quest.recurrence_type == "monthly":
        # Approximate: add 30 days
        next_due = quest.due_date + timedelta(days=30)

    if not next_due:
        return None

    return SideQuest(
        skill_id=quest.skill_id,
        user_id=quest.user_id,
        title=quest.title,
        description=quest.description,
        xp_reward=quest.xp_reward,
        difficulty=quest.difficulty,
        status="pending",
        due_date=next_due,
        estimated_duration=quest.estimated_duration,
        is_recurring=True,
        recurrence_type=quest.recurrence_type,
        recurrence_days=quest.recurrence_days,
        is_boss_battle=quest.is_boss_battle,
        sort_order=quest.sort_order,
    )
