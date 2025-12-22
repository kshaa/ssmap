import React, { useState } from 'react'
import Form from '@src/components/Form/Form'
import Field from '@src/components/Field/Field'
import URL from 'url-parse'
import { PostThingSync } from '@shared/synchronizedThing'
import { FeedAndPostThingSync } from '@shared/synchronizedThing'
import { fetchProjectCreateThing } from '@src/services/apiService'
export interface PostFormProps {
  projectId: string
  addErrorMessage: (message: string) => void
  appendPosts: (post: PostThingSync | FeedAndPostThingSync) => void
}

const PostForm = ({ projectId, addErrorMessage, appendPosts }: PostFormProps) => {
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
    fetchProjectCreateThing(projectId, formData.url)
      .then(post => {
        appendPosts(post)
      })
      .catch((error: unknown) => {
        console.error(error)
        addErrorMessage(typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : 'Unknown error')
      })

    event.preventDefault()
  }

  return (
    <Form
      formOnSubmit={formOnSubmit}
      centered={true}
      withMargin={true}
    >
      <Field
        fieldLabel="Pievienot sludinājumu"
        fieldType="text"
        fieldPlaceholder="SS.lv sludinājuma saite"
        fieldName="url"
        fieldValue={formData.url}
        fieldOnChange={fieldOnChange}
        fullWidth={true}
      />
    </Form>
  )
}

export default PostForm
