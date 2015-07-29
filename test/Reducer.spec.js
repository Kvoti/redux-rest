import expect from 'expect';

import { ActionTypes, Reducer } from '../src/reduxRest';

describe('Reducer', () => {
    describe('reducer', () => {

        let actionTypes = new ActionTypes('endpoint');

        it('should create pending list state on list action', () => {
            let reducer = new Reducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.list,
                pendingID: 1
            }
            let newState = reducer(undefined, action);
            expect(newState.items.length).toEqual(0);
            expect(newState.collection.length).toEqual(1);
            expect(newState.collection[0]).toEqual({
                action: 'list',
                pendingID: 1,
                status: 'pending'
            });
        });

        it('should set pending list state to success on list action success', () => {
            let reducer = new Reducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.list_success,
                pendingID: 1
                payload: [{id: 1}]
            }
            let newState = reducer({
                items: [],
                collection: [{
                    action: 'list',
                    pendingID: 1,
                    status: 'pending'
                }]
            }, action);
            expect(newState.items.length).toEqual(0);
            expect(newState.collection.length).toEqual(1);
            expect(newState.collection[0]).toEqual({
                action: 'list',
                status: 'saved'
            });
        });

        it('should append item to state on create action', () => {
            let reducer = new Reducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.create,
                payload: {some: 'thing'},
                pendingID: 1
            }
            let newState = reducer(undefined, action);
            expect(newState.items.length).toEqual(1);
            expect(newState.items[0]).toEqual({
                // TODO split these into separate tests
                some: 'thing',
                pendingID: 1,
                status: 'pending'
            });
        });

        it('should replace item on create action success', () => {
            let reducer = new Reducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.create_success,
                payload: {id: 1, some: 'thing'},
                pendingID: 1
            }
            let newState = reducer(
                {items: [{some: 'thing', pendingID: 1}]},
                action);
            expect(newState.items.length).toEqual(1);
            expect(newState.items[0]).toEqual({
                // TODO split these into separate tests
                id: 1,
                some: 'thing',
                status: 'saved'
            });
        });

        it('should set item status to failed on create action failure', () => {
            let reducer = new Reducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.create_failure,
                pendingID: 1
            }
            let newState = reducer(
                {items: [{some: 'thing', pendingID: 1}]},
                action);
            expect(newState.items.length).toEqual(1);
            expect(newState.items[0]).toEqual({
                // TODO split these into separate tests
                pendingID: 1,
                some: 'thing',
                status: 'failed'
            });
        });
        
    });
});
