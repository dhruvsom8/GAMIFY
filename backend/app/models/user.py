from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)

    # RPG profile
    avatar = db.Column(db.String(50), default="warrior")  # pixel avatar type
    title = db.Column(db.String(100), default="Novice Adventurer")
    bio = db.Column(db.String(300), default="")

    # Global stats
    total_xp = db.Column(db.Integer, default=0, nullable=False)
    global_level = db.Column(db.Integer, default=1, nullable=False)
    total_quests_completed = db.Column(db.Integer, default=0, nullable=False)
    current_streak = db.Column(db.Integer, default=0, nullable=False)
    longest_streak = db.Column(db.Integer, default=0, nullable=False)
    last_active_date = db.Column(db.Date, nullable=True)

    # Settings
    streak_penalty_enabled = db.Column(db.Boolean, default=False)
    theme = db.Column(db.String(30), default="default")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    skills = db.relationship("Skill", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    xp_logs = db.relationship("XPLog", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    streak_logs = db.relationship("StreakLog", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    daily_stats = db.relationship("DailyStat", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    user_achievements = db.relationship("UserAchievement", backref="user", lazy="dynamic", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "avatar": self.avatar,
            "title": self.title,
            "bio": self.bio,
            "total_xp": self.total_xp,
            "global_level": self.global_level,
            "total_quests_completed": self.total_quests_completed,
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "theme": self.theme,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<User {self.username}>"
