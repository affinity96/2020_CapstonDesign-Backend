var express = require("express");
var router = express.Router();
var request = require("request");


router.post("/infor", (req,res) =>{
    var message = "에러 발생";
    var resultCode = 404;
    var currentLocation_latitude = req.body.lat;
    var currentLocation_longitude = req.body.lon;



    var apiURI = "http://api.openweathermap.org/data/2.5/weather?lat="+currentLocation_latitude+"&lon="+currentLocation_longitude+"&appid=866b4be044cb21855136af0babacb72a";



    request.get(apiURI, (err, res1, body) => {
        const info =JSON.parse(body);
        console.log(info);

        var current_temperature = (info.main.temp - 273.15).toFixed(2);
        var current_weather = info.weather[0].main;

        res.json({
            current_temperature :current_temperature,
            current_weather : current_weather
        });
    });
});

module.exports = router;