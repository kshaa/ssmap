// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'
import postData from 's/helper/postData'
import './Form.scss'

export default class Form extends Component {
	constructor(props) {
		super(props)

		this.state = {
            form: {}
        }

		this.fieldOnChange = this.fieldOnChange.bind(this)
	}

	// Attach this to input field components with the same prop name
	// Whoever extends this Form class should probably bind the new proper form scope
	fieldOnChange(event, fieldName) {
        this.setState({
			form: {
				...this.state.form,
				[fieldName]: event.target.value
			}
		})
	}
	
	postData(url, data) { 
		return postData(url, data)
	}
	
	render() {
		let {children, formAction, formMethod, formOnSubmit} = this.props
		
		return (
			<form onSubmit={formOnSubmit}
				className={this.getSkinnedBlockClass('form')}
                action={formAction}
                method={formMethod}>
				<div className={this.getSkinnedElementClass('form', 'content', {border: 'light'})}>
					{children}
				</div>
            </form>
		);
	}j
}
