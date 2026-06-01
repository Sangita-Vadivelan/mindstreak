from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, timedelta
from collections import defaultdict

from db import db

analytics_bp = Blueprint("analytics", __name__)

DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def date_range(start: date, end: date):
    cur = start
    while cur <= end:
        yield cur
        cur += timedelta(days=1)


def calculate_current_streak(uid, habit_ids):
    """Count consecutive days ending today where at least one habit was logged."""
    if not habit_ids:
        return 0

    logs = list(db().logs.find(
        {"user_id": uid, "status": "done"},
        {"date": 1}
    ))
    log_dates = set(l["date"] for l in logs)

    streak = 0
    check = date.today()

    while check.isoformat() in log_dates:
        streak += 1
        check = date.fromordinal(check.toordinal() - 1)

    # If today not logged yet, check if yesterday keeps the streak alive
    if streak == 0:
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        if yesterday in log_dates:
            check = date.today() - timedelta(days=1)
            while check.isoformat() in log_dates:
                streak += 1
                check = date.fromordinal(check.toordinal() - 1)

    return streak


# ── GET /api/analytics/summary ─────────────────────────────────────────────────
@analytics_bp.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    uid   = get_jwt_identity()
    today = date.today().isoformat()

    habits      = list(db().habits.find({"user_id": uid}))
    habit_ids   = [str(h["_id"]) for h in habits]
    total_habits = len(habits)

    done_habits  = db().logs.count_documents({
        "user_id": uid, "date": today, "status": "done"
    }) if habit_ids else 0

    total_tasks  = db().activities.count_documents({"user_id": uid, "date": today})
    done_tasks   = db().activities.count_documents({"user_id": uid, "date": today, "done": True})
    total_notes  = db().notes.count_documents({"user_id": uid})

    h_score = (done_habits / total_habits * 100) if total_habits else 0
    a_score = (done_tasks  / total_tasks  * 100) if total_tasks  else 0
    score   = round(h_score * 0.6 + a_score * 0.4)

    current_streak = calculate_current_streak(uid, habit_ids)

    return jsonify({
        "productivity_score": score,
        "current_streak":     current_streak,
        "habits":  {"done": done_habits,  "total": total_habits},
        "tasks":   {"done": done_tasks,   "total": total_tasks},
        "notes":   total_notes,
        "date":    today,
    }), 200


# ── GET /api/analytics/weekly ──────────────────────────────────────────────────
@analytics_bp.route("/weekly", methods=["GET"])
@jwt_required()
def weekly():
    uid   = get_jwt_identity()
    today = date.today()
    monday = today - timedelta(days=today.weekday())

    habits     = list(db().habits.find({"user_id": uid}))
    habit_ids  = [str(h["_id"]) for h in habits]
    total_habits = len(habits)

    result = []
    for d in date_range(monday, today):
        iso = d.isoformat()

        habit_done = db().logs.count_documents({
            "user_id": uid,
            "date":    iso,
            "status":  "done",
        }) if habit_ids else 0

        total_act = db().activities.count_documents({"user_id": uid, "date": iso})
        done_act  = db().activities.count_documents({"user_id": uid, "date": iso, "done": True})

        h_score = (habit_done / total_habits * 100) if total_habits else 0
        a_score = (done_act   / total_act    * 100) if total_act    else 0
        score   = round(h_score * 0.6 + a_score * 0.4)

        result.append({
            "day":    DAY_NAMES[d.weekday()],
            "date":   iso,
            "score":  score,
            "habits": habit_done,
            "tasks":  done_act,
        })

    return jsonify(result), 200


# ── GET /api/analytics/heatmap ─────────────────────────────────────────────────
@analytics_bp.route("/heatmap", methods=["GET"])
@jwt_required()
def heatmap():
    uid   = get_jwt_identity()
    weeks = int(request.args.get("weeks", 15))

    habits     = list(db().habits.find({"user_id": uid}))
    habit_ids  = [str(h["_id"]) for h in habits]
    total_habits = max(len(habits), 1)

    today = date.today()
    start = today - timedelta(weeks=weeks)

    logs = list(db().logs.find({
        "user_id": uid,
        "date":    {"$gte": start.isoformat(), "$lte": today.isoformat()},
        "status":  "done",
    })) if habit_ids else []

    logs_by_date = defaultdict(int)
    for l in logs:
        logs_by_date[l["date"]] += 1

    grid     = []
    cur_week = []
    for d in date_range(start, today):
        iso   = d.isoformat()
        count = logs_by_date[iso]
        level = min(4, round((count / total_habits) * 4))
        cur_week.append({"date": iso, "level": level, "count": count})
        if d.weekday() == 6:
            grid.append(cur_week)
            cur_week = []
    if cur_week:
        grid.append(cur_week)

    return jsonify(grid), 200


# ── GET /api/analytics/insights ────────────────────────────────────────────────
@analytics_bp.route("/insights", methods=["GET"])
@jwt_required()
def insights():
    uid          = get_jwt_identity()
    today        = date.today()
    four_weeks   = today - timedelta(weeks=4)

    habits    = list(db().habits.find({"user_id": uid}))
    habit_ids = [str(h["_id"]) for h in habits]

    if not habits:
        return jsonify([{
            "icon": "💡", "type": "info",
            "text": "Add your first habit to start getting personalized insights!"
        }]), 200

    logs = list(db().logs.find({
        "user_id": uid,
        "date":    {"$gte": four_weeks.isoformat()},
        "status":  "done",
    })) if habit_ids else []

    day_scores = defaultdict(list)
    for d in date_range(four_weeks, today):
        iso   = d.isoformat()
        count = sum(1 for l in logs if l["date"] == iso)
        score = round((count / max(len(habits), 1)) * 100)
        day_scores[d.weekday()].append(score)

    avg_by_day = {
        wd: round(sum(v) / len(v))
        for wd, v in day_scores.items() if v
    }

    result = []

    if avg_by_day:
        best_wd  = max(avg_by_day, key=avg_by_day.get)
        worst_wd = min(avg_by_day, key=avg_by_day.get)
        result.append({
            "icon": "⭐", "type": "success",
            "text": f"You're most productive on {DAY_NAMES[best_wd]}s ({avg_by_day[best_wd]}% avg)"
        })
        if avg_by_day[worst_wd] < 50:
            result.append({
                "icon": "📉", "type": "warning",
                "text": f"You drop to {avg_by_day[worst_wd]}% on {DAY_NAMES[worst_wd]}s — your weakest day"
            })

    # Streak insights per habit
    for h in habits[:3]:
        hid     = str(h["_id"])
        h_dates = sorted(l["date"] for l in logs if l["habit_id"] == hid)
        streak  = _max_streak(h_dates)
        if streak >= 5:
            result.append({
                "icon": "🔥", "type": "success",
                "text": f"{h['title']} — best streak: {streak} days!"
            })

    # Weekend drop warning
    sat = avg_by_day.get(5, 100)
    sun = avg_by_day.get(6, 100)
    weekday_vals = [avg_by_day.get(d, 0) for d in range(5)]
    weekday_avg  = sum(weekday_vals) / max(len(weekday_vals), 1)
    if weekday_avg > 0 and (sat + sun) / 2 < weekday_avg * 0.6:
        result.append({
            "icon": "⚠️", "type": "warning",
            "text": "Weekend productivity drops significantly — try a lighter weekend routine"
        })

    if not result:
        result.append({
            "icon": "📊", "type": "info",
            "text": "Keep logging habits for 7+ days to unlock pattern insights"
        })

    return jsonify(result[:5]), 200


def _max_streak(sorted_dates):
    if not sorted_dates:
        return 0
    streak = max_s = 1
    for i in range(1, len(sorted_dates)):
        d1 = date.fromisoformat(sorted_dates[i - 1])
        d2 = date.fromisoformat(sorted_dates[i])
        if (d2 - d1).days == 1:
            streak += 1
            max_s = max(max_s, streak)
        else:
            streak = 1
    return max_s