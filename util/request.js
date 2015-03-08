var querystring = require('querystring');
var fs          = require('fs');
var http        = require('http');
var Q           = require('q');

var request = function request(host, path, method, data, auth, query_format, as_url_params) {
    if (typeof data === "undefined") {
        data = {};
    }
    if (typeof auth === "undefined") {
        auth = "";
    }
    if (typeof query_format === "undefined") {
        query_format = true;
    }
    if (typeof as_url_params === "undefined") {
        as_url_params = false;
    }

    var deferred = Q.defer(),
        string_data = query_format || as_url_params ? querystring.stringify(data) : JSON.stringify(data),
        response_body = "";

    var req = http.request({
        host: host,
        port: 80,
        path: path + (as_url_params ? "?" + string_data : ""),
        method: method,
        auth: auth,
        headers: (as_url_params) ? null : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': string_data.length
        }
    }, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            response_body += chunk;
        });
        res.on('end', function () {
            try {
                deferred.resolve(JSON.parse(response_body));
            } catch (e) {
                console.debug("INVALID JSON RETURNED");
                console.debug(host, path, method, string_data);
                console.debug(response_body);
                console.debug("---------------------");
            }
        });
    });

    req.on('error', function(e) {
        deferred.resolve();
    });

    if (!as_url_params) {
        req.write(string_data);
    }

    req.end();

    return deferred.promise;
};

var self = module.exports = {
    post:  function(host, path, data, auth, query_format, as_url_params) {
        return request(host, path, "POST", data, auth, query_format, as_url_params);
    },
    get:  function(host, path, auth, query_format, as_url_params) {
        return request(host, path, "GET", null, auth, query_format, as_url_params);
    },
    put:  function(host, path, data, auth, query_format, as_url_params) {
        return request(host, path, "PUT", data, auth, query_format, as_url_params);
    },
    perform:  function(host, path, method, data, auth, query_format, as_url_params) {
        if (typeof method === "undefined") {
            method = "GET";
        }

        return request(host, path, method, data, auth, query_format, as_url_params);
    }
};

