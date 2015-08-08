# redux-rest

Automatically create Flux action constants, action creators and Redux
reducers for your REST API.

## Install
```
npm install git://github.com/Kvoti/redux-rest.git
```

## Example
```js
import React from 'react';
import { connect, Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import Flux from 'redux-rest';

// This is a super simple app that displays a list of users from an API and
// lets you add new users. Until a success response is recevied from the API
// endpoint new users are show as pending.
class UserApp extends React.component {

  componentDidMount() {
    // Request the list of users when this component mounts
    this.props.dispatch(flux.actionCreators.users.list());
  }

  render() {
    let users = this.props.users;
    let pendingUsers = users.filter(u => u.status === 'pending');
    let currentUsers = users.filter(u => u.status !== 'pending');
    return (
      <div>
        {pendingUsers.map(user => <p>Saving {user.username}...</p>)}
        <ul>
          {currentUsers.map(user => <li>{user.username}</li>)}
        </ul>
        <input ref="username" placeholder="Enter username"/>
        <input type="submit" value="Add user" onClick={this._addUser}/>
      </div>
    );
  }

  _addUser() {
    let inputNode = React.findDOMNode(this.refs.username);
    let val = inputNode.value;
    this.props.dispatch(
      flux.actionCreators.users.create(
        {username: val}
      )
    );
    inputNode.val = '';
  }
}

// To create a store with redux for this app all you have to do is
// describe your API endpoints as key value pairs where the key is an
// identifier and the value is the URL of the endpoint.
const myAPI = {
  users: '/api/users/'
};

// Then create a Flux instance. This automatically creates
// action creators and reducers for each endpoint. No boilerplate!
const flux = new Flux(myAPI);

// Now configure redux in the usual way.
let reducers = combineReducers(flux.reducers);
let store = createStore(reducers);

// Which props do we want to inject, given the global state?
function select(state) {
  // Each endpoint has an _items and _collection reducer. Here we only need
  // the user items so we only pull out users_items.
  return {
    users: state.users_items
  };
})

// Wrap UserApp to inject dispatch and state into it
UserApp = connect(select)(UserApp);

// To render UserApp we need to wrap it in redux's Provider.
export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        {() => <UserApp />}
      </Provider>
    );
  }
}
```

## What is the Flux object?

The Flux object encapsulates common patterns when dealing with REST APIs.

When created with a description of your API you can call all the actions you'd
expect and there are reducers that automatically handle those actions, including
'pending', 'success' and 'failure' states.

```js
import Flux from 'redux-rest';

const myAPI = {
    users: '/api/users/',
}	   

const flux = new Flux(myAPI);
```

This creates a pair of reducers for each API endpoint; a _collection_
reducer to handle actions at the collection level and and _item_
reducer to handle actions on individual items.

    TODO not sure about the item/collection stuff. Needs a rethink.

Calling actions is as simple as

```js 
flux.actionCreators.users.create(userData);
```

### Status of API requests

Each action creator triggers an API request and immediately dispatches
an action so the UI can reflect the change straight away. During the
request the state change is marked as pending. For example, creating a
new object,

```js
flux.actionCreators.users.create({username: 'mark'});
```

will add,

```js
{
    username: 'mark',
    status: 'pending'
}
```

to the state.

    TODO what if 'status' is already a field of user?

On completion of the request the status is updated to ```saved``` or
```failed``` as appropriate. E.g.

```js
{
    username: 'mark',
    status: 'saved'
}
```

### Available actions

The standard set of REST actions is available; ```list```,
```retrieve```, ```create``` and ```update```.

## TODO
- add `delete` action
- add a `revert` action to revert optimistic changes if API request
fails.
- support APIs with custom endpoints
- integrate normalizr for flat object storage?
