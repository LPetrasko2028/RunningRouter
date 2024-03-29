import React from 'react';
import { Button, Card } from 'flowbite-react';
import Drawer from './routeBarComponents/Drawer.jsx';
import FormDeleteRoute from './formsRoute/FormDeleteRoute.jsx';
import FormSaveRoute from './formsRoute/FormSaveRoute.jsx';
import MapContext from './mapComponents/MapContext.jsx';

import * as ol from 'ol';
import * as olExtent from 'ol/extent';
import * as olProj from 'ol/proj'
import * as olGeom from 'ol/geom'
import * as olLayer from 'ol/layer'
import * as olSource from 'ol/source'
import * as olStyle from 'ol/style'
import {getVectorContext} from 'ol/render.js';
import RouteBar from './routeBarComponents/RouteBar.jsx';

import StripeDrawer from './stripeComponents/StripeDrawer.jsx';
import EmbeddedStripeCheckout from './formsStripe/EmbeddedStripeCheckout.jsx';
import { set } from 'ol/transform.js';


const customTheme = {
    "root": {
      "base": "flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800",
      "children": "flex h-full flex-col justify-center gap-1 p-2",
      "horizontal": {
        "off": "flex-col",
        "on": "flex-col md:max-w-xl md:flex-row"
      },
      "href": "hover:bg-gray-100 dark:hover:bg-gray-700"
    },
    "img": {
      "base": "",
      "horizontal": {
        "off": "rounded-t-lg",
        "on": "h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
      }
    }
};

function SelectRouteBar(props) {
  const routes = props.routes;
  const setRoutes = props.setRoutes;
  const showBar = props.showBar;
  const setShowBar = props.setShowBar;
  const routesType = props.routesType;
  const setShowModal = props.setShowModal;
  const setModalContent = props.setModalContent;
  const showStripeDrawer = props.showStripeDrawer;
  const setShowStripeDrawer = props.setShowStripeDrawer;

  const [showRoutePreview, setShowRoutePreview] = React.useState(null);
  const [animationLayer, setAnimationLayer] = React.useState(null);
  const [startRoute, setStartRoute] = React.useState(false);

  const [startLoop, setStartLoop] = React.useState(false);

  const [showRouteNavBar, setShowRouteNavBar] = React.useState(false);
  const handleCloseRouteNavBar = () => { setShowRouteNavBar(false); setShowBar(true); }

  const { map } = React.useContext(MapContext);

  const handlePreview = (routeIndex) => {
    // Show the route on the map and erase the previous route
    if (showRoutePreview) {
      map.removeLayer(showRoutePreview);
      setShowRoutePreview(null);
    }
    if (animationLayer) {
      map.removeLayer(animationLayer);
      setAnimationLayer(null);
    }
    const route = routes[routeIndex].route;
    let points = []; // Convert each point object with lat and lng to an array
    if (!route[0][0]) {
      for (let i = 0; i < route.length; i++) {
        points.push([route[i].Lat, route[i].Lng]);
      }
    } else {
      points = route;
    }
    let maxLat, minLat, maxLng, minLng;
    for (let i = 0; i < points.length; i++) {
      points[i] = olProj.transform(points[i], "EPSG:4326", "EPSG:3857");
      if (i === 0) {
        maxLat = points[i][0];
        minLat = points[i][0];
        maxLng = points[i][1];
        minLng = points[i][1];
      } else {
        if (points[i].Lat > maxLat) {
          maxLat = points[i][0];
        }
        if (points[i].Lat < minLat) {
          minLat = points[i][0];
        }
        if (points[i].Lng > maxLng) {
          maxLng = points[i][1];
        }
        if (points[i].Lng < minLng) {
          minLng = points[i][1];
        }
      }
    }
    // Create the route line ---------------------------------------------------
    const lineString = new olGeom.LineString(points);
    const featureLine = new ol.Feature({
      type: "route",
      geometry: lineString,
    });
    const startMarker = new ol.Feature({
      type: "start",
      geometry: new olGeom.Point(lineString.getFirstCoordinate()),
    });
    const endMarker = new ol.Feature({
      type: "end",
      geometry: new olGeom.Point(lineString.getLastCoordinate()),
    });

    const styles = {
      route: new olStyle.Style({
        stroke: new olStyle.Stroke({
          width: 6,
          color: [50, 50, 200, 0.7],
        }),
      }),
      end: new olStyle.Style({
        image: new olStyle.Icon({
          anchor: [0.5, 1],
          scale: 0.04,
          src: "marker.png",
        }),
      }),
      start: new olStyle.Style({
        image: new olStyle.Circle({
          radius: 7,
          fill: new olStyle.Fill({ color: "grey" }),
          stroke: new olStyle.Stroke({
            color: [50, 50, 50, 0.5], // TO DO change to dark grey
            width: 1,
          }),
        }),
      }),
    };
    const routeLayer = new olLayer.Vector({
      source: new olSource.Vector({
        features: [featureLine, startMarker, endMarker],
      }),
      style: function (feature) {
        // hide geoMarker if animation is active
        return styles[feature.get("type")];
      },
    });
    map.addLayer(routeLayer);
    setShowRoutePreview(routeLayer);
    // Set the map zoom
    const extent = olExtent.boundingExtent(points);
    map.getView().fit(extent, { padding: [90, 75, 200, 75] });

  };
  const handleStart = (routeIndex) => {
    // TO DO - ACTIVE NAVIGATION
    // 1) add dynamic re-centering and rotation based on user location (follow the user, break if screen is changed)
    // 2) create icon for user location
    // 3) create logic to prevent a route starting if user location is too far from start (mostly applies to Saved Routes) Another solution would be dynamic route re-calculation, but this is not in scope for project
    // 4) determine how to deal with route breaks (when a user moves to far away from the path), is dynamic re-calculation necessary?
    // 5) end route when user is in x distance from end
    // 6) close routes bar
    // 7) create thin navigation bar with time, stop route, and stats

    // TO DO - FORMAT
    // separate this function into at least 1 separate file to clean the code up
    setStartRoute(true);
    console.log(startRoute);

    setStartLoop(true);
    console.log("start loop: ", startLoop);

    setShowRouteNavBar(true);
    setShowBar(false);

    if (showRoutePreview) {
      map.removeLayer(showRoutePreview);
      setShowRoutePreview(null);
    }
    // Get the route points ---------------------------------------------------
    const route = routes[routeIndex].route;
    let points = []; // Convert each point object with lat and lng to an array

    let maxLat, minLat, maxLng, minLng;

    if (!route[0][0]) {
      for (let i = 0; i < route.length; i++) {
        points.push([route[i].Lat, route[i].Lng]);
      }
    } else {
      points = route;
    }
    for (let i = 0; i < points.length; i++) {
      points[i] = olProj.transform(points[i], "EPSG:4326", "EPSG:3857");
      if (i === 0) {
        maxLat = points[i][0];
        minLat = points[i][0];
        maxLng = points[i][1];
        minLng = points[i][1];
      } else {
        if (points[i].Lat > maxLat) {
          maxLat = points[i][0];
        }
        if (points[i].Lat < minLat) {
          minLat = points[i][0];
        }
        if (points[i].Lng > maxLng) {
          maxLng = points[i][1];
        }
        if (points[i].Lng < minLng) {
          minLng = points[i][1];
        }
      }
    }

    // Create the route line ---------------------------------------------------
    const lineString = new olGeom.LineString(points);
    const featureLine = new ol.Feature({
      type: "route",
      geometry: lineString,
    });
    const startMarker = new ol.Feature({
      type: "start",
      geometry: new olGeom.Point(lineString.getFirstCoordinate()),
    });
    const endMarker = new ol.Feature({
      type: "end",
      geometry: new olGeom.Point(lineString.getLastCoordinate()),
    });
    const position = startMarker.getGeometry().clone();
    const geoMarker = new ol.Feature({
      type: "geoMarker",
      geometry: position,
    });

    const styles = {
      route: new olStyle.Style({
        stroke: new olStyle.Stroke({
          width: 6,
          color: [50, 50, 200, 0.7],
        }),
      }),
      end: new olStyle.Style({
        image: new olStyle.Icon({
          anchor: [0.5, 1],
          scale: 0.04,
          src: "marker.png",
        }),
      }),
      start: new olStyle.Style({
        image: new olStyle.Circle({
          radius: 7,
          fill: new olStyle.Fill({ color: "grey" }),
          stroke: new olStyle.Stroke({
            color: [50, 50, 50, 0.5], // TO DO change to dark grey
            width: 1,
          }),
        }),
      }),
      geoMarker: new olStyle.Style({
        // image: new olStyle.Icon({
        //   anchor: [0.5, 0.5],
        //   scale: 1,
        //   src: 'logo.svg',
        //   })
        image: new olStyle.Circle({
          radius: 7,
          fill: new olStyle.Fill({ color: "black" }),
          stroke: new olStyle.Stroke({
            color: "white",
            width: 2,
          }),
        }),
      }),
    };
    const routeLayer = new olLayer.Vector({
      source: new olSource.Vector({
        features: [featureLine, startMarker, endMarker, geoMarker],
      }),
      style: function (feature) {
        // hide geoMarker if animation is active
        return styles[feature.get("type")];
      },
    });
    map.addLayer(routeLayer);
    setAnimationLayer(routeLayer);
    const extent = olExtent.boundingExtent(points);
    map.getView().fit(extent, { padding: [90, 75, 200, 75] });
    // Start the route navigation ---------------------------------------------

    const speed = 600; // will be input by the user and passed as a state variable
    // start and stop animation
    let animating = false;
    let distance = 0;
    let lastTime;

    const moveFeature = (event) => {
      const time = event.frameState.time;
      const elapsedTime = time - lastTime;
      distance = (distance + (speed * elapsedTime) / 1e6) //% 2;
      console.log(distance);
      lastTime = time;

      function setDistance(distance) {
        if (distance >= 1) {
          stopAnimation();
          return 1;
        } else {
          return distance;
        }
      }
      const currentCoordinate = lineString.getCoordinateAt(
        setDistance(distance) // 2 - distance
      );
      position.setCoordinates(currentCoordinate);
      const vectorContext = getVectorContext(event);
      vectorContext.setStyle(styles.geoMarker);
      vectorContext.drawGeometry(position);
      // tell OpenLayers to continue the postrender animation
      map.render();
    };
    function startAnimation() {
      animating = true;
      lastTime = Date.now();
      // set animating boolean variable to true
      routeLayer.on("postrender", moveFeature);
    }
    startAnimation();

    function stopAnimation() {
      animating = false;
      // set animating boolean variable to false
      routeLayer.un("postrender", moveFeature);
      geoMarker.setGeometry(endMarker.getGeometry().clone()); // draws the geoMarker at the end of the route when the animation is stopped
      //setStartRoute(false);
    }

    // TO DO - ADD NAVIGATION BAR
    // TO DO - Create loop to start navigation. Separate state variable for the loop control.
    // In loop track user position, if user is within x distance of the end, stop the loop and the route
    // Something like if (!startRoute) {   setStartRoute(true); startRunningRoute(); }
    // function startRunningRoute() { ... }
    // function stopRunningRoute() { ... }
    // function recenter () { // add rotation control
    //   navigator.geolocation.getCurrentPosition((position) => {
    //     const latitude = position.coords.latitude;
    //     const longitude = position.coords.longitude;
    //     const coordinate = [longitude, latitude];
    //     const marker = new olLayer.Vector({
    //       source: new olSource.Vector({
    //         features: [
    //           new ol.Feature({
    //             geometry: new olGeom.Point(
    //               olProj.fromLonLat(coordinate)
    //             )
    //           })
    //         ]
    //       })
    //     })
    //     marker.setStyle(new olStyle.Style({
    //       image: new olStyle.Circle({
    //         radius: 3,
    //         fill: new olStyle.Fill({color: 'red'}),
    //         stroke: new olStyle.Stroke({
    //           color: [255,0,0], width: 2
    //         })
    //       })
    //     }))
    //     map.addLayer(marker);
    //     map.getView().setCenter(olProj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'));
    //     map.getView().setZoom(18);
    //   });
    // }
    // console.log("Start Route", startRoute);
    // async function wrapper() {
    //   return new Promise(resolve => {
    //     setTimeout(() => {
    //       resolve();
    //     }, 10000);
    //   });
    // }
    // async function wait() {
    //   await wrapper();
    // }
    // function sleep(ms) {
    //   return new Promise(resolve => setTimeout(resolve, ms));
    // }
    // while (!startLoop) {
    //   // TO DO - ADD USER LOCATION TRACKING
    //   setTimeout(() => {
    //   recenter();
    //   console.log("Recentering");
    //   }, 100);

    //   // TO DO - ADD USER LOCATION ICON

    //   // TO DO - ADD USER LOCATION FOLLOWING
    //   // TO DO - ADD USER LOCATION RE-CENTERING
    //   // TO DO - ADD USER LOCATION ROTATION
    //   // TO DO - ADD USER LOCATION DISTANCE FROM ROUTE
    //   // TO DO - ADD USER LOCATION DISTANCE FROM END
    //   // TO DO - ADD USER LOCATION DISTANCE FROM START
    //   // TO DO - ADD USER LOCATION DISTANCE FROM BREAK
    // }
  };
  const handleCancel = (routeIndex) => {
    console.log("Cancel "+routes[routeIndex].name);
    // Stop the route navigation
    map.removeLayer(animationLayer);
    setAnimationLayer(null)
    setStartRoute(false);
  }
  const handleSave = (routeIndex) => {
    console.log("Save "+routes[routeIndex].name);
    // MongoDB FindOneAndUpdate if we are keeping MyRoutes as state, otherwise call for MyRoutes on render
    setModalContent(<FormSaveRoute handleClose={()=>setShowModal(false)} route={routes[routeIndex]} />)
    setShowModal(true)
  }
  const handleDelete = (routeIndex) => {
    console.log("Delete "+routes[routeIndex].name);
    // MongoDB FindOneAndUpdate because MyRoutes would be currently displayed. Only change display/React state when the mongoDB/backend state updates.
    if (routesType === 'My Routes') {
    setModalContent(<FormDeleteRoute handleClose={()=>setShowModal(false)} route={routes[routeIndex]} />)
    setShowModal(true)
    } else if (routesType === 'Generated Routes') {
      const newRoutes = [...routes]
      newRoutes.splice(routeIndex, 1)
      setRoutes(newRoutes)
    }
  }

  const handleCloseBar = () => {
    if (animationLayer) {map.removeLayer(animationLayer); setAnimationLayer(null);}
    if (showRoutePreview) {map.removeLayer(showRoutePreview); setShowRoutePreview(null);}
    setStartRoute(false)
    setShowBar(false)

  }
  return (
    <>
      <Drawer show={showBar} onClose={handleCloseBar} routesType={routesType} >
        {(routes.length) ? routes.map((route, index) => {
          return (
            <Card
              key={index}
              theme={customTheme}
              className="max-h-sm p-0 m-0"
            >
              <div onClick={() => handlePreview(index)}>
              <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white p-0 m-0">
                {route.name ?? "Route " + (index+1)}
              </h5>
              </div>
              <div className="flex flex-row space-x-1 p-0 m-0">
              {(!startRoute) ? <Button onClick={()=>handleStart(index)} color="success" size="xs" className="m-0">Start</Button> : <Button onClick={()=>handleCancel(index)} color="success" size="xs" className="m-0">Stop</Button> }
              {(routesType === "Generated Routes") ? <Button onClick={()=>handleSave(index)} color="blue" size="xs" className="m-0">Save</Button> : null}
              <Button onClick={()=>handleDelete(index)} color="failure" size="xs" className="m-0">Delete</Button>
              </div>
            </Card>
          );
        }): <div className="text-red-600" >No Routes Available</div>}
      </Drawer>
      <RouteBar show={showRouteNavBar} onClose={handleCloseRouteNavBar} />
      <StripeDrawer show={showStripeDrawer.show} onClose={()=>setShowStripeDrawer({show: false, option: null})} stripeObj={showStripeDrawer} >{(showStripeDrawer.show) ? <EmbeddedStripeCheckout/> : null}</StripeDrawer>

    </>
  );
}

export default SelectRouteBar;
