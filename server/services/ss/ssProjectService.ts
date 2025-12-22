import { FeedAndPostThingSync, PostThingSync, ThingKind } from "@shared/synchronizedThing"
import { Project, ProjectWithContentAndMetadata } from "@shared/project"
import { ProjectPostFeeling } from "@shared/projectPostFeeling"
import { DatabaseService } from "../database/initDatabase"
import { CrudMetadata } from "@shared/crudMetadata"
import { SSSynchronizerService } from "./ssSynchronizerService"
import { NotFoundError } from "@shared/errors/notFoundError"

export interface SSProjectService {
  upsertProject: (project: Project) => Promise<Project & CrudMetadata>
  getProject: (id: string, isFresh: boolean) => Promise<ProjectWithContentAndMetadata>
  addThing: (projectId: string, thingUrl: string) => Promise<PostThingSync | FeedAndPostThingSync>
  ratePost: (projectId: string, postUrl: string, rating: Omit<ProjectPostFeeling, 'projectId' | 'postUrl'>) => Promise<void>
}

interface State {
  database: DatabaseService
  syncService: SSSynchronizerService
}

const initState = (database: DatabaseService, syncService: SSSynchronizerService): State => {
  return {
    database,
    syncService,
  }
}

const upsertProject = async (state: State, project: Project): Promise<Project & CrudMetadata> => {
  return await state.database.tables.project.upsert(project)
}

const refreshProject = async (state: State, id: string): Promise<void> => {
  const project = await state.database.tables.project.get(id)
  if (!project) {
    throw new NotFoundError({ entity: 'Project', id })
  }

  const projectFeeds = await state.database.tables.projectFeed.getAll(id)
  for (const projectFeed of projectFeeds) {
    const feed = await state.database.tables.feed.get(projectFeed.feedUrl)
    const isListingPage = feed?.isListingPage ?? false
    await state.syncService.syncFeed(projectFeed.feedUrl, isListingPage)
  }

  const projectPosts = await state.database.tables.projectPost.getAll(id)
  for (const projectPost of projectPosts) {
    await state.syncService.syncPost(projectPost.postUrl)
  }
}

const getProject = async (state: State, id: string, isFresh: boolean): Promise<ProjectWithContentAndMetadata> => {
  const project = await state.database.tables.project.get(id)
  if (!project) {
    throw new NotFoundError({ entity: 'Project', id })
  }
  if (isFresh) await refreshProject(state, id)
  const projectPosts = await state.database.tables.projectPost.getAll(id)
  const projectFeeds = await state.database.tables.projectFeed.getAll(id)
  const feeds = await Promise.all(projectFeeds.map(projectFeed => state.database.tables.feed.get(projectFeed.feedUrl))).then(feeds => feeds.filter(feed => feed !== null))
  const feedPosts = await state.database.tables.feedPost.getAll(id)
  const postUrls = [...(new Set([...feeds.flatMap(feed => feed.data.posts.map(post => post.url)), ...projectPosts.map(projectPost => projectPost.postUrl)]))]
  const posts = await Promise.all(postUrls.map(postUrl => state.database.tables.post.get(postUrl))).then(posts => posts.filter(post => post !== null))
  const projectPostFeelings = await state.database.tables.projectPostFeeling.getAll(id)
  return { project, projectPosts, projectFeeds, feeds, feedPosts, posts, projectPostFeelings }
}

const addThing = async (state: State, projectId: string, thingUrl: string): Promise<PostThingSync | FeedAndPostThingSync> => {
  const thing = await state.syncService.syncSsUrl(thingUrl, true)
  if (thing.kind === ThingKind.Post) {
    await state.database.tables.projectPost.upsert(projectId, thing.data.url)
    await state.database.tables.projectPostFeeling.upsert(projectId, thing.data.url, { isSeen: true, stars: 0 })
  } else if (thing.kind === ThingKind.FeedAndPosts) {
    await state.database.tables.projectFeed.upsert(projectId, thing.data.feed.url)
    await Promise.all(thing.data.posts.map(post => state.database.tables.projectPostFeeling.upsert(projectId, post.url, { isSeen: true, stars: 0 })))
  } else {
    throw new Error(`Invalid thing kind ${thing.kind}`)
  }

  return thing
}

const ratePost = async (state: State, projectId: string, postUrl: string, rating: Omit<ProjectPostFeeling, 'projectId' | 'postUrl'>): Promise<void> => {
  await state.database.tables.projectPostFeeling.upsert(projectId, postUrl, rating)
}

export const buildSsProjectService = (database: DatabaseService, syncService: SSSynchronizerService): SSProjectService => {
  const state = initState(database, syncService)
  return {
    upsertProject: upsertProject.bind(null, state),
    getProject: getProject.bind(null, state),
    addThing: addThing.bind(null, state),
    ratePost: ratePost.bind(null, state),
  }
}