# mini-edrz
# To run the app locally:
  1. `npm install`
  1. `npm start`
# To run the debug:
* `npm run dev`
### Ports:

* Client - 80
* Server - 8081
* Mongo - 27018

(See `utils/docker-compose.yml`)

### Setup:

* View utils shell scripts in `/utils`, change environments in `/utils/env`

```
cd utils
```

* **!!! Change git links in** `/utils/env` **!!!**
 
* Create files `mongo-init.js`, `mongo.env` and `server.env` and set passwords in 

`mongo.env`

```
MONGO_INITDB_DATABASE=admin
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=adminpassword
```

`server.env`

```
MONGO_USERNAME=user
MONGO_PASSWORD=userpassword
MONGO_HOSTNAME=mongo
MONGO_DB=dbname
MONGO_PORT=27017
SERVER_PORT=8081
```

`mongo-init.js`

```
db.auth('admin', 'adminpassword');

db.createUser(
  {
    user: "user",
    pwd: "userpassword",
    roles: [
      {
          role: "readWrite",
          db: "dbname"
      }
    ]
  }
);
```

* `client.env` Optionally:

```
BASE_URL=domain.com
```

* Don't forget to change permissions:

```
chmod 600 mongo-init.js
chmod 600 mongo.env
chmod 600 server.env
chmod 600 client.env
```

* Make sure that you can access git repositories with root
