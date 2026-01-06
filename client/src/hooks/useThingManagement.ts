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
const DEFAULT_MIN_PRICE = null
const DEFAULT_MAX_PRICE = null
const DEFAULT_MIN_AREA = null
const DEFAULT_MAX_AREA = null
interface FilterSettings {
  starFilter: number
  showSeenFilter: boolean
  showUnseenFilter: boolean
  minPrice: number | null
  maxPrice: number | null
  minArea: number | null
  maxArea: number | null
}

// Functions to persist filter settings in query parameters
const getFilterSettingsFromQueryParams = (): FilterSettings => {
  const queryParams = new URLSearchParams(window.location.search)
  let queryMinPrice: number | null = queryParams.has('minPrice') ? parseInt(queryParams.get('minPrice') as string) : NaN
  if (isNaN(queryMinPrice)) queryMinPrice = null
  let queryMaxPrice: number | null = queryParams.has('maxPrice') ? parseInt(queryParams.get('maxPrice') as string) : NaN
  if (isNaN(queryMaxPrice)) queryMaxPrice = null
  let queryMinArea: number | null = queryParams.has('minArea') ? parseInt(queryParams.get('minArea') as string) : NaN
  if (isNaN(queryMinArea)) queryMinArea = null
  let queryMaxArea: number | null = queryParams.has('maxArea') ? parseInt(queryParams.get('maxArea') as string) : NaN
  if (isNaN(queryMaxArea)) queryMaxArea = null

  return {
    starFilter: queryParams.has('starFilter') ? parseInt(queryParams.get('starFilter') ?? DEFAULT_STAR_FILTER.toString()) : DEFAULT_STAR_FILTER,
    showSeenFilter: queryParams.has('showSeenFilter') ? queryParams.get('showSeenFilter') === 'true' : DEFAULT_SHOW_SEEN_FILTER,
    showUnseenFilter: queryParams.has('showUnseenFilter') ? queryParams.get('showUnseenFilter') === 'true' : DEFAULT_SHOW_UNSEEN_FILTER,
    minPrice: queryMinPrice ?? DEFAULT_MIN_PRICE,
    maxPrice: queryMaxPrice ?? DEFAULT_MAX_PRICE,
    minArea: queryMinArea ?? DEFAULT_MIN_AREA,
    maxArea: queryMaxArea ?? DEFAULT_MAX_AREA,
  }
}

const setFilterSettingsInQueryParams = (filterSettings: FilterSettings) => {
  console.log('setFilterSettingsInQueryParams', filterSettings)
  const queryParams = new URLSearchParams(window.location.search)
  if (filterSettings.starFilter !== DEFAULT_STAR_FILTER) queryParams.set('starFilter', filterSettings.starFilter.toString())
  else queryParams.delete('starFilter')
  if (filterSettings.showSeenFilter !== DEFAULT_SHOW_SEEN_FILTER) queryParams.set('showSeenFilter', filterSettings.showSeenFilter.toString())
  else queryParams.delete('showSeenFilter')
  if (filterSettings.showUnseenFilter !== DEFAULT_SHOW_UNSEEN_FILTER) queryParams.set('showUnseenFilter', filterSettings.showUnseenFilter.toString())
  else queryParams.delete('showUnseenFilter')
  if (filterSettings.minPrice !== DEFAULT_MIN_PRICE) queryParams.set('minPrice', filterSettings.minPrice.toString())
  else queryParams.delete('minPrice')
  if (filterSettings.maxPrice !== DEFAULT_MAX_PRICE) queryParams.set('maxPrice', filterSettings.maxPrice.toString())
  else queryParams.delete('maxPrice')
  if (filterSettings.minArea !== DEFAULT_MIN_AREA) queryParams.set('minArea', filterSettings.minArea.toString())
  else queryParams.delete('minArea')
  if (filterSettings.maxArea !== DEFAULT_MAX_AREA) queryParams.set('maxArea', filterSettings.maxArea.toString())
  else queryParams.delete('maxArea')
  window.history.pushState({}, '', `?${queryParams.toString()}`)
}

export const useThingManagement = (projectManagement: ProjectManagement, isLandscape: boolean, setIsSidebarOpen: (isSidebarOpen: boolean) => void) => {
  const [projectWithContent, setProjectWithContent] = useState<ProjectWithContentAndMetadata | null>(null)
  const [mapCenterCoordinates] = useState<Coordinates>(latviaCoordinates)
  const [mapZoom, setMapZoom] = useState<number>(latviaZoom)
  const [focusedPost, setFocusedPost] = useState<ParsedPostWithUrl | null>(null)

  const persistedFilter = getFilterSettingsFromQueryParams()
  console.log('persistedFilter', persistedFilter)
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    starFilter: persistedFilter.starFilter,
    showSeenFilter: persistedFilter.showSeenFilter,
    showUnseenFilter: persistedFilter.showUnseenFilter,
    minPrice: persistedFilter.minPrice,
    maxPrice: persistedFilter.maxPrice,
    minArea: persistedFilter.minArea,
    maxArea: persistedFilter.maxArea,
  })

  const adjustStarFilter = useCallback((stars: number) => {
    const newFilterSettings = { ...filterSettings, starFilter: stars }
    setFilterSettings(newFilterSettings)
    setFilterSettingsInQueryParams(newFilterSettings)
  }, [filterSettings, setFilterSettings])

  const adjustShowSeenFilter = useCallback((show: boolean) => {
    const newFilterSettings = { ...filterSettings, showSeenFilter: show }
    setFilterSettings(newFilterSettings)
    setFilterSettingsInQueryParams(newFilterSettings)
  }, [filterSettings, setFilterSettings])

  const adjustShowUnseenFilter = useCallback((show: boolean) => {
    const newFilterSettings = { ...filterSettings, showUnseenFilter: show }
    setFilterSettings(newFilterSettings)
    setFilterSettingsInQueryParams(newFilterSettings)
  }, [filterSettings, setFilterSettings])

  const adjustMinPrice = useCallback((minPrice: number | null) => {
    const newFilterSettings = { ...filterSettings, minPrice: minPrice }
    setFilterSettings(newFilterSettings)
    setFilterSettingsInQueryParams(newFilterSettings)
  }, [filterSettings, setFilterSettings])

  const adjustMaxPrice = useCallback((maxPrice: number | null) => {
    const newFilterSettings = { ...filterSettings, maxPrice: maxPrice }
    setFilterSettings(newFilterSettings)
    setFilterSettingsInQueryParams(newFilterSettings)
  }, [filterSettings, setFilterSettings])

  const adjustMinArea = useCallback((minArea: number | null) => {
    const newFilterSettings = { ...filterSettings, minArea: minArea }
    setFilterSettings(newFilterSettings)
    setFilterSettingsInQueryParams(newFilterSettings)
  }, [filterSettings, setFilterSettings])

  const adjustMaxArea = useCallback((maxArea: number | null) => {
    const newFilterSettings = { ...filterSettings, maxArea: maxArea }
    setFilterSettings(newFilterSettings)
    setFilterSettingsInQueryParams(newFilterSettings)
  }, [filterSettings, setFilterSettings])

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
      if (!isLandscape) setIsSidebarOpen(false)
    }
  }, [isLandscape, setIsSidebarOpen])

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
      projectManagement.createProject(projectData.project.id, projectData.project.name)
    }).catch(error => {
      console.error('Failed to load project', error)
      projectManagement.setSelectedProjectId(null, false)
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
      if (filterSettings.starFilter > 0 && (postRatings[post.url]?.stars ?? 0) < filterSettings.starFilter) return false
      if (!filterSettings.showSeenFilter && postRatings[post.url]?.isSeen) return false
      if (!filterSettings.showUnseenFilter && !postRatings[post.url]?.isSeen) return false
      if (filterSettings.minPrice !== null && (post.data.priceStructured?.amount ?? 0) < filterSettings.minPrice) return false
      if (filterSettings.maxPrice !== null && (post.data.priceStructured?.amount ?? 0) > filterSettings.maxPrice) return false
      if (filterSettings.minArea !== null && (post.data.areaStructured?.amount ?? 0) < filterSettings.minArea) return false
      if (filterSettings.maxArea !== null && (post.data.areaStructured?.amount ?? 0) > filterSettings.maxArea) return false
      return true
    })
  }, [projectWithContent, filterSettings, postRatings])

  return {
    projectWithContent,
    postList,
    filterSettings,
    adjustStarFilter,
    adjustShowSeenFilter,
    adjustShowUnseenFilter,
    adjustMinPrice,
    adjustMaxPrice,
    adjustMinArea,
    adjustMaxArea,
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
