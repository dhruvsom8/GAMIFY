"""
XP Engine — core leveling logic for the gamified skill system.
Handles XP gain, level-up calculations, streak multipliers, and decay.
"""
from __future__ import annotations
import math
from datetime import date, timedelta
from app import db
from app.models.xp_log import XPLog
from app.models.daily_stat import DailyStat


# ─── Level Formula ────────────────────────────────────────────────────────────

def xp_required_for_level(level: int) -> int:
    """Total XP needed to reach a given level from level 1."""
    return int(100 * (level ** 1.5))


def xp_for_next_level(current_level: int) -> int:
    """XP needed to advance from current_level to current_level+1."""
    return xp_required_for_level(current_level + 1) - xp_required_for_level(current_level)


def calculate_level_from_total_xp(total_xp: int) -> tuple[int, int]:
    """
    Given total XP, return (current_level, xp_within_current_level).
    Walks up levels until total_xp is exhausted.
    """
    level = 1
    remaining = total_xp

    while True:
        needed = xp_for_next_level(level)
        if remaining < needed:
            break
        remaining -= needed
        level += 1

    return level, remaining


# ─── Difficulty Multipliers ───────────────────────────────────────────────────

DIFFICULTY_MULTIPLIERS = {
    "easy": 0.75,
    "normal": 1.0,
    "hard": 1.5,
    "boss": 2.5,
}


def get_difficulty_multiplier(difficulty: str) -> float:
    return DIFFICULTY_MULTIPLIERS.get(difficulty, 1.0)


# ─── Streak Multiplier ────────────────────────────────────────────────────────

def get_streak_multiplier(streak: int) -> float:
    """
    Streak bonus caps at 2.0x after 30 days.
    Formula: 1.0 + min(streak * 0.033, 1.0)
    """
    return round(1.0 + min(streak * 0.033, 1.0), 2)


# ─── XP Award ─────────────────────────────────────────────────────────────────

def award_xp(user, skill, quest, session=None) -> dict:
    """
    Award XP to a skill and user after quest completion.
    Returns a result dict with level-up info for frontend animations.
    """
    s = session or db.session

    base_xp = quest.xp_reward
    diff_mult = get_difficulty_multiplier(quest.difficulty)
    streak_mult = get_streak_multiplier(skill.current_streak)
    total_xp = int(base_xp * diff_mult * streak_mult)

    # Snapshot levels before
    skill_level_before = skill.current_level
    user_level_before = user.global_level

    # ── Update skill XP ──
    skill.current_xp += total_xp
    skill.total_xp_earned += total_xp

    # Check skill level-ups
    skill_leveled_up = False
    while skill.current_xp >= xp_for_next_level(skill.current_level):
        skill.current_xp -= xp_for_next_level(skill.current_level)
        skill.current_level += 1
        skill_leveled_up = True

    # ── Update user global XP ──
    user.total_xp += total_xp
    user_level_before_calc = user.global_level
    new_level, _ = calculate_level_from_total_xp(user.total_xp)
    user.global_level = new_level
    user_leveled_up = new_level > user_level_before_calc

    # ── Log XP ──
    xp_log = XPLog(
        user_id=user.id,
        skill_id=skill.id,
        quest_id=quest.id,
        xp_amount=total_xp,
        source="quest",
        description=f"Completed: {quest.title}",
        level_before=skill_level_before,
        level_after=skill.current_level,
        leveled_up=skill_leveled_up,
    )
    s.add(xp_log)

    # ── Update daily stats ──
    _update_daily_stats(user.id, total_xp, s)

    return {
        "xp_awarded": total_xp,
        "base_xp": base_xp,
        "difficulty_multiplier": diff_mult,
        "streak_multiplier": streak_mult,
        "skill_level_before": skill_level_before,
        "skill_level_after": skill.current_level,
        "skill_leveled_up": skill_leveled_up,
        "user_level_before": user_level_before,
        "user_level_after": user.global_level,
        "user_leveled_up": user_leveled_up,
        "skill_xp_progress": skill.current_xp,
        "skill_xp_needed": xp_for_next_level(skill.current_level),
    }


# ─── Streak Management ────────────────────────────────────────────────────────

def update_streak(user, skill, completion_date: date = None) -> dict:
    """
    Update streak for user and skill after quest completion.
    Returns streak info.
    """
    today = completion_date or date.today()

    # ── Skill streak ──
    if skill.last_quest_date is None:
        skill.current_streak = 1
    elif skill.last_quest_date == today - timedelta(days=1):
        skill.current_streak += 1
    elif skill.last_quest_date == today:
        pass  # already updated today
    else:
        skill.current_streak = 1  # streak broken

    skill.last_quest_date = today
    if skill.current_streak > skill.longest_streak:
        skill.longest_streak = skill.current_streak

    # ── User global streak ──
    if user.last_active_date is None:
        user.current_streak = 1
    elif user.last_active_date == today - timedelta(days=1):
        user.current_streak += 1
    elif user.last_active_date == today:
        pass
    else:
        user.current_streak = 1

    user.last_active_date = today
    if user.current_streak > user.longest_streak:
        user.longest_streak = user.current_streak

    return {
        "skill_streak": skill.current_streak,
        "user_streak": user.current_streak,
        "streak_multiplier": get_streak_multiplier(skill.current_streak),
    }


# ─── Skill Decay ──────────────────────────────────────────────────────────────

def apply_skill_decay(skill, days_inactive: int) -> int:
    """
    Apply XP decay for inactive skills.
    Loses 5% of current XP per day inactive (min 0).
    Returns XP lost.
    """
    if not skill.decay_enabled or days_inactive <= 0:
        return 0

    decay_rate = 0.05
    xp_lost = int(skill.current_xp * decay_rate * days_inactive)
    xp_lost = min(xp_lost, skill.current_xp)

    skill.current_xp = max(0, skill.current_xp - xp_lost)

    # Recalculate level after decay
    if skill.current_xp == 0 and skill.current_level > 1:
        skill.current_level = max(1, skill.current_level - 1)

    return xp_lost


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _update_daily_stats(user_id: int, xp_earned: int, session) -> None:
    today = date.today()
    stat = session.query(DailyStat).filter_by(user_id=user_id, date=today).first()
    if not stat:
        stat = DailyStat(user_id=user_id, date=today, xp_earned=0, quests_completed=0)
        session.add(stat)
    stat.xp_earned += xp_earned
    stat.quests_completed += 1
