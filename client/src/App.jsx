import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CreateRoom from './routes/CreateRoom.jsx';
import Room from './routes/Room.jsx';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path='/' exact component={CreateRoom} />
          <Route path='/room/:roomID' component={Room} />
        </Switch>
      </BrowserRouter>
    </div>
  )
}

ReactDOM.render( <App />, document.getElementById('app'));