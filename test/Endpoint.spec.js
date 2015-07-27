import assert from 'assert';
import { request } from 'superagent';

import { Endpoint } from '../src/reduxRest';

describe('Endpoint', () => {
    describe('#_getObjectURL()', () => {
        it('should append the object id the the url', () => {
            let endpoint = new Endpoint('');
            let objectURL = endpoint._getObjectURL('obj');
            assert.equal(objectURL, 'obj');
        });
    });
    
    describe('list', () => {
        it('should make a GET request', () => {
            let endpoint = new Endpoint('');
            let request = endpoint.list();
            assert.equal(request.method, 'GET');
        });
        
        it('should request the url passed to the constructor', () => {
            let endpoint = new Endpoint('endpoint/');
            let request = endpoint.list();
            assert.equal(request.url, 'endpoint/');
        });

        it('should append params object as the query string', () => {
            let endpoint = new Endpoint('');
            let request = endpoint.list({key: 'value'});
            assert.deepEqual(request.qs, {key: 'value'});
        });
    });

    describe('retrieve', () => {
        it('should make a GET request', () => {
            let endpoint = new Endpoint('');
            let request = endpoint.list();
            assert.equal(request.method, 'GET');
        });
        
        it('should request the url passed to the constructor with the object id', () => {
            let endpoint = new Endpoint('endpoint/');
            let request = endpoint.retrieve('obj');
            assert.equal(request.url, 'endpoint/obj');
        });
    });

    describe('create', () => {
        it('should make a POST request', () => {
            let endpoint = new Endpoint('');
            let request = endpoint.create({});
            assert.equal(request.method, 'POST');
        });
        
        it('should request the url passed to the constructor', () => {
            let endpoint = new Endpoint('endpoint');
            let request = endpoint.create({});
            assert.equal(request.url, 'endpoint');
        });
    });

    describe('update', () => {
        it('should make a PUT request', () => {
            let endpoint = new Endpoint('');
            let request = endpoint.update('obj', {});
            assert.equal(request.method, 'PUT');
        });
        
        it('should request the url passed to the constructor with the object id', () => {
            let endpoint = new Endpoint('endpoint/');
            let request = endpoint.update('obj', {});
            assert.equal(request.url, 'endpoint/obj');
        });
    });
});
