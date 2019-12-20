import React from 'react';
import Header from "../header";
import StocksList from "../stocks-list/stocks-list";
import StockInfo from "../stock-info/stock-info"
import SignIn from "../sign-in"
import Loader from "../loader";

import './root.scss';
import backRequest from "../../api/back-request";
import {StocksContext} from "../../contexts/stocks-context";
import UserContext from "../../contexts/user-context";


class Root extends React.Component {
    static contextType = StocksContext;

    state = {
        selectedStock: undefined,
        page: "stocks",
        loading: false,
        message: false,
        authenticated: false,
        userName: "Guest"
    };

    componentDidMount() {
        let userId = localStorage.userId;

        let userName = localStorage.userName;

        if (userId) {
            this.setState({ authenticated: true, userName });
            this.context.setUserId(userId);
        }
    }

    toggleAuthenticated = (userName, password, newUser) => e => {
        this.setState({loading: true, authenticated: !this.state.authenticated});
        backRequest.post('/users/', {
            newUser,
            userName,
            password,
        }).then(responce => {
            if(responce.data.status === 'ERROR'){
                this.setState({ message: true, loading: false,  authenticated: !this.state.authenticated});
            }
            else{
                const data = responce.data.data;
                data && this.context.setUserId(data);
                data && this.setState({userName, loading: false, message: false});
                localStorage.setItem('userId', data);
                localStorage.setItem('userName', userName);
            }
        });

    };

    renderStockInfo = selectedStock => e => {
        if (!selectedStock.count) {
            backRequest.get(`/userstocks/${selectedStock.symbol}?userId=${this.context.userId}`).then(responce => {
                const stock = responce.data.data;
                this.context.changeWindowedCount((stock) ? stock.count : 0);
            })
        } else {
            this.context.changeWindowedCount(selectedStock.count);
        }
        this.setState({ selectedStock });
    };

    signOut = () => {
        this.setState({ authenticated: !this.state.authenticated, userName: "Guest" });
    };

    render() {
        const { selectedStock, loading } = this.state;

        return (
            <div className="root">
                <UserContext.Provider
                    value={{
                        authenticated: this.state.authenticated,
                        userName: this.state.userName,
                        message: this.state.message,
                        toggleAuthenticated: this.toggleAuthenticated,
                        signOut: this.signOut
                    }}
                >
                    {this.state.authenticated || <SignIn/>}
                    <Header/>
                </UserContext.Provider>
                {loading && <Loader/>}
                <main>
                    <StocksList
                        renderStockInfo={this.renderStockInfo}
                    />
                    {selectedStock && <StockInfo
                        stockInfo={selectedStock}
                        setTransaction={this.setTransaction}
                    />}
                </main>
            </div>

        );
    }
}

export default Root;
