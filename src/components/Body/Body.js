import React, {
	Component
} from 'react';
import block from 'bem-cn';

export default class Body extends Component {
	render() {
		let b = block('body')
		let {skin, children} = this.props;

		return (
			<div className={b({skin})}>
				{children}
            </div>
		);
	}
}
