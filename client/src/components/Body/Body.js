// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'

export default class Body extends Component {
	render() {
		let {children} = this.props

		return (
			<div className={this.getSkinnedBlockClass('body')}>
				{children}
            </div>
		);
	}
}
