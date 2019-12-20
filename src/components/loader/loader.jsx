import React from 'react';

import './loader.scss';


class Loader extends React.Component {

    render() {
        return (
            <div className="loading">
                <div className="obj"></div>
                <div className="obj"></div>
                <div className="obj"></div>
                <div className="obj"></div>
                <div className="obj"></div>
                <div className="obj"></div>
                <div className="obj"></div>
                <div className="obj"></div>
            </div>
        );
    }

}

export default Loader;
