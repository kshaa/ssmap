import React, { useState } from 'react'
import { useBemClassName } from '@src/hooks/useBemClassName'
import postData from '@src/services/postData'
import './Form.scss'

interface FormProps {
  children?: React.ReactNode
  formAction?: string
  formMethod?: string
  formOnSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  skin?: any
}

const Form = ({ children, formAction, formMethod, formOnSubmit, skin = {} }: FormProps) => {
  const [form, setForm] = useState<{ [key: string]: any }>({})
  const { getSkinnedBlockClass, getSkinnedElementClass } = useBemClassName(skin)

  const fieldOnChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    setForm({
      ...form,
      [fieldName]: event.target.value,
    })
  }

  const postFormData = (url: string, data: any) => {
    return postData(url, data)
  }

  return (
    <form
      onSubmit={formOnSubmit}
      className={getSkinnedBlockClass('form')}
      action={formAction}
      method={formMethod}
    >
      <div className={getSkinnedElementClass('form', 'content', { border: 'light' })}>
        {children}
      </div>
    </form>
  )
}

export default Form
export { postData }
