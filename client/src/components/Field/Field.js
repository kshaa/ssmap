// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'
import './Field.scss'

export default class Field extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isInputFocused: false
        }
        this.onChangeHandler = this.onChangeHandler.bind(this)
    }

    onChangeHandler(event) {
        if (this.props.fieldOnChange) {
            this.props.fieldOnChange(event, this.props.fieldName);
        }
    }

	render() {
        let {fieldLabel, children, fieldType, fieldName, fieldValue, fieldRequired, fieldDisabled} = this.props

        const InputElement = <input className={this.getSkinnedBlockClass(fieldType)}
            type={fieldType}
            name={fieldName}
            value={fieldValue}
            required={fieldRequired}
            disabled={fieldDisabled}
            onChange={this.onChangeHandler}>
            {children}
        </input>

        if (fieldLabel) {
            return (
                <div className={this.getSkinnedElementClass(fieldType, 'wrapper')}>
                    {InputElement}
                    <label htmlFor={fieldName}
                        className={this.getSkinnedElementClass(fieldType, 'label')}>
                        {fieldLabel}
                    </label>
                </div>
            )
        } else {
            return InputElement
        }
	}
}
