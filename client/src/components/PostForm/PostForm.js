// eslint-disable-next-line
import React from 'react'
import Form from 's/components/Form/Form'
import Field from 's/components/Field/Field'
import URL from 'url-parse'

export default class PostForm extends Form {
    constructor(props) {
        super(props)

        const url = new URL(window.location.href, true)
        this.state = {
            form: {
                url: url.query.post || ''
            }
        }
    
        // Use form field change function, but set PostForm scope so it gets the field data bound, not Form
        this.fieldOnChange = this.fieldOnChange.bind(this)
        // When scope not bound here, the submit has scope undefined (how do scopes work? Hlep I ned en a dult)
        this.formOnSubmit = this.formOnSubmit.bind(this)
    }

    // Attach this to the form component with the same prop name
    formOnSubmit(event) {
        this.postData(event.target.action, this.state.form)
            .then(postJson => this.props.handlePostResponse(postJson))
            .catch(error => {
                console.log(error);
                this.props.handlePostResponse(null)
            })

        event.preventDefault();
    }

	render() {
		return (
            <Form
                formAction="/api/post"
                formMethod="post"
                formOnSubmit={this.formOnSubmit}
                skin={{
                    centered: true,
                    margin: true,
                    padding: true
                }}>
                <Field
                    fieldLabel="SS.com sludinājuma saite"
                    fieldType="text"
                    fieldName="url"
                    fieldValue={this.state.form.url} 
                    fieldOnChange={this.fieldOnChange}
                    skin={{width: 'full'}}/>
            </Form>
		);
	}
}
