import React from "react";
import axios from "axios";

import "../../css/admin.scss";
import "../../css/newsadmin.scss";

import { Link } from "react-router";

import { HeaderAdmin, AdminMenu } from "./layout.js";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faPlus from "@fortawesome/fontawesome-free-solid/faPlus";
import faPen from "@fortawesome/fontawesome-free-solid/faPencilAlt";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";
import faEyeS from "@fortawesome/fontawesome-free-solid/faEyeSlash";

export class FindAdmin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            places: [],
            current: {},
            popup: "hidden",
            action: "Modifier un point de vente"
        };
        this.showPopupCreate = this.showPopupCreate.bind(this);
        this.showPopup = this.showPopup.bind(this);
        this.getNews = this.getNews.bind(this);
        this.handleChangeActive = this.handleChangeActive.bind(this);
        this.getData = this.getData.bind(this);
        this.importAll = this.importAll.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    showPopupCreate() {
        var empty = { active: 1, type: "bar" };
        this.setState({ popup: "visible", current: empty, action: "Créer un point de vente" });
    }

    showPopup(item) {
        this.setState({ popup: "visible", action: "Modifier un point de vente" });
        this.getNews(item.id);
    }

    getNews(id) {
        axios.get("/api/getPlaceById", { params: { id: id } })
            .then(response => {
                this.setState({ current: response.data[0] });
            });
    }

    importAll(r) {
        let images = {};
        r.keys().map((item) => { images[item.replace("./", "")] = r(item); });
        return images;
    }

    getData() {
        axios.get("/api/getPlaces")
            .then(response => {
                this.setState({ places: response.data });
            });
    }

    handleChangeActive(item) {
        axios.post("/api/patchPlacesActive", { id: item.id, active: !item.active })
            .then(() => {
                this.getData();
            });
    }

    handleChange(e, type) {
        var newCurrent = this.state.current;
        newCurrent[type] = e.target.value;
        this.setState({ current: newCurrent });
    }

    submitForm() {
        if (this.state.action == "Créer un point de vente") {
            axios.post("/api/postPlace", { type: this.state.current.type, name: this.state.current.name, address: this.state.current.address, phone: this.state.current.phone, site: this.state.current.site, opening: this.state.current.opening })
                .then(() => {
                    this.setState({ popup: "hidden" });
                    this.getData();
                });
        } else {
            axios.post("/api/patchPlace", { id: this.state.current.id, type: this.state.current.type, name: this.state.current.name, address: this.state.current.address, phone: this.state.current.phone, site: this.state.current.site, opening: this.state.current.opening })
                .then(() => {
                    this.setState({ popup: "hidden" });
                    this.getData();
                });
        }
    }

    render() {
        var corres = { bar: "Bar", cave: "Cave", us: "Nous" };
        return [
            <HeaderAdmin key="header"/>,
            <section className="adminContainer" key="content">
                <div className="commandContainer">
                    <div className="adminHeader">
                        <div>POINTS DE VENTE</div>
                        <div className="addHeader" onClick={() => { this.showPopupCreate(); }}>
                            <FontAwesomeIcon icon={faPlus} className="stockIcon"/>
                        </div>
                    </div>
                    <div className="newsSectionContainer">
                        <div className="findTableHeader">
                            <div className="findTableHeaderItem findTableType">Type</div>
                            <div className="findTableHeaderItem findTableName">Nom</div>
                            <div className="findTableHeaderItem findTableAddress">Addresse</div>
                            <div className="findTableHeaderItem findTableSite">Site</div>
                            <div className="findTableHeaderItem findTablePhone">Tel</div>
                            <div className="findTableHeaderItem findTableOpening">Horaires</div>
                            <div className="findTableHeaderItem findTableActions">Actions</div>
                        </div>
                        {this.state.places.map((item, index) => {
                            return (
                                <div className="findItem" key={index} style={{ backgroundColor: !item.active ? "lightgrey" : "white" }}>
                                    <div className="findItemDesc">
                                        <div className="findTableItem findTableType">{corres[item.type]}</div>
                                        <div className="findTableItem findTableName">{item.name.toUpperCase()}</div>
                                        <div className="findTableItem findTableAddress">{item.address}</div>
                                        <div className="findTableItem findTableSite">{item.site}</div>
                                        <div className="findTableItem findTablePhone">{item.phone}</div>
                                        <div className="findTableItem findTableOpening">{item.opening}</div>
                                        <div className="findTableItem findTableActions">
                                            <div className="findButton" onClick={() => this.showPopup(item)}>
                                                <FontAwesomeIcon icon={faPen} className="stockIcon"/>
                                            </div>
                                            <div className="findButton" onClick={() => this.handleChangeActive(item)}>
                                                <FontAwesomeIcon icon={(item.active) ? faEye : faEyeS} className="stockIcon"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <AdminMenu active="find"/>
            </section>,
            <div className="disable" style={{ visibility: this.state.popup }} key="popup">
                <div className="popUpFind">
                    <div className="close" onClick={() => this.setState({ popup: "hidden" })}>+</div>
                    <div className="popUpStockHeader">{this.state.action.toUpperCase()}</div>
                    <div className="popUpFindContent">
                        <div className="newsInputs">
                            <div className="newsInputContainer">
                                <div>Type :</div>
                                <select className="selectPlace" value={this.state.current.type} onChange={(e) => this.handleChange(e, "type")}>
                                    <option value="bar">Bar</option>
                                    <option value="cave">Cave</option>
                                    <option value="us">Nous</option>
                                </select>
                            </div>
                            <div className="newsInputContainer">
                                <div>Nom :</div>
                                <input type="text" placeholder="Nom" className="modifyPlaceInput modifyNameInput" value={this.state.current.name} onChange={(e) => this.handleChange(e, "name")}/>
                            </div>
                            <div className="newsInputContainer">
                                <div>Addresse :</div>
                                <input type="text" placeholder="Addresse" className="modifyPlaceInput" value={this.state.current.address} onChange={(e) => this.handleChange(e, "address")}/>
                            </div>
                            <div className="newsInputContainer">
                                <div>Site Web :</div>
                                <input type="text" placeholder="Site Web" className="modifyPlaceInput" value={this.state.current.site} onChange={(e) => this.handleChange(e, "site")}/>
                            </div>
                            <div className="newsInputContainer">
                                <div>Téléphone :</div>
                                <input type="text" placeholder="Téléphone" className="modifyPlaceInput" value={this.state.current.phone} onChange={(e) => this.handleChange(e, "phone")}/>
                            </div>
                            <div className="newsInputContainer">
                                <div>Horaires :</div>
                                <input type="text" placeholder="Horaires" className="modifyPlaceInput" value={this.state.current.opening} onChange={(e) => this.handleChange(e, "opening")}/>
                            </div>
                        </div>
                        <div className="modifyProductRow">
                            <div className="modifyNewsButton" onClick={(e) => this.submitForm(e)}>VALIDER</div>
                        </div>
                    </div>
                </div>
            </div>
        ];
    }
}
