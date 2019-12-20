import React from 'react';
import Stock from "../stock";
import Locale from "../../locale";

import './stocks-list.scss';
import {StocksContext} from '../../contexts/stocks-context';

class StocksList extends React.Component {
    static contextType = StocksContext;
    state = { searchValue: "", timer: undefined };
    myscroll = React.createRef();

    handleScroll = () => {
        if (
            this.myscroll.current.scrollTop + this.myscroll.current.clientHeight >=
            this.myscroll.current.scrollHeight
        ) {
            this.context.scrollLoading();
        }

    };

    handleInput = event => {
        let { timer } = this.state;

        this.setState({ searchValue: Number(event.target.value) });

        if (timer) {
            clearTimeout(timer);
            timer = setTimeout(this.context.changeSearchValue, 500, event.target.value, this.context.page);
            this.setState({ timer });
        } else {
            timer = setTimeout(this.context.changeSearchValue, 500, event.target.value, this.context.page);
            this.setState({ timer });
        }
    };

    render() {
        const locale = Locale.stocksList;

        const {
            stocks,
            loading,
            message,
            page,
            renderStocksList,
            renderUserStockList,
            renderHistory
        } = this.context;

        return (
            <div className="stocks-list">
                <div className="stocks-list__button-bar">
                    <button
                        className={`stocks-list__button${
                            (page === "stocks" ? ' stocks-list__button_active' : '')}`
                        }
                        onClick={renderStocksList}>{locale.buttons[0]}
                    </button>
                    <button
                        className={`stocks-list__button${
                            (page === "userstocks" ? ' stocks-list__button_active' : '')}`
                        }
                        onClick={renderUserStockList}>{locale.buttons[1]}
                    </button>
                    <button
                        className={`stocks-list__button${
                            (page === "transactions" ? ' stocks-list__button_active' : '')}`
                        }
                        onClick={renderHistory}>{locale.buttons[2]}
                    </button>
                </div>
                <div className="search-bar">
                    <input type='text' className="search-input" placeholder='Search stock...'
                           onChange={this.handleInput}/>
                </div>
                <div
                    className="stocks-list__list"
                    onScroll={this.handleScroll}
                    ref={this.myscroll}
                >
                    {stocks.map((stock) => {
                        return <Stock
                            key={stock.symbol + stock.date}
                            stock={stock}
                            page={page}
                            renderStockInfo={this.props.renderStockInfo}
                        />
                    })}
                </div>
            </div>
        );
    }
}

export default StocksList;
