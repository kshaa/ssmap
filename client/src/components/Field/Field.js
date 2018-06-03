// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'

export default class Field extends Component {
	render() {
        let {children, fieldType, fieldValue, fieldRequired, fieldDisabled} = this.props

		return (
            <input className={this.getSkinnedBlockClass('field')}
                type={fieldType}
                value={fieldValue}
                required={fieldRequired}
                disabled={fieldDisabled}>
				{children}
            </input>
		);
	}
}
