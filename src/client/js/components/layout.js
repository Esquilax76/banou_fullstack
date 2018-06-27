import React from "react";
import { SectionsContainer, ScrollToTopOnMount } from "react-fullpage";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faFacebookSquare from "@fortawesome/fontawesome-free-brands/faFacebookSquare";
import faInstagram from "@fortawesome/fontawesome-free-brands/faInstagram";

import { Beers } from "./beers.js";
import { Find } from "./find.js";
import { Story } from "./story.js";
import { Contact } from "./contact.js";

import { Link } from "react-router";

class Header extends React.Component {
    render() {
        return (
            <header className="header">
                <Link to="/" className="headerTitle">LA BANOU</Link>
                <nav className="nav">
                    <a href="#bieres" className="navItem hvr-underline-reveal activeMenu">NOS BIERES<div className="line"/></a>
                    <a href="#bar" className="navItem hvr-underline-reveal">BANOUBAR<div className="line"/></a>
                    <a href="#lieux" className="navItem hvr-underline-reveal">POINTS DE VENTE<div className="line"/></a>
                    <a href="#histoire" className="navItem hvr-underline-reveal">NOTRE HISTOIRE<div className="line"/></a>
                    <a href="#contact" className="navItem hvr-underline-reveal">CONTACT<div className="line"/></a>
                    <Link to="/boutique" className="navItem hvr-underline-reveal">BOUTIQUE<div className="line"/></Link>
                </nav>
            </header>
        );
    }
}

export class HeaderAdmin extends React.Component {
    render() {
        return (
            <header className="headerAdmin">
                <Link to="/" className="headerTitle">LA BANOU</Link>
                <div style={{ borderBottom: "1px solid white", width: "60%" }}/>
                <div style={{ fontSize: "1.5em" }}>ADMINISTRATEUR</div>
            </header>
        );
    }
}

export class Footer extends React.Component {
    render() {
        return (
            <footer className="footer">
                <div>© 2017 LA BANOU</div>
                <Link to="/credits" className="creditsButton footerChild">Mentions Légales</Link>
                <div className="links footerChild">
                    <a href="https://www.facebook.com/bierelabanou" target="blank">
                        <FontAwesomeIcon icon={faFacebookSquare} className="linkIcon"/>
                    </a>
                    <a href="https://www.instagram.com/biere_la_banou/?hl=fr" target="blank">
                        <FontAwesomeIcon icon={faInstagram} className="linkIcon"/>
                    </a>
                </div>
            </footer>
        );
    }
}

class Layout extends React.Component {
    render() {
        return (
            <main>
                {this.props.location.pathname === "/" ? (<Header/>) : (<div/>)}
                {this.props.children}
            </main>
        );
    }
}

export class AdminMenu extends React.Component {
    render() {
        return (
            <div className="adminActionContainer">
                <Link to="/admin" className={(this.props.active == "command") ? "adminAction activeAdmin" : "adminAction"}>
                    <div className="adminActionTitle">COMMANDES</div>
                    <img src={require("../../img/basket.png")} className="adminActionImg"/>
                </Link>
                <Link to="/stock" className={(this.props.active == "stock") ? "adminAction activeAdmin" : "adminAction"}>
                    <div className="adminActionTitle">STOCKS</div>
                    <img src={require("../../img/stock.png")} className="adminActionImg"/>
                </Link>
                <Link to="/stats" className={(this.props.active == "stats") ? "adminAction activeAdmin" : "adminAction"}>
                    <div className="adminActionTitle">STATISTIQUES</div>
                    <img src={require("../../img/stat.png")} className="adminActionImg"/>
                </Link>
                <Link to="/newsadmin" className={(this.props.active == "news") ? "adminAction activeAdmin" : "adminAction"}>
                    <div className="adminActionTitle">NEWS</div>
                    <img src={require("../../img/news.png")} className="adminActionImg"/>
                </Link>
                <Link to="/findadmin" className={(this.props.active == "find") ? "adminAction activeAdmin" : "adminAction"}>
                    <div className="adminActionTitle">POINTS DE VENTE</div>
                    <img src={require("../../img/find.png")} className="adminActionImg"/>
                </Link>
            </div>
        );
    }
}

export default Layout;
