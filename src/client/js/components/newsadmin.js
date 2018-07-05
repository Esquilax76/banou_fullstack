import React from "react";
import axios from "axios";

import "../../css/admin.scss";
import "../../css/newsadmin.scss";

import { Link } from "react-router";

import { HeaderAdmin, AdminMenu } from "./layout.js";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faPlus from "@fortawesome/fontawesome-free-solid/faPlus";
import faCamera from "@fortawesome/fontawesome-free-solid/faCamera";
import faPen from "@fortawesome/fontawesome-free-solid/faPencilAlt";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";
import faEyeS from "@fortawesome/fontawesome-free-solid/faEyeSlash";

export class NewsAdmin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            news: [],
            current: {},
            popup: "hidden",
            action: "Modifier une News",
            selectedFile: {}
        };
        this.showPopupCreate = this.showPopupCreate.bind(this);
        this.showPopup = this.showPopup.bind(this);
        this.getNews = this.getNews.bind(this);
        this.handleChangeActive = this.handleChangeActive.bind(this);
        this.getData = this.getData.bind(this);
        this.importAll = this.importAll.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    showPopupCreate() {
        var empty = { active: 1, title: "", description: "" };
        this.setState({ popup: "visible", current: empty, action: "Créer une News", selectedFile: {} });
    }

    showPopup(item) {
        this.setState({ popup: "visible", action: "Modifier une News" });
        this.getNews(item.id);
    }

    getNews(id) {
        axios.get("/api/getNewsById", { params: { id: id } })
            .then(response => {
                this.setState({ current: response.data[0], selectedFile: { name: response.data[0].image } });
            });
    }

    importAll(r) {
        let images = {};
        r.keys().map((item) => { images[item.replace("./", "")] = r(item); });
        return images;
    }

    getData() {
        axios.get("/api/getNews")
            .then(response => {
                this.setState({ news: response.data });
            });
    }

    handleChangeActive(item) {
        axios.post("/api/patchNewsActive", { id: item.id, active: !item.active })
            .then(() => {
                this.getData();
            });
    }

    handleFileChange(e) {
        this.setState({ selectedFile: e.target.files[0] });
    }

    handleChange(e, type) {
        var newCurrent = this.state.current;
        newCurrent[type] = e.target.value;
        this.setState({ current: newCurrent });
    }

    submitForm() {
        const selectedFile = this.state.selectedFile;
        let formData = new FormData();

        formData.append("selectedFile", selectedFile);

        axios.post("/api/uploadNewsFile", formData)
            .then(() => {
                if (this.state.action == "Créer une News") {
                    axios.post("/api/postNews", { title: this.state.current.title, description: this.state.current.description, image: this.state.selectedFile.name })
                        .then(() => {
                            this.setState({ popup: "hidden" });
                            this.getData();
                        });
                } else {
                    axios.post("/api/patchNews", { id: this.state.current.id, title: this.state.current.title, description: this.state.current.description, image: this.state.selectedFile.name })
                        .then(() => {
                            this.setState({ popup: "hidden" });
                            this.getData();
                        });
                }
            });
    }

    render() {
        const images = this.importAll(require.context("../../img/news", false, /\.(png|jpe?g|svg)$/));
        return [
            <HeaderAdmin key="header"/>,
            <section className="adminContainer" key="content">
                <div className="commandContainer">
                    <div className="adminHeader">
                        <div>NEWS</div>
                        <div className="addHeader" onClick={() => { this.showPopupCreate(); }}>
                            <FontAwesomeIcon icon={faPlus} className="stockIcon"/>
                        </div>
                    </div>
                    <div className="newsSectionContainer">
                        {this.state.news.map((item, index) => {
                            return (
                                <div className="stockItem" key={index} style={{ backgroundColor: !item.active ? "lightgrey" : "white" }}>
                                    <div className="newsAdminImage" style={{ backgroundImage: "url(" + images[item.image] + ")" }}/>
                                    <div className="newsItemDesc">
                                        <div className="stockItemName">{item.title.toUpperCase()}</div>
                                        <div className="stockItemDescription">{item.description}</div>
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
                        })}
                    </div>
                </div>
                <AdminMenu active="news"/>
            </section>,
            <div className="disable" style={{ visibility: this.state.popup }} key="popup">
                <div className="popUpStock">
                    <div className="close" onClick={() => this.setState({ popup: "hidden" })}>+</div>
                    <div className="popUpStockHeader">{this.state.action.toUpperCase()}</div>
                    <div className="popUpNewsContent">
                        <div className="newsInputs">
                            <input type="text" placeholder="Titre" className="modifyNewsInput" value={this.state.current.title} onChange={(e) => this.handleChange(e, "title")}/>
                            <textarea placeholder="Description" className="modifyNewsTextarea" value={this.state.current.description} onChange={(e) => this.handleChange(e, "description")}/>
                        </div>
                        <label htmlFor="file" className="label-file newsLabel">
                            <div className="labelText">Image</div>
                            <FontAwesomeIcon icon={faCamera} className="inputIcon"/>
                            <div className="imageName">{this.state.selectedFile.name}</div>
                        </label>
                        <input id="file" className="input-file" type="file" onChange={(e) => this.handleFileChange(e)} />
                    </div>
                    <div className="modifyProductRow">
                        <div className="modifyNewsButton" onClick={(e) => this.submitForm(e)}>VALIDER</div>
                    </div>
                </div>
            </div>
        ];
    }
}
