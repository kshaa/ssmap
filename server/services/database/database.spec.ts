import { describe, it } from 'mocha'
import { expect } from 'chai'
import { initDatabase } from './initDatabase'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { generateUuid } from '../utils/generateUuid'
import { ParsedPost } from '@shared/post'
import { wait } from '../testing/utils/wait'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const buildTestDatabase = async () => {
  return await initDatabase({ dbPath: ':memory:', migrationsPath: path.join(__dirname, 'migrations') })
}

describe('Database', () => {
  it('should be able to initialize the database', async () => {
    // Load sqlite in-memory
    const database = await buildTestDatabase()

    // Create project
    const id = generateUuid()
    const project = await database.tables.project.create({ id })
    expect(project.id).to.equal(id)
    expect(project.createdAt).to.be.a('number')
    expect(project.updatedAt).to.be.a('number')
    expect(project.createdAt).to.be.greaterThan(0)
    expect(project.updatedAt).to.be.greaterThan(0)

    // Create post
    const postUrl = 'https://fake.internal/tada'
    const parsedPost = { title: 'Foo', content: 'Bar' } as unknown as ParsedPost
    const persistedPost = await database.tables.post.upsert(postUrl, parsedPost)
    const postCreatedAt = persistedPost.createdAt
    const postUpdatedAt = persistedPost.updatedAt
    expect(persistedPost.url).to.equal(postUrl)
    expect(persistedPost.data).to.deep.equal(parsedPost)
    expect(persistedPost.createdAt).to.be.a('number')
    expect(persistedPost.updatedAt).to.be.a('number')
    expect(persistedPost.createdAt).to.be.greaterThan(0)
    expect(persistedPost.updatedAt).to.be.greaterThan(0)

    // Update post
    await wait(50)
    const parsedPost2 = { ...parsedPost, title: 'potat'}
    const persistedPost2 = await database.tables.post.upsert(postUrl, parsedPost2)
    expect(persistedPost2.url).to.equal(postUrl)
    expect(persistedPost2.data).to.deep.equal(parsedPost2)
    expect(persistedPost2.createdAt).to.be.a('number')
    expect(persistedPost2.updatedAt).to.be.a('number')
    expect(persistedPost2.createdAt).to.eq(postCreatedAt)
    expect(persistedPost2.updatedAt).to.be.greaterThan(postUpdatedAt)

    // Create feed
    await wait(50)
    const feedUrl = 'https://fake.internal/feed'
    const parsedFeed = { title: 'Feed', ttlSeconds: 10, posts: [] }
    const persistedFeed = await database.tables.feed.upsert(feedUrl, parsedFeed, false)
    const feedCreatedAt = persistedFeed.createdAt
    const feedUpdatedAt = persistedFeed.updatedAt
    expect(persistedFeed.url).to.equal(feedUrl)
    expect(persistedFeed.data).to.deep.equal(parsedFeed)
    expect(persistedFeed.createdAt).to.be.a('number')
    expect(persistedFeed.updatedAt).to.be.a('number')
    expect(persistedFeed.createdAt).to.be.greaterThan(0)
    expect(persistedFeed.updatedAt).to.be.greaterThan(0)
    
    // Update feed
    await wait(50)
    const parsedFeed2 = { ...parsedFeed, title: 'potat'}
    const persistedFeed2 = await database.tables.feed.upsert(feedUrl, parsedFeed2, false)
    expect(persistedFeed2.url).to.equal(feedUrl)
    expect(persistedFeed2.data).to.deep.equal(parsedFeed2)
    expect(persistedFeed2.createdAt).to.be.a('number')
    expect(persistedFeed2.updatedAt).to.be.a('number')
    expect(persistedFeed2.createdAt).to.eq(feedCreatedAt)
    expect(persistedFeed2.updatedAt).to.be.greaterThan(feedUpdatedAt)

    // Create feed post
    const feedPost = await database.tables.feedPost.upsert(feedUrl, postUrl)
    expect(feedPost.feedUrl).to.equal(feedUrl)
    expect(feedPost.postUrl).to.equal(postUrl)
    expect(feedPost.createdAt).to.be.a('number')
    expect(feedPost.updatedAt).to.be.a('number')
    expect(feedPost.createdAt).to.be.greaterThan(0)
    expect(feedPost.updatedAt).to.be.greaterThan(0)

    // Create project post
    const projectPost = await database.tables.projectPost.upsert(project.id, postUrl)
    expect(projectPost.projectId).to.equal(project.id)
    expect(projectPost.postUrl).to.equal(postUrl)
    expect(projectPost.createdAt).to.be.a('number')
    expect(projectPost.updatedAt).to.be.a('number')
    expect(projectPost.createdAt).to.be.greaterThan(0)
    expect(projectPost.updatedAt).to.be.greaterThan(0)

    // Create project post feeling
    const projectPostFeeling = await database.tables.projectPostFeeling.upsert(project.id, postUrl, { isSeen: false, stars: 0 })
    expect(projectPostFeeling.projectId).to.equal(project.id)
    expect(projectPostFeeling.postUrl).to.equal(postUrl)
    expect(projectPostFeeling.isSeen).to.be.false
    expect(projectPostFeeling.stars).to.equal(0)
    expect(projectPostFeeling.createdAt).to.be.a('number')
    expect(projectPostFeeling.updatedAt).to.be.a('number')
    expect(projectPostFeeling.createdAt).to.be.greaterThan(0)
    expect(projectPostFeeling.updatedAt).to.be.greaterThan(0)

    // Update project post feeling
    await wait(50)
    const projectPostFeeling2 = await database.tables.projectPostFeeling.upsert(project.id, postUrl, { isSeen: true, stars: 1 })
    expect(projectPostFeeling2.projectId).to.equal(project.id)
    expect(projectPostFeeling2.postUrl).to.equal(postUrl)
    expect(projectPostFeeling2.isSeen).to.be.true
    expect(projectPostFeeling2.stars).to.equal(1)
    expect(projectPostFeeling2.createdAt).to.be.a('number')
    expect(projectPostFeeling2.updatedAt).to.be.a('number')
    expect(projectPostFeeling2.createdAt).to.eq(projectPostFeeling.createdAt)
    expect(projectPostFeeling2.updatedAt).to.be.greaterThan(projectPostFeeling.updatedAt)
  })
})