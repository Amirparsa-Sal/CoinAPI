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
    coin_name = db.Column(db.String(128))
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now().isoformat())
    price = db.Column(db.Float)

    def serialize(self):
        return {
            "id": self.id,
            "coin_name": self.coin_name,
            "timestamp": self.timestamp,
            "price": self.price
        }

class Subscription(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String(512))
    coin_name = db.Column(db.String(128))
    difference_percentage = db.Column(db.Integer)

@app.route('/api/history', methods = ['GET'])
def get_history():
    coin_name = request.args.get('coin', None)
    # Check if coin name is passed in query params
    if not coin_name:
        return jsonify({"error": "coin paramter must be passed as a query param."}), 400
    
    coin_name = coin_name.lower()
    # check if the coin is valid
    if coin_name not in available_coins:
        return jsonify({"error": "Coin name is not supported!"}), 400
    
    # query database
    with app.app_context():
        # Get all records relating to the coin
        records = db.session.query(Price) \
                    .filter(Price.coin_name == coin_name) \
                    .order_by(Price.timestamp.desc()) \
                    .all()
        return jsonify(list(map(lambda record: record.serialize(), records))), 200
        
    
@app.route('/api/subscribe', methods = ['POST'])
def subscribe():
    # check for validation errors
    try:
        data = request.get_json()
        validate(data, subscribe_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    
    # Get values from request body
    email = data['email']
    coin_name = data['coin_name'].lower()
    difference_percent = data['difference_percent']

    # check if the coin is valid
    if coin_name not in available_coins:
        return jsonify({"error": "Coin name is not supported!"}), 400
        
    # update the database    
    with app.app_context():
        # check if the user has subscribed to this coin before
        sub = db.session.query(Subscription) \
                    .filter(Subscription.email == email) \
                    .filter(Subscription.coin_name == coin_name) \
                    .first()

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

port = int(os.getenv('SERVER_PORT'))
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)