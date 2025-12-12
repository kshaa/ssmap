import React, { useState, useEffect, useCallback } from 'react'
import { useBemClassName } from '@src/hooks/useBemClassName'
import Body from '@src/components/Body/Body'
import PostForm from '@src/components/PostForm/PostForm'
import PostList from '@src/components/PostList/PostList'
import PostMap from '@src/components/PostMap/PostMap'
import './App.scss'
import { ParsedPostWithUrl, Coordinates } from '@shared/post'
import { PostWithUI, PostListType } from '@src/components/PostList/PostList'

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

  const appendPosts = (posts: ParsedPostWithUrl[]) => {
    const fondledPosts: PostListType = Object.fromEntries(posts.map(post => [
      [post.url], {
        ...post,
        isOpen: true,
      },
    ]))
    setPostList(prevList => ({
      ...prevList,
      ...fondledPosts,
    }))
    setFocusedPost(Object.values(fondledPosts)[0])
    setMapZoom(13)
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
        <PostForm addErrorMessage={addErrorMessage} appendPosts={appendPosts} />
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
