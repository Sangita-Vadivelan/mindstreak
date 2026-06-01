from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

from db import db

notes_bp = Blueprint("notes", __name__)

def note_to_dict(n):
    return {
        "id": str(n["_id"]),
        "title": n["title"],
        "content": n.get("content", ""),
        "tags": n.get("tags", []),
        "pinned": n.get("pinned", False),
        "created_at": n.get("created_at", ""),
        "updated_at": n.get("updated_at", ""),
    }

# ── GET /api/notes?q=search ────────────────────────────────────────────────────
@notes_bp.route("/", methods=["GET"])
@jwt_required()
def get_notes():
    uid = get_jwt_identity()
    q = request.args.get("q", "").strip()

    query = {"user_id": uid}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]

    notes = list(db().notes.find(query).sort([("pinned", -1), ("updated_at", -1)]))
    return jsonify([note_to_dict(n) for n in notes]), 200

# ── POST /api/notes ────────────────────────────────────────────────────────────
@notes_bp.route("/", methods=["POST"])
@jwt_required()
def create_note():
    uid = get_jwt_identity()
    data = request.get_json()
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title required"}), 400

    now = datetime.utcnow().isoformat()
    result = db().notes.insert_one({
        "user_id": uid,
        "title": title,
        "content": data.get("content", ""),
        "tags": data.get("tags", []),
        "pinned": data.get("pinned", False),
        "created_at": now,
        "updated_at": now,
    })

    note = db().notes.find_one({"_id": result.inserted_id})
    return jsonify(note_to_dict(note)), 201

# ── PUT /api/notes/<id> ────────────────────────────────────────────────────────
@notes_bp.route("/<nid>", methods=["PUT"])
@jwt_required()
def update_note(nid):
    uid = get_jwt_identity()
    note = db().notes.find_one({"_id": ObjectId(nid), "user_id": uid})
    if not note:
        return jsonify({"error": "Not found"}), 404

    data = request.get_json()
    allowed = ["title", "content", "tags", "pinned"]
    update = {k: data[k] for k in allowed if k in data}
    update["updated_at"] = datetime.utcnow().isoformat()

    db().notes.update_one({"_id": ObjectId(nid)}, {"$set": update})
    note = db().notes.find_one({"_id": ObjectId(nid)})
    return jsonify(note_to_dict(note)), 200

# ── DELETE /api/notes/<id> ─────────────────────────────────────────────────────
@notes_bp.route("/<nid>", methods=["DELETE"])
@jwt_required()
def delete_note(nid):
    uid = get_jwt_identity()
    result = db().notes.delete_one({"_id": ObjectId(nid), "user_id": uid})
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"deleted": nid}), 200

# ── POST /api/notes/<id>/pin ───────────────────────────────────────────────────
@notes_bp.route("/<nid>/pin", methods=["POST"])
@jwt_required()
def toggle_pin(nid):
    uid = get_jwt_identity()
    note = db().notes.find_one({"_id": ObjectId(nid), "user_id": uid})
    if not note:
        return jsonify({"error": "Not found"}), 404

    new_pinned = not note.get("pinned", False)
    db().notes.update_one({"_id": ObjectId(nid)}, {"$set": {"pinned": new_pinned}})
    note = db().notes.find_one({"_id": ObjectId(nid)})
    return jsonify(note_to_dict(note)), 200