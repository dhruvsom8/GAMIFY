import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


def _fix_db_url(url: str | None) -> str | None:
    """
    Render and some providers give 'postgres://' but SQLAlchemy 2.x
    requires 'postgresql://'. Fix it silently.
    """
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class BaseConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-change-in-prod")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 24))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 30))
    )

    # PostgreSQL connection pool tuning for Supabase / managed Postgres.
    # Supabase has a max of 60 connections on the free tier — keep pool small.
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800,   # recycle connections every 30 min
        "pool_pre_ping": True,  # test connection health before using it
    }


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = _fix_db_url(
        os.getenv("DATABASE_URL", "sqlite:///gamify_dev.db")
    )
    # SQLite doesn't use connection pooling — override engine options
    SQLALCHEMY_ENGINE_OPTIONS = {}


class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = _fix_db_url(os.getenv("DATABASE_URL"))


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = _fix_db_url(
        os.getenv("TEST_DATABASE_URL", "sqlite:///gamify_test.db")
    )
    SQLALCHEMY_ENGINE_OPTIONS = {}


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
