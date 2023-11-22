# tracker-api


# install dependencies
-> npm install express
-> npm install pg
-> npm install dotenv
-> npm install swagger-jsdoc swagger-ui-express

# TO Run
node index.js


#DB permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to tracker;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public to tracker;