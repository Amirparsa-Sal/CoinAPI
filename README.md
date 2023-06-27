# CoinAPI

A simple service to subscribe and check coins price update.



### How to deploy using Docker

- Deploy coin news API using this [repository]([GitHub - amirhnajafiz/coinnews: Providing a data source for Cloud Computing course (Spring 2023).](https://github.com/amirhnajafiz/coinnews)).

- Deploy a postgresql container. Here I use `postgres:15-alpine` image:
  
  ```bash
  docker run --name postgresql -e POSTGRES_DB=coin_api -e POSTGRES_USER=my_user -e \
  POSTGRES_PASSWORD=my_pass -p 5433:5432 -v ~/data:/var/lib/postgresql/data \
  -d postgres:15-alpine
  ```

- Create `.env` file inside `webserver` folder containing the following content:
  
  ```bash
  DB_CONNECTION_STRING=postgresql://my_user:my_pass@db:5432/coin_api
  
  COIN_NEWS_HOST=http://coinnews-host:8000
  
  SERVER_PORT=5000
  ```

- Run this command inside `webserver` folder to build the image for webserver:
  
  ```bash
  docker image build -t coin_api_webserver .
  ```

- Run the webserver:
  
  ```bash
  docker run -it --env-file .env --link postgresql:db --link coinnews-container:coinnews-host -p 5001:5000 coin_api_webserver5
  ```
  
  Create `.env` file inside `bepa` folder containing the following content:
  
  ```bash
  DB_CONNECTION_STRING=postgresql://amirparsa:Amirparsa96@db:5432/coin_api
  
  COIN_NEWS_HOST=http://coinnews-host:8000
  
  MAILGUN_DOMAIN=your_mailgun_domain
  MAILGUN_API_KEY=your_mailgun_key
  MAILGUN_USER_NAME=your_mailgun_sender_name
  ```

- Run this command inside `bepa` folder to build the image for webserver:
  
  ```bash
  docker image build -t bepa_conjob .
  ```

- You can use the following command to run the cronjob one time.
  
  ```bash
  docker run -it --env-file .env --link postgresql:db --link coinnews-container:coinnews-host -p 5001:5000 bepa_conjob
  ```
