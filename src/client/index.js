// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';

// ReactDOM.render(<App />, document.getElementById('root'));

import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute, browserHistory, hashHistory } from "react-router";

import { Beers } from "./js/components/beers.js";
import { Shop } from "./js/components/shop.js";
import { Credits } from "./js/components/credits.js";
import { Fullpage } from "./js/components/fullpage.js";
import { Admin } from "./js/components/admin.js";
import { Stats } from "./js/components/stats.js";
import { Pay } from "./js/components/pay.js";
import Layout from "./js/components/layout.js";

import "./css/common.scss";

const app = document.getElementById("root");
ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={Layout}>
            <IndexRoute component={Fullpage}></IndexRoute>
            <Route path="boutique" component={Shop}></Route>
            <Route path="credits" component={Credits}></Route>
            <Route path="admin" component={Admin}></Route>
            <Route path="stats" component={Stats}></Route>
            <Route path="pay" component={Pay}></Route>
        </Route>
    </Router>,
    app
);
