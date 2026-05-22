import os
from app import create_app, db
from app.services.achievement_service import seed_achievements

app = create_app(os.getenv("FLASK_ENV", "development"))


@app.cli.command("seed-achievements")
def seed():
    """Seed achievement definitions into the database."""
    with app.app_context():
        seed_achievements()
        print("Achievements seeded.")


@app.cli.command("init-db")
def init_db():
    """Create all tables."""
    with app.app_context():
        db.create_all()
        seed_achievements()
        print("Database initialized.")


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
