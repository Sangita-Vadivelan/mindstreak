from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from db import mongo
from routes.auth       import auth_bp
from routes.habits     import habits_bp
from routes.activities import activities_bp
from routes.notes      import notes_bp
from routes.analytics  import analytics_bp

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)

# ── Config ─────────────────────────────────────────────────────────────────────
app.config["MONGO_URI"]      = os.getenv("MONGO_URI", "mongodb://localhost:27017/mindstreak")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret-change-this")

# ── Extensions ─────────────────────────────────────────────────────────────────
CORS(
    app,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://mindstreak-omega.vercel.app"
    ]
)JWTManager(app)
mongo.init_app(app)

# ── Blueprints ─────────────────────────────────────────────────────────────────
app.register_blueprint(auth_bp,       url_prefix="/api/auth")
app.register_blueprint(habits_bp,     url_prefix="/api/habits")
app.register_blueprint(activities_bp, url_prefix="/api/activities")
app.register_blueprint(notes_bp,      url_prefix="/api/notes")
app.register_blueprint(analytics_bp,  url_prefix="/api/analytics")

# ── Health check ───────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return {"status": "ok", "app": "MindStreak"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)