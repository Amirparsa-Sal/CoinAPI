from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import requests
from datetime import datetime

def run():
    # load env variables
    load_dotenv()

    # Create an engine to connect to the database
    engine = create_engine(os.getenv('DB_CONNECTION_STRING'))

    # Reflect the existing tables into SQLAlchemy models
    Base = automap_base()
    Base.prepare(engine, reflect=True)

    # Access the mapped models
    Price = Base.classes.price
    Subscription = Base.classes.subscription

    # Create a session
    session = Session(engine)

    # Get a list of available coins
    available_coins = requests.get(os.getenv('COIN_NEWS_HOST') + '/api/data').json()

    # Add new price of each coin
    for coin in available_coins:
        coin_data = requests.get(os.getenv('COIN_NEWS_HOST') + f'/api/data/{coin}').json()
        timestamp = datetime.strptime(coin_data['updated_at'][:26]+'Z', "%Y-%m-%dT%H:%M:%S.%fZ")
        price = Price(coin_name=coin, price=-coin_data['value'], timestamp=timestamp)
        session.add(price)
    
    session.commit()
    session.close()
        

if __name__ == '__main__':
    run()