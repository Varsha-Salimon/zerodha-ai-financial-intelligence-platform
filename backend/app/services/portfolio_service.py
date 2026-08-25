from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import PortfolioHolding

from app.services.analytics_service import calculate_summary


def get_portfolio_data():
    """
    Retrieve portfolio holdings from PostgreSQL.
    """

    db: Session = SessionLocal()

    try:
        holdings = (
            db.query(PortfolioHolding)
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


def get_portfolio_summary():
    """
    Calculate portfolio summary using
    database-backed portfolio data.
    """

    portfolio = get_portfolio_data()

    return calculate_summary(portfolio)