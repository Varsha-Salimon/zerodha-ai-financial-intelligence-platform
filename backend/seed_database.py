from app.database.database import Base, SessionLocal, engine
from app.database.models import PortfolioHolding


def seed_database():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Prevent duplicate seed data
        existing_count = (
            db.query(PortfolioHolding).count()
        )

        if existing_count > 0:
            print(
                f"Database already contains "
                f"{existing_count} portfolio holdings."
            )
            return

        holdings = [
            PortfolioHolding(
                stock="TCS",
                quantity=20,
                avg_price=3400,
                current_price=3620,
            ),
            PortfolioHolding(
                stock="Infosys",
                quantity=15,
                avg_price=1520,
                current_price=1610,
            ),
            PortfolioHolding(
                stock="HDFC Bank",
                quantity=30,
                avg_price=1650,
                current_price=1630,
            ),
        ]

        db.add_all(holdings)
        db.commit()

        print(
            f"Successfully inserted "
            f"{len(holdings)} portfolio holdings."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()