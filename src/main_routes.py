from flask import Blueprint, request, redirect, render_template, jsonify
from models import db, Links
from utils import generateCode
import validators

bp = Blueprint("main", __name__)

@bp.route("/")
def home():
    return render_template("index.html")

@bp.route("/shorten", methods=["POST"])
def shortenURL():
    data = request.json
    original = data.get("url")

    if not original:
        return jsonify({"error": "URL required"}), 400
    if not validators.url(original):
        return jsonify({"error": "URL invalid"}), 400

    short = generateCode()

    link = Links(original_url=original, short_code=short)
    db.session.add(link)
    db.session.commit()

    total_clicks = db.session.query(db.func.sum(Links.clicks)).scalar() or 0

    return jsonify({
        "original": link.original_url,
        "short": link.short_code,
        "created_at": link.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "clicks": link.clicks,
        "total_clicks": total_clicks
    })

@bp.route("/<short_code>")
def redirectShort(short_code):
    link = Links.query.filter_by(short_code=short_code).first()

    if not link:
        return jsonify({"error": "Short code not found"}), 404

    link.clicks += 1
    db.session.commit()

    return redirect(link.original_url)

@bp.route("/stats/clicks")
def total_clicks():
    total = db.session.query(db.func.sum(Links.clicks)).scalar() or 0
    return jsonify({"total_clicks": total})

@bp.route("/stats/links")
def stats_links():
    links = Links.query.order_by(Links.id.desc()).limit(50).all()

    data = []
    for link in links:
        data.append({
            "original_url": link.original_url,
            "short_code": link.short_code,
            "created_at": link.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "clicks": link.clicks
        })

    return jsonify(data)

@bp.route("/delete/<short_code>", methods=["DELETE"])
def delete_link(short_code):
    link = Links.query.filter_by(short_code=short_code).first()

    if not link:
        return jsonify({"error": "Link not found"}), 404
    
    db.session.delete(link)
    db.session.commit()

    return jsonify({"msg": "Link deleted"})

