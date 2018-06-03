// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'
import './Form.scss'

export default class Form extends Component {
	render() {
        let {children, formAction, formMethod} = this.props

		return (
			<form className={this.getSkinnedBlockClass('form')}
                action={formAction}
                method={formMethod}>
				<div className={this.getSkinnedElementClass('form', 'content')}>
					{children}
				</div>
            </form>
		);
	}j
}
