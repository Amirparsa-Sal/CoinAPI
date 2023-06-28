# CoinAPI

A simple service to subscribe and check coins price update.

### How to deploy using Docker

- Deploy coin news API using this [repository](https://github.com/amirhnajafiz/coinnews).

- Deploy a postgresql container. Here I use `postgres:15-alpine` image:
  
  ```bash
  docker run --name postgresql -e POSTGRES_DB=coin_api -e POSTGRES_USER=my_user -e \
  POSTGRES_PASSWORD=my_pass -p 5433:5432 -v ~/data:/var/lib/postgresql/data \
  -d postgres:15-alpine
  ```

- Create `.env` file inside `webserver` folder containing the following content:
  
  ```bash
  POSTGRES_USER=your_user
  POSTGRES_PASSWORD=your_pass
  POSTGRES_DB=your_db
  POSTGRES_PORT=5432
  POSTGRES_HOST=db

  COIN_NEWS_HOST=http://coinnews-host:8000
  WEBSERVER_PORT=5000
  ```

- Run this command inside `webserver` folder to build the image for webserver:
  
  ```bash
  docker image build -t coin_api_webserver .
  ```

- Run the webserver:
  
  ```bash
  docker run -d --env-file .env --link postgresql:db --link coinnews-container:coinnews-host -p 5001:5000   --name coinnews_webserver coin_api_webserver
  ```
  
  Create `.env` file inside `bepa` folder containing the following content:
  
  ```bash
  POSTGRES_USER=your_user
  POSTGRES_PASSWORD=your_pass
  POSTGRES_DB=your_db
  POSTGRES_PORT=5432
  POSTGRES_HOST=db

  COIN_NEWS_HOST=http://coinnews-host:8000

  MAILGUN_DOMAIN=sandbox453580d8b4394b02b7e97264b75b12e5.mailgun.org
  MAILGUN_API_KEY=c92726051d08afcf0e351bf07ad5dc3c-81bd92f8-80e92a12
  MAILGUN_USER_NAME=coin_news_api
  ```

- Run this command inside `bepa` folder to build the image for webserver:
  
  ```bash
  docker image build -t bepa_conjob .
  ```

- You can use the following command to run the cronjob one time.
  
  ```bash
  docker run -it --env-file .env --link postgresql:db --link coinnews-container:coinnews-host --name coinnews_bepa_cronjob bepa_conjob
  ```
