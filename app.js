const request = require("request");
const http = require("http");
const url = require("url");
let apiData;
let gamesData = [];
let lastPage;
const gameOptionsReq = {
  url: "https://api.igdb.com/v4/games",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Client-ID": "vb838qqqsndwhxbu1gg98ljvtavacr",
    Authorization: "Bearer vfy1vmyrfsegaywsniv2jdfpvjbm0x",
  },
  body: "fields summary,platforms.*,rating,first_release_date,genres.name,screenshots.*,name,cover.*;where cover!=null & themes != (42) & first_release_date <= 631152000 & rating != null;limit 400; ",
};

request(gameOptionsReq, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    const parsedApiData = JSON.parse(body);

    function fragmentApiGamesData() {
      apiData = parsedApiData;
      let fragmentedGamesData = [];

      for (let i = 0; i < apiData.length; i++) {
        const gameData = apiData[i];
        const lastIteration = apiData.length - 1;
        fragmentedGamesData.push(gameData);
        // check when fragmentedGamesData have a maximum of 20 games and push the array to the gamesData;
        if (fragmentedGamesData.length === 20) {
          gamesData.push(fragmentedGamesData);
          fragmentedGamesData = [];
        }
        // if there are are not 20 games in the fragmentedGamesData and you are at the last iteration of the loop
        // push the fragmentedGamesData array with the remaining games to the gamesData;
        if (i === lastIteration) {
          gamesData.push(fragmentedGamesData);
          fragmentedGamesData = [];
        }
      }

      lastPage = gamesData.length - 1;
    }
    fragmentApiGamesData();
  }
});

const serverForSendingAllGames = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  if (pathname === "/gamesData") {
    const queryValue = +query.game;
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(JSON.stringify(gamesData[`${queryValue}`]));
  }
  if (pathname === "/id-for-last-page") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(JSON.stringify(lastPage));
  }
});

serverForSendingAllGames.listen(process.env.PORT || 5000, () => {});
