from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, date

from db import db

activities_bp = Blueprint("activities", __name__)

def activity_to_dict(a):
    return {
        "id": str(a["_id"]),
        "title": a["title"],
        "done": a.get("done", False),
        "date": a.get("date", ""),
        "created_at": a.get("created_at", ""),
    }

# ── GET /api/activities?date=YYYY-MM-DD ────────────────────────────────────────
@activities_bp.route("/", methods=["GET"])
@jwt_required()
def get_activities():
    uid = get_jwt_identity()
    target_date = request.args.get("date", date.today().isoformat())
    activities = list(db().activities.find({"user_id": uid, "date": target_date}))
    return jsonify([activity_to_dict(a) for a in activities]), 200

# ── POST /api/activities ───────────────────────────────────────────────────────
@activities_bp.route("/", methods=["POST"])
@jwt_required()
def create_activity():
    uid = get_jwt_identity()
    data = request.get_json()
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title required"}), 400

    result = db().activities.insert_one({
        "user_id": uid,
        "title": title,
        "done": False,
        "date": data.get("date", date.today().isoformat()),
        "created_at": datetime.utcnow().isoformat(),
    })

    activity = db().activities.find_one({"_id": result.inserted_id})
    return jsonify(activity_to_dict(activity)), 201

# ── PUT /api/activities/<id> ───────────────────────────────────────────────────
@activities_bp.route("/<aid>", methods=["PUT"])
@jwt_required()
def update_activity(aid):
    uid = get_jwt_identity()
    activity = db().activities.find_one({"_id": ObjectId(aid), "user_id": uid})
    if not activity:
        return jsonify({"error": "Not found"}), 404

    data = request.get_json()
    update = {}
    if "title" in data:
        update["title"] = data["title"].strip()
    if "done" in data:
        update["done"] = bool(data["done"])

    db().activities.update_one({"_id": ObjectId(aid)}, {"$set": update})
    activity = db().activities.find_one({"_id": ObjectId(aid)})
    return jsonify(activity_to_dict(activity)), 200

# ── DELETE /api/activities/<id> ────────────────────────────────────────────────
@activities_bp.route("/<aid>", methods=["DELETE"])
@jwt_required()
def delete_activity(aid):
    uid = get_jwt_identity()
    result = db().activities.delete_one({"_id": ObjectId(aid), "user_id": uid})
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"deleted": aid}), 200

# ── POST /api/activities/<id>/toggle ──────────────────────────────────────────
@activities_bp.route("/<aid>/toggle", methods=["POST"])
@jwt_required()
def toggle_activity(aid):
    uid = get_jwt_identity()
    activity = db().activities.find_one({"_id": ObjectId(aid), "user_id": uid})
    if not activity:
        return jsonify({"error": "Not found"}), 404

    new_done = not activity.get("done", False)
    db().activities.update_one({"_id": ObjectId(aid)}, {"$set": {"done": new_done}})
    activity = db().activities.find_one({"_id": ObjectId(aid)})
    return jsonify(activity_to_dict(activity)), 200