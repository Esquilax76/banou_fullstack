import React from "react";
import { Footer } from "./layout.js";

import { Link } from "react-router";
import axios from "axios";

import "../../css/contact.scss";

export class Contact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            message: "",
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e, input) {
        this.setState({ [input]: e.target.value });
    }

    handleSubmit() {
        axios.post("/api/sendMail", { name: this.state.name, email: this.state.email, message: this.state.message })
            .then(response => {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render() {
        return [
            <div className="contactContainer" key="1">

                <div className="leftColumn">
                    <div className="contactSubtitle">N'hésitez pas à venir nous rendre visite à la microbrasserie! Nous nous ferons un plaisir de vous faire découvrir</div>
                    <div className="banou">LA BANOU</div>
                </div>

                <div className="rightColumn">
                    <div className="pageTitle contactPageTitle">CONTACTEZ-NOUS</div>
                    <div className="banouPetit">LA BANOU</div>
                    <div className="address">Adresse<br/>Telephone</div>
                    <div className="hoursTitle">Horaires d'ouverture de la microbrasserie:</div>
                    <div className="hours">Du lundi au vendredi, de 9h à 18h<br/>Visite le samedi de 10h à 16h</div>
                    <div className="contactForm">
                        <div className="contactID">
                            <input className="input smallInput" value={this.state.name} type="text" placeholder="Nom" onChange={(e) => this.handleChange(e, "name")}/>
                            <input className="input smallInput" type="email" placeholder="Email" onChange={(e) => this.handleChange(e, "email")}/>
                        </div>
                        <textarea rows="10" className="message" placeholder="Message" onChange={(e) => this.handleChange(e, "message")}/>
                        <input className="send" type="submit" value="Envoyer" onClick={this.handleSubmit}/>
                    </div>
                </div>

            </div>,
            <Footer key="2"/>
        ];
    }
}
