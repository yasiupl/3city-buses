import 'materialize-css/dist/js/materialize.min.js'
import mapboxgl from 'mapbox-gl'
import sources from './sources.json'
import headers from './przystanek.json'
import './style.scss'

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js');
    });
}

mapboxgl.accessToken = 'pk.eyJ1IjoieWFzaXUiLCJhIjoiY2o4dWF2dmZnMHEwODMzcnB6NmZ5cGpicCJ9.XzC5pC59qPSmqbLv2xBDQw';

const paint = {
    "circle-color": "#11b4da",
    "circle-radius": 5,
    "circle-stroke-width": 1,
    "circle-opacity": 0.8,
    "circle-stroke-color": "#555"
}

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    hash: true,
    center: [18.5209, 54.4394],
    zoom: 6
});

// Add geolocate control to the map.
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

map.addControl(new mapboxgl.NavigationControl());


map.on('load', function () {
    for (let source of sources) {
        addLayerFromHash(map, source);
    }


});

map.on('idle', detailsLoadInView);

map.on('moveend', detailsLoadInView);


function addLayerFromHash(map, hash) {
    map.addLayer({
        id: hash,
        type: "circle",
        source: {
            type: "geojson",
            data: `./data/${hash}.geojson?t=${sources.generated}`
        },
        paint: paint
    });
    map.on('click', hash, (e) => {
        detailsLoad(e.features[0].properties.id);
    });

    map.on('mouseenter', hash, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', hash, function () {
        map.getCanvas().style.cursor = '';
    });
}


function detailsLoad(id, mapInstance = map) {
    let details = document.querySelector('#details');
    let description = ''
    const feature = map.queryRenderedFeatures({
        filter: ['has', 'stopName'],
        validate: false
    });
    const properties = feature[0].properties;
    const coordinates = [properties.stopLon, properties.stopLat];

    for (let i in properties) {
        description += `<b>${(headers[i])? headers[i] : i}:</b> ${properties[i]}</br>`;
    }

    details.data = 'details'
    details.innerHTML = `<i id="detailsClose" class="material-icons right">arrow_back</i>`
    details.innerHTML += description;

    document.querySelector("#detailsClose").addEventListener('click', () => {
        details.data = '';
        details.scrollTop = 0;
        clearPopUps();
        detailsLoadInView();
    });

    mapInstance.flyTo({
        center: coordinates,
        offset: [(window.innerWidth > 992) ? window.innerWidth / 10 : 0, (window.innerWidth < 992) ? -1 * window.innerHeight / 4 : 0],
        speed: 0.8,
        zoom: map.getZoom(),
        bearing: 0
    });

    let popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<center>${properties.stopCode || ""} ${(properties.stopDesc || properties.stopName).slice(0, 30)}</center>`)
        .addTo(mapInstance);

    (window.popups = window.popups || []).push(popup)
}

function detailsLoadInView() {
    let details = document.querySelector('#details');
    let features = map.queryRenderedFeatures({
        filter: ['has', 'stopName'],
        validate: false
    });

    if (details.data != 'details') {
        details.innerHTML = `Przystanki w widoku.`;
        details.data = 'collection'

        let collection = document.createElement('ul');
        collection.className = 'collection'
        details.appendChild(collection);

        for (let i in features) {
            let feature = features[i];
            let element = document.createElement('li');
            element.className = 'collection-item truncate';
            element.onclick = function () {
                detailsLoad(feature.properties.id)
            };
            element.innerHTML = `${(feature.properties.stopDesc || properties.stopName)}<span class="badge new" data-badge-caption="">${feature.properties.stopCode}</span>`;
            collection.appendChild(element);
        }
    }
}

function clearPopUps() {
    for (let i in window.popups) {
      window.popups[i].remove();
    }
  }