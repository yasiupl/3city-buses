const stopsAPI = 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/4c4025f0-01bf-41f7-a39f-d156d201b82b/download/stops.json';

const request = require('request');
const path = require('path');
const fs = require('fs');

function saveToFile(data, path, name) {
    fs.writeFile(path + name, data, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

function parseJSONtoGeoJSON(json) {
    const data = json[(new Date()).toISOString().split("T")[0]].stops;
    let geojson = {
        type: "FeatureCollection",
        name: "Przystanki",
        features: []
    }

    for (let i in data) {
        let point = data[i];
        geojson.features.push({
            type: "Feature",
            properties: point,
            geometry: {
                type: "Point",
                coordinates: [point.stopLon, point.stopLat]
            }
        });
    }
    saveToFile(JSON.stringify(geojson), './dist/data/', 'przystanki.geojson');
    saveToFile(JSON.stringify(["przystanki"]), './src/', 'sources.json');
    
}

function downloadAndParse(url) {
    request({
        url: url,
        json: true
    }, function (error, response, body) {;
        parseJSONtoGeoJSON(body);
    });
}

downloadAndParse(stopsAPI);