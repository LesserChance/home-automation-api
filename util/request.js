var querystring = require('querystring');
var fs          = require('fs');
var http        = require('http');
var Q           = require('q');

var request = function request(host, path, method, data, auth, query_format) {
    if (typeof data === "undefined") {
        data = {};
    }
    if (typeof auth === "undefined") {
        auth = "";
    }
    if (typeof query_format === "undefined") {
        query_format = true;
    }

    var deferred = Q.defer(),
        string_data = query_format ? querystring.stringify(data) : JSON.stringify(data),
        response_body = "";

    var req = http.request({
        host: host,
        port: 80,
        path: path,
        method: method,
        auth: auth,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': string_data.length
        }
    }, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            response_body += chunk;
        });
        res.on('end', function () {
            deferred.resolve(JSON.parse(response_body));
        });
    });

    req.on('error', function(e) {
        deferred.resolve();
    });

    req.write(string_data);
    req.end();

    return deferred.promise;
};

var self = module.exports = {
    post:  function(host, path, data, auth, query_format) {
        return request(host, path, "POST", data, auth, query_format);
    },
    get:  function(host, path, auth, query_format) {
        return request(host, path, "GET", null, auth, query_format);
    },
    put:  function(host, path, data, auth, query_format) {
        return request(host, path, "PUT", data, auth, query_format);
    },
    perform:  function(host, path, method, data, auth, query_format) {
        if (typeof method === "undefined") {
            method = "GET";
        }

        return request(host, path, method, data, auth, query_format);
    }
};

