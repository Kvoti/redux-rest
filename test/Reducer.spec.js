


state.users.items

state.users.collection

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

