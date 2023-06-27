from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import requests
import re
from validators import subscribe_schema
from jsonschema import validate, ValidationError

load_dotenv()

db = SQLAlchemy()
app = Flask(__name__)

# Config Database
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('DB_CONNECTION_STRING')

available_coins = requests.get(os.getenv('COIN_NEWS_HOST') + '/api/data').json()

db.init_app(app)

class Price(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    coin_name = db.Column(db.String(512))
    timestamp = db.Column(db.db.DateTime, nullable=False, default=datetime.now().isoformat())
    coin_name = db.Column(db.Float)


class Subscription(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String(512))
    coin_name = db.Column(db.String)
    difference_percentage = db.Column(db.Integer)

@app.route('/api/subscribe', methods = ['POST'])
def get_results():
    # check for validation errors
    try:
        data = request.get_json()
        validate(data, subscribe_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    
    # Get values from request body
    email = data['email']
    coin_name = data['coin_name']
    difference_percent = data['difference_percent']

    # check if the coin is valid
    if coin_name.lower() not in available_coins:
        return jsonify({"error": "Coin name is not supported!"}), 400
        
    # update the database    
    with app.app_context():
        # check if the user has subscribed to this coin before
        sub = db.session.query(Subscription) \
                    .filter(Subscription.email == email) \
                    .filter(Subscription.coin_name == coin_name).first()

        # update difference percent if the user has subscribed before
        if sub:
            sub.difference_percentage = difference_percent
            db.session.add(sub)
            db.session.commit()
            return jsonify({}), 200
        
        # create a new sub object if user has not subscribed
        sub = Subscription(email=email, coin_name=coin_name, difference_percentage=difference_percent)
        db.session.add(sub)
        db.session.commit()
        return jsonify({}), 201
    
    
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)