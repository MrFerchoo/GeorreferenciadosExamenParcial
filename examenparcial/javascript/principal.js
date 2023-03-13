import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import Point from "ol/geom/Point.js";
import View from "ol/View.js";
import { Circle as CircleStyle, Stroke, Style } from "ol/style.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { easeOut } from "ol/easing.js";
import { fromLonLat } from "ol/proj.js";
import { getVectorContext } from "ol/render.js";
import { unByKey } from "ol/Observable.js";

//Objetos HTML
const btnMostrarMapa = document.getElementById('btnmapa');
const txtlatitud = document.getElementById('latitud');
const txtlongitud = document.getElementById('longitud');
const txtlugar = document.getElementById('nombrelugar')

//Objetos para el punto
const tileLayer = new TileLayer({
  source: new OSM({
    wrapX: false,
  }),
});
const source = new VectorSource({
  wrapX: false,
});
const vector = new VectorLayer({
  source: source,
});

//API
const API_URL = "http://localhost:4000/city";
const xhr = new XMLHttpRequest(); 

async function onRequestHandler(){
  if(this.readyState == 4 && this.status == 200){
    console.log(this.response);
    const data = JSON.parse(this.response);
    while(true){
      console.log('calling json map');
      data.map(city => addCityFeature(city.longitude,city.latitude));
      await sleep(4000);
    }
  }
}

xhr.addEventListener("load", onRequestHandler);
xhr.open("GET", API_URL);
xhr.send();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
btnMostrarMapa.addEventListener('click', () => {
//Validacion de rango
if(latitud.value > 20.638682 || latitud.value < 20.605071 || longitud.value < -101.693165 || longitud.value > -101.653712 ){
  alert("Su ubicacion esta afuera de nuestros alcances");
}
else if(nombrelugar.value == ""){
  alert("Ponga el nombre de su ubicacion");
}
else{
//Boton
  const nombrelugar = parseFloat(txtlugar.value);
  const latitud = parseFloat(txtlatitud.value);
  const longitud = parseFloat(txtlongitud.value);
  addFromLonLarFeature(longitud,latitud);

  const mapa = new Map({
    layers: [tileLayer,vector],
    target: 'mapa',
    view: new View({
      center: fromLonLat([-101.67170,20.62671]),
      //center: [0, 0],
      zoom: 14,
      multiWorld: true,
    }),
  });

//Label de nombre de lugar
var texto = document.getElementById("nombrelugar").value;
  document.getElementById("lugar").textContent = texto;

// Desplegar texto invisible
document.getElementById("bienvenida").style.display = "block";

//Funciones para el punto
const duration = 3000;
function flash(feature) {
  const start = Date.now();
  const flashGeom = feature.getGeometry().clone();
  const listenerKey = tileLayer.on("postrender", animate);

  function animate(event) {
    const frameState = event.frameState;
    const elapsed = frameState.time - start;
    if (elapsed >= duration) {
      unByKey(listenerKey);
      return;
    }
    const vectorContext = getVectorContext(event);
    const elapsedRatio = elapsed / duration;
    const radius = easeOut(elapsedRatio) * 25 + 5;
    const opacity = easeOut(1 - elapsedRatio);
    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: "rgba(255, 0, 0, " + opacity + ")",
          width: 0.25 + opacity,
        }),
      }),
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    mapa.render();
  }
}

source.on("addfeature", function (e) {
  flash(e.feature);
});
}
});
function addCityFeature(longitude, latitude) {
  addFromLonLarFeature(longitude, latitude);
  window.setInterval(addFromLonLarFeature, 5000);
}

function addFromLonLarFeature(longitude, latitude) {
  const x = longitude;
  const y = latitude;
  const geom = new Point(fromLonLat([x, y]));
  const feature = new Feature(geom);
  source.addFeature(feature);
}
