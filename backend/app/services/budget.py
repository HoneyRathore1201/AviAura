"""Roll up estimated costs and flag overspend."""

from collections import defaultdict

from app.schemas import BudgetBreakdown, DayPlan


def summarize_budget(days: list[DayPlan], user_budget: float, currency: str = "INR") -> BudgetBreakdown:
    by_category: dict[str, float] = defaultdict(float)
    by_day: list[float] = []
    total = 0.0

    for day in days:
        day_sum = 0.0
        for item in day.items:
            cost = float(item.estimated_cost or 0)
            day_sum += cost
            by_category[item.category] += cost
        day.day_total = round(day_sum, 2)
        by_day.append(day.day_total)
        total += day_sum

    total = round(total, 2)
    over = total > user_budget + 1  # ₹1 slack so rounding does not false-flag
    note = ""
    if over:
        note = (
            f"This draft is about {round(total - user_budget, 2)} {currency} over budget. "
            "Aviaura asked the model to tighten costs."
        )
    elif total < user_budget * 0.55:
        note = "Plenty of budget left — you could add a nicer stay or a paid experience."
    else:
        note = "Estimated spend fits inside the budget you set."

    return BudgetBreakdown(
        total_estimated=total,
        user_budget=user_budget,
        over_budget=over,
        by_category={k: round(v, 2) for k, v in by_category.items()},
        by_day=by_day,
        currency=currency,
        note=note,
    )
