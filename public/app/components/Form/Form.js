import React, {
	Component
} from 'react';
import block from 'bem-cn';

export default class Form extends Component {
	render() {
        let {formAction, formMethod} = this.props;
		let {skin, children} = this.props;
		let b = block('form')
        
		return (
            <form className={b({skin})}
                action={formAction}
                method={formMethod}>
				{children}
            </form>
		);
	}
}
