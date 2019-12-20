import {createContext} from 'react';

const UserContext = createContext({
    authenticated: false,
    message: false,
    userName: "Guest",
    toggleAuthenticated() {},
    signOut() {}
});

export default UserContext;
