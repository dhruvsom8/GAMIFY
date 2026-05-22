from datetime import datetime
from app import db


class Achievement(db.Model):
    __tablename__ = "achievements"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)  # e.g. "first_quest"
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300), nullable=False)
    icon = db.Column(db.String(50), default="trophy")
    xp_bonus = db.Column(db.Integer, default=0)
    rarity = db.Column(db.String(20), default="common")  # common, rare, epic, legendary

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_achievements = db.relationship("UserAchievement", backref="achievement", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "xp_bonus": self.xp_bonus,
            "rarity": self.rarity,
        }


class UserAchievement(db.Model):
    __tablename__ = "user_achievements"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = db.Column(db.Integer, db.ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)

    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "achievement_id": self.achievement_id,
            "achievement": self.achievement.to_dict(),
            "earned_at": self.earned_at.isoformat(),
        }
