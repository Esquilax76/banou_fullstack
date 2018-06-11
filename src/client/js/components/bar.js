import React from "react";

import "../../css/bar.scss";
import data from "../data/data.js";

export class Bar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            news: data.barNews,
            current: data.barNews[0],
            index: 0,
            changeOk: true
        };

        this.changeNews = this.changeNews.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(this.changeNews, 7000);
    }

    changeNews() {
        if (this.state.changeOk) {
            let index = this.state.index;
            let max = this.state.news.length;
            if (index === max - 1) {
                this.setState({ index: 0, current: data.barNews[0] });
            } else {
                this.setState({ index: this.state.index + 1, current: data.barNews[this.state.index + 1] });
            }
        }
    }

    handleChange(index) {
        this.setState({ index: index, current: data.barNews[index], changeOk: false });
    }

    render() {
        return (
            <div className="barContainer">
                <div className="barContent">
                    <div className="pageTitle barTitle">LE BANOUBAR</div>
                    <div className="barInfoContainer">
                        <div className="barInfo bigInfo">
                            Venez découvrir notre Brew pub au sein même de notre microbrasserie!
                            <br/><br/>
                            Un lieu chaleureux et convivial, où vous pourrrez dégustez les bières La BANOU, tout en faisant une partie de flechette ou de babyfoot!
                        </div>
                        <div className="barInfo greyInfo">
                            Recherche d'un local en cours
                            <br/><br/>
                            06 58 26 98 58
                        </div>
                        <div className="barInfo">
                            <strong>Horaires d'ouverture du BANOU BAR</strong>
                            <br/><br/>
                            Du mardi au jeudi de 16h à 20h
                            <br/>
                            Le vendredi et le samedi de 12h à 22h
                            <br/>
                            Brunch le dimanche matin de 12h à 15h
                        </div>
                    </div>
                </div>
                <div className="barImage" style={{ backgroundImage: "url(" + this.state.current.image + ")" }}>
                    <div className="barNewsNav">
                        {this.state.news.map(function (item, index) {
                            return (
                                <div
                                    key={index}
                                    className={"barNewsButton " + (this.state.index === index ? "activeNav" : "nonActiveNav")}
                                    onClick={() => this.handleChange(index)}
                                />
                            );
                        }.bind(this))}
                    </div>
                    <div className="barNews">
                        <div className="barNewsTitle">{this.state.current.title}</div>
                        <div className="barNewsDesc">{this.state.current.desc}</div>
                    </div>
                </div>
            </div>
        );
    }
}
