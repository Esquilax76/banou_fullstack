import React from "react";
import { withGoogleMap, withScriptjs, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import { compose, withProps, withStateHandlers } from "recompose";

import "../../css/find.scss";
import axios from "axios";

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
                <Marker key={index} position={{ lat: item.coordinates.lat, lng: item.coordinates.lng }} icon={ image } onClick={() => props.onToggleOpen(index)}>
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
                                <span>{item.opening}</span>
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
            places: [],
            cities: [],
            zoom: 13,
            lat: 45.164172,
            lng: 1.537178,
        };

        this.handleChange = this.handleChange.bind(this);
        this.getCities = this.getCities.bind(this);
        this.getCities = this.getCities.bind(this);
    }

    componentDidMount() {
        this.getPlaces();
    }

    getPlaces() {
        var places = [];
        var cities = [];
        axios.get("/api/getPlaces")
            .then(response => {
                response.data.map(function (item) {
                    let place = item;
                    axios.get("https://maps.google.com/maps/api/geocode/json?address=" + item.address.split(" ").join("+") + "&key=AIzaSyBfx9Bh1qVZY_QMAXFocqwoDXek4ck0714")
                        .then(response2 => {
                            place.coordinates = response2.data.results[0].geometry.location;
                            places.push(place);
                            let city = response2.data.results[0].address_components[2].long_name;
                            if (cities.indexOf(city) === -1) {
                                cities.push(city);
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }.bind(this));
                this.setState({ places: places, citiesTmp: cities });
                setTimeout(() => { this.getCities(); }, 500);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getCities() {
        let result = [];
        this.state.citiesTmp.map(function (item) {
            axios.get("https://maps.google.com/maps/api/geocode/json?address=" + item + "&key=AIzaSyBfx9Bh1qVZY_QMAXFocqwoDXek4ck0714")
                .then(response => {
                    var city = {
                        name: item,
                        coordinates: response.data.results[0].geometry.location
                    };
                    result.push(city);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }.bind(this));
        setTimeout(() => { this.setState({ cities: result }); }, 500);
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
                            markers={this.state.places}
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
                                {this.state.cities.map(function (item, index) {
                                    return (
                                        <option key={index} value={item.coordinates.lat + "_" + item.coordinates.lng}>{item.name}</option>
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
