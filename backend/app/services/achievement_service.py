"""
Achievement service — checks and awards badges after quest completion.
"""
from app import db
from app.models.achievement import Achievement, UserAchievement
from app.models.xp_log import XPLog


# Achievement definitions — seeded into DB on startup
ACHIEVEMENT_DEFINITIONS = [
    {"key": "first_quest", "name": "First Blood", "description": "Complete your first quest", "icon": "sword", "xp_bonus": 50, "rarity": "common"},
    {"key": "quest_10", "name": "Side Hustler", "description": "Complete 10 quests", "icon": "scroll", "xp_bonus": 100, "rarity": "common"},
    {"key": "quest_50", "name": "Grinder", "description": "Complete 50 quests", "icon": "shield", "xp_bonus": 250, "rarity": "rare"},
    {"key": "quest_100", "name": "Legend", "description": "Complete 100 quests", "icon": "crown", "xp_bonus": 500, "rarity": "epic"},
    {"key": "streak_7", "name": "Week Warrior", "description": "Maintain a 7-day streak", "icon": "fire", "xp_bonus": 150, "rarity": "common"},
    {"key": "streak_30", "name": "Monthly Master", "description": "Maintain a 30-day streak", "icon": "star", "xp_bonus": 500, "rarity": "rare"},
    {"key": "streak_100", "name": "Centurion", "description": "Maintain a 100-day streak", "icon": "diamond", "xp_bonus": 2000, "rarity": "legendary"},
    {"key": "level_5", "name": "Apprentice", "description": "Reach level 5 in any skill", "icon": "book", "xp_bonus": 200, "rarity": "common"},
    {"key": "level_10", "name": "Journeyman", "description": "Reach level 10 in any skill", "icon": "gem", "xp_bonus": 500, "rarity": "rare"},
    {"key": "level_20", "name": "Master", "description": "Reach level 20 in any skill", "icon": "trophy", "xp_bonus": 1000, "rarity": "epic"},
    {"key": "boss_slayer", "name": "Boss Slayer", "description": "Complete a boss battle quest", "icon": "skull", "xp_bonus": 300, "rarity": "rare"},
    {"key": "skill_collector", "name": "Skill Collector", "description": "Create 5 different skills", "icon": "bag", "xp_bonus": 200, "rarity": "common"},
]


def seed_achievements():
    """Seed achievement definitions into the database."""
    for ach_data in ACHIEVEMENT_DEFINITIONS:
        existing = Achievement.query.filter_by(key=ach_data["key"]).first()
        if not existing:
            ach = Achievement(**ach_data)
            db.session.add(ach)
    db.session.commit()


def check_and_award_achievements(user, skill, quest, xp_result: dict) -> list:
    """
    Check all achievement conditions and award any newly earned ones.
    Returns list of newly earned achievement dicts.
    """
    earned = []

    checks = [
        ("first_quest", lambda: user.total_quests_completed >= 1),
        ("quest_10", lambda: user.total_quests_completed >= 10),
        ("quest_50", lambda: user.total_quests_completed >= 50),
        ("quest_100", lambda: user.total_quests_completed >= 100),
        ("streak_7", lambda: user.current_streak >= 7),
        ("streak_30", lambda: user.current_streak >= 30),
        ("streak_100", lambda: user.current_streak >= 100),
        ("level_5", lambda: skill.current_level >= 5),
        ("level_10", lambda: skill.current_level >= 10),
        ("level_20", lambda: skill.current_level >= 20),
        ("boss_slayer", lambda: quest.is_boss_battle),
        ("skill_collector", lambda: user.skills.count() >= 5),
    ]

    for key, condition in checks:
        if _award_if_not_earned(user, key, condition):
            ach = Achievement.query.filter_by(key=key).first()
            if ach:
                # Award bonus XP for achievement
                if ach.xp_bonus > 0:
                    user.total_xp += ach.xp_bonus
                    skill.current_xp += ach.xp_bonus
                    skill.total_xp_earned += ach.xp_bonus
                earned.append(ach.to_dict())

    return earned


def _award_if_not_earned(user, achievement_key: str, condition_fn) -> bool:
    """Award achievement if condition met and not already earned."""
    ach = Achievement.query.filter_by(key=achievement_key).first()
    if not ach:
        return False

    already_earned = UserAchievement.query.filter_by(
        user_id=user.id, achievement_id=ach.id
    ).first()

    if already_earned:
        return False

    if condition_fn():
        ua = UserAchievement(user_id=user.id, achievement_id=ach.id)
        db.session.add(ua)
        return True

    return False
