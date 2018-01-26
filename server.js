var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var dbUrl = 'mongodb://user:user@ds115758.mlab.com:15758/lynda-learn-nodejs'

var Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', (req, res) =>{
    Message.find({}, (err, messages) => {
        res.send(messages);
    })
});

app.get('/messages/:user', (req, res) =>{
    var user = req.params.user;
    Message.find({name: user}, (err, messages) => {
        res.send(messages);
    })
});

app.post('/messages', async (req, res) =>{
    try {
        var message = new Message(req.body);
        var savedMessage = await message.save();
        console.log('message saved: ', message.message);
        io.emit('message', req.body);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        return console.error(error);
    }
});

io.on('connection',(socket) => {
    console.log("user connected");
});

mongoose.connect(dbUrl, (err) => {
    console.log('mongodb connection', err);
});

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
});