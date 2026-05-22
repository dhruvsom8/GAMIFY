from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name="development"):
    app = Flask(__name__)

    # Load config
    from app.config import config_map
    app.config.from_object(config_map[config_name])

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # CORS — restrict origins in production via CORS_ORIGINS env var
    cors_origins = os.environ.get("CORS_ORIGINS", "*")
    origins_list = [o.strip() for o in cors_origins.split(",")] if cors_origins != "*" else "*"
    CORS(app, resources={r"/api/*": {"origins": origins_list}})

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.skills import skills_bp
    from app.api.quests import quests_bp
    from app.api.analytics import analytics_bp
    from app.api.achievements import achievements_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(skills_bp, url_prefix="/api/skills")
    app.register_blueprint(quests_bp, url_prefix="/api/quests")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(achievements_bp, url_prefix="/api/achievements")

    return app
