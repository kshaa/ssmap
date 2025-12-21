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
  max-width: ${theme.layout.pageWidthMin};
  ${props => props.$centered && `
    display: block;
    margin-right: auto;
    margin-left: auto;
  `}
  ${props => props.$withMargin && `
    padding: ${theme.spacing.m};
  `}
`

const FormContent = styled.div`
  padding: ${theme.spacing.m};
  border: 1px solid ${theme.colors.mercury};
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
