from flask_sqlalchemy import SQLAlchemy
import time


db = SQLAlchemy()


from datetime import datetime
import time

class Links(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    original_url = db.Column(db.String(100), nullable=False)
    short_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    clicks = db.Column(db.Integer, default=0)

    def __str__(self):
        return f"Original Link: {self.original_url}. Short Code: {self.short_code}. Created At: {self.created_at}. Clicks: {self.clicks}."

    def serialize(self):
        return {
            "id": self.id,
            "original_url": self.original_url,
            "short_code": self.short_code,
            "created_at": self.created_at,
            "clicks": self.clicks
        }
