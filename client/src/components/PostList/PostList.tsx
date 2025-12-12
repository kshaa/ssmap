import React from 'react'
import { useBemClassName } from '@src/hooks/useBemClassName'
import './PostList.scss'
import { ParsedPostWithUrl } from '@shared/post'

export interface PostWithUI extends ParsedPostWithUrl {
  isOpen?: boolean
}

export interface PostListType {
  [url: string]: PostWithUI
}

interface PostListProps {
  postList: PostListType
  focusPost: (post: PostWithUI) => () => void
  removePost: (post: PostWithUI) => () => void
  skin?: any
}

const PostList = ({ postList, focusPost, removePost, skin = {} }: PostListProps) => {
  const { getSkinnedBlockClass, getSkinnedElementClass } = useBemClassName(skin)

  const renderPost = (post: PostWithUI) => {
    return (
      <div className={getSkinnedBlockClass('post')} key={post.url} onClick={focusPost(post)}>
        <div className={getSkinnedElementClass('post', 'title')}>{post.data.title}</div>
        <div className={getSkinnedElementClass('post', 'action-bar')}>
          <div className={getSkinnedElementClass('post', 'price')}>
            <strong>Cena: </strong>
            <span>{post.data.price}</span>
          </div>
          <button className={getSkinnedElementClass('post', 'remove')} onClick={removePost(post)}>
            {'✖'}
          </button>
        </div>
      </div>
    )
  }

  const posts = Object.values(postList).map(postEntry => {
    return renderPost(postEntry)
  })

  const postListSkin = {
    centered: true,
    margin: true,
    padding: true,
  }

  return (
    <div className={getSkinnedBlockClass('post-list', postListSkin)}>
      <div className={getSkinnedElementClass('post-list', 'title')}>
        <strong>{'Sludinājumi'}</strong>
      </div>
      <div className={getSkinnedElementClass('post-list', 'content')}>
        {posts.length === 0 && (
          <div>
            <p>... Tukšums!</p>
          </div>
        )}
        {posts.length > 0 && posts}
      </div>
    </div>
  )
}

export default PostList
