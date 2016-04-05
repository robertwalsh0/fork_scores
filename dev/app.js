require("babel-polyfill");

var request = require('request');
var cheerio = require('cheerio');
var API = {}

function getPitchfork(){
  return new Promise(function(resolve, reject){
    request('http://pitchfork.com', function(err, resp, body){
      if (err) { return err }
      resolve(body)
    })
  })
}

function getReviewJSON(ID){
  return new Promise(function(resolve, reject){
    request(`http://api.pitchfork.com/api/v1/albumreviews/${ID}`, function(err, resp, body){
      if (err) { return err }
      resolve(body)
    })
  })
}

API.getReviewID = function(URL) {
  var exp = /albums\/(.\d*)/g;
  var shorterURL = URL.match(exp)
  var theID = shorterURL[0].replace('albums/', '')
  return theID
}

API.returnPitchforkPage = async function (){
  var siteContent = await getPitchfork()
  return siteContent
}

API.returnLinkURLs = (HTML) => {
  var $ = cheerio.load(HTML)
  var URLArray = []
  var theURLs = $(".album-reviews a.artwork").each((index, item) =>{
    theURLs = URLArray.push($(item).attr('href'))
  })
  return URLArray
}

API.fetchJSON = async function(ID){
  var resp = await getReviewJSON(ID)
  var parsedJSON = JSON.parse(resp)
  return parsedJSON
}

var main = async function(){
  var HTML = await API.returnPitchforkPage()
  var linksArray = API.returnLinkURLs(HTML)
  var reviewIDs = linksArray.map((item) => { return API.getReviewID(item) })

  // Async functions on a .map have to be wrapped in a Promise.all
  var ReviewsJSON = await Promise.all(reviewIDs.map(async (item) => {
    return await API.fetchJSON(item)
  }))

  var report = ReviewsJSON.map((item) => {
    return {
      artist: item.results[0].tombstone.albums[0].album.artists[0].display_name,
      rating: item.results[0].tombstone.albums[0].rating.rating,
      albumTitle: item.results[0].tombstone.albums[0].album.display_name,
      genre: item.results[0].genres[0].display_name
    }
  })

  console.log("Pitchfork Reviews for today: ", report)
}

main()

module.exports = API;
