import json
from pathlib import Path
from app.services.analytics_service import calculate_summary

def get_portfolio_data():
    data_file = Path(__file__).resolve().parents[3] / "data" / "portfolio.json"

    with open(data_file, "r") as file:
        portfolio = json.load(file)

    return portfolio

def get_portfolio_summary():

    portfolio = get_portfolio_data()

    return calculate_summary(portfolio)