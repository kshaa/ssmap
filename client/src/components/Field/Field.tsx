import React from 'react'
import styled from 'styled-components'
import { theme, darken } from '@src/styling/theme'

interface FieldProps {
  fieldLabel?: string
  fieldType: string
  fieldName: string
  fieldValue?: string
  fieldRequired?: boolean
  fieldDisabled?: boolean
  fieldOnChange?: (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void
  children?: React.ReactNode
  fullWidth?: boolean
}

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
`

const StyledInput = styled.input<{ $fullWidth?: boolean }>`
  border-width: 0 0 1px;
  border-color: ${theme.colors.mercury};
  transition: ${theme.transitions.fast} border-color;
  height: 40px;
  outline: none;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};

  &:hover {
    border-color: ${darken(theme.colors.mercury, theme.contrast.medium)};
  }

  &:focus {
    border-color: ${darken(theme.colors.mercury, theme.contrast.hard)};
  }
`

const StyledLabel = styled.label`
  font-weight: bold;

  &:before {
    display: inline-block;
    content: '✤';
    margin: 0 0 10px;
    opacity: 0;
    max-width: 0px;
    transition: ${theme.transitions.regular};
  }

  ${StyledInput}:focus + &:before {
    margin: 0 10px 10px 4px;
    max-width: 15px;
    opacity: 1;
  }
`

const Field = ({
  fieldLabel,
  children,
  fieldType,
  fieldName,
  fieldValue,
  fieldRequired,
  fieldDisabled,
  fieldOnChange,
  fullWidth = false,
}: FieldProps) => {
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (fieldOnChange) {
      fieldOnChange(event, fieldName)
    }
  }

  const InputElement = (
    <StyledInput
      $fullWidth={fullWidth}
      type={fieldType}
      name={fieldName}
      value={fieldValue}
      required={fieldRequired}
      disabled={fieldDisabled}
      onChange={onChangeHandler}
    >
      {children}
    </StyledInput>
  )

  if (fieldLabel) {
    return (
      <FieldWrapper>
        {InputElement}
        <StyledLabel htmlFor={fieldName}>
          {fieldLabel}
        </StyledLabel>
      </FieldWrapper>
    )
  } else {
    return InputElement
  }
}

export default Field
