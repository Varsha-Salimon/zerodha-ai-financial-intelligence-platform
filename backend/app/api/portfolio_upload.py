import csv
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.database.models import PortfolioHolding, User


router = APIRouter()


# ============================================================
# Required CSV columns
# ============================================================

REQUIRED_COLUMNS = {
    "stock",
    "quantity",
    "avg_price",
    "current_price",
    "sector",
}


# ============================================================
# Upload Portfolio
# ============================================================

@router.post("/upload")
async def upload_portfolio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Add portfolio holdings from a CSV file to the
    authenticated user's existing portfolio.

    Rules:
    - Existing holdings are preserved.
    - New stocks are added.
    - Duplicate stocks for the same user are rejected.
    - Duplicate stocks inside the CSV are rejected.
    - Invalid CSV rows reject the entire upload.
    - Database changes are committed atomically.
    """

    # --------------------------------------------------------
    # 1. Validate filename
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported.",
        )

    # --------------------------------------------------------
    # 2. Read uploaded file
    # --------------------------------------------------------

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    try:
        csv_text = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to read the CSV file. "
                "Please save the file using UTF-8 encoding."
            ),
        )

    # --------------------------------------------------------
    # 3. Parse CSV
    # --------------------------------------------------------

    try:
        reader = csv.DictReader(
            io.StringIO(csv_text)
        )

        if not reader.fieldnames:
            raise HTTPException(
                status_code=400,
                detail="CSV file does not contain a header row.",
            )

        # Normalize header names.
        normalized_headers = {
            header.strip().lower()
            for header in reader.fieldnames
            if header
        }

        missing_columns = (
            REQUIRED_COLUMNS - normalized_headers
        )

        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Missing required columns: "
                    + ", ".join(sorted(missing_columns))
                ),
            )

        rows = list(reader)

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse CSV file: {str(exc)}",
        )

    if not rows:
        raise HTTPException(
            status_code=400,
            detail=(
                "CSV file does not contain "
                "any portfolio holdings."
            ),
        )

    # --------------------------------------------------------
    # 4. Validate uploaded rows
    # --------------------------------------------------------

    validated_holdings = []
    uploaded_stocks = set()
    validation_errors = []

    for row_number, row in enumerate(rows, start=2):

        normalized_row = {}

        for key, value in row.items():

            if key is None:
                continue

            normalized_key = key.strip().lower()

            if isinstance(value, str):
                normalized_value = value.strip()
            else:
                normalized_value = value

            normalized_row[
                normalized_key
            ] = normalized_value

        stock = normalized_row.get("stock")
        quantity = normalized_row.get("quantity")
        avg_price = normalized_row.get("avg_price")
        current_price = normalized_row.get("current_price")
        sector = normalized_row.get("sector")

        # ----------------------------------------------------
        # Required values
        # ----------------------------------------------------

        if not stock:
            validation_errors.append(
                f"Row {row_number}: stock is required."
            )
            continue

        if not quantity:
            validation_errors.append(
                f"Row {row_number}: quantity is required."
            )
            continue

        if not avg_price:
            validation_errors.append(
                f"Row {row_number}: avg_price is required."
            )
            continue

        if not current_price:
            validation_errors.append(
                f"Row {row_number}: current_price is required."
            )
            continue

        if not sector:
            validation_errors.append(
                f"Row {row_number}: sector is required."
            )
            continue

        # ----------------------------------------------------
        # Normalize stock symbol/name
        # ----------------------------------------------------

        stock = stock.strip()

        stock_key = stock.upper()

        # ----------------------------------------------------
        # Duplicate inside uploaded CSV
        # ----------------------------------------------------

        if stock_key in uploaded_stocks:
            validation_errors.append(
                f"Row {row_number}: duplicate stock '{stock}'."
            )
            continue

        uploaded_stocks.add(stock_key)

        # ----------------------------------------------------
        # Numeric validation
        # ----------------------------------------------------

        try:
            quantity_value = float(quantity)
            avg_price_value = float(avg_price)
            current_price_value = float(current_price)

        except (TypeError, ValueError):
            validation_errors.append(
                f"Row {row_number}: quantity, avg_price "
                "and current_price must be numeric."
            )
            continue

        if quantity_value <= 0:
            validation_errors.append(
                f"Row {row_number}: quantity must be greater than 0."
            )

        if avg_price_value < 0:
            validation_errors.append(
                f"Row {row_number}: avg_price cannot be negative."
            )

        if current_price_value < 0:
            validation_errors.append(
                f"Row {row_number}: current_price cannot be negative."
            )

        if (
            quantity_value <= 0
            or avg_price_value < 0
            or current_price_value < 0
        ):
            continue

        validated_holdings.append(
            {
                "stock": stock,
                "stock_key": stock_key,
                "quantity": quantity_value,
                "avg_price": avg_price_value,
                "current_price": current_price_value,
                "sector": sector.strip(),
            }
        )

    # --------------------------------------------------------
    # 5. Reject entire upload if CSV validation failed
    # --------------------------------------------------------

    if validation_errors:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Portfolio upload rejected.",
                "errors": validation_errors,
            },
        )

    if not validated_holdings:
        raise HTTPException(
            status_code=400,
            detail="No valid portfolio holdings were found.",
        )

    # --------------------------------------------------------
    # 6. Check duplicates against existing user portfolio
    # --------------------------------------------------------

    existing_holdings = (
        db.query(PortfolioHolding)
        .filter(
            PortfolioHolding.user_id
            == current_user.id
        )
        .all()
    )

    existing_stocks = {
        holding.stock.strip().upper()
        for holding in existing_holdings
        if holding.stock
    }

    duplicate_existing = sorted(
        {
            holding["stock"]
            for holding in validated_holdings
            if holding["stock_key"]
            in existing_stocks
        }
    )

    if duplicate_existing:
        raise HTTPException(
            status_code=409,
            detail={
                "message": (
                    "Portfolio upload rejected because "
                    "some stocks already exist in your portfolio."
                ),
                "duplicate_stocks": duplicate_existing,
            },
        )

    # --------------------------------------------------------
    # 7. Insert all new holdings atomically
    # --------------------------------------------------------

    try:

        for holding in validated_holdings:

            db_holding = PortfolioHolding(
                user_id=current_user.id,
                stock=holding["stock"],
                quantity=holding["quantity"],
                avg_price=holding["avg_price"],
                current_price=holding["current_price"],
                sector=holding["sector"],
            )

            db.add(db_holding)

        db.commit()

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save portfolio. "
                f"Changes were rolled back. Error: {str(exc)}"
            ),
        )

    # --------------------------------------------------------
    # 8. Success response
    # --------------------------------------------------------

    return {
        "message": "Portfolio uploaded successfully.",
        "holdings_added": len(
            validated_holdings
        ),
        "stocks_added": [
            holding["stock"]
            for holding in validated_holdings
        ],
    }