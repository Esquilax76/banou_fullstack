import React from "react";
import axios from "axios";

import Moment from "react-moment";

import "../../css/admin.scss";

import { Link } from "react-router";

import { HeaderAdmin, AdminMenu } from "./layout.js";

export class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            commands: [],
            sizes: ["28%", "28%", "28%"]
        };
        this.constructObject = this.constructObject.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getData = this.getData.bind(this);
        this.sectionFocus = this.sectionFocus.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        axios.get("/api/getCommands")
            .then(response => {
                this.constructObject(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    constructObject(response) {
        var result = [];
        Object.keys(response).map(function (key) {
            result[response[key].command_id] = {
                items: [],
                client: response[key].firstname + " " + response[key].lastname,
                address: response[key].address,
                date: response[key].date,
                status: response[key].status,
                price: response[key].total_price,
                id: response[key].command_id,
            };
        }.bind(this));
        Object.keys(response).map(function (key) {
            result[response[key].command_id]["items"].push({
                quantity: response[key].quantity,
                package: response[key].package,
                name: response[key].name,
                size: response[key].size,
            });
        }.bind(this));
        this.setState({ commands: result });
    }

    handleChange(e, id) {
        axios.post("/api/patchCommand", { id: id, status: e.target.value })
            .then(response => {
                this.getData();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    sectionFocus(e, i) {
        let sizes = this.state.sizes;
        sizes = ["3%", "3%", "3%"];
        sizes[i] = "80%";
        this.setState({ sizes: sizes });
    }

    render() {
        const corres = {
            unit: "A l'unité",
            pack: "Pack de 6",
            carton: "Carton de 12",
            fut: "Fût"
        };

        const status = [["received"], ["preparing"], ["finished", "sent"]];
        const titles = ["Nouvelles commandes", "Commandes en cours", "Commandes terminées"];
        const colors = { received: "#b2c8ca", preparing: "#739291", sent: "#546a67", finished: "grey" };

        return [
            <HeaderAdmin key="header"/>,
            <section className="adminContainer" key="content">
                <div className="commandContainer">
                    <div className="adminHeader" onClick={() => this.setState({ sizes: ["28%", "28%", "28%"] })}>COMMANDES</div>
                    <div className="commandSectionContainer">
                        {status.map(function (stat, i) {
                            return (
                                <div
                                    className={"commandSection commandSection" + i}
                                    key={"section" + i}
                                    style={{ height: this.state.sizes[i] }}
                                    onClick={(e) => this.sectionFocus(e, i)}
                                >
                                    <div className={"commandSectionTitle commandSectionTitle" + i}>{titles[i]}</div>
                                    <div className="commandSectionContent" style={{ display: (this.state.sizes[i] == "3%") ? "none" : null }}>
                                        <table>
                                            <colgroup>
                                                <col/>
                                                <col/>
                                                <col/>
                                                <col/>
                                                <col/>
                                                <col/>
                                                <col/>
                                            </colgroup>
                                            <tbody>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>ID</th>
                                                    <th>Client</th>
                                                    <th>Adresse</th>
                                                    <th>Commande</th>
                                                    <th>Prix</th>
                                                    <th>Status</th>
                                                </tr>
                                                {this.state.commands.map(function (item, index) {
                                                    if (stat.includes(item.status)) {
                                                        return (
                                                            <tr key={"tr" + index}>
                                                                <td><Moment add={{ hours: 2 }} format="DD/MM/YY HH:mm">{item.date}</Moment></td>
                                                                <td>{item.id}</td>
                                                                <td>{item.client}</td>
                                                                <td>{item.address}</td>
                                                                <td>
                                                                    {item.items.map(function (item2, index2) {
                                                                        return (
                                                                            <div className="commandItem" key={"1-2-" + index2}>
                                                                                {item2.quantity} {corres[item2.package]} {item2.name.toUpperCase()} {item2.size}
                                                                            </div>
                                                                        );
                                                                    }.bind(this))}
                                                                </td>
                                                                <td>{item.price.toFixed(2)} €</td>
                                                                <td>
                                                                    <select
                                                                        className="selectStatus"
                                                                        style={{ backgroundColor: colors[item.status], color: (item.status == "sent") ? "white" : null }}
                                                                        onChange={(e) => this.handleChange(e, item.id)}
                                                                        value={item.status}
                                                                    >
                                                                        <option value="received">En cours de traitement</option>
                                                                        <option value="preparing">En prépraration</option>
                                                                        <option value="sent">Envoyée</option>
                                                                        <option value="finished">Terminée</option>
                                                                    </select>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                }.bind(this))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        }.bind(this))}
                    </div>
                </div>
                <AdminMenu active="command"/>
            </section>
        ];
    }
}
