# redux-rest

Automatically create Flux action constants, action creators and Redux
reducers for your REST API.

## Install
TODO

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

Initialise Redux.

```js
let redux = createRedux(flux.reducers);
```


Calling actions is as simple as
```js 
flux.actionCreators.users.create(userData);
```

New objects are added to the state with a status of 'pending' until
the API request either succeeds or fails, at which point the status is
updated.

The standard set of REST actions is available; list, retrieve, create,
update.

## TODO
Add a `revert` action to revert optmistic changes if API request fails.

