import React from "react";
import classNames from 'classnames';

import "./stock.scss";

class Stock extends React.Component {
    render() {
        let dateOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timezone: 'UTC',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };

        const {
            stock: {
                profile,
                transactionCount,
                transactionPrice,
                middlePrice,
                count,
                date,
                symbol,
                type
            },
            page,
            renderStockInfo
        } = this.props;

        const trueDate = date ? new Date(date) : undefined;

        return (
            <div
                onClick={renderStockInfo(this.props.stock)}
                className={`stock${
                    type ?
                        (type === "sell" ? ' stock_color_red' : ' stock_color_green')
                        :
                        ""
                }`}>
                <div className="stock__img-container">
                    <img className="stock__img" src={profile.image} alt={symbol}/>
                </div>
                <div className="stock__content-box">
                    <div className="stock__column stock__left">
                        <span className="stock__title">{profile.companyName}</span>
                        {count && <span className="stock__count">{count} item(s)</span>}
                        {transactionCount && <span className="stock__count">{transactionCount} item(s)</span>}
                    </div>
                    <div className="stock__column stock__right">

                        {transactionPrice &&
                        <span className="stock__price">{transactionPrice ? transactionPrice.toFixed(2) : profile.price.toFixed(2)}$</span>}
                        {middlePrice &&
                        <span className="stock__price">{middlePrice ? middlePrice.toFixed(2) : profile.price.toFixed(2)}$</span>}
                        {page === 'stocks' && <span className="stock__price">{profile.price.toFixed(2)}$</span>}

                        {trueDate && <span className="stock__date">{trueDate.toLocaleString("ru", dateOptions)}</span>}

                        {page !== 'transactions' && <div className="stock__changes-box">

                            <svg
                                className={classNames('stock__caret', {
                                    'down': parseFloat(profile.changes) < 0,
                                    'up': parseFloat(profile.changes) > 0
                                })
                                }
                                xmlns="http://www.w3.org/2000/svg"
                                width="10"
                                height="10"
                            >
                                <path fillRule="evenodd" d="M4.51 5.018L0 0h9.02z"/>
                            </svg>

                            <span
                                className={classNames('stock__changes', {
                                    'down': parseFloat(profile.changes) < 0,
                                    'up': parseFloat(profile.changes) > 0
                                })
                                }
                            >{profile.changes}</span>

                            <span className={classNames('stock__percentage', {
                                'down': parseFloat(profile.changes) < 0,
                                'up': parseFloat(profile.changes) > 0
                            })
                            }>{profile.changesPercentage}</span>

                        </div>}
                    </div>
                </div>
            </div>
        )
    }
}

export default Stock;
