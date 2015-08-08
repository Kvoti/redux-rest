import { createStore, combineReducers, applyMiddleware } from 'redux';
import expect from 'expect';
import nock from 'nock';

import Flux, { asyncDispatch } from '../src/reduxRest';

describe('Flux', () => {
  it('should integrate with redux', () => {
    const myAPI = {
      users: 'http://example.com/api/users/'
    };
    const flux = new Flux(myAPI);
    const reducers = combineReducers(flux.reducers);

    let createStoreWithMiddleware = applyMiddleware(
      asyncDispatch
    )(createStore);
    const store = createStoreWithMiddleware(reducers);
    let scope = nock('http://example.com')
        .get('/api/users/')
        .reply(200, [{
          username: 'mark'
        }]);
    store.dispatch(
      d => {
        flux.actionCreators.users.list()(d).end(() => {
          expect(store.getState()).toBe([{username: 'mark'}]);
          scope.done();
        });
      });
  });
});
