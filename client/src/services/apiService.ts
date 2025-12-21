import { UnknownError } from '@shared/errors/unknownError'
import { ParseError } from '@shared/errors/parseError'
import { parseAppError } from '@shared/errors/base'
import { z } from 'zod'
import { Project, projectSchema, ProjectWithContentAndMetadata, projectWithContentAndMetadataSchema } from '@shared/project'
import { FeedAndPostThingSync, feedAndPostThingSyncSchema, PostThingSync, postThingSyncSchema } from '@shared/synchronizedThing'
import { ProjectPostFeeling } from '@shared/projectPostFeeling'

const parseFetchJson = async <T>(fetchPromise: Promise<Response>, schema: z.ZodSchema<T>): Promise<T> => {
  const response = await fetchPromise.catch(err => {
    throw new UnknownError('Failed to fetch entity', err)
  })

  const json = await response.json().catch(err => {
    // If it's a void schema, don't fail on JSON parse error
    if (schema.safeParse(null).success) return null
    throw new ParseError({ entity: 'responseBody', isUserError: false }, err)
  })

  const parsedError = parseAppError(json)
  if (parsedError) throw parsedError

  if (response.status >= 400) {
    console.error(`Failed to parse network error`, parsedError)
    throw new UnknownError(`Network request failed with an unknown error: ${response.status} ${response.statusText}`)
  }

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

export const fetchProjectRateThing = async (projectId: string, postUrl: string, rating: Omit<ProjectPostFeeling, 'projectId' | 'postUrl'>): Promise<void> => {
  const fetchPromise = fetch(`/api/project/${projectId}/thing/rating`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postUrl, rating }),
  })
  const schema = z.any()
  await parseFetchJson<void>(fetchPromise, schema)
}
