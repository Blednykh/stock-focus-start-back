import React from 'react';

import './header.scss';
import UserContext from "../../contexts/user-context";

class Header extends React.Component {
    static contextType = UserContext;

    handleClick = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        this.context.signOut();
    };

    render() {
        return (
            <header className="l-header">
                <span>BLED STOCKS</span>
                <div className="user-box">
                    <span>{this.context.userName}</span>
                    {this.context.authenticated && <span className="logout" onClick={this.handleClick}>Logout?</span>}
                </div>
            </header>
        );
    }

}

export default Header;
