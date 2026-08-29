from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import PortfolioHolding

from app.services.analytics_service import calculate_summary


def get_portfolio_data(user_id: int):
    """
    Retrieve portfolio holdings belonging
    only to the specified user.
    """

    db: Session = SessionLocal()

    try:
        holdings = (
            db.query(PortfolioHolding)
            .filter(
                PortfolioHolding.user_id == user_id
            )
            .order_by(PortfolioHolding.id)
            .all()
        )

        portfolio = [
            {
                "stock": holding.stock,
                "quantity": holding.quantity,
                "avg_price": holding.avg_price,
                "current_price": holding.current_price,
                "sector": holding.sector,
            }
            for holding in holdings
        ]

        return portfolio

    finally:
        db.close()


def get_portfolio_summary(user_id: int):
    """
    Calculate portfolio summary using
    database-backed portfolio data belonging
    to the specified user.
    """

    portfolio = get_portfolio_data(
        user_id
    )

    return calculate_summary(
        portfolio
    )