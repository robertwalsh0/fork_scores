'use strict';

var API = require('../../app.js');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var cheerio = require('cheerio');
var HTMLFixture = require('../fixtures/html.js');
var JSONFixture = require('../fixtures/api-response.js');

chai.use(chaiAsPromised);

describe('Get homepage', function () {
  it('return the homepage', function _callee() {
    var theHTML, $, theTitle;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(API.returnPitchforkPage());

          case 2:
            theHTML = _context.sent;
            $ = cheerio.load(theHTML);
            theTitle = $('title').text();

            expect(theTitle).to.equal('Pitchfork | The Most Trusted Voice in Music.');

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, null, this);
  });
});

describe('When taking a URL get the ID', function () {
  it('should return the URL only', function () {
    var theURL = "http://pitchfork.com/reviews/albums/21756-sept-5th/";
    var theID = API.getReviewID(theURL);
    expect(theID).to.equal('21756');
  });
});

describe('When taking a webpage return a list of the article links', function () {
  it('should get a list of all review URLS', function () {
    var theURLs = API.returnLinkURLs(HTMLFixture);
    var expectedValues = ['/reviews/albums/21756-sept-5th/', '/reviews/albums/21768-amen-goodbye/', '/reviews/albums/21596-everything-youve-come-to-expect/', '/reviews/albums/21747-pussys-dead/', '/reviews/albums/21776-patch-the-sky/'];
    expect(theURLs).to.deep.equal(expectedValues);
  });
});

describe('When taking an ID I should get the JSON for that review', function () {
  it('should fetch the JSON', function _callee2() {
    var theJSON, theID;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(API.fetchJSON(21756));

          case 2:
            theJSON = _context2.sent;
            theID = theJSON.results[0].id;

            expect(theID).to.equal(21756);

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, null, this);
  });
});