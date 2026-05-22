from datetime import datetime
from app import db


class DailyStat(db.Model):
    __tablename__ = "daily_stats"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    date = db.Column(db.Date, nullable=False, index=True)
    xp_earned = db.Column(db.Integer, default=0)
    quests_completed = db.Column(db.Integer, default=0)
    quests_failed = db.Column(db.Integer, default=0)
    skills_active = db.Column(db.Integer, default=0)
    streak_day = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "date", name="uq_daily_stat_user_date"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date.isoformat(),
            "xp_earned": self.xp_earned,
            "quests_completed": self.quests_completed,
            "quests_failed": self.quests_failed,
            "skills_active": self.skills_active,
            "streak_day": self.streak_day,
        }
