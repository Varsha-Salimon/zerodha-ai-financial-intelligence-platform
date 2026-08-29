import bcrypt

from app.database.database import (
    Base,
    SessionLocal,
    engine,
)

from app.database.models import (
    User,
    PortfolioHolding,
)


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

def seed_database():
    # Create tables if they don't exist.
    Base.metadata.create_all(
        bind=engine
    )

    db = SessionLocal()

    try:

        # =====================================================
        # 1. Create demo users
        # =====================================================

        users = {
            "varsha@demo.com": User(
                name="Varsha",
                email="varsha@demo.com",
                password_hash=get_password_hash(
                    "varsha123"
                ),
                role="USER",
            ),

            "rahul@demo.com": User(
                name="Rahul",
                email="rahul@demo.com",
                password_hash=get_password_hash(
                    "rahul123"
                ),
                role="USER",
            ),

            "admin@demo.com": User(
                name="Admin",
                email="admin@demo.com",
                password_hash=get_password_hash(
                    "admin123"
                ),
                role="ADMIN",
            ),
        }

        for email, user in users.items():

            existing_user = (
                db.query(User)
                .filter(
                    User.email == email
                )
                .first()
            )

            if existing_user:
                print(
                    f"User already exists: {email}"
                )
                users[email] = existing_user

            else:
                db.add(user)
                db.flush()

                print(
                    f"Created user: {email}"
                )

        # =====================================================
        # 2. Get users
        # =====================================================

        varsha = users[
            "varsha@demo.com"
        ]

        rahul = users[
            "rahul@demo.com"
        ]

        # =====================================================
        # 3. Assign existing holdings to Varsha
        # =====================================================

        existing_holdings = (
            db.query(PortfolioHolding)
            .filter(
                PortfolioHolding.user_id.is_(None)
            )
            .all()
        )

        if existing_holdings:

            for holding in existing_holdings:

                holding.user_id = varsha.id

            print(
                f"Assigned {len(existing_holdings)} "
                f"existing holdings to Varsha."
            )

        # =====================================================
        # 4. Check whether Rahul already has holdings
        # =====================================================

        rahul_holdings_count = (
            db.query(PortfolioHolding)
            .filter(
                PortfolioHolding.user_id
                == rahul.id
            )
            .count()
        )

        # =====================================================
        # 5. Add Rahul's demo portfolio
        # =====================================================

        if rahul_holdings_count == 0:

            rahul_holdings = [

                PortfolioHolding(
                    user_id=rahul.id,
                    stock="Reliance",
                    quantity=12,
                    avg_price=2850,
                    current_price=2920,
                    sector="Energy",
                ),

                PortfolioHolding(
                    user_id=rahul.id,
                    stock="ICICI Bank",
                    quantity=25,
                    avg_price=1200,
                    current_price=1265,
                    sector="Banking",
                ),

                PortfolioHolding(
                    user_id=rahul.id,
                    stock="ITC",
                    quantity=40,
                    avg_price=450,
                    current_price=475,
                    sector="FMCG",
                ),

                PortfolioHolding(
                    user_id=rahul.id,
                    stock="L&T",
                    quantity=10,
                    avg_price=3500,
                    current_price=3640,
                    sector="Infrastructure",
                ),

            ]

            db.add_all(
                rahul_holdings
            )

            print(
                "Created Rahul's demo portfolio."
            )

        else:

            print(
                f"Rahul already has "
                f"{rahul_holdings_count} holdings."
            )

        # =====================================================
        # 6. Make sure existing Varsha holdings
        #    have sector information
        # =====================================================

        varsha_holdings = (
            db.query(PortfolioHolding)
            .filter(
                PortfolioHolding.user_id
                == varsha.id
            )
            .all()
        )

        for holding in varsha_holdings:

            if holding.stock == "TCS":
                holding.sector = "IT"

            elif holding.stock == "Infosys":
                holding.sector = "IT"

            elif holding.stock == "HDFC Bank":
                holding.sector = "Banking"

        db.commit()

        # =====================================================
        # 7. Print final database summary
        # =====================================================

        print()
        print(
            "===================================="
        )
        print(
            "Database seeding completed successfully."
        )
        print(
            "===================================="
        )

        all_users = (
            db.query(User)
            .order_by(User.id)
            .all()
        )

        for user in all_users:

            holdings_count = (
                db.query(PortfolioHolding)
                .filter(
                    PortfolioHolding.user_id
                    == user.id
                )
                .count()
            )

            print(
                f"{user.id}: "
                f"{user.name} | "
                f"{user.email} | "
                f"{user.role} | "
                f"{holdings_count} holdings"
            )

    except Exception:

        db.rollback()
        raise

    finally:

        db.close()


if __name__ == "__main__":
    seed_database()