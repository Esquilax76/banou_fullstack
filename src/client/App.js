// import React, { Component } from 'react';
// import './app.css';

// export default class App extends Component {
//   constructor(props) {
//     super(props);
//     this.state = { users: [] };
//   }

//   componentDidMount() {
//     fetch('/api/getUsername')
//       .then(res => res.json())
//       .then(users => this.setState({ users }));
//   }

//   render() {
//     return (
//       <div className="App">
//         <h1>Users</h1>
//         <ul>
//           {this.state.users.map(user =>
//             <li key={user.id}>{user.name}</li>
//           )}
//         </ul>
//       </div>
//     );
//   }
// }

