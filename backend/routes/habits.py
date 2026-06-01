# backend/routes/habits.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, date

from db import db

habits_bp = Blueprint("habits", __name__)


def habit_to_dict(h, user_id=None):
    """Serialize a habit document. Includes ALL fields the frontend needs."""
    hid   = str(h["_id"])
    uid   = user_id or h.get("user_id", "")
    today = date.today().isoformat()

    # Was this habit logged today?
    log_today = db().logs.find_one({
        "habit_id": hid,
        "date":     today,
        "status":   "done",
    })

    streak = calculate_streak(hid, uid)

    return {
        "id":          hid,
        "title":       h.get("title", ""),
        "category":    h.get("category", "Other"),
        "icon":        h.get("icon", "⚡"),
        # ── color: always return the saved value, fallback to amber ──────────
        "color":       h.get("color", "#f59e0b"),
        "target_days": h.get("target_days", 30),
        "created_at":  h.get("created_at", ""),
        "done_today":  bool(log_today),
        "streak":      streak,
    }


def calculate_streak(habit_id, user_id):
    """Count consecutive days (ending today or yesterday) with a done log."""
    logs = list(db().logs.find(
        {"habit_id": habit_id, "user_id": user_id, "status": "done"},
        {"date": 1}
    ))
    if not logs:
        return 0

    log_dates = {l["date"] for l in logs}
    streak    = 0
    check     = date.today()

    # Count backwards from today
    while check.isoformat() in log_dates:
        streak += 1
        check   = date.fromordinal(check.toordinal() - 1)

    # If today not logged yet, allow streak from yesterday
    if streak == 0:
        yesterday = date.fromordinal(date.today().toordinal() - 1).isoformat()
        if yesterday in log_dates:
            check = date.today() - __import__('datetime').timedelta(days=1)
            while check.isoformat() in log_dates:
                streak += 1
                check   = date.fromordinal(check.toordinal() - 1)

    return streak


# ── GET /api/habits/ ───────────────────────────────────────────────────────────
@habits_bp.route("/", methods=["GET"])
@jwt_required()
def get_habits():
    uid    = get_jwt_identity()
    habits = list(db().habits.find({"user_id": uid}))
    return jsonify([habit_to_dict(h, uid) for h in habits]), 200


# ── POST /api/habits/ ──────────────────────────────────────────────────────────
@habits_bp.route("/", methods=["POST"])
@jwt_required()
def create_habit():
    uid  = get_jwt_identity()
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    # Duplicate check per user
    existing = db().habits.find_one({"user_id": uid, "title": {"$regex": f"^{title}$", "$options": "i"}})
    if existing:
        return jsonify({"error": "A habit with this name already exists"}), 409

    # ── Save color exactly as sent — supports hex, rgb, any valid CSS color ──
    color = data.get("color", "#f59e0b").strip()
    if not color:
        color = "#f59e0b"

    result = db().habits.insert_one({
        "user_id":     uid,
        "title":       title,
        "category":    data.get("category", "Other").strip() or "Other",
        "icon":        data.get("icon", "⚡"),
        "color":       color,
        "target_days": max(1, int(data.get("target_days", 30))),
        "created_at":  datetime.utcnow().isoformat(),
    })

    habit = db().habits.find_one({"_id": result.inserted_id})
    return jsonify(habit_to_dict(habit, uid)), 201


# ── PUT /api/habits/<id> ───────────────────────────────────────────────────────
@habits_bp.route("/<hid>", methods=["PUT"])
@jwt_required()
def update_habit(hid):
    uid   = get_jwt_identity()
    habit = db().habits.find_one({"_id": ObjectId(hid), "user_id": uid})
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    data    = request.get_json(silent=True) or {}
    allowed = ["title", "category", "icon", "color", "target_days"]
    update  = {}

    for k in allowed:
        if k in data:
            update[k] = data[k]

    if "target_days" in update:
        update["target_days"] = max(1, int(update["target_days"]))

    if "color" in update and not update["color"]:
        update["color"] = "#f59e0b"

    if update:
        db().habits.update_one({"_id": ObjectId(hid)}, {"$set": update})

    habit = db().habits.find_one({"_id": ObjectId(hid)})
    return jsonify(habit_to_dict(habit, uid)), 200


# ── DELETE /api/habits/<id> ────────────────────────────────────────────────────
@habits_bp.route("/<hid>", methods=["DELETE"])
@jwt_required()
def delete_habit(hid):
    uid    = get_jwt_identity()
    result = db().habits.delete_one({"_id": ObjectId(hid), "user_id": uid})
    if result.deleted_count == 0:
        return jsonify({"error": "Habit not found"}), 404
    # Also remove all logs for this habit
    db().logs.delete_many({"habit_id": hid, "user_id": uid})
    return jsonify({"deleted": hid}), 200


# ── POST /api/habits/<id>/log ──────────────────────────────────────────────────
@habits_bp.route("/<hid>/log", methods=["POST"])
@jwt_required()
def log_habit(hid):
    """Toggle today's completion for a habit."""
    uid   = get_jwt_identity()
    habit = db().habits.find_one({"_id": ObjectId(hid), "user_id": uid})
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    today    = date.today().isoformat()
    existing = db().logs.find_one({"habit_id": hid, "date": today, "user_id": uid})

    if existing:
        db().logs.delete_one({"_id": existing["_id"]})
        done = False
    else:
        db().logs.insert_one({
            "habit_id":  hid,
            "user_id":   uid,
            "date":      today,
            "status":    "done",
            "timestamp": datetime.utcnow().isoformat(),
        })
        done = True

    habit = db().habits.find_one({"_id": ObjectId(hid)})
    result = habit_to_dict(habit, uid)
    result["done_today"] = done
    return jsonify(result), 200