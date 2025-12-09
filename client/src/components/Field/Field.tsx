import React from 'react'
import { useBemClassName } from 's/hooks/useBemClassName'
import './Field.scss'

interface FieldProps {
  fieldLabel?: string
  fieldType: string
  fieldName: string
  fieldValue?: string
  fieldRequired?: boolean
  fieldDisabled?: boolean
  fieldOnChange?: (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void
  children?: React.ReactNode
  skin?: any
}

const Field = ({
  fieldLabel,
  children,
  fieldType,
  fieldName,
  fieldValue,
  fieldRequired,
  fieldDisabled,
  fieldOnChange,
  skin = {},
}: FieldProps) => {
  const { getSkinnedBlockClass, getSkinnedElementClass } = useBemClassName(skin)

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (fieldOnChange) {
      fieldOnChange(event, fieldName)
    }
  }

  const InputElement = (
    <input
      className={getSkinnedBlockClass(fieldType)}
      type={fieldType}
      name={fieldName}
      value={fieldValue}
      required={fieldRequired}
      disabled={fieldDisabled}
      onChange={onChangeHandler}
    >
      {children}
    </input>
  )

  if (fieldLabel) {
    return (
      <div className={getSkinnedElementClass(fieldType, 'wrapper')}>
        {InputElement}
        <label htmlFor={fieldName} className={getSkinnedElementClass(fieldType, 'label')}>
          {fieldLabel}
        </label>
      </div>
    )
  } else {
    return InputElement
  }
}

export default Field
