from datetime import datetime
from app import db


class XPLog(db.Model):
    __tablename__ = "xp_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id"), nullable=True, index=True)
    quest_id = db.Column(db.Integer, db.ForeignKey("side_quests.id"), nullable=True)

    xp_amount = db.Column(db.Integer, nullable=False)
    source = db.Column(db.String(50), default="quest")  # quest, bonus, achievement, decay
    description = db.Column(db.String(200), default="")

    # Level snapshot at time of log
    level_before = db.Column(db.Integer, nullable=False)
    level_after = db.Column(db.Integer, nullable=False)
    leveled_up = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skill_id": self.skill_id,
            "quest_id": self.quest_id,
            "xp_amount": self.xp_amount,
            "source": self.source,
            "description": self.description,
            "level_before": self.level_before,
            "level_after": self.level_after,
            "leveled_up": self.leveled_up,
            "created_at": self.created_at.isoformat(),
        }
