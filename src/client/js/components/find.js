import React from "react";
import { withGoogleMap, withScriptjs, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import { compose, withProps, withStateHandlers } from "recompose";

import "../../css/find.scss";
import data from "../data/data.js";

import { Link } from "react-router";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faFacebookMarker from "@fortawesome/fontawesome-free-solid/faMapMarkerAlt";
import faFacebookGlobe from "@fortawesome/fontawesome-free-solid/faGlobe";
import faFacebookPhone from "@fortawesome/fontawesome-free-solid/faPhone";
import faFacebookClock from "@fortawesome/fontawesome-free-solid/faClock";

import pictoBiere from "../../img/pictoBiere.png";
import pictoPinte from "../../img/pictoPinte.png";
import pictoMicrob from "../../img/pictoMicrob.png";

import markerBiere from "../../img/markerBiere.png";
import markerPinte from "../../img/markerPinte.png";

const mapStyle = [{"featureType": "administrative.land_parcel","stylers": [{"visibility": "off"}]},{"featureType": "administrative.neighborhood","stylers": [{"visibility": "off"}]},{"featureType": "poi","stylers": [{"visibility": "off"}]},{"featureType": "road","elementType": "labels.icon","stylers": [{  "visibility": "off"}]},];

const MyMapComponent = compose(
    withStateHandlers(() => ({ isOpen: -1, }), { onToggleOpen: ({ e }) => (e) => ({ isOpen: e, }) }),
    withScriptjs,
    withGoogleMap
)(props =>
    <GoogleMap
        zoom={props.zoom}
        center={{ lat: props.lat, lng: props.lng }}
        defaultOptions={{ styles: mapStyle }}
    >

        {props.markers.map(function (item, index) {
            var image = markerBiere;
            if (item.type === "bar") {
                image = markerPinte;
            } else if (item.type === "us") {
                image = pictoMicrob;
            }
            return (
                <Marker key={index} position={{ lat: item.latitude, lng: item.longitude }} icon={ image } onClick={() => props.onToggleOpen(index)}>
                    {(props.isOpen == index) && <InfoWindow onCloseClick={() => props.onToggleOpen(-1)}>
                        <div className="infoWindow">
                            <div className="infoWindowRow">
                                <FontAwesomeIcon icon={faFacebookMarker} className="infoIcon"/>
                                <span>{item.address}</span>
                            </div>
                            <div className="infoWindowRow">
                                <FontAwesomeIcon icon={faFacebookGlobe} className="infoIcon"/>
                                <a href={item.site} target="_blank">{item.site}</a>
                            </div>
                            <div className="infoWindowRow">
                                <FontAwesomeIcon icon={faFacebookPhone} className="infoIcon"/>
                                <span>{item.phone}</span>
                            </div>
                            <div className="infoWindowRow">
                                <FontAwesomeIcon icon={faFacebookClock} className="infoIcon"/>
                                <span>{item.time}</span>
                            </div>
                        </div>
                    </InfoWindow>}
                </Marker>
            );
        })}
    </GoogleMap>
);

export class Find extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            places: data.find,
            markers: data.map,
            zoom: 13,
            lat: 45.164172,
            lng: 1.537178,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({ lat: parseFloat(e.target.value.split("_")[0]), lng: parseFloat(e.target.value.split("_")[1]) });
    }

    render() {
        return (
            <div className="findContainer">
                <div className="pageTitle findPageTitle">POINTS DE VENTE</div>
                <div className="findPageSubtitle">Parcourez la carte pour connaitre les points de vente de Banou</div>

                <div className="findColumn">
                    <div className="findLeftColumn">
                        <MyMapComponent
                            containerElement={<div className="fullHeight" />}
                            mapElement={<div className="fullHeight" />}
                            markers={this.state.markers}
                            zoom={this.state.zoom}
                            lat={this.state.lat}
                            lng={this.state.lng}
                            isOpen={-1}
                            loadingElement={<div style={{ height: "100%" }} />}
                            googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyBpQuWaLLHJrTvR_vwPAKKXFzDGt0__NB8&libraries=places&language=fr"
                        />
                    </div>

                    <div className="findRightColumn">
                        <div className="selectCityContainer">
                            <select className="selectCity" defaultValue="nothing" onChange={(e) => this.handleChange(e)}>
                                <option value="nothing" disabled>Sélectionnez une ville</option>
                                {this.state.places.map(function (item, index) {
                                    return (
                                        <option key={index} value={item.latitude + "_" + item.longitude}>{item.name}</option>
                                    );
                                }.bind(this))}
                            </select>
                            <div className="legend">
                                <img src={pictoBiere} className="legendImg"/>
                                <div className="legendText">Les bars où vous pourrez dégustez la Banou</div>
                            </div>
                            <div className="legend">
                                <img src={pictoPinte} className="legendImg"/>
                                <div className="legendText">Les magasins et caves où vous pourrez en achetez</div>
                            </div>
                            <div className="legend">
                                <img src={pictoMicrob} className="legendImg"/>
                                <div className="legendText">Le Banou Bar</div>
                            </div>
                        </div>
                        <div className="legendInfos">
                            <div className="legendInfo">Vous êtes loin de nos points de vente ?</div>
                            <div className="legendInfo">Commandez en ligne et faites vous livrer directement chez vous !</div>
                            <Link to="/boutique" className="hvr-sweep-to-right">Boutique en ligne</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
