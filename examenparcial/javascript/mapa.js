import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
const { fromLonLat } = require('ol/proj');

app.get('/views/principal.html:longitud',(req,res) => {
  const latitud = parseFloat(req.query.latitud);
  const longitud = parseFloat(req.query.longitud);

  const view = new View({
    center: fromLonLat([longitud, latitud]),
    zoom:13
  });

  const map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: [0, 0],
      zoom: 2
    })
  })
});

