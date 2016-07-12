var request = require('request');

// Credentials for authentication
var userName='xxxxx';
var password='xxxxx';

// Array of hosts to authenticate with
var hosts = [
    'xxxxx'
]

var getNextHost = function() {

    if (hosts.length > 0) {
        var nextHost = hosts[0];
        hosts.splice(0, 1); // remove the first element
        return nextHost;
    } else {
        return null;
    }
};

var authenticateWithFireWalls = function() {

    // We authenticate the hosts one at a time sequentially so that the console logging
    // will be readable. Otherwise requests would get executed in parallel and the console
    // logging for different hosts would be interlaced.
    var nextHost = getNextHost();
    if (nextHost != null) {
        doAuthentication(nextHost, function () {
            // Keep authenticating util we run out of hosts
            authenticateWithFireWalls();
        });
    }
};

var doAuthentication = function(url, callback) {

    console.log('Authenticating: ' + url);

    // create basic authorization header
    var authCookieValue = 'Basic ' + new Buffer(userName + ':' + password).toString('base64');
    //console.log('Auth cookie value: ' + authCookieValue);

    // send the request
    return request({
        method: 'GET',
        uri: url,
        headers: {
            'Authorization': authCookieValue // basic authorization
        }
    }, function (error, response, body) {

        if (error) {

            // host was found and we didn't get challenged by firewall
            if (error.code == 'ECONNREFUSED' || error.code == 'ECONNRESET') {
                console.log('Authentication successful.');
            }

            // host not found
            else if (error.code == 'ENOTFOUND') {
                console.log('Host not found...check your VPN connection.');
            }

            // an unexpected error happened
            else {
                console.log("Unexpected error:");
                console.log(error);
            }
        } else {

            // host was found and we didn't get challenged by firewall
            if (response.statusCode == 200 || response.statusCode == 404) {
                console.log('Authentication successful.');
            }

            // we got challenged by the firewall - must be invalid user/password
            else if (response.statusCode == 401) {
                console.log('401 - Check user name and password.');
            }

            // an unexpected error happened
            else {
                console.log("Unexpected response:");
                console.log(response.statusCode, body);
            }
        }
        console.log('');

        callback();
    });
};

authenticateWithFireWalls();

