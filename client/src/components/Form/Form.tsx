import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@src/styling/theme'

interface FormProps {
  children?: React.ReactNode
  formAction?: string
  formMethod?: string
  formOnSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  centered?: boolean
  withMargin?: boolean
}

const StyledForm = styled.form<{ $centered?: boolean; $withMargin?: boolean }>`
  width: 100%;
  padding: 20px;
  max-width: ${theme.layout.pageWidthMax};
  ${props => props.$centered && `
    display: block;
    margin-right: auto;
    margin-left: auto;
  `}
`

const FormContent = styled.div`
  padding: ${theme.spacing.m} 0;
`

const Form = ({ children, formAction, formMethod, formOnSubmit, centered = false, withMargin = false }: FormProps) => {
  return (
    <StyledForm
      onSubmit={formOnSubmit}
      $centered={centered}
      $withMargin={withMargin}
      action={formAction}
      method={formMethod}
    >
      <FormContent>
        {children}
      </FormContent>
    </StyledForm>
  )
}

export default Form
