import { UnknownError } from '@shared/errors/unknownError'
import { ParseError } from '@shared/errors/parseError'
import { parseAppError } from '@shared/errors/base'
import { z } from 'zod'
import { Project, projectSchema, ProjectWithContentAndMetadata, projectWithContentAndMetadataSchema } from '@shared/project'
import { FeedAndPostThingSync, feedAndPostThingSyncSchema, PostThingSync, postThingSyncSchema } from '@shared/synchronizedThing'

const parseFetchJson = async <T>(fetchPromise: Promise<Response>, schema: z.ZodSchema<T>): Promise<T> => {
  const response = await fetchPromise.catch(err => {
    throw new UnknownError('Failed to fetch entity', err)
  })

  const json = await response.json().catch(err => {
    throw new ParseError({ entity: 'responseBody', isUserError: false }, err)
  })

  const parsedError = parseAppError(json)
  if (parsedError) throw parsedError

  const parsedEntity: T = await schema.parseAsync(json).catch((err: unknown) => {
    throw new ParseError({ entity: 'responseJson', isUserError: false }, err)
  })

  return parsedEntity
}

export const fetchProjectCreate = async (projectName: string): Promise<Project> => {
  const fetchPromise = fetch('/api/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: projectName }),
  })
  const schema = projectSchema
  return await parseFetchJson<Project>(fetchPromise, schema)
}

export const fetchProjectCreateThing = async (projectId: string, thingUrl: string): Promise<PostThingSync | FeedAndPostThingSync> => {
  const fetchPromise = fetch(`/api/project/${projectId}/thing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: thingUrl }),
  })
  const schema = postThingSyncSchema.or(feedAndPostThingSyncSchema)
  return await parseFetchJson<PostThingSync | FeedAndPostThingSync>(fetchPromise, schema)
}

export const fetchProjectGetThings = async (projectId: string): Promise<ProjectWithContentAndMetadata> => {
  const fetchPromise = fetch(`/api/project/${projectId}/things`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  const schema = projectWithContentAndMetadataSchema
  return await parseFetchJson<ProjectWithContentAndMetadata>(fetchPromise, schema)
}
