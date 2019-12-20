import React, {createContext, Component} from 'react';
import backRequest from '../api/back-request';
import Loader from "../components/loader";

export const StocksContext = createContext({
    stocks: [],
    loading: false,
    message: null,
    page: "",
    searchValue: "",
    offset: 0,
    windowedCount: 0,
    userId: "",
    renderStocksList() {
    },
    renderUserStockList() {
    },
    renderHistory() {
    },
    scrollLoading() {
    },
    changeSearchValue() {
    },
    setTransaction() {
    },
    changeWindowedCount() {
    },
    setUserId() {
    }
});

class StocksProvider extends Component {
    state = {
        stocks: [],
        loading: false,
        message: null,
        page: "stocks",
        searchValue: "",
        offset: 0,
        windowedCount: 0,
        userId: ""
    };

    renderList = (page, searchValue) => {
        this.setState({  loading: true, stocks: [] });
        backRequest.get(`/${page}/?offset=0&name=${searchValue}&userId=${this.state.userId}`).then(responce => {
            const stocks = responce.data.data;
            this.setState({ stocks, page, loading: false});
        })
    };

    componentDidMount() {
        this.renderList("stocks", this.state.searchValue);

    }

    renderStocksList = () => {
        this.setState({ page: "stocks", offset: 0 });
        this.renderList("stocks", this.state.searchValue);

    };
    renderUserStockList = () => {
        this.setState({ page: "userstocks", offset: 0 });
        this.renderList("userstocks", this.state.searchValue);
    };
    renderHistory = () => {
        this.setState({ page: "transactions", offset: 0 });
        this.renderList("transactions", this.state.searchValue);
    };

    scrollLoading = () => {
        let { stocks, page, offset, searchValue, userId } = this.state;
        offset += 10;
        backRequest.get(`/${page}/?offset=${offset}&name=${searchValue}&userId=${userId}`).then(responce => {
            stocks = stocks.concat(responce.data.data);
            this.setState({ stocks, offset: offset});
        })
    };
    changeSearchValue = (searchValue, page) => {
        this.setState({ searchValue, offset: 0 });
        this.renderList(page, searchValue);
    };

    changeWindowedCount = (count) => {
        this.setState({ windowedCount: count });
    };

    setUserId = (userId) => {
        this.setState({ userId });
    };


    setTransaction = (symbol, count, price, type) => {
        backRequest.post('/userstocks/', {
            symbol,
            count,
            price,
            type,
            userId: this.state.userId
        }).then(responce => {
            const data = responce.data.data;
            if (data && data.count !== 0) {
                this.setState({ windowedCount: data.count });
                let { stocks, page, searchValue } = this.state;
                if (page === "transactions") {
                    this.renderList(page, searchValue);
                }
                if (page === "userstocks") {
                    const findIndex = stocks.findIndex(item => item.symbol === data.symbol);
                    if (findIndex !== -1) {
                        stocks[findIndex].count = data.count;
                        this.setState({ stocks });
                    } else {
                        this.renderList(page, searchValue);
                    }
                }
            }
            else{
                this.setState({ windowedCount: 0});
                let { stocks, page, searchValue } = this.state;
                if (page === "transactions") {
                    this.renderList(page, searchValue);
                }
                if (page === "userstocks") {
                    this.renderList(page, searchValue);
                }
            }
        })
    };


    render() {
        const { stocks, loading, message, page, searchValue, offset, windowedCount, userId } = this.state;
        return (
            <StocksContext.Provider value={{
                stocks,
                loading,
                message,
                page,
                searchValue,
                offset,
                windowedCount,
                userId,
                renderStocksList: this.renderStocksList,
                renderUserStockList: this.renderUserStockList,
                renderHistory: this.renderHistory,
                scrollLoading: this.scrollLoading,
                changeSearchValue: this.changeSearchValue,
                setTransaction: this.setTransaction,
                changeWindowedCount: this.changeWindowedCount,
                setUserId: this.setUserId
            }}>
                {this.props.children}
                {this.state.loading && userId!=='' && <Loader/>}
            </StocksContext.Provider>
        )
    }
}

export default StocksProvider;
