from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import requests
from datetime import datetime

def send_mailgun_email(domain, api_key, from_user, to_email, subject, text):
	return requests.post(
		f"https://api.mailgun.net/v3/{domain}/messages",
		auth=("api", api_key),
		data={
              "from": f"{from_user} <mailgun@domain>",
              "to": [to_email],
              "subject": subject,
              "text": text
        }
    )

def run():
    mailgun_domain = os.getenv('MAILGUN_DOMAIN')
    mailgun_api_key = os.getenv('MAILGUN_API_KEY')
    mailgun_username = os.getenv('MAILGUN_USER_NAME')
    
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

    # looping over available coins to get new prices
    for coin in available_coins:
        #get last price of the coin
        last_data = session.query(Price) \
                        .filter(Price.coin_name == coin) \
                        .order_by(Price.timestamp.desc()) \
                        .first()
        # get new data of the coin
        coin_data = requests.get(os.getenv('COIN_NEWS_HOST') + f'/api/data/{coin}').json()
        timestamp = datetime.strptime(coin_data['updated_at'][:26]+'Z', "%Y-%m-%dT%H:%M:%S.%fZ")

        # if there is no previous data save and continue
        if last_data is None:
            price = Price(coin_name=coin, price=-coin_data['value'], timestamp=timestamp)
            session.add(price)
            continue
        
        # if data is not new continue
        if last_data.timestamp == timestamp:
             continue
        
        # calculate the price difference percentage
        last_price = last_data.price
        diff_percent = abs((-coin_data['value'] - last_price) / last_price * 100) if last_price !=0 else 0
        print(coin, diff_percent)

        # find subscription which are triggered
        subs = session.query(Subscription) \
                        .filter(Subscription.coin_name == coin) \
                        .filter(Subscription.difference_percentage < diff_percent) \
                        .all()
        
        # send email to subscriptions which are triggered
        for sub in subs:
            response = send_mailgun_email(
                 domain=mailgun_domain,
                 api_key=mailgun_api_key,
                 from_user=mailgun_username,
                 to_email=sub.email,
                 subject=f'{coin} price change alert!',
                 text=f"The price of {coin} is changed {diff_percent}% from {last_price} to {coin_data['price']}" 
            )
            print(response)
            print(response.text)
        # Create new price record
        price = Price(coin_name=coin, price=-coin_data['value'], timestamp=timestamp)
        session.add(price)
    
    session.commit()
    session.close()
        

if __name__ == '__main__':
    run()