import React from "react";
import axios from "axios";
import moment from "moment";

import { Doughnut, Bar, Pie } from "react-chartjs-2";
import { CSVLink, CSVDownload } from "react-csv";

import { Link } from "react-router";

import { HeaderAdmin } from "./layout.js";
import data from "../data/data.js";

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
            images: data.images
        };
        this.constructDataLitters = this.constructDataLitters.bind(this);
        this.constructDataProducts = this.constructDataProducts.bind(this);
        this.constructDataBenefits = this.constructDataBenefits.bind(this);
        this.constructData = this.constructData.bind(this);
        this.exportData = this.exportData.bind(this);
    }

    componentDidMount() {
        axios.get("/api/getCommands")
            .then(response => {
                this.constructDataBenefits(response.data);
                this.constructData(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    exportData() {
        var result = [];
        Object.keys(this.state.data).map(function (key) {
            let item = this.state.data[key];
            result.push({ name: key, 33: item["33"], 75: item["75"], fut: item["fut"], litres: item.totalLitters });
        }.bind(this));
        return result;
    }

    constructData(response) {
        var result = {};
        var packCorres = { fut: 1, unit: 1, pack: 6, carton: 12 };
        var beers = data.beers;
        beers.map(function (item) {
            result[item.name.toLowerCase()] = { 33: 0, 75: 0, fut: 0, totalLitters: 0 };
        }.bind(this));
        Object.keys(response).map(function (key) {
            var size = 30;
            var pack = packCorres[response[key].package];

            if (response[key].size != "fut") {
                size = parseInt(response[key].size) / 100;
            }

            if (response[key].name == "decouverte") {
                Object.keys(result).map(function (key2) {
                    result[key2]["totalLitters"] += response[key].quantity * size;
                    result[key2][response[key].size] += response[key].quantity;
                }.bind(this));
            } else {
                result[response[key].name]["totalLitters"] += response[key].quantity * size * pack;
                result[response[key].name][response[key].size] += response[key].quantity * pack;
            }
        }.bind(this));

        this.setState({ data: result });
        this.constructDataLitters();
        beers.map(function (item) {
            this.constructDataProducts(item.name.toLowerCase());
        }.bind(this));
    }

    constructDataLitters() {
        var result = [];
        Object.keys(this.state.data).map(function (key) {
            result.push(this.state.data[key]["totalLitters"].toFixed(2));
        }.bind(this));

        var data = {
            datasets: [{
                data: result,
                backgroundColor: ["#409b46", "lightblue", "#e4a524", "#d15527", "#68321f", "#ad2024"]
            }],

            labels: ["IPA", "Blanche", "Blonde", "Rousse", "Brune", "Noel"]
        };
        this.setState({ dataLitters: data });
    }

    constructDataProducts(type) {
        var result = [];
        var sizes = ["33", "75", "fut"];

        sizes.map(function (item) {
            result.push(this.state.data[type][item]);
        }.bind(this));

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
        Object.keys(response).map(function (key) {
            let date = moment(response[key].date).format("MM/YY");
            if (!labels.includes(date)) {
                labels.push(date);
            }
            if (result[date]  != null) {
                result[date] += parseFloat(response[key].price);
            } else {
                result[date] = parseFloat(response[key].price);
            }
        }.bind(this));

        Object.keys(result).map(function (key) {
            insert.push(result[key]);
        }.bind(this));

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
        return [
            <HeaderAdmin key="header"/>,
            <section className="statsContainer" key="content">
                <div className="chartsContainer">
                    <div className="adminHeader">STATISTIQUES</div>
                    <div className="chartsContent">
                        <div className="leftChart">
                            <div className="chartRow">
                                <div className="chartLarge">
                                    <div className="chartTitle">Types de bières vendus</div>
                                    <div className="litters">
                                        <Pie
                                            data={this.state.dataLitters}
                                            height={250}
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
                                            data={this.state.dataLitters}
                                            height={250}
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
                                        width={200}
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
                                    {Object.keys(this.state.dataProducts).map(function (key, index) {
                                        return (
                                            <div className="productsChartImg" style={{ backgroundImage: "url(" + this.state.images[key].stats + ")" }} key={"chart" + index}>
                                                <Doughnut
                                                    data={this.state.dataProducts[key]}
                                                    height={150}
                                                    options={{
                                                        legend: { display: false },
                                                        maintainAspectRatio: false,
                                                    }}
                                                />
                                            </div>
                                        );
                                    }.bind(this))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="adminActionContainer">
                    <div className="adminAction">
                        <div className="adminActionTitle">STOCKS</div>
                        <img src={require("../../img/stock.png")} className="adminActionImg"/>
                    </div>
                    <Link to="/admin" className="adminAction">
                        <div className="adminActionTitle">COMMANDES</div>
                        <img src={require("../../img/basket.png")} className="adminActionImg"/>
                    </Link>
                    <div className="adminAction">
                        <div className="adminActionTitle">CLIENTS</div>
                        <img src={require("../../img/client.png")} className="adminActionImg"/>
                    </div>
                    <CSVLink
                        data={this.exportData()}
                        filename={"data_" + moment().format("DD_MM_YY") + ".csv"}
                        className="exportButton"
                        target="_blank"
                        separator={";"}
                    >
                        EXPORT DES DONNEES
                    </CSVLink>
                </div>
            </section>
        ];
    }
}
