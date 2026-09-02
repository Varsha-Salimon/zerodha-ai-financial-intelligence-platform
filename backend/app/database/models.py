from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Text,
    JSON,
    ForeignKey,
)

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="USER")


class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stock = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    avg_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    sector = Column(String(100), nullable=True)


class RecommendationRecord(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    generation_id = Column(String(100), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    recommendation = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    supporting_metrics = Column(JSON, nullable=True)
    confidence = Column(String(20), nullable=False)
    data_source = Column(String(255), nullable=False)
    disclaimer = Column(Text, nullable=False)


class AIExecutionRecord(Base):
    __tablename__ = "ai_execution_records"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String(100), nullable=False, unique=True, index=True)
    workflow = Column(String(100), nullable=False)
    model = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False)
    validation_status = Column(String(50), nullable=False)
    input_source = Column(String(255), nullable=False)
    output_summary = Column(JSON, nullable=True)
    validation_details = Column(JSON, nullable=True)


class MCPExecutionRecord(Base):
    __tablename__ = "mcp_execution_records"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String(100), nullable=False, index=True)
    tool_name = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)
    duration_ms = Column(Float, nullable=False)
    error_message = Column(Text, nullable=True)
    input_source = Column(String(255), nullable=True)


class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    generation_id = Column(String(100), nullable=False, index=True)
    recommendation_type = Column(String(50), nullable=False)
    rating = Column(String(20), nullable=False)
