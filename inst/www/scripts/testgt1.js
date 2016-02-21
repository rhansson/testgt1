/* 
 Copyright (c) 2015 Roland Hansson - Nova Spatial LLC. All rights reserved. 
*/

var L; // Leaflet
var L_map;
var L_markerLayer;
var G_colorScale;
var G_points = [];  // point features

window.addEventListener('load', function(){
	//console.log("document load"); 
	if (document.createElement('canvas').getContext) {
		console.log("document ok"); 
	} else {
		document.getElementById('msg').innerHTML = "Browser must support HTML5!";
		return;		
	}
 });

$(document).ready(function(){
	console.log("document ready");

  $('#about').load("footer.html");
  $('#copyright').load("copyright.html");

  // set up Mapbox
  L.mapbox.accessToken = 'YOUR_KEY_HERE';
  L_map = L.mapbox.map('map', 'mapbox.light', {
    maxZoom: 17, minZoom: 5,
    legendControl: {
      position: 'topright'
    }
  }).setView([33.690, -117.772], 10);
  L_map.on("moveend", refresh);  // Fired when the view of the map stops changing (incl zoom)

  // draw study area outline
  var promise = $.getJSON('data/oc_clip.geojson');
  promise.then(function(data) {           
    console.log(data.features.length +" features")
    geojsonLayer = L.geoJson(data, {
      style: function(feature) { return {
        fill: false,
        weight: 2,
        color: '#FF00FF' 
      }}
    }); 
    L_map.addLayer(geojsonLayer);
    L.control.scale().addTo(map);
  });

  // create marker layer for themes
  L_markerLayer = L.mapbox.featureLayer().addTo(L_map);
      
  G_colorScale = d3.scale.ordinal()  // Orange-Red
    .range(colorbrewer.OrRd[9])
    .domain([1,2,3,4,5,6,7,8,9,10]);

  $("#refresh").on("click", function() {
    $("#refresh").attr("disabled", "disabled"); 
    refresh(null);
  }); 

  $("#test").on("click", function(){
    $("#test").attr("disabled", "disabled");
    var req = ocpu.rpc("test", {
      x : "hello"
    }, function(output){
      $("#output").text(output.message);
    });
    req.fail(function(){
      alert("Server error: " + req.responseText);
    });
    req.always(function(){
      $("#test").removeAttr("disabled")
    });
  });

  $("#corr").on("click", function() {
    var theme = $("#theme").find('option:selected').val();         
    var bnds = L_map.getBounds();  // NE, SW lat/lon
    var zoom = L_map.getZoom();    
    
    // request features via opencpu Stateful
    var res = null;
    console.log("Call: "+theme+" Zoom:"+zoom+" "+bnds._southWest.lng+","+bnds._southWest.lat+" "+bnds._southWest.lng+","+bnds._southWest.lat)
    $("#corr").attr("disabled", "disabled");
    var req1 = ocpu.call("testgt1", {
      sw : bnds._southWest,          
      ne : bnds._northEast,
      zoom : zoom,
      theme: theme
      }, function(session1) {
        var req2 = ocpu.call("corXY", {df : session1}, function(session2) {
          session2.getObject(function(data) {
            $("#output").text(data);
          });
        });
        req2.fail(function(){
          alert("Server error: " + req2.responseText);
        });
      });
    req1.fail(function(){
      alert("Server error: " + req1.responseText);
    });
    req1.always(function(){
      $("#corr").removeAttr("disabled")
    });
  });

  // draw map
  refresh();
});

function refresh(e) {
  if (e!==null) {  // Check on null because L_map.on("moveend", refresh) event sends an object
    if (!($('#auto').is(":checked"))) {
      return;
    }    
  }
  var theme = $("#theme").find('option:selected').val();         
  var bnds = L_map.getBounds();  // NE, SW lat/lon
  var zoom = L_map.getZoom();    
  
  // request features via opencpu stateless
  var res = null;
  console.log("RPC: "+theme+" Zoom:"+zoom+" "+bnds._southWest.lng+","+bnds._southWest.lat+" "+bnds._southWest.lng+","+bnds._southWest.lat)
  var req = ocpu.rpc("testgt1", {
    sw : bnds._southWest,          
    ne : bnds._northEast,
    zoom : zoom,
    theme: theme
  }, function(res) {
    //console.log(res)
    if (res[0]) {  // not null  
      $("#output").text(res.length+" points");
      G_points = res;
      refreshMap(G_points, L_map, L_markerLayer, theme, G_colorScale);      
    } else {
      $("#output").text("0 points returned");      
    }    
  });
  req.fail(function(){
    alert("Server error: " + req.responseText);
  });
  req.always(function(){
    $("#refresh").removeAttr("disabled")
  });
}

function refreshMap(points, map, markerLayer, theme, colorScale) {
  markerLayer.clearLayers();  // reset map
  var arrLen = points.length;  
  var markerOpts = {
    radius: 7,
    fillColor: '#6F4E37',
    stroke: false,
    fillOpacity: 0.7
  }
  // assign color
  var val = null;
  for (var i=0; i<arrLen; i++) {
    p = points[i];
    switch(theme) {                  
      case 'colls':
        val = p.INJURED;
        //console.log(val)
        markerOpts['fillColor'] = colorScale(val).toString();
        break;                  
    }
    var marker = L.circleMarker([p.y, p.x], markerOpts);
    markerLayer.addLayer(marker);                       
  }                              
  map.invalidateSize();  // force redraw
}

