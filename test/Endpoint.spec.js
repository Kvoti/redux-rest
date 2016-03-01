import assert from 'assert';
import nock from 'nock';
import sinon from 'sinon';
import superagent from 'superagent';

import { Endpoint } from '../src/reduxRest';

describe('Endpoint', () => {
  describe('#_setCSRFHeader()', () => {
    it('should call a custom setCSRF function', () => {
      let csrf = sinon.stub();
      let endpoint = new Endpoint('', {setCSRF: csrf});
      let request = 'request';
      endpoint._setCSRFHeader(request);
      sinon.assert.calledWith(csrf, request);
    });

    it('should be able to set headers from custom function', () => {
      const custom = (request) => {
        request.set('X-Custom', '1');
        return request;
      };
      let endpoint = new Endpoint('', {setCSRF: custom});
      let request = superagent.post('');
      let expectation = sinon.mock(request).expects('set').once();
      expectation.withArgs('X-Custom', '1');
    });
    
    it('should set headers when withCSRF is true', () => {
      let endpoint = new Endpoint('', {withCSRF: true});
      sinon.stub(endpoint, '_getCookie', () => 'cookie');
      let request = superagent.post('');
      let expectation = sinon.mock(request).expects('set').once();
      expectation.withArgs('X-CSRFToken', 'cookie');
      endpoint._setCSRFHeader(request);
      expectation.verify();
    });

    it('should not set headers when withCSRF is false', () => {
      let endpoint = new Endpoint('');
      let request = superagent.post('');
      let expectation = sinon.mock(request).expects('set').never();
      endpoint._setCSRFHeader(request);
      expectation.verify();
    });

    it('should use custom CSRFHeaderName', () => {
      let endpoint = new Endpoint('', {withCSRF: true, CSRFHeaderName: 'X-Fred'});
      sinon.stub(endpoint, '_getCookie');
      let request = superagent.post('');
      let expectation = sinon.mock(request).expects('set').once();
      expectation.withArgs('X-Fred');
      endpoint._setCSRFHeader(request);
      expectation.verify();
    });

    it('should use custom CSRFCookieName', () => {
      let endpoint = new Endpoint('', {withCSRF: true, CSRFCookieName: 'testcookie'});
      let stub = sinon.stub(endpoint, '_getCookie');
      let request = superagent.post('');
      sinon.stub(request, 'set');
      endpoint._setCSRFHeader(request);
      sinon.assert.calledWithExactly(stub, 'testcookie');
    });

    it('should set request headers', (done) => {
      let scope = nock('http://example.com')
          .matchHeader('x-csrftoken', 'token')
          .post('/endpoint')
          .reply(200);
      let endpoint = new Endpoint('http://example.com/endpoint', {withCSRF: true});
      sinon.stub(endpoint, '_getCookie', () => 'token');
      endpoint.create().end(() => {
        scope.done();
        done();
      });
    });
  });
  
  describe('#_getObjectURL()', () => {
    it('should append the object id to the endpoint url', () => {
      let endpoint = new Endpoint('');
      let objectURL = endpoint._getObjectURL('obj');
      assert.equal(objectURL, '/obj');
    });

    it('should handle the endpoint url ending in a /', () => {
      let endpoint = new Endpoint('/');
      let objectURL = endpoint._getObjectURL('obj');
      assert.equal(objectURL, '/obj');
    });
  });

  describe('list', () => {
    it('should make a GET request to the endpoint url', (done) => {
      // Note only giving full url to work with nock
      // TODO run these tests in browser?
      let endpoint = new Endpoint('http://example.com/endpoint');
      // TODO if nock gets support for path regexps we don't need to specify the path here
      let scope = nock('http://example.com').get('/endpoint').reply(200);
      endpoint.list().end(() => {
        scope.done();
        done();
      });
    });

    it('should append params object as the query string', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      let scope = nock('http://example.com')
          .get('/endpoint')
          .query({key: 'value'})
          .reply(200);
      endpoint.list({key: 'value'}).end(() => {
        scope.done();
        done();
      });

    });
  });

  describe('retrieve', () => {
    it('should make a GET request to the object url', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      let scope = nock('http://example.com').get('/endpoint/obj').reply(200);
      endpoint.retrieve('obj').end(() => {
        scope.done();
        done();
      });
    });
  });

  describe('create', () => {
    it('should make a POST request to the endpoint url', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      sinon.stub(endpoint, '_setCSRFHeader', request => request);
      let scope = nock('http://example.com').post('/endpoint').reply(200);
      endpoint.create().end(() => {
        scope.done();
        done();
      });
    });

    it('should send the object conf in the request body', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      sinon.stub(endpoint, '_setCSRFHeader', request => request);
      let scope = nock('http://example.com')
          .post('/endpoint', {id: 1})
          .reply(200);
      endpoint.create({id: 1}).end(() => {
        scope.done();
        done();
      });
    });

  });

  describe('update', () => {
    it('should make a PUT request to the object url', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      sinon.stub(endpoint, '_setCSRFHeader', request => request);
      let scope = nock('http://example.com').put('/endpoint/obj').reply(200);
      endpoint.update({}, 'obj').end(() => {
        scope.done();
        done();
      });
    });

    it('should send the object conf in the request body', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      sinon.stub(endpoint, '_setCSRFHeader', request => request);
      let scope = nock('http://example.com')
          .put('/endpoint/obj', {id: 1})
          .reply(200);
      endpoint.update({id: 1}, 'obj').end(() => {
        scope.done();
        done();
      });
    });

  });
});
