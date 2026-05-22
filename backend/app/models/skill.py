from datetime import datetime
from app import db


class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), default="")
    icon = db.Column(db.String(50), default="sword")  # pixel icon key
    color = db.Column(db.String(20), default="#4ade80")  # accent color

    # Progression
    current_xp = db.Column(db.Integer, default=0, nullable=False)
    current_level = db.Column(db.Integer, default=1, nullable=False)
    total_xp_earned = db.Column(db.Integer, default=0, nullable=False)

    # Stats
    current_streak = db.Column(db.Integer, default=0, nullable=False)
    longest_streak = db.Column(db.Integer, default=0, nullable=False)
    total_quests_completed = db.Column(db.Integer, default=0, nullable=False)
    total_quests_failed = db.Column(db.Integer, default=0, nullable=False)
    last_quest_date = db.Column(db.Date, nullable=True)

    # Decay system
    decay_enabled = db.Column(db.Boolean, default=False)
    last_decay_date = db.Column(db.Date, nullable=True)

    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    quests = db.relationship("SideQuest", backref="skill", lazy="dynamic", cascade="all, delete-orphan")
    xp_logs = db.relationship("XPLog", backref="skill", lazy="dynamic")

    def xp_for_next_level(self):
        """XP required to reach next level from current level."""
        return int(100 * (self.current_level ** 1.5))

    def xp_progress_percent(self):
        needed = self.xp_for_next_level()
        return min(100, int((self.current_xp / needed) * 100)) if needed > 0 else 100

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "color": self.color,
            "current_xp": self.current_xp,
            "current_level": self.current_level,
            "total_xp_earned": self.total_xp_earned,
            "xp_for_next_level": self.xp_for_next_level(),
            "xp_progress_percent": self.xp_progress_percent(),
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "total_quests_completed": self.total_quests_completed,
            "total_quests_failed": self.total_quests_failed,
            "decay_enabled": self.decay_enabled,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Skill {self.name} Lv.{self.current_level}>"
