import os
from app import create_app, db
from app.services.achievement_service import seed_achievements

# Select config from FLASK_ENV — defaults to development (SQLite)
app = create_app(os.getenv("FLASK_ENV", "development"))


@app.cli.command("seed-achievements")
def seed():
    """Seed achievement definitions into the database."""
    with app.app_context():
        seed_achievements()
        print("Achievements seeded.")


@app.cli.command("init-db")
def init_db():
    """
    Create all tables directly (bypasses migrations).
    Use only for fresh dev setups without migration history.
    For production, use: flask db upgrade
    """
    with app.app_context():
        db.create_all()
        seed_achievements()
        print("Database initialized.")


@app.cli.command("setup")
def setup():
    """
    Full setup: run migrations + seed achievements.
    Equivalent to: flask db upgrade && flask seed-achievements
    Use this as the deployment start command.
    """
    from flask_migrate import upgrade as db_upgrade
    with app.app_context():
        db_upgrade()
        seed_achievements()
        print("Setup complete: migrations applied + achievements seeded.")


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV") != "production")
