import { FeedAndPostThingSync, PostThingSync, ThingKind } from "@shared/synchronizedThing"
import { Project, ProjectWithContentAndMetadata } from "@shared/project"
import { ProjectPostFeeling } from "@shared/projectPostFeeling"
import { DatabaseService } from "../database/initDatabase"
import { CrudMetadata } from "@shared/crudMetadata"
import { SSSynchronizerService } from "./ssSynchronizerService"

export interface SSProjectService {
  upsertProject: (project: Project) => Promise<Project & CrudMetadata>
  getProject: (id: string) => Promise<ProjectWithContentAndMetadata>
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

const getProject = async (state: State, id: string): Promise<ProjectWithContentAndMetadata> => {
  const project = await state.database.tables.project.get(id)
  if (!project) {
    throw new Error('Project not found')
  }
  const projectPosts = await state.database.tables.projectPost.getAll(id)
  const projectFeeds = await state.database.tables.projectFeed.getAll(id)
  const feeds = await Promise.all(projectFeeds.map(projectFeed => state.database.tables.feed.get(projectFeed.feedUrl))).then(feeds => feeds.filter(feed => feed !== null))
  const feedPosts = await state.database.tables.feedPost.getAll(id)
  const postUrls = [...(new Set([...feedPosts.map(feedPost => feedPost.postUrl), ...projectPosts.map(projectPost => projectPost.postUrl)]))]
  const posts = await Promise.all(postUrls.map(postUrl => state.database.tables.post.get(postUrl))).then(posts => posts.filter(post => post !== null))
  return { project, projectPosts, projectFeeds, feeds, feedPosts, posts }
}

const addThing = async (state: State, projectId: string, thingUrl: string): Promise<PostThingSync | FeedAndPostThingSync> => {
  const thing = await state.syncService.syncSsUrl(thingUrl, true)
  if (thing.kind === ThingKind.Post) {
    await state.database.tables.projectPost.upsert(projectId, thingUrl)
  } else if (thing.kind === ThingKind.FeedAndPosts) {
    await state.database.tables.projectFeed.upsert(projectId, thingUrl)
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