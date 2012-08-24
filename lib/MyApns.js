exports.get = function() {
    var myApns = {};

    var apns = require('apn');
    function errorCallback(err, notification) {
        console.log(err);
        console.log(notification);
    }
    var options = {
        cert: './_devel_secret_keys/apns-client-cert.pem',
        certData: null,
        key:  './_devel_secret_keys/apns-client-key-noenc.pem',
        keyData: null,
        passphrase: 'mixi_iphone',
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
