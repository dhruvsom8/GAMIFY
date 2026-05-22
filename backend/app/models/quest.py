from datetime import datetime
from app import db


class SideQuest(db.Model):
    __tablename__ = "side_quests"

    id = db.Column(db.Integer, primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(1000), default="")

    # Rewards
    xp_reward = db.Column(db.Integer, default=50, nullable=False)
    difficulty = db.Column(db.String(20), default="normal")  # easy, normal, hard, boss

    # Status
    status = db.Column(db.String(20), default="pending", nullable=False, index=True)
    # pending | completed | failed | skipped

    # Scheduling
    due_date = db.Column(db.Date, nullable=True)
    estimated_duration = db.Column(db.Integer, default=30)  # minutes
    sort_order = db.Column(db.Integer, default=0)

    # Recurrence
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_type = db.Column(db.String(20), nullable=True)  # daily, weekly, monthly
    recurrence_days = db.Column(db.String(50), nullable=True)  # e.g. "1,3,5" for Mon/Wed/Fri

    # Boss battle flag
    is_boss_battle = db.Column(db.Boolean, default=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # XP multiplier (for streaks/bonuses)
    xp_multiplier = db.Column(db.Float, default=1.0)

    def final_xp(self):
        return int(self.xp_reward * self.xp_multiplier)

    def to_dict(self):
        return {
            "id": self.id,
            "skill_id": self.skill_id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "xp_reward": self.xp_reward,
            "final_xp": self.final_xp(),
            "difficulty": self.difficulty,
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "estimated_duration": self.estimated_duration,
            "sort_order": self.sort_order,
            "is_recurring": self.is_recurring,
            "recurrence_type": self.recurrence_type,
            "recurrence_days": self.recurrence_days,
            "is_boss_battle": self.is_boss_battle,
            "xp_multiplier": self.xp_multiplier,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

    def __repr__(self):
        return f"<SideQuest {self.title} [{self.status}]>"
