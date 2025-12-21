import React, { useState } from 'react'
import Form from '@src/components/Form/Form'
import Field from '@src/components/Field/Field'
import URL from 'url-parse'
import { PostThingSync } from '@shared/synchronizedThing'
import { FeedAndPostThingSync } from '@shared/synchronizedThing'
import { fetchProjectCreate, fetchProjectCreateThing } from '@src/services/apiService'
import { ProjectManagement } from '@src/hooks/useProjectManagement'

export interface CreateProjectFormProps {
  projectManagement: ProjectManagement
  addErrorMessage: (message: string) => void
}

const CreateProjectForm = ({ projectManagement, addErrorMessage }: CreateProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
  })

  const fieldOnChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    setFormData({
      ...formData,
      [fieldName]: event.target.value,
    })
  }

  const formOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    fetchProjectCreate(formData.name)
      .then(project => {
        projectManagement.createProject(project.id, project.name)
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
        fieldLabel="Projekta nosaukums"
        fieldType="text"
        fieldName="name"
        fieldValue={formData.name}
        fieldOnChange={fieldOnChange}
        fullWidth={true}
      />
    </Form>
  )
}

export default CreateProjectForm
