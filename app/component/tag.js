/**
 * Created by therfaint- on 01/12/2017.
 */
import React from 'react';

class Tag extends React.Component {

    render() {
        let {type} = this.props;
        let color, text;
        switch (type){
            case 'pass':
                color = 'green';text = 'PASS';break;
            case 'review':
                color = 'yellow';text = 'REVIEW';break;
            case 'fail':
                color = 'red';text = 'FAIL';break;
        }
        return (
            <div style={{backgroundColor: color}} className="tag">
                {
                    text
                }
            </div>
        )
    }
}

export default Tag;