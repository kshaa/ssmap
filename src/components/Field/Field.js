import React, {
	Component
} from 'react';
import block from 'bem-cn';

export default class Field extends Component {
	render() {
        let {fieldType, fieldValue, fieldRequired, fieldDisabled} = this.props;
        let {skin, children} = this.props;
		let b = block(fieldType)

		return (
            <input className={b({skin})}
                type={fieldType}
                value={fieldValue}
                required={fieldRequired}
                disabled={fieldDisabled}>
				{children}
            </input>
		);
	}
}
