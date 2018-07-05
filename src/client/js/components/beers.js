import React from "react";
import axios from "axios";

import "../../css/beers.scss";
import { getFileName } from "./util.js";

export class Beers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opacity: 0,
            positions: ["calc(50% - 600px)", "calc(50% - 400px)", "calc(50% - 200px)", "calc(50%)", "calc(50% + 200px)", "calc(50% + 400px)"],
            active: { name: "IPA", desc: "", ibu: "", ebc: "", alcool: "" },
            details: 0,
            beers: [],
            current: { position: 0, name: "IPA" },
        };
        this.showDetails = this.showDetails.bind(this);
        this.hideDetails = this.hideDetails.bind(this);
        this.findBeer = this.findBeer.bind(this);
        this.getData = this.getData.bind(this);
        this.importAll = this.importAll.bind(this);
    }

    importAll(r) {
        let images = {};
        r.keys().map((item) => { images[item.replace("./", "")] = r(item); });
        return images;
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        axios.get("/api/getBeers")
            .then(response => {
                this.setState({ beers: response.data });
            });
    }

    findBeer(name) {
        this.state.beers.forEach((value) => {
            if (value.name == name) {
                this.setState({ active: value });
            }
            return -1;
        });
    }

    showDetails(v, name) {
        let space = 40;
        if (screen.width > 1600) {
            space = 55;
        }
        let newPositions = this.state.positions;
        const left = [-600, -400, -200, 0, 200, 400];
        let newDetails = "calc(50% + " + (left[v] + space) + "px)";
        newPositions.forEach(function (value, i) {
            if (i > v) {
                newPositions[i] = "calc(50% + " + (left[i] + 75) + "px)";
            } else {
                newPositions[i] = "calc(50% + " + (left[i] - 75) + "px)";
            }
        });
        this.findBeer(name);
        this.setState({ positions: newPositions, opacity: 1, details: newDetails, current: { position: v, name: name } });
    }

    hideDetails() {
        this.setState({ positions: ["calc(50% - 600px)", "calc(50% - 400px)", "calc(50% - 200px)", "calc(50%)", "calc(50% + 200px)", "calc(50% + 400px)"], opacity: 0 });
    }

    render() {
        const images = this.importAll(require.context("../../img/home", false, /\.(png|jpe?g|svg)$/));
        return (
            <section className="beersContainer">
                <div className="pageTitle">Découvrez nos bières artisanales</div>
                <div className="bottleContainer">
                    {this.state.beers.map((item, index) => {
                        return (
                            <div
                                key={index}
                                onMouseEnter={() => this.showDetails(index, item.name)}
                                onMouseLeave={this.hideDetails}
                                className="bottle"
                                style={{ backgroundImage: "url(" + images["bouteille_" + getFileName(item.name) + ".png"]  + ")", left: this.state.positions[index] }}
                            />
                        );
                    })}
                    <div
                        className="description"
                        onMouseEnter={() => this.showDetails(this.state.current.position, this.state.current.name)}
                        style={{ left: this.state.details, opacity: this.state.opacity, backgroundImage: "url(" + images["verre_" + getFileName(this.state.current.name) + ".png"]  + ")" }}
                    >
                        <div className="desc">
                            <div className="descTitle">{this.state.active.name.toUpperCase()}</div>
                            <div className="descText">{this.state.active.description}</div>
                            <div className="descAlcool">
                                <div className="little">ALCOOL</div>
                                <div className="value">{this.state.active.alcool} <span className="unit">%/VOL</span></div>
                            </div>
                            <div className="descIbu">
                                <div className="little">AMERTUME</div>
                                <div className="value">{this.state.active.ibu} <span className="unit">IBU</span></div>
                            </div>
                            <div className="descSRM">
                                <div className="little">COULEUR</div>
                                <div className="value">{this.state.active.ebc} <span className="unit">EBC</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
