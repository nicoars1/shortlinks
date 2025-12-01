from flask import Flask, jsonify, render_template
from models import db, Links
from main_routes import bp
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "database", "links.db")


app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)


app.register_blueprint(bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=4000)