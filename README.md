# redux-rest

Automatically create Flux action constants, action creators and Redux
reducers for your REST API.

## Install
```
npm install git://github.com/Kvoti/redux-rest.git
```

## How to use

Create an object witht the urls of your API endpoints. E.g.

```js
let myAPI = {
    users: '/api/users/',
}	   
```

Create a ```Flux``` instance.

```js
let flux = new Flux(myAPI);
```

This creates a pair of reducers for each API endpoint; a _collection_
reducer to handle actions at the collection level and and _item_
reducer to handle actions on individual items.

Initialise Redux.

```js
let redux = createRedux(flux.reducers);
```

Your components can then be hooked up to the Redux state in the usual
way:

```js
import { connect } from redux/react;

@connect(state => {
    users: state.users_items	       
});
class MyContainerComponent extends React.component {

    componentDidMount () {
        this.props.dispatch(flux.actionCreators.users.list());
    }

    ...
}
```

Note the ```state``` keys are ```<endpoint>_items``` and
```<endpoint>_collection```.

    TODO not sure about the item/collection stuff. Needs a rethink.

Calling actions is as simple as

```js 
flux.actionCreators.users.create(userData);
```

In the example above we call the ```list``` action to load the list of
users from the API when the component is mounted.

### Status of API requests

Each action creator triggers an API request and immediately dispatches
an action so the UI can reflect the change straight away. During the
request the state change is marked as pending. For example, creating a
new object,

```js
flux.actionCreators.users.create({username: 'mark'});
```

will add

```js
{
    username: 'mark',
    status: 'pending'
}
```

to the state.

    TODO what if 'status' is already a field of user?

On completion of the request the status is updated to ```saved``` or
```failed``` as appropriate.

### Actions

The standard set of REST actions is available; ```list```,
```retrieve```, ```create```, ```update```.

## Development
TODO

## TODO

- add a `revert` action to revert optmistic changes if API request
fails.
- support APIs with custom endpoints
