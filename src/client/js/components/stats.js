import React from "react";
import axios from "axios";
import moment from "moment";

import { Doughnut, Bar, Pie } from "react-chartjs-2";
import { CSVLink, CSVDownload } from "react-csv";

import { Link } from "react-router";

import { HeaderAdmin, AdminMenu } from "./layout.js";

import { getFileName } from "./util.js";

import "../../css/admin.scss";
import "../../css/stats.scss";

export class Stats extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            dataLitters: {},
            dataProducts: {},
            dataBenefits: {},
            dataNotBeer: {},
        };
        this.constructDataLitters = this.constructDataLitters.bind(this);
        this.constructDataProducts = this.constructDataProducts.bind(this);
        this.constructDataBenefits = this.constructDataBenefits.bind(this);
        this.constructDataNotBeer = this.constructDataNotBeer.bind(this);
        this.constructData = this.constructData.bind(this);
        this.exportData = this.exportData.bind(this);
        this.importAll = this.importAll.bind(this);
    }

    componentDidMount() {
        axios.get("/api/getBeers")
            .then(response => {
                this.setState({ beers: response.data });
            });
        axios.get("/api/getCommands")
            .then(response => {
                this.constructDataBenefits(response.data);
                this.constructData(response.data);
                this.constructDataNotBeer(response.data);
            });
    }

    importAll(r) {
        let images = {};
        r.keys().map((item) => { images[item.replace("./", "")] = r(item); });
        return images;
    }

    exportData() {
        var result = [];
        Object.keys(this.state.data).map((key) => {
            let item = this.state.data[key];
            result.push({ name: key, 33: item["33"], 75: item["75"], fut: item["fut"], litres: item.totalLitters });
        });
        return result;
    }

    constructData(response) {
        var beers = this.state.beers;
        var result = {};
        var packCorres = { fut: 1, unit: 1, pack: 6, carton: 12 };
        Object.keys(beers).map((key) => {
            result[beers[key].name.toLowerCase()] = { 33: 0, 75: 0, fut: 0, totalLitters: 0 };
        });
        Object.keys(response).map((key) => {
            var size = 30;
            var pack = packCorres[response[key].package];

            if (response[key].size != "fut") {
                size = parseInt(response[key].size) / 100;
            }

            if (getFileName(response[key].name) == "pack_decouverte") {
                Object.keys(result).map((key2) => {
                    result[key2]["totalLitters"] += response[key].quantity * size;
                    result[key2][response[key].size] += response[key].quantity;
                });
            } else if (response[key].isbeer == 1) {
                result[response[key].name.toLowerCase()]["totalLitters"] += response[key].quantity * size * pack;
                result[response[key].name.toLowerCase()][response[key].size] += response[key].quantity * pack;
            }
        });

        this.setState({ data: result });
        this.constructDataLitters();
        Object.keys(beers).map((key) => {
            this.constructDataProducts(beers[key].name.toLowerCase());
        });
    }

    constructDataLitters() {
        var result = [];
        Object.keys(this.state.data).map((key) => {
            result.push(this.state.data[key]["totalLitters"].toFixed(2));
        });

        var data = {
            datasets: [{
                data: result,
                backgroundColor: ["#409b46", "lightblue", "#e4a524", "#d15527", "#68321f", "#ad2024"]
            }],

            labels: ["IPA", "Blanche", "Blonde", "Rousse", "Brune", "Saison"]
        };
        this.setState({ dataLitters: data });
    }

    constructDataNotBeer(response) {
        var result = {};
        var labels = [];
        var insert = [];
        Object.keys(response).map((key) => {
            if (!response[key].isbeer) {
                let name = response[key].name;
                if (!labels.includes(name)) {
                    labels.push(name);
                }
                if (result[name]  != null) {
                    result[name] += response[key].quantity;
                } else {
                    result[name] = response[key].quantity;
                }
            }
        });

        Object.keys(result).map((key) => {
            insert.push(result[key]);
        });

        var data = {
            datasets: [{
                data: insert,
                backgroundColor: ["#409b46", "lightblue", "#e4a524", "#d15527", "#68321f", "#ad2024"]
            }],

            labels: labels
        };
        this.setState({ dataNotBeer: data });
    }

    constructDataProducts(type) {
        var result = [];
        var sizes = ["33", "75", "fut"];

        sizes.map((item) => {
            result.push(this.state.data[type][item]);
        });

        var data = {
            datasets: [{
                data: result,
                backgroundColor: ["#A6BFBF", "#3E4F4F", "#202325"],
            }],

            labels: ["33cl", "75cl", "Fut"]
        };
        var insert = this.state.dataProducts;
        insert[type] = data;
        this.setState({ dataProducts: insert });
    }

    constructDataBenefits(response) {
        var result = {};
        var labels = [];
        var insert = [];
        Object.keys(response).map((key) => {
            let date = moment(response[key].date).format("MM/YY");
            if (!labels.includes(date)) {
                labels.push(date);
            }
            if (result[date]  != null) {
                result[date] += parseFloat(response[key].price);
            } else {
                result[date] = parseFloat(response[key].price);
            }
        });

        Object.keys(result).map((key) => {
            insert.push(result[key]);
        });

        var data = {
            datasets: [{
                backgroundColor: "#A6BFBF",
                borderColor: "#3E4F4F",
                borderWidth: 1,
                hoverBorderColor: "#A6BFBF",
                hoverBackgroundColor: "#3E4F4F",
                label: "Ventes (en euros)",
                data: insert,
            }],

            labels: labels
        };
        this.setState({ dataBenefits: data });
    }

    render() {
        const images = this.importAll(require.context("../../img/stats", false, /\.(png|jpe?g|svg)$/));
        var screenSize =  screen.width;
        var chartSize = 250;
        var beerChartSize = 150;
        if (screenSize < 1600) {
            chartSize = 150;
            beerChartSize = 125;
        }
        return [
            <HeaderAdmin key="header"/>,
            <section className="statsContainer" key="content">
                <div className="chartsContainer">
                    <div className="adminHeader" style={{ paddingRight: "20px" }}>
                        <div>STATISTIQUES</div>
                        <CSVLink
                            data={this.exportData()}
                            filename={"data_" + moment().format("DD_MM_YY") + ".csv"}
                            className="exportButton"
                            target="_blank"
                            separator={";"}
                        >
                            Export des données
                        </CSVLink>
                    </div>
                    <div className="chartsContent">
                        <div className="leftChart">
                            <div className="chartRow">
                                <div className="chartLarge">
                                    <div className="chartTitle">Types de bières vendus (en litres)</div>
                                    <div className="litters">
                                        <Pie
                                            data={this.state.dataLitters}
                                            height={chartSize}
                                            options={{
                                                legend: { display: false },
                                                maintainAspectRatio: false
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="chartLarge">
                                    <div className="chartTitleDark">Autres produits vendus</div>
                                    <div className="litters">
                                        <Pie
                                            data={this.state.dataNotBeer}
                                            height={chartSize}
                                            options={{
                                                legend: { display: false },
                                                maintainAspectRatio: false
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: "20px" }}>
                                <div className="chartTitleDark">Revenus par mois</div>
                                <div className="benefits">
                                    <Bar
                                        data={this.state.dataBenefits}
                                        height={200}
                                        options={{
                                            legend: { display: false },
                                            maintainAspectRatio: false,
                                            scales: {
                                                xAxes: [{ barThickness: 30 }],
                                                yAxes: [{ ticks: { min: 0 } }]
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="chart">
                            <div className="chartTitle">Sous quels formats ?</div>
                            <div className="products">
                                <div className="productsChart">
                                    {Object.keys(this.state.dataProducts).map((key, index) => {
                                        return (
                                            <div className="productsChartImg" style={{ backgroundImage: "url(" + images[getFileName(key) + "_stats.png"] + ")" }} key={"chart" + index}>
                                                <Doughnut
                                                    data={this.state.dataProducts[key]}
                                                    height={beerChartSize}
                                                    options={{
                                                        legend: { display: false },
                                                        maintainAspectRatio: false,
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AdminMenu active="stats"/>
            </section>
        ];
    }
}
