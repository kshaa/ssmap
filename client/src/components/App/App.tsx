import React, { useState, useEffect, useCallback } from 'react'
import { useBemClassName } from 's/hooks/useBemClassName'
import Body from 's/components/Body/Body'
import PostForm from 's/components/PostForm/PostForm'
import PostList from 's/components/PostList/PostList'
import PostMap from 's/components/PostMap/PostMap'
import './App.scss'
import {
  Post,
  PostList as PostListType,
  PostWithUI,
  Coordinates,
} from '../../../../../shared/types'

const latviaZoom = 7
const latviaCoordinates: Coordinates = { lat: 56.8796, lng: 24.6032 }

const App = () => {
  const [postList, setPostList] = useState<PostListType>({})
  const [errorList, setErrorList] = useState<string[]>([])
  const [mapCenterCoordinates] = useState<Coordinates>(latviaCoordinates)
  const [mapZoom, setMapZoom] = useState<number>(latviaZoom)
  const [focusedPost, setFocusedPost] = useState<PostWithUI | null>(null)
  const [isLandscape, setIsLandscape] = useState<boolean>(true)
  const { getSkinnedBlockClass, getSkinnedElementClass } = useBemClassName()

  const recheckLandscape = useCallback(() => {
    const landscape = window.innerWidth > window.innerHeight
    setIsLandscape(landscape)
  }, [])

  useEffect(() => {
    recheckLandscape()
    window.addEventListener('resize', recheckLandscape)
    return () => {
      window.removeEventListener('resize', recheckLandscape)
    }
  }, [recheckLandscape])

  const preparePost = (postJson: Post): PostWithUI => {
    return {
      ...postJson,
      isOpen: true,
    }
  }

  const removeError = useCallback((removableErrorMessage: string) => {
    setErrorList(prevErrors =>
      prevErrors.filter(errorMessage => errorMessage !== removableErrorMessage)
    )
  }, [])

  const addErrorMessage = (errorMessage: string) => {
    setErrorList(prevErrors => [...prevErrors, errorMessage])
    setTimeout(() => {
      removeError(errorMessage)
    }, 4000)
  }

  const handlePostResponse = (postJson: Post | null) => {
    if (
      !postJson ||
      (postJson && !postJson.status) ||
      (postJson.status && postJson.status === 'fail')
    ) {
      const errorMessage =
        (postJson && postJson.message) || 'Nu ir ziepes, kaut kas pavisam neizdevās. Atvaino!'
      addErrorMessage(errorMessage)
      return
    }

    if (!postJson.addressInfo || !postJson.addressInfo.coordinates) {
      const errorMessage = 'Izskatās, ka šim sludinājumam nav adreses :('
      addErrorMessage(errorMessage)
      return
    }

    const fondledPost = preparePost(postJson)
    if (postJson.url) {
      setPostList(prevList => ({
        ...prevList,
        [postJson.url!]: fondledPost,
      }))
      setFocusedPost(fondledPost)
      setMapZoom(13)
    }
  }

  const removePost = (removablePost: PostWithUI) => {
    return () => {
      if (removablePost.url) {
        setPostList(prevList => {
          const newPostList = { ...prevList }
          delete newPostList[removablePost.url!]
          return newPostList
        })
        setFocusedPost(null)
        setMapZoom(8)
      }
    }
  }

  const focusPost = (post: PostWithUI) => {
    return () => {
      const focusedPost: PostWithUI = {
        ...post,
      }
      setFocusedPost(focusedPost)
      setMapZoom(13)
    }
  }

  const landscapeClass = isLandscape ? 'horizontal' : 'vertical'

  return (
    <div className={getSkinnedBlockClass('app', {}, { [landscapeClass]: true })}>
      <div className={getSkinnedElementClass('error', 'container')}>
        {errorList.length > 0 &&
          errorList.map((errorMessage, index) => (
            <div key={index} className={getSkinnedBlockClass('error')}>
              <p className={getSkinnedElementClass('error', 'text')}>
                <span className={getSkinnedElementClass('error', 'icon')}>{'⚠'}</span>
                {errorMessage}
              </p>
            </div>
          ))}
      </div>
      <Body className={getSkinnedBlockClass('body')}>
        <PostForm handlePostResponse={handlePostResponse} />
        <div className={getSkinnedBlockClass('info-wrapper', { [landscapeClass]: true })}>
          <PostList
            postList={postList}
            skin={{ [landscapeClass]: true }}
            focusPost={focusPost}
            removePost={removePost}
          />
          <PostMap
            postList={postList}
            defaultCenter={mapCenterCoordinates}
            defaultZoom={mapZoom}
            focusedPost={focusedPost}
            skin={{ [landscapeClass]: true }}
          />
        </div>
      </Body>
    </div>
  )
}

export default App
