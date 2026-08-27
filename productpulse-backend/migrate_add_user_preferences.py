from sqlalchemy import create_engine, inspect, text

from app.core.config import settings


def main() -> None:
    engine = create_engine(settings.database_url)

    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) NOT NULL DEFAULT 'light'"
            )
        )
        conn.execute(
            text(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE"
            )
        )

    columns = [c["name"] for c in inspect(engine).get_columns("users")]
    print("users columns:", columns)


if __name__ == "__main__":
    main()
