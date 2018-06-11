import React from "react";
import { SectionsContainer, ScrollToTopOnMount } from "react-fullpage";

import { Beers } from "./beers.js";
import { Bar } from "./bar.js";
import { Find } from "./find.js";
import { Story } from "./story.js";
import { Contact } from "./contact.js";

export class Fullpage extends React.Component {
    constructor() {
        super();
        this.state = { initialActiveSection: null };

        this.onScroll = this.onScroll.bind(this);
    }

    onScroll(e) {
        var links = document.getElementsByClassName("navItem");
        links[e.activeSection].classList.add("activeMenu");
        if (this.state.initialActiveSection === null) {
            this.setState(() => ({ initialActiveSection: e.activeSection }));
        }
    }

    componentDidMount() {
        //this.onScroll({ activeSection: 0 });
    }

    render() {
        let options = {
            activeClass: "active",
            anchors: ["bieres", "bar", "lieux", "histoire", "contact"],
            arrowNavigation: true,
            className: "SectionContainer",
            delay: 1000,
            navigation: true,
            scrollBar: false,
            sectionPaddingTop: "0",
            sectionPaddingBottom: "0",
            verticalAlign: false,
        };

        return (
            <SectionsContainer className="sectionContainer" {...options} scrollCallback={this.onScroll} activeSection={this.state.initialActiveSection}>
                <Beers/>
                <Bar/>
                <Find/>
                <Story/>
                <Contact/>
            </SectionsContainer>
        );
    }
}
