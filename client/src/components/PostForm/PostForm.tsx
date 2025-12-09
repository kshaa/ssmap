import React, { useState } from 'react'
import Form from '@src/components/Form/Form'
import Field from '@src/components/Field/Field'
import URL from 'url-parse'
import postData from '@src/services/postData'
import { ParsedPostWithUrl } from '@shared/post'
import { fetchSSPost } from '@src/services/ssService'

export interface PostFormProps {
  addErrorMessage: (message: string) => void
  appendPost: (post: ParsedPostWithUrl) => void
}

const PostForm = ({ addErrorMessage, appendPost }: PostFormProps) => {
  const url = new URL(window.location.href, true)
  const [formData, setFormData] = useState({
    url: url.query.post || '',
  })

  const fieldOnChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    setFormData({
      ...formData,
      [fieldName]: event.target.value,
    })
  }

  const formOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLFormElement

    fetchSSPost(target.action, formData.url)
      .then(post => {
        appendPost(post)
      })
      .catch((error: unknown) => {
        addErrorMessage(typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : 'Unknown error')
      })

    event.preventDefault()
  }

  return (
    <Form
      formAction="/api/post"
      formMethod="post"
      formOnSubmit={formOnSubmit}
      skin={{
        centered: true,
        margin: true,
        padding: true,
      }}
    >
      <Field
        fieldLabel="SS.com sludinājuma saite"
        fieldType="text"
        fieldName="url"
        fieldValue={formData.url}
        fieldOnChange={fieldOnChange}
        skin={{ width: 'full' }}
      />
    </Form>
  )
}

export default PostForm
