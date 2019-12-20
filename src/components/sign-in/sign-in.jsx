import React from 'react';
import UserContext from "../../contexts/user-context";

import Locale from "../../locale";
import './sign-in.scss';

class SignIn extends React.Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            password: '',
            newUser: false
        };
    }

    changeSignInType = () => {
        this.setState({ newUser: !this.state.newUser });
    };

    onUserNameChange = event => this.setState({ userName: event.target.value });

    onPasswordChange = event => this.setState({ password: event.target.value });

    render() {
        const { userName, password, newUser } = this.state;

        const locale = Locale.signInForm;

        return (
            <div className="login">
                <div className="signin-form">
                    <div>
                        <h1 className="signin-form__title">{newUser ? locale.title[0] : locale.title[1]}</h1>
                        <input
                            type="text"
                            placeholder={locale.username}
                            className="signin-form__item"
                            onChange={this.onUserNameChange}
                        />
                        <input
                            type="password"
                            placeholder={locale.password}
                            className="signin-form__item"
                            onChange={this.onPasswordChange}
                        />
                        {this.context.message && <span className="errorText">
                            Pair login-password doesn't match!
                        </span>}
                        <button
                            className="signin-form__item signin-form__btn"
                            onClick={this.context.toggleAuthenticated(userName, password, newUser)}
                        >{newUser ? locale.signInButton[0] : locale.signInButton[1]}</button>
                        <span
                            className="signin-form__switch"
                            onClick={this.changeSignInType}>{newUser ? locale.signInHref[0] : locale.signInHref[1]}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}

export default SignIn;
