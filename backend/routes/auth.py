from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime

from db import db

auth_bp = Blueprint("auth", __name__)


def user_to_dict(u):
    return {
        "id":         str(u["_id"]),
        "name":       u["name"],
        "email":      u["email"],
        "created_at": u.get("created_at", ""),
    }


# ── POST /api/auth/register ────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    name     = data.get("name", "").strip()
    email    = data.get("email", "").lower().strip()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if db().users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed = generate_password_hash(password)
    result = db().users.insert_one({
        "name":       name,
        "email":      email,
        "password":   hashed,
        "created_at": datetime.utcnow().isoformat(),
    })

    user  = db().users.find_one({"_id": result.inserted_id})
    token = create_access_token(identity=str(result.inserted_id))

    return jsonify({"token": token, "user": user_to_dict(user)}), 201


# ── POST /api/auth/login ───────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    email    = data.get("email", "").lower().strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = db().users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": token, "user": user_to_dict(user)}), 200


# ── GET /api/auth/me ───────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = db().users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user_to_dict(user)), 200