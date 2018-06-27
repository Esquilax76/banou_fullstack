import React from "react";
import axios from "axios";

import Moment from "react-moment";
import data from "../data/data.js";
import "../../css/stock.scss";

import { Link } from "react-router";

import { HeaderAdmin, AdminMenu } from "./layout.js";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
//import faTrash from "@fortawesome/fontawesome-free-solid/faTrashAlt";
import faPen from "@fortawesome/fontawesome-free-solid/faPencilAlt";
import faCamera from "@fortawesome/fontawesome-free-solid/faCamera";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";
import faEyeS from "@fortawesome/fontawesome-free-solid/faEyeSlash";
import faPlus from "@fortawesome/fontawesome-free-solid/faPlus";

export class Stock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            beers: [],
            stocks: {},
            action: "Modifier un produit",
            popup: "hidden",
            current: { id: 2, active: 1, isbeer: 1, name: "Blanche", description: "La bière d’été par excellence, rafraîchissante aux arômes d’agrumes.", price_33: 2.8, price_75: 5, price_fut: 105, stock_33: 0, stock_75: 0, stock_fut: 0, ebc: 8, ibu: 30, alcool: 4.8 },
        };
        this.getData = this.getData.bind(this);
        this.getProduct = this.getProduct.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeActive = this.handleChangeActive.bind(this);
        this.showPopup = this.showPopup.bind(this);
        this.importAll = this.importAll.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    showPopupCreate() {
        var empty = { active: 1, isbeer: 1, name: "", description: "", price_33: 0, price_75: 0, price_fut: 0, stock_33: 0, stock_75: 0, stock_fut: 0, ebc: 0, ibu: 0, alcool: 0 };
        this.setState({ action: "Ajouter un produit", popup: "visible", current: empty });
    }

    showPopup(item) {
        this.setState({ action: "Modifier un produit", popup: "visible" });
        this.getProduct(item.id);
    }

    importAll(r) {
        let images = {};
        r.keys().map((item) => { images[item.replace("./", "")] = r(item); });
        return images;
    }

    getData() {
        axios.get("/api/getProducts")
            .then(response => {
                this.setState({ beers: response.data });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getProduct(id) {
        axios.get("/api/getProductById", { params: { id: id } })
            .then(response => {
                console.log(response.data[0]);
                this.setState({ current: response.data[0] });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    handleChange(e, item, size, index) {
        let newBeers = this.state.beers;
        newBeers[index]["stock_" + size] = e.target.value;
        this.setState({ beers: newBeers });

        axios.post("/api/patchStock", { id: item.id, stock: e.target.value, size: size })
            .then(response => {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    handleChangeActive(item) {
        axios.post("/api/patchProductActive", { id: item.id, active: !item.active })
            .then(response => {
                console.log(response);
                this.getData();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render() {
        const images = this.importAll(require.context("../../img/shop", false, /\.(png|jpe?g|svg)$/));
        return [
            <HeaderAdmin key="header"/>,
            <section className="stockContainer" key="content">
                <div className="stockItemsContainer">
                    <div className="adminHeader">
                        <div>STOCKS</div>
                        <div className="addHeader" onClick={() => { this.showPopupCreate(); }}>
                            <FontAwesomeIcon icon={faPlus} className="stockIcon"/>
                        </div>
                    </div>
                    <div className="stockSectionContainer">
                        {this.state.beers.map(function (item, index) {
                            return (
                                <div className="stockItem" key={index} style={{ backgroundColor: !item.active ? "lightgrey" : "white" }}>
                                    <img src={images[item.name.replace(/\s+/g, "_").replace("é", "e").toLowerCase() + "_unit.jpg"]} className="stockImage"/>
                                    <div className="stockItemDesc">
                                        <div className="stockItemName">{item.name.toUpperCase()}</div>
                                        <div className="stockItemDescription">{item.description}</div>
                                    </div>
                                    <div className="stockInputContainer">
                                        <div className="stockInputText">{(item.isbeer) ? "33 cl" : "Unité"}</div>
                                        <input type="number" className="inputStock" min="0" value={item.stock_33} onChange={(e) => this.handleChange(e, item, "33", index)}/>
                                        <div className="stockInputPrice">{item.price_33} €</div>
                                    </div>
                                    <div className="stockInputContainer" style={{ visibility: !item.isbeer ? "hidden" : "none" }}>
                                        <div className="stockInputText">75 cl</div>
                                        <input type="number" className="inputStock" min="0" value={item.stock_75} onChange={(e) => this.handleChange(e, item, "75", index)}/>
                                        <div className="stockInputPrice">{item.price_75} €</div>
                                    </div>
                                    <div className="stockInputContainer" style={{ visibility: !item.isbeer ? "hidden" : "none" }}>
                                        <div className="stockInputText">Fût</div>
                                        <input type="number" className="inputStock" min="0" value={item.stock_fut} onChange={(e) => this.handleChange(e, item, "fut", index)}/>
                                        <div className="stockInputPrice">{item.price_fut} €</div>
                                    </div>
                                    <div className="stockButtonsContainer">
                                        <div className="stockButton" onClick={() => this.showPopup(item)}>
                                            <FontAwesomeIcon icon={faPen} className="stockIcon"/>
                                        </div>
                                        <div className="stockButton" onClick={() => this.handleChangeActive(item)}>
                                            <FontAwesomeIcon icon={(item.active) ? faEye : faEyeS} className="stockIcon"/>
                                        </div>
                                    </div>
                                </div>
                            );
                        }.bind(this))}
                    </div>
                </div>
                <AdminMenu active="stock"/>
            </section>,
            <div className="disable" style={{ visibility: this.state.popup }} key="popup">
                <div className="popUpStock">
                    <div className="close" onClick={() => this.setState({ popup: "hidden" })}>+</div>
                    <div className="popUpStockHeader">{this.state.action.toUpperCase()}</div>
                    <PopUpBeer action={this.state.action} current={this.state.current} images={images}/>
                </div>
            </div>
        ];
    }
}

class PopUpBeer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: "",
            radio: "yes",
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        //this.getDynamicImage = this.getDynamicImage.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            description: nextProps.current.description,
            name: nextProps.current.name,
            ebc: nextProps.current.ebc,
            ibu: nextProps.current.ibu,
            alcool: nextProps.current.alcool,
            price_33: nextProps.current.price_33,
            price_75: nextProps.current.price_75,
            price_fut: nextProps.current.price_fut,
            active: nextProps.current.active,
            price: nextProps.current.price,
            isbeer: nextProps.current.isbeer,
        });
    }

    handleChange(e, type) {
        this.setState({ [type]: e.target.value });
    }

    handleFileChange(e) {
        this.setState({ selectedFile: e.target.files[0] });
    }

    submitForm() {
        const selectedFile = this.state.selectedFile;
        let formData = new FormData();

        //formData.append('description', "test");
        formData.append("selectedFile", selectedFile);
        console.log(formData);

        axios.post("/api/uploadFile", formData)
            .then((result) => {
                console.log(result);
            });
    }

    render() {
        const info = { Indices: ["Alc/vol", "IBU", "EBC"], Prix: ["33cl", "75cl", "fut"] };
        const inputImage = ["BOUTIQUE UNITE", "BOUTIQUE PACK DE 6", "BOUTIQUE CARTON", "ACCUEIL"];
        const corres = { "Alc/vol": "alcool", "IBU": "ibu", "EBC": "ebc", "33cl": "price_33", "75cl": "price_75", "fut": "price_fut" };
        //const corresImage = { "BOUTIQUE UNITE": "unit", "BOUTIQUE PACK DE 6": "pack", "BOUTIQUE CARTON" : "carton", "ACCUEIL" : "" };
        return (
            <div className="popUpContentHeader">
                <div className="modifyProductRow">
                    <div className="modifyProductDescription">
                        <div className="modifyProductRow">
                            <div className="modifyProductText">Type de produit</div>
                            <select className="modifyProductSelect" value={this.state.isbeer} onChange={(e) => this.handleChange(e, "isbeer")} disabled={this.props.action == "Modifier un produit"}>
                                <option value="1">Bière</option>
                                <option value="0">Autres</option>
                            </select>
                        </div>
                        <input type="text" placeholder="Nom du produit" className="modifyProductInput" value={this.state.name} onChange={(e) => this.handleChange(e, "name")}/>
                        <textarea placeholder="Description du produit" className="modifyProductTextarea" value={this.state.description} onChange={(e) => this.handleChange(e, "description")}/>
                    </div>
                    {this.state.isbeer == "1" &&
                        <div className="modifyProductImages">
                            {inputImage.map(function (item) {
                                return [
                                    <label htmlFor="file" className="label-file" key={item}>
                                        <div className="labelText">{item}</div>
                                        <FontAwesomeIcon icon={faCamera} className="inputIcon"/>
                                        <div></div>
                                    </label>,
                                    <input id="file" className="input-file" type="file" key={item + "file"} onChange={(e) => this.handleFileChange(e, item)} name="selectedFile"/>
                                ];
                            }.bind(this))}
                        </div>
                    }
                    {this.state.isbeer == "0" &&
                        <div className="modifyProductImages">
                            <label htmlFor="file" className="label-file label-fileSolo">
                                <div className="labelText">BOUTIQUE</div>
                                <FontAwesomeIcon icon={faCamera} className="inputIcon"/>
                            </label>
                            <input id="file" className="input-file" type="file" onChange={(e) => this.handleFileChange(e, "only")} />
                            <div className="flex" style={{ width: "140px", justifyContent: "space-between", height: "2em", marginTop: "10px" }}>
                                <div className="bold">Prix :</div>
                                <input type="number" step="0.01" min="0" className="modifyProductBeerInfo" value={this.state.price_33}/>
                            </div>
                        </div>
                    }
                </div>
                {this.state.isbeer == "1" &&
                    <div className="modifyProductRow">
                        <div style={{ width: "60%" }}>
                            {Object.keys(info).map(function (key) {
                                return (
                                    <div className="modifyProductInfo" key={key}>
                                        <div style={{ width: "100px" }}>{key} :</div>
                                        {info[key].map(function (item) {
                                            return (
                                                <div className="flex" style={{ width: "140px", justifyContent: "space-between" }} key={item}>
                                                    <div className="bold">{item} :</div>
                                                    <input type="number" step="0.01" min="0" className="modifyProductBeerInfo" value={this.state[corres[item]]} onChange={(e) => this.handleChange(e, corres[item])} name="selectedFile"/>
                                                </div>
                                            );
                                        }.bind(this))}
                                    </div>
                                );
                            }.bind(this))}
                        </div>
                        <div className="modifyProductRadioContainer">
                            <div className="modifyProductRadioText">Visible dans l'accueil ?</div>
                            <div>
                                <input type="radio" name="visible" value="yes" checked={this.state.radio == "yes"} onChange={(e) => this.handleChange(e, "radio")}/>Oui
                                <input type="radio" name="visible" value="no" style={{ marginLeft: "20px" }} checked={this.state.radio == "no"} onChange={(e) => this.handleChange(e, "radio")}/>Non
                            </div>
                        </div>
                    </div>
                }
                <div className="modifyProductRow">
                    <div className="modifyProductButton" onClick={(e) => this.submitForm(e)}>VALIDER</div>
                </div>
            </div>
        );
    }
}
