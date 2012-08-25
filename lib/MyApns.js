exports.get = function() {
    var myApns = {};

    var apns = require('apn');
    function errorCallback(err, notification) {
        console.log(err);
        console.log(notification);
    }
    var options = {
        cert: 'cert.pem',
        certData: null,
        key:  'key.pem',
        keyData: null,
        passphrase: 'passphrase',
        ca: null,
        gateway: 'gateway.sandbox.push.apple.com',
        port: 2195,
        enhanced: true,
        errorCallback: errorCallback,
        cacheLength: 100
    };
    var apnsConnection = new apns.Connection(options);

    myApns.apns = apns;
    myApns.connection = apnsConnection;
    return myApns;
}
