from datetime import datetime
from app import db


class StreakLog(db.Model):
    __tablename__ = "streak_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id", ondelete="CASCADE"), nullable=True, index=True)

    date = db.Column(db.Date, nullable=False, index=True)
    streak_count = db.Column(db.Integer, nullable=False)
    quests_completed = db.Column(db.Integer, default=0)
    xp_earned = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "skill_id", "date", name="uq_streak_user_skill_date"),
        db.Index("ix_streak_user_date", "user_id", "date"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skill_id": self.skill_id,
            "date": self.date.isoformat(),
            "streak_count": self.streak_count,
            "quests_completed": self.quests_completed,
            "xp_earned": self.xp_earned,
        }
