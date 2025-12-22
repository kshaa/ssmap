import { useState, useCallback, useEffect, useMemo } from 'react'
import { Coordinates, ParsedPostWithUrl } from '@shared/post'
import { FeedAndPostThingSync, PostThingSync, ThingKind } from '@shared/synchronizedThing'
import { ProjectWithContentAndMetadata } from '@shared/project'
import { ProjectManagement } from './useProjectManagement'
import { fetchProjectGetThings, fetchProjectRateThing } from '@src/services/apiService'
import { ProjectPostFeeling } from '@shared/projectPostFeeling'

const latviaZoom = 7
const latviaCoordinates: Coordinates = { lat: 56.8796, lng: 24.6032 }

const DEFAULT_STAR_FILTER = 0
const DEFAULT_SHOW_SEEN_FILTER = true
const DEFAULT_SHOW_UNSEEN_FILTER = true

// Functions to persist filter settings in query parameters
const getFilterSettingsFromQueryParams = (): { starFilter: number, showSeenFilter: boolean, showUnseenFilter: boolean } => {
  const queryParams = new URLSearchParams(window.location.search)
  return {
    starFilter: queryParams.has('starFilter') ? parseInt(queryParams.get('starFilter') ?? DEFAULT_STAR_FILTER.toString()) : DEFAULT_STAR_FILTER,
    showSeenFilter: queryParams.has('showSeenFilter') ? queryParams.get('showSeenFilter') === 'true' : DEFAULT_SHOW_SEEN_FILTER,
    showUnseenFilter: queryParams.has('showUnseenFilter') ? queryParams.get('showUnseenFilter') === 'true' : DEFAULT_SHOW_UNSEEN_FILTER,
  }
}

const setFilterSettingsInQueryParams = (starFilter: number, showSeenFilter: boolean, showUnseenFilter: boolean) => {
  console.log('setFilterSettingsInQueryParams', starFilter, showSeenFilter, showUnseenFilter)
  const queryParams = new URLSearchParams(window.location.search)
  if (starFilter !== DEFAULT_STAR_FILTER) queryParams.set('starFilter', starFilter.toString())
  if (showSeenFilter !== DEFAULT_SHOW_SEEN_FILTER) queryParams.set('showSeenFilter', showSeenFilter.toString())
  if (showUnseenFilter !== DEFAULT_SHOW_UNSEEN_FILTER) queryParams.set('showUnseenFilter', showUnseenFilter.toString())
  window.history.pushState({}, '', `?${queryParams.toString()}`)
}

export const useThingManagement = (projectManagement: ProjectManagement) => {
  const [projectWithContent, setProjectWithContent] = useState<ProjectWithContentAndMetadata | null>(null)
  const [mapCenterCoordinates] = useState<Coordinates>(latviaCoordinates)
  const [mapZoom, setMapZoom] = useState<number>(latviaZoom)
  const [focusedPost, setFocusedPost] = useState<ParsedPostWithUrl | null>(null)

  const { starFilter: persistedStarFilter, showSeenFilter: persistedShowSeenFilter, showUnseenFilter: persistedShowUnseenFilter } = getFilterSettingsFromQueryParams()
  const [starFilter, setStarFilter] = useState<number>(persistedStarFilter)
  const [showSeenFilter, setShowSeenFilter] = useState<boolean>(persistedShowSeenFilter)
  const [showUnseenFilter, setShowUnseenFilter] = useState<boolean>(persistedShowUnseenFilter)

  const adjustStarFilter = useCallback((stars: number) => {
    setStarFilter(stars)
    setFilterSettingsInQueryParams(stars, showSeenFilter, showUnseenFilter)
  }, [starFilter, showSeenFilter, showUnseenFilter])

  const adjustShowSeenFilter = useCallback((show: boolean) => {
    setShowSeenFilter(show)
    setFilterSettingsInQueryParams(starFilter, show, showUnseenFilter)
  }, [starFilter, showSeenFilter, showUnseenFilter])

  const adjustShowUnseenFilter = useCallback((show: boolean) => {
    setShowUnseenFilter(show)
    setFilterSettingsInQueryParams(starFilter, showSeenFilter, show)
  }, [starFilter, showSeenFilter, showUnseenFilter])

  const appendPosts = useCallback((thing: PostThingSync | FeedAndPostThingSync) => {
    if (!projectWithContent) {
      console.error('Base project missing, cannot append posts')
      return
    }
    let posts: typeof projectWithContent.posts
    let projectPosts: typeof projectWithContent.projectPosts
    let projectFeeds: typeof projectWithContent.projectFeeds
    let projectPostFeelings: typeof projectWithContent.projectPostFeelings
    switch (thing.kind) {
      case ThingKind.Post:
        posts = [thing.data]
        projectPosts = [{ projectId: projectWithContent.project.id, postUrl: thing.data.url, createdAt: thing.data.createdAt, updatedAt: thing.data.updatedAt }]
        projectFeeds = []
        projectPostFeelings = [{ projectId: projectWithContent.project.id, postUrl: thing.data.url, isSeen: true, stars: 0, createdAt: thing.data.createdAt, updatedAt: thing.data.updatedAt }]
        break
      case ThingKind.FeedAndPosts:
        posts = thing.data.posts
        projectPosts = thing.data.posts.map(post => ({ projectId: projectWithContent.project.id, postUrl: post.url, createdAt: post.createdAt, updatedAt: post.updatedAt }))
        projectFeeds = thing.data.feedPosts.map(feedPost => ({ projectId: projectWithContent.project.id, feedUrl: feedPost.feedUrl, createdAt: feedPost.createdAt, updatedAt: feedPost.updatedAt }))
        projectPostFeelings = thing.data.posts.map(post => ({ projectId: projectWithContent.project.id, postUrl: post.url, isSeen: true, stars: 0, createdAt: post.createdAt, updatedAt: post.updatedAt }))
        break
      default:
        throw new Error(`Invalid thing kind ${thing.kind}`)
    }
    
    setProjectWithContent(prev => {
      if (!prev) return prev
      return {
        ...prev,
        posts: [...prev.posts, ...posts],
        projectPosts: [...prev.projectPosts, ...projectPosts],
        projectFeeds: [...prev.projectFeeds, ...projectFeeds],
        projectPostFeelings: [...prev.projectPostFeelings, ...projectPostFeelings],
      }
    })
    
    const firstValidCoordinatePost = posts.find(post => post.data.addressInfo?.coordinates?.lat && post.data.addressInfo?.coordinates?.lng)
    if (firstValidCoordinatePost) {
      setFocusedPost(firstValidCoordinatePost)
      setMapZoom(13)
    }
  }, [projectWithContent, setProjectWithContent, setFocusedPost, setMapZoom])

  const focusPost = useCallback((post: ParsedPostWithUrl) => {
    return () => {
      const focusedPost: ParsedPostWithUrl = {
        ...post,
      }
      setFocusedPost(focusedPost)
      setMapZoom(13)
    }
  }, [])

  const ratePost = useCallback((post: ParsedPostWithUrl, rating: Omit<ProjectPostFeeling, 'projectId' | 'postUrl'>) => {
    if (!projectManagement.selectedProjectId) {
      console.error('Base project missing, cannot rate post')
      return
    }
    fetchProjectRateThing(projectManagement.selectedProjectId, post.url, rating).then(() => {
      setProjectWithContent(prev => {
        if (!prev) return prev
        return {
          ...prev,
          projectPostFeelings: prev.projectPostFeelings.map(projectPostFeeling => projectPostFeeling.postUrl === post.url ? { ...projectPostFeeling, ...rating } : projectPostFeeling),
        }
      })
    }).catch(error => {
      console.error('Failed to rate post', error)
    })
  }, [projectManagement.selectedProjectId])

  const refreshProjectWithContent = useCallback(async () => {
    if (!projectManagement.selectedProjectId) {
      console.error('Base project missing, cannot refresh project')
      return
    }
    await fetchProjectGetThings(projectManagement.selectedProjectId, true).then(projectData => {
      setProjectWithContent(projectData)
    })
  }, [projectManagement.selectedProjectId])

  useEffect(() => {
    console.log('Loading project data for selectedProjectId', projectManagement.selectedProjectId)
    if (!projectManagement.selectedProjectId) {
      setProjectWithContent(null)
      setFocusedPost(null)
      return
    }
    fetchProjectGetThings(projectManagement.selectedProjectId, false).then(projectData => {
      console.log(`Project data loaded, name: ${projectData.project.name}, id: ${projectData.project.id}, posts: ${projectData.posts.length}`)
      setProjectWithContent(projectData)
    }).catch(error => {
      console.error('Failed to load project', error)
      projectManagement.setSelectedProjectId(null)
    })
  }, [projectManagement.selectedProjectId])

  const postRatings = useMemo(() => {
    if (!projectWithContent) return {}
    return Object.fromEntries(projectWithContent.projectPostFeelings.map(projectPostFeeling => {
      const { projectId, postUrl, ...rating } = projectPostFeeling
      return [postUrl, rating]
    }))
  }, [projectWithContent])

  const postList = useMemo(() => {
    if (!projectWithContent) return []
    return projectWithContent.posts.filter(post => {
      if (starFilter > 0 && (postRatings[post.url]?.stars ?? 0) < starFilter) return false
      if (!showSeenFilter && postRatings[post.url]?.isSeen) return false
      if (!showUnseenFilter && !postRatings[post.url]?.isSeen) return false

      return true
    })
  }, [projectWithContent, starFilter, postRatings, showSeenFilter, showUnseenFilter])

  return {
    projectWithContent,
    postList,
    starFilter,
    adjustStarFilter,
    showSeenFilter,
    adjustShowSeenFilter,
    showUnseenFilter,
    adjustShowUnseenFilter,
    mapCenterCoordinates,
    mapZoom,
    focusedPost,
    postRatings,
    appendPosts,
    focusPost,
    ratePost,
    refreshProjectWithContent,
  }
}

export type ThingManagement = ReturnType<typeof useThingManagement>
