-- ============================================================
-- GAMIFY — PostgreSQL Schema
-- Production-ready normalized schema for the XP Leveling System
-- ============================================================

-- Users
CREATE TABLE users (
    id                      SERIAL PRIMARY KEY,
    username                VARCHAR(50)  UNIQUE NOT NULL,
    email                   VARCHAR(120) UNIQUE NOT NULL,
    password_hash           VARCHAR(256) NOT NULL,
    avatar                  VARCHAR(50)  DEFAULT 'warrior',
    title                   VARCHAR(100) DEFAULT 'Novice Adventurer',
    bio                     VARCHAR(300) DEFAULT '',
    total_xp                INTEGER      NOT NULL DEFAULT 0,
    global_level            INTEGER      NOT NULL DEFAULT 1,
    total_quests_completed  INTEGER      NOT NULL DEFAULT 0,
    current_streak          INTEGER      NOT NULL DEFAULT 0,
    longest_streak          INTEGER      NOT NULL DEFAULT 0,
    last_active_date        DATE,
    streak_penalty_enabled  BOOLEAN      DEFAULT FALSE,
    theme                   VARCHAR(30)  DEFAULT 'default',
    created_at              TIMESTAMP    DEFAULT NOW(),
    updated_at              TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX ix_users_email    ON users(email);
CREATE INDEX ix_users_username ON users(username);

-- Skills (parent skills)
CREATE TABLE skills (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                    VARCHAR(100) NOT NULL,
    description             VARCHAR(500) DEFAULT '',
    icon                    VARCHAR(50)  DEFAULT 'sword',
    color                   VARCHAR(20)  DEFAULT '#4ade80',
    current_xp              INTEGER      NOT NULL DEFAULT 0,
    current_level           INTEGER      NOT NULL DEFAULT 1,
    total_xp_earned         INTEGER      NOT NULL DEFAULT 0,
    current_streak          INTEGER      NOT NULL DEFAULT 0,
    longest_streak          INTEGER      NOT NULL DEFAULT 0,
    total_quests_completed  INTEGER      NOT NULL DEFAULT 0,
    total_quests_failed     INTEGER      NOT NULL DEFAULT 0,
    last_quest_date         DATE,
    decay_enabled           BOOLEAN      DEFAULT FALSE,
    last_decay_date         DATE,
    is_active               BOOLEAN      DEFAULT TRUE,
    created_at              TIMESTAMP    DEFAULT NOW(),
    updated_at              TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX ix_skills_user_id ON skills(user_id);

-- Side Quests
CREATE TABLE side_quests (
    id                  SERIAL PRIMARY KEY,
    skill_id            INTEGER      NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    user_id             INTEGER      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    title               VARCHAR(200) NOT NULL,
    description         VARCHAR(1000) DEFAULT '',
    xp_reward           INTEGER      NOT NULL DEFAULT 50,
    difficulty          VARCHAR(20)  DEFAULT 'normal',
    status              VARCHAR(20)  NOT NULL DEFAULT 'pending',
    due_date            DATE,
    estimated_duration  INTEGER      DEFAULT 30,
    sort_order          INTEGER      DEFAULT 0,
    is_recurring        BOOLEAN      DEFAULT FALSE,
    recurrence_type     VARCHAR(20),
    recurrence_days     VARCHAR(50),
    is_boss_battle      BOOLEAN      DEFAULT FALSE,
    xp_multiplier       FLOAT        DEFAULT 1.0,
    created_at          TIMESTAMP    DEFAULT NOW(),
    completed_at        TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX ix_side_quests_skill_id ON side_quests(skill_id);
CREATE INDEX ix_side_quests_user_id  ON side_quests(user_id);
CREATE INDEX ix_side_quests_status   ON side_quests(status);

-- XP Logs
CREATE TABLE xp_logs (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER     NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    skill_id        INTEGER              REFERENCES skills(id)      ON DELETE SET NULL,
    quest_id        INTEGER              REFERENCES side_quests(id) ON DELETE SET NULL,
    xp_amount       INTEGER     NOT NULL,
    source          VARCHAR(50) DEFAULT 'quest',
    description     VARCHAR(200) DEFAULT '',
    level_before    INTEGER     NOT NULL,
    level_after     INTEGER     NOT NULL,
    leveled_up      BOOLEAN     DEFAULT FALSE,
    created_at      TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX ix_xp_logs_user_id    ON xp_logs(user_id);
CREATE INDEX ix_xp_logs_skill_id   ON xp_logs(skill_id);
CREATE INDEX ix_xp_logs_created_at ON xp_logs(created_at);

-- Streak Logs
CREATE TABLE streak_logs (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    skill_id            INTEGER          REFERENCES skills(id) ON DELETE CASCADE,
    date                DATE    NOT NULL,
    streak_count        INTEGER NOT NULL,
    quests_completed    INTEGER DEFAULT 0,
    xp_earned           INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, skill_id, date)
);

CREATE INDEX ix_streak_logs_user_id ON streak_logs(user_id);
CREATE INDEX ix_streak_logs_date    ON streak_logs(date);

-- Daily Stats
CREATE TABLE daily_stats (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date                DATE    NOT NULL,
    xp_earned           INTEGER DEFAULT 0,
    quests_completed    INTEGER DEFAULT 0,
    quests_failed       INTEGER DEFAULT 0,
    skills_active       INTEGER DEFAULT 0,
    streak_day          INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, date)
);

CREATE INDEX ix_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX ix_daily_stats_date    ON daily_stats(date);

-- Achievements
CREATE TABLE achievements (
    id          SERIAL PRIMARY KEY,
    key         VARCHAR(50)  UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(300) NOT NULL,
    icon        VARCHAR(50)  DEFAULT 'trophy',
    xp_bonus    INTEGER      DEFAULT 0,
    rarity      VARCHAR(20)  DEFAULT 'common',
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- User Achievements (junction)
CREATE TABLE user_achievements (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    achievement_id  INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at       TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, achievement_id)
);

CREATE INDEX ix_user_achievements_user_id ON user_achievements(user_id);
