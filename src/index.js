//Import packages
const express = require('express');
const cors = require('cors');
const {timesCrawler} = require('./crawler')
const app = express();
const fs = require('fs')
app.use(express.json());
app.use(cors());

//Create router and route for GET request to home
const router = express.Router()
router.get('/', (req, res) => {
    //Run the webcrawler
    timesCrawler()
    //Receive data returned from crawler and serve
    const data = require('../times.json')
    res.send(data)
})

//Set server to listen
app.use(router);
const port = process.env.PORT || 3001
const server = app.listen(port, () => {console.log(`server listening on port: ${ port }`)})

//Graceful exit, count the number of connections and listen for events that signal end of runtime. Disconnect all existing connections on signal
setInterval(() => server.getConnections(
    (err, connections) => console.log(`${connections} connections currently open`)
), 1000);

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

let connections = [];

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    //Code to remove the data file from the application when the application shuts down
    const path = 'times.json'
    try {
        fs.unlinkSync(path)
        //file removed
      } catch(err) {
        console.error(err)
      }
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}