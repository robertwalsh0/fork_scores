'use strict';

require("babel-polyfill");

var request = require('request');
var cheerio = require('cheerio');
var API = {};

var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ port: 3000 });

// ----------------------------
// FUNCTIONS
// ----------------------------
function getPitchfork() {
  return new Promise(function (resolve, reject) {
    request('http://pitchfork.com', function (err, resp, body) {
      if (err) {
        return err;
      }
      resolve(body);
    });
  });
}

function getReviewJSON(ID) {
  return new Promise(function (resolve, reject) {
    request('http://api.pitchfork.com/api/v1/albumreviews/' + ID, function (err, resp, body) {
      if (err) {
        return err;
      }
      resolve(body);
    });
  });
}

API.getReviewID = function (URL) {
  var exp = /albums\/(.\d*)/g;
  var shorterURL = URL.match(exp);
  var theID = shorterURL[0].replace('albums/', '');
  return theID;
};

API.returnPitchforkPage = function _callee() {
  var siteContent;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(getPitchfork());

        case 2:
          siteContent = _context.sent;
          return _context.abrupt('return', siteContent);

        case 4:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this);
};

API.returnLinkURLs = function (HTML) {
  var $ = cheerio.load(HTML);
  var URLArray = [];
  var theURLs = $(".album-reviews a.artwork").each(function (index, item) {
    theURLs = URLArray.push($(item).attr('href'));
  });
  return URLArray;
};

API.fetchJSON = function _callee2(ID) {
  var resp, parsedJSON;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(getReviewJSON(ID));

        case 2:
          resp = _context2.sent;
          parsedJSON = JSON.parse(resp);
          return _context2.abrupt('return', parsedJSON);

        case 5:
        case 'end':
          return _context2.stop();
      }
    }
  }, null, this);
};

var main = function _callee5() {
  var _this = this;

  var HTML, linksArray, reviewIDs, ReviewsJSON, report;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(API.returnPitchforkPage());

        case 2:
          HTML = _context5.sent;
          linksArray = API.returnLinkURLs(HTML);
          reviewIDs = linksArray.map(function (item) {
            return API.getReviewID(item);
          });

          // Async functions on a .map have to be wrapped in a Promise.all

          _context5.next = 7;
          return regeneratorRuntime.awrap(Promise.all(reviewIDs.map(function _callee3(item) {
            return regeneratorRuntime.async(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return regeneratorRuntime.awrap(API.fetchJSON(item));

                  case 2:
                    return _context3.abrupt('return', _context3.sent);

                  case 3:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, null, _this);
          })));

        case 7:
          ReviewsJSON = _context5.sent;
          _context5.next = 10;
          return regeneratorRuntime.awrap(Promise.all(ReviewsJSON.map(function _callee4(item) {
            return regeneratorRuntime.async(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return regeneratorRuntime.awrap({
                      artist: item.results[0].tombstone.albums[0].album.artists[0].display_name,
                      rating: item.results[0].tombstone.albums[0].rating.rating,
                      albumTitle: item.results[0].tombstone.albums[0].album.display_name,
                      genre: item.results[0].genres[0].display_name
                    });

                  case 2:
                    return _context4.abrupt('return', _context4.sent);

                  case 3:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, null, _this);
          })));

        case 10:
          report = _context5.sent;
          _context5.next = 13;
          return regeneratorRuntime.awrap(report);

        case 13:
          return _context5.abrupt('return', _context5.sent);

        case 14:
        case 'end':
          return _context5.stop();
      }
    }
  }, null, this);
};

//-----------------------
// SERVER
//-----------------------

server.start(function (err) {
  if (err) {
    throw err;
  }
  console.log('Server running at: ' + server.info.uri);
});

server.register([require('vision'), require('hapi-async-handler')], function (err) {

  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './templates'
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: {
      async: function async(request, reply) {
        var theData;
        return regeneratorRuntime.async(function async$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return regeneratorRuntime.awrap(main());

              case 2:
                theData = _context6.sent;

                reply.view('index.html', {
                  data: theData
                });

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, null, this);
      }
    }
  });
});

//-----------------------

main();

module.exports = API;