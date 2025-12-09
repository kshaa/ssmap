import React, { useState } from 'react'
import Form from 's/components/Form/Form'
import Field from 's/components/Field/Field'
import URL from 'url-parse'
import postData from 's/helper/postData'
import { Post } from '../../../../../shared/types'

interface PostFormProps {
  handlePostResponse: (postJson: Post | null) => void
  skin?: any
}

const PostForm = ({ handlePostResponse }: PostFormProps) => {
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
    postData(target.action, formData)
      .then(postJson => handlePostResponse(postJson))
      .catch(error => {
        console.log(error)
        handlePostResponse(null)
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
