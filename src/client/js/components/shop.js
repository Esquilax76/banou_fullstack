import React from "react";
import axios from "axios";

import data from "../data/data.js";

import { Link } from "react-router";
import { Footer } from "./layout.js";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faPlus from "@fortawesome/fontawesome-free-solid/faPlus";
import faMinus from "@fortawesome/fontawesome-free-solid/faMinus";
import faTrash from "@fortawesome/fontawesome-free-solid/faTrashAlt";

import "../../css/shop.scss";

export class Shop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            basket: [],
            popup: "hidden",
            currentChoice: { name: "" },
            quantity: 1,
            package: "unit",
            size: 33,
            rent: "yes",
            basketAnimation: "0",
            basketVisibility: "hidden",
            duplicates: [],
        };

        this.showPopUp = this.showPopUp.bind(this);
        this.hidePopUp = this.hidePopUp.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.addToBasket = this.addToBasket.bind(this);
        this.showBasketMenu = this.showBasketMenu.bind(this);
        this.checkDuplicates = this.checkDuplicates.bind(this);
        this.modifyQuantity = this.modifyQuantity.bind(this);
        this.importAll = this.importAll.bind(this);
        this.findPrice = this.findPrice.bind(this);
    }

    componentDidMount() {
        axios.get("/api/getProducts")
            .then(response => {
                this.setState({ products: response.data });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    importAll(r) {
        let images = {};
        r.keys().map((item) => { images[item.replace("./", "")] = r(item); });
        return images;
    }

    checkDuplicates(price, quantity) {
        let item = this.state.duplicates.pop();
        let index = this.state.duplicates.indexOf(item);
        if (index <= -1) {
            this.state.duplicates.push(item);
        } else {
            this.state.basket[index].quantity = parseInt(this.state.basket[index].quantity) + parseInt(quantity);
            this.state.basket[index].price = (parseFloat(this.state.basket[index].price) + parseFloat(price)).toFixed(2) + "€";
            this.state.basket.pop();
        }
    }

    addToBasket() {
        const corres = {
            unit: "A l'unité",
            pack: "Pack de 6",
            carton: "Carton de 12",
            fut: "Fût"
        };

        let basket = this.state.basket;
        let details;
        let rent = " - avec location de tireuse";
        if (this.state.rent === "no") {
            rent = "";
        }
        if (this.state.package === "fut") {
            details = corres[this.state.package] + rent;
        } else {
            details = this.state.size + "cl - " + corres[this.state.package];
        }
        let newItem = {
            name: this.state.currentChoice.name,
            quantity: this.state.quantity,
            price: this.findPrice("all"),
            id: this.state.currentChoice.name + " - " + details,
            package: this.state.package,
            size: this.state.size,
            details: details,
            product_id: this.state.currentChoice.id,
            //unit: this.state.currentChoice.price
            unit: this.findPrice("unit"),
        };

        this.state.duplicates.push(this.state.currentChoice.name + " - " + details);
        basket.push(newItem);
        this.setState({ basket: basket, basketAnimation: "25%" });
        this.checkDuplicates(this.findPrice("all"), newItem.quantity);
        this.hidePopUp();
        this.showBasketMenu();
    }

    showPopUp(item) {
        this.setState({ popup: "visible", currentChoice: item });
    }

    hidePopUp() {
        this.setState({ popup: "hidden", package: "unit", size: 33, quantity: 1 });
    }

    handleChange(e, item) {
        switch (item) {
            case "quantity":
                this.setState({ quantity: e.target.value });
                break;
            case "package":
                this.setState({ package: e.target.value });
                break;
            case "size":
                this.setState({ size: e.target.value });
                break;
            case "rent":
                this.setState({ rent: e.target.value });
                break;
        }
    }

    getBasketTotal() {
        let total = 0;
        this.state.basket.map(function (item) {
            total += parseFloat(item.price);
        });
        return total.toFixed(2);
    }

    findPrice(type) {
        var rent = 0;
        if (this.state.rent === "yes" && this.state.package === "fut") {
            rent = 15;
        }

        if (this.state.package == "fut") {
            return (this.state.quantity * this.state.currentChoice["price_fut"] + rent).toFixed(2);
        }

        var number = 1;
        var discount = 0;
        if (this.state.package == "pack") {
            number = 6;
            discount = 0.05;
        } else if (this.state.package == "carton") {
            number = 12;
            discount = 0.15;
        }
        var result = this.state.currentChoice["price_" + this.state.size] * number;
        if (number != 1) {
            result = result - result * discount;
            result = Math.trunc(result);
        }
        if (type == "all") {
            return (result * this.state.quantity).toFixed(2);
        } else {
            return result.toFixed(2);
        }
    }

    addRent() {
        if (this.state.package === "fut" && this.state.rent === "yes") {
            return "+ 15.00€";
        } else {
            return "";
        }
    }

    showBasketMenu() {
        this.setState({ basketVisibility: "visible", basketAnimation: "25%" });
    }

    hideBasketMenu() {
        this.setState({ basketVisibility: "hidden", basketAnimation: "0" });
    }

    modifyQuantity(index, action) {
        let basket = this.state.basket;
        let item = basket[index];
        let unitPrice = (parseFloat(item.price) / item.quantity).toFixed(2);
        if (action === "plus") {
            item.quantity++;
            item.price = (parseFloat(item.price) + parseFloat(unitPrice)).toFixed(2) + "€";
        } else if (action === "less" && item.quantity > 1) {
            item.quantity--;
            item.price = (parseFloat(item.price) - parseFloat(unitPrice)).toFixed(2) + "€";
        } else if (action === "delete") {
            let duplicates = this.state.duplicates;
            let findDuplicate = duplicates.indexOf(item.id);
            duplicates.splice(findDuplicate, 1);
            basket.splice(index, 1);
            this.setState({ duplicates: duplicates });
        }
        this.setState({ basket: basket });
    }

    render() {
        const images = this.importAll(require.context("../../img/shop", false, /\.(png|jpe?g|svg)$/));
        return [
            <header className="header" key="header">
                <Link to="/" className="headerTitle">LA BANOU</Link>
                <div className="basket" onClick={() => this.showBasketMenu()}>{this.state.basket.length}</div>
            </header>,
            <div className="shopContainer" key="content">
                <div className="pageTitle shopTitle">Commandez vos bières en ligne !</div>
                <div className="shopItems">
                    {this.state.products.map(function (item, index) {
                        return (
                            <div className="shopItem" key={index} onClick={() => this.showPopUp(item)}>
                                <img className="shopItemImage" src={images[item.name.replace(/\s+/g, "_").replace("é", "e").toLowerCase() + "_unit.jpg"]}/>
                                <div className="shopItemTitle">{item.name.toUpperCase()}</div>
                                <div className="shopItemPrice">{item.price_33.toFixed(2)} €</div>
                            </div>
                        );
                    }.bind(this))}
                </div>
            </div>,
            <div className="disable" style={{ visibility: this.state.popup }} key="popup">
                <div className="popUp">
                    <div className="close" onClick={() => this.hidePopUp()}>+</div>
                    <div className="popUpHeader">FICHE DESCRIPTIVE PRODUIT</div>
                    <div className="popUpContent">
                        <img src={images[this.state.currentChoice.name.replace(/\s+/g, "_").replace("é", "e").toLowerCase() + "_" + this.state.package + ".jpg"]} className="popUpImage"/>
                        <div className="popUpDescription">
                            <div className="popUpTitle">{this.state.currentChoice.name.toUpperCase()}</div>
                            <div className="popUpText" dangerouslySetInnerHTML={{ __html: this.state.currentChoice.description }}></div>
                            {this.state.currentChoice.isbeer == 1 &&
                                <div className="popUpinput">
                                    <div className="inputLabel">Conditionnement</div>
                                    <select
                                        className="popUpSelect"
                                        onChange={(e) => this.handleChange(e, "package")}
                                        value={this.state.package}
                                    >
                                        <option value="unit">Unité</option>
                                        <option value="pack">Pack de 6</option>
                                        <option value="carton">Carton de 12</option>
                                        <option value="fut">Fût</option>
                                    </select>
                                </div>
                            }
                            {(this.state.package !== "fut" && this.state.currentChoice.isbeer == 1) &&
                                <div className="popUpinput">
                                    <div className="inputLabel">Taille</div>
                                    <select
                                        className="popUpSelect"
                                        onChange={(e) => this.handleChange(e, "size")}
                                        value={this.state.size}
                                    >
                                        <option value="33">33cl</option>
                                        <option value="75">75cl</option>
                                    </select>
                                </div>
                            }
                            {this.state.package === "fut" &&
                                <div className="popUpinput">
                                    <div className="inputLabel">Prêt Tireuse (15€)</div>
                                    <input type="radio" className="radio" name="rent" value="yes" checked={this.state.rent === "yes"} onChange={(e) => this.handleChange(e, "rent")}/>Oui
                                    <input type="radio" className="radio" name="rent" value="no" checked={this.state.rent === "no"} onChange={(e) => this.handleChange(e, "rent")}/>Non
                                </div>
                            }
                            <div className="popUpinput">
                                <div className="inputLabel">Quantité</div>
                                <input
                                    className="popUpNumber"
                                    type="number"
                                    min="1"
                                    value={this.state.quantity}
                                    onChange={(e) => this.handleChange(e, "quantity")}
                                />
                            </div>
                            <div className="popUpPrice">
                                {this.findPrice("all") + " €"}<span className="popUpPriceDetail"> ( {this.findPrice("unit") + " €"} x {this.state.quantity} {this.addRent()})</span>
                            </div>
                            <div className="addToBasket" onClick={() => this.addToBasket()}>AJOUTER AU PANIER</div>
                        </div>
                    </div>
                </div>
            </div>,
            <div className="disable" style={{ visibility: this.state.basketVisibility }} key="basketMenu" onClick={() => this.hideBasketMenu()}>
                <div className="basketMenu" style={{ width: this.state.basketAnimation }} onClick={(e) => e.stopPropagation()}>
                    <div className="basketMenuHeader">PANIER</div>
                    <div className="basketMenuContent">
                        {this.state.basket.length === 0 &&
                            <div className="emptyBasket">Panier vide !</div>
                        }
                        <div>
                            {this.state.basket.map(function (item, index) {
                                return (
                                    <div key={index} className="basketItem">
                                        <img src={images[item.name.replace(/\s+/g, "_").replace("é", "e").toLowerCase() + "_" + item.package + ".jpg"]} className="basketItemImage"/>
                                        <div className="basketItemDesc">
                                            <div className="basketItemTitle">{item.name.toUpperCase()}</div>
                                            <div className="basketItemInfo">{item.details}</div>
                                            <div className="basketItemInfo">{"QUANTITE : " + item.quantity}</div>
                                            <div className="basketQuantity">
                                                <div className="basketItemInfo">{item.price + " €"}</div>
                                                <div className="basketQuantityButtons">
                                                    <div className="basketQuantityButton" onClick={() => this.modifyQuantity(index, "plus")}>
                                                        <FontAwesomeIcon icon={faPlus}/>
                                                    </div>
                                                    <div className={"basketQuantityButton " + ((item.quantity == 1) ? "disableButton" : "") } onClick={() => this.modifyQuantity(index, "less")}>
                                                        <FontAwesomeIcon icon={faMinus}/>
                                                    </div>
                                                    <div className="basketQuantityButton" onClick={() => this.modifyQuantity(index, "delete")}>
                                                        <FontAwesomeIcon icon={faTrash}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }.bind(this))}
                        </div>
                        <div className="basketValidation">
                            <div className="basketTotal">
                                Total : {this.getBasketTotal()} €
                            </div>
                            <Link to={{ pathname: "/pay", state: { basket: this.state.basket, price: this.getBasketTotal() } }} className="basketButton">Passer au payement</Link>
                        </div>
                    </div>
                </div>
            </div>,
            <Footer key="footer"/>
        ];
    }
}
