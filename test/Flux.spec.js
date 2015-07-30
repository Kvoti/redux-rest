import expect from 'expect';

import Flux, * as flux from '../src/reduxRest';

describe('Flux', () => {
  const APIConf = {endpoint: 'enpoint/'};

  it('should create an API helper for each API endpoint', () => {
    let f = new Flux(APIConf);
    expect(f.API.endpoint).toBeAn(flux.Endpoint);
  });

  it('should create ActionTypes for each API endpoint', () => {
    let f = new Flux(APIConf);
    expect(f.actionTypes.endpoint).toBeAn(flux.ActionTypes);
  });

  it('should create ActionCreators for each API endpoint', () => {
    let f = new Flux(APIConf);
    expect(f.actionCreators.endpoint).toBeAn(flux.ActionCreators);
  });

  it('should create an item reducer for each API endpoint', () => {
    let f = new Flux(APIConf);
    let newState = f.reducers.endpoint_items(undefined, {type: 'endpoint_create', payload: {key: 'val'}});
    expect(newState[0].key).toEqual('val');
  });

  it('should create a collection reducer for each API endpoint', () => {
    let f = new Flux(APIConf);
    let newState = f.reducers.endpoint_collection(undefined, {type: 'endpoint_list'});
    expect(newState[0].action).toEqual('list');
  });

});
