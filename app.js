var express = require('express')
, routes = require('./routes')
, http = require('http')
, path = require('path');

var Location = require('./lib/Location');

var myApns = require('./lib/MyApns').get();

// redis setting
var redis = require('redis');
var redisClient = redis.createClient(6379, 'dvm135.lo.mixi.jp');

var app = express();
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.render('index', { title: 'imadoko' });
});

app.get('/api', function(req, res) {
    var json = { deviceToken: "6aaee5870f798abc29cf6d7f1d2e2bb60130aa8c9f74ab75ca7e11f86ba45d67" }
    var myDevice = new myApns.apns.Device(json.deviceToken); 

    var note = new apns.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = "You have a new message";
    note.payload = {'messageFrom': 'Caroline'};
    note.device = myDevice;

    myApns.connection.sendNotification(note);

    res.send("OK");
});

//app.get('/api/request_imadoko', requestImadoko);
app.post('/api/request_imadoko', requestImadoko);

function requestImadoko(req, res) {
    console.log("\n---> called requestImadoko");
    var mockJson = {
        fromUserId: 1234,
        toUserId: 4567
    }

    console.log("------POST DATA------");
    var json = JSON.parse(req.body.json);
    console.log(json);
    checkUserId(json);

    console.log("-----REDIS DATA------");
    var redisKey = 'imadoko/request/' + json.toUserId;
    var redisData = JSON.stringify(json);
    redisClient.set(redisKey, JSON.stringify(json));

    console.log("redisKey: " + redisKey);
    console.log("redisData: " + redisData);

    console.log("----RESPONSE DATA----");
    var resData = "OK";
    console.log(resData + "\n");
    res.send(resData);
}

//app.get('/api/response_imadoko', responseImadoko);
app.post('/api/response_imadoko', responseImadoko);

function responseImadoko(req, res) {
    console.log("\n---> called reponseImadoko");
    var mockJson = {
        fromUserId: 1234,
        toUserId: 4567,
        location: {
            latitude: 1234.5678,
            longitude: 1234.5678
        }
    }

    console.log("------POST DATA------");
    var json = JSON.parse(req.body.json);
    console.log(json);
    checkUserId(json);

    console.log("-----REDIS DATA------");
    var redisKey = 'imadoko/response/' + json.toUserId;
    var redisData = JSON.stringify(json);
    redisClient.set(redisKey, JSON.stringify(json));

    console.log("redisKey: " + redisKey);
    console.log("redisData: " + redisData);

    console.log("----RESPONSE DATA----");
    var resData = "OK";
    console.log(resData + "\n");
    res.send(resData);
}

//app.get('/api/lookup_imadoko', lookupImadoko);
app.post('/api/lookup_imadoko', lookupImadoko);

function lookupImadoko(req, res) {
    console.log("\n---> called lookupImadoko");
    var mockJson = {
        fromUserId: 4567 
    }

    console.log("------POST DATA------");
    var json = JSON.parse(req.body.json);
    console.log(json);

    var resJson = {};

    console.log("------RDIS DATA------");
    var redisKey = 'imadoko/request/' + json.fromUserId;
    console.log("redisKey: " + redisKey);
    var redisData = {};
    redisClient.get(redisKey, function(err, replies) {
        if (err) {
            console.log("err: " + err);
        } else {
            redisData = JSON.parse(replies);
            console.log("redisData: " + redisData);
            resJson.request = redisData;
            redisClient.del(redisKey);
        }
        
        console.log("------RDIS DATA------");
        redisKey = 'imadoko/response/' + json.fromUserId;
        console.log("redisKey: " + redisKey);
        redisData = {};
        redisClient.get(redisKey, function(err, replies) {
            if (err) {
                console.log("err: " + err);
                console.log("----RESPONSE DATA-----");
                res.send(resJson);
            } else {
                redisData = JSON.parse(replies);
                console.log("redisData: " + redisData);

                //if (redisData != null) redisData.distance = calcDistance(redisData.location, redisData.realLocation)
                
                console.log("----RESPONSE DATA-----");
                resJson.response = redisData;
                console.log(resJson + "\n");
                res.send(resJson);
                redisClient.del(redisKey);
            }
        });
    });
};

//app.get('/api/reqres_imadoko', reqresImadoko);
app.post('/api/reqres_imadoko', reqresImadoko);

function reqresImadoko(req, res) {
    console.log("\n---> called reqresImadoko");
    var mockJson = {
        fromUserId: 1234,
        toUserId: 4567,
        location: {
            latitude: 50.00,
            longitude: 50.00
        },
        message: "imadoko?",
        image: "imageString"
    };

    console.log("------POST DATA------");
    var json = JSON.parse(req.body.json);
    console.log(json);
    checkUserId(json);
    var locJson1 = json.location;

    console.log("-----REDIS DATA------");
    var redisKey = 'imadoko/reqres/' + json.toUserId;
    var redisData = JSON.stringify(json);
    redisClient.rpush(redisKey, JSON.stringify(json));

    console.log("redisKey: " + redisKey);
    console.log("redisData: " + redisData);

    var resJson = {};
    
    console.log("------RDIS DATA------");
    var redisKey = 'imadoko/reqres/' + json.fromUserId;
    console.log("redisKey: " + redisKey);
    fetchList(redisKey, {
        err: function(err) { res.send(resJson); },
        success: function(list) {
            if (list != null && list.length > 0) {
                var locJson2 = list[list.length-1].location;
                list[list.length-1].distance = calcDistance(locJson1, locJson2).toFixed(2);
            }
            console.log(list[list.length-1]);
            res.send(list);
        }
    });
};

//app.get('/api/lookup_reqres_imadoko', lookupReqresImadoko);
app.post('/api/lookup_reqres_imadoko', lookupReqresImadoko);

function lookupReqresImadoko(req, res) {
    console.log("\n---> called lookupReqresImadoko");
    var mockJson = {
        fromUserId: 1234
    };

    console.log("------POST DATA------");
    var json = JSON.parse(req.body.json);
    console.log(json);

    var resJson = {};
    console.log("------RDIS DATA------");
    var redisKey = 'imadoko/reqres/' + json.fromUserId;
    console.log("redisKey: " + redisKey);
    fetchList(redisKey, {
        err: function(err) { res.send(resJson); },
        success: function(list) { res.send(list); }
    });
};

function fetchList(key, callbackJson) {
    redisClient.llen(key, function(err, length) {
        if (err) {
            console.log("err: " + err);
        } else {
            console.log("length: " + length);
            redisClient.lrange(key, 0, length-1, function(err, replies) {
                if (err) {
                    console.log("err: " + err);
                    callbackJson.err(err);
                } else {
                    for (var i = 0; i < replies.length; i++) {
                        replies[i] = JSON.parse(replies[i]);
                    }
                    console.log(replies);
                    redisClient.del(key);
                    callbackJson.success(replies);
                }
            });
        }
    });
}

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

function checkUserId(json) {
    if ((json.fromUserId && json.toUserId) &&
            (json.fromUserId == json.toUserId)) {
        console.warn("fromUserId == toUserId, is it correct???");
    }
}

// ロケーションのJSONを引数に2点間の距離(km)を返す
function calcDistance(locJson1, locJson2) {
    if (locJson1 && locJson2) {
        return Location.distance(
            locJson1.latitude, locJson1.longitude,
            locJson2.latitude, locJson2.longitude) * 1000;
    } else {
        return -1;
    }
}
