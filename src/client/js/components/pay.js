import React from "react";
import axios from "axios";
import { Link } from "react-router";

import "../../css/pay.scss";
import data from "../data/data.js";

import { CardElement, CardNumberElement, CardExpiryElement, CardCVCElement, PostalCodeElement, PaymentRequestButtonElement, StripeProvider, Elements, injectStripe } from "react-stripe-elements";

export class Pay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            basket: this.props.location.state.basket,
            price: this.props.location.state.price,
            delivery: 0
        };
        this.handleChange = this.handleChange.bind(this);
        this.importAll = this.importAll.bind(this);
    }

    importAll(r) {
        let images = {};
        r.keys().map((item) => { images[item.replace("./", "")] = r(item); });
        return images;
    }

    handleChange(e) {
        this.setState({ delivery: e });
    }

    render() {
        const images = this.importAll(require.context("../../img/shop", false, /\.(png|jpe?g|svg)$/));
        return [
            <header className="header" key="header">
                <Link to="/" className="headerTitle">LA BANOU</Link>
            </header>,
            <div className="payContainer" key="pay">
                <div className="pageTitle payTitle">Votre Commande</div>
                <div className="commandRecap">
                    <div className="commandRecapHeader">
                        <div className="commandRecapItem">Panier</div>
                        <div className="commandRecapPrice">Prix</div>
                        <div className="commandRecapQuantity">Qté</div>
                        <div className="commandRecapTotal">Total</div>
                    </div>
                    {Object.keys(this.state.basket).map(function (key, index) {
                        let item = this.state.basket[key];
                        return (
                            <div className="commandRecapRow" key={index}>
                                <div className="commandRecapItem">
                                    <img src={images[item.name.replace(/\s+/g, "_").replace("é", "e").toLowerCase() + "_" + item.package + ".jpg"]} className="recapItemImage"/>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div>{this.state.basket[key].name.toUpperCase()}</div>
                                        <div className="commandRecapInfo">{item.details}</div>
                                    </div>
                                </div>
                                <div className="commandRecapPrice">{item.unit}</div>
                                <div className="commandRecapQuantity">{item.quantity}</div>
                                <div className="commandRecapTotal">{item.price}</div>
                            </div>
                        );
                    }.bind(this))}
                </div>
                <div className="payTotal">
                    <div className="payTotalText">
                        <div>Sous-total</div>
                        <div className="dots"/>
                        <div>{this.state.price} €</div>
                    </div>
                    <div className="payTotalInfo">(Hors frais de livraison)</div>
                </div>
                <div className="payDelivery">
                    <div className="payDeliveryText">Livraison :</div>
                    <div className="payDeliveryOption">
                        <input type="radio" value="0" onChange={() => this.handleChange("0")} checked={this.state.delivery == "0"} />
                        <label className="radioLabel">Retrait à la Brasserie La Banou</label>
                        <div className="dots"/>
                        <div className="deliveryPrice"> 0 €</div>
                    </div>
                    <div className="payDeliveryOption">
                        <input type="radio" value="10" onChange={() => this.handleChange("10")} checked={this.state.delivery == "10"} />
                        <label className="radioLabel">Livraison à domicile</label>
                        <div className="dots"/>
                        <div className="deliveryPrice">10 €</div>
                    </div>
                    <div className="payTotalInfo">(france Métropolitaine uniquement)</div>
                    <div className="totalToPay">TOTAL A PAYER : {(parseFloat(this.state.delivery) + parseFloat(this.state.price)).toFixed(2)} €</div>
                </div>
                <StripeProvider apiKey="pk_test_syiPXjXdGnFGKn00cX6zJQ2Q" key="form">
                    <Elements>
                        <PayForm price={(parseFloat(this.state.delivery) + parseFloat(this.state.price)).toFixed(2)} basket={this.state.basket} delivery={this.state.delivery}/>
                    </Elements>
                </StripeProvider>
            </div>
        ];
    }
}

class _PayForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.sendCommand = this.sendCommand.bind(this);
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.stripe.createToken().then(payload => {
            console.log(payload);
            axios.post("/api/proceedPay", { stripeToken: payload.token.id, price: this.props.price })
                .then(response => {
                    console.log(response);
                    this.sendCommand();
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }

    sendCommand() {
        var corres = { unit: 1, pack: 6, carton: 12 };
        axios.post("/api/postCommand", { address: "ici", price: this.props.price, user: 25, delivery: this.props.delivery })
            .then(response => {
                var id = response.data.insertId;
                this.props.basket.map(function (item) {
                    console.log(item);
                    axios.post("/api/postCommandItem", { command_id: id, quantity: item.quantity, package: item.package, size: item.size, price: parseFloat(item.price), product_id: item.product_id })
                        .then(response2 => {
                            console.log(response2);
                            axios.post("/api/patchStockAfterCommand", { id: item.product_id, stock: parseInt(item.quantity * corres[item.package]), size: item.size })
                                .then(response3 => {
                                    console.log(response3);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }.bind(this));
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render() {
        const createOptions = () => {
            return {
                style: {
                    base: {
                        "color": "white",
                        "::placeholder": { color: "#aab7c4", },
                    },
                    invalid: { color: "red", },
                },
            };
        };
        return (
            <form onSubmit={this.handleSubmit} className="payForm">
                <div className="formContent">
                    <div className="formRow">
                        <label className="formLabel">
                            Nom :
                            <input type="text" className="paySmallInput" autoComplete="nope"/>
                        </label>
                        <label className="formLabel">
                            Prénom :
                            <input type="text" className="paySmallInput" autoComplete="nope"/>
                        </label>
                    </div>
                    <div className="formRow">
                        <label className="formLabelLarge">
                            Addresse :
                            <input type="text" className="payLargeInput" autoComplete="nope"/>
                        </label>
                    </div>
                    <div className="formRow">
                        <label className="formLabel">
                            Ville :
                            <input type="text" className="paySmallInput" autoComplete="nope"/>
                        </label>
                        <label className="formLabel">
                            Code Postal :
                            <input type="text" className="paySmallInput" autoComplete="nope"/>
                        </label>
                    </div>
                    <div className="formRow">
                        <label className="formLabel">
                            Téléphone :
                            <input type="text" className="paySmallInput" autoComplete="nope"/>
                        </label>
                    </div>
                    <div className="formSubtitle">INFORMATIONS DE PAIEMENT</div>
                    <div className="formRowStripe">
                        <label className="cardNumber">
                            Numéro de carte :
                            <CardNumberElement  {...createOptions()} placeholder="0000 0000 0000 0000"/>
                        </label>
                        <label className="cardValidity">
                            Date de validité :
                            <CardExpiryElement  {...createOptions()} placeholder="01/20"/>
                        </label>
                        <label className="cardCCV">
                            CCV :
                            <CardCVCElement  {...createOptions()} placeholder="000"/>
                        </label>
                    </div>
                </div>
                <button className="formSubmit">VALIDER LE PAIEMENT</button>
            </form>
        );
    }
}

const PayForm = injectStripe(_PayForm);
