import styled from 'styled-components'
import { theme, darken, lighten } from '@src/styling/theme'
import { ParsedPostWithUrl } from '@shared/post'

interface PostListProps {
  postList: ParsedPostWithUrl[]
  focusPost: (post: ParsedPostWithUrl) => () => void
  // removePost: (post: ParsedPostWithUrl) => () => void
  isHorizontal?: boolean
}

const PostListContainer = styled.div<{ $isHorizontal?: boolean }>`
  ${props => props.$isHorizontal ? `
    min-width: ${theme.layout.sidebarWidth};
    max-width: ${theme.layout.sidebarWidth};
    height: calc(100vh - 150px);
  ` : `
    display: block;
    margin-right: auto;
    margin-left: auto;
    width: 100%;
    max-width: ${theme.layout.pageWidthMax};
  `}
`

const PostListTitle = styled.div<{ $isHorizontal?: boolean }>`
  ${props => props.$isHorizontal ? `
    display: inline-block;
    padding: ${theme.spacing.m};
    border-width: 1px 0 1px;
    border-color: ${theme.colors.mercury};
    border-style: solid;
    min-width: 100%;
  ` : `
    display: none;
  `}
`

const PostListContent = styled.div<{ $isHorizontal?: boolean }>`
  padding: ${theme.spacing.m};
  display: block;
  width: 100%;

  ${props => props.$isHorizontal && `
    max-height: calc(100% - 61px);
    min-height: calc(100% - 61px);
    overflow-y: scroll;
  `}
`

const Post = styled.div<{ $isFaulty?: boolean }>`
  margin-bottom: ${theme.spacing.m};
  display: block;
  padding: 10px;
  border-style: solid;
  border-width: 1px;
  border-radius: 3px;
  border-color: ${theme.colors.mercury};
  transition: ${theme.transitions.fast};
  ${props => props.$isFaulty && `
    background-color: ${lighten(theme.colors.pink, theme.contrast.light)};
  `}

  &:hover {
    border-color: ${darken(theme.colors.mercury, theme.contrast.hard)};
  }
`

const PostTitle = styled.div`
  max-height: 46px;
  line-height: 22px;
  transition: ${theme.transitions.fast};
  overflow: hidden;

  &:hover {
    max-height: 92px;
  }
`

const PostActionBar = styled.div`
  position: relative;
  margin-top: 10px;
  padding: 25px 0 15px;
  border-top: 1px solid ${theme.colors.mercury};
`

const PostRemove = styled.button`
  position: absolute;
  right: 5px;
  bottom: 13px;
  max-height: 26px;
  border: 0;
  background: transparent;
  color: ${theme.colors.monza};
  transform: scale(1.5);
  transition: ${theme.transitions.fast};
  outline: 0;
  cursor: pointer;

  &:hover {
    transform: scale(1.8);
  }

  &:active {
    transform: scale(2);
  }
`

const PostList = ({ postList, focusPost, isHorizontal = false }: PostListProps) => {
  const renderPost = (post: ParsedPostWithUrl) => {
    const isFaulty = !post.data.addressInfo?.coordinates || !post.data.addressInfo?.coordinates.lat || !post.data.addressInfo?.coordinates.lng

    return (
      <Post $isFaulty={isFaulty} key={post.url} onClick={focusPost(post)}>
        <PostTitle>{post.data.title}</PostTitle>
        <PostActionBar>
          <div>
            <strong>Cena: </strong>
            <span>{post.data.price}</span>
          </div>
          <div>
            <strong>Saite: </strong>
            <a href={post.url} target="_blank" rel="noopener noreferrer">Apskatīt</a>
          </div>
          {/* <PostRemove onClick={removePost(post)}>
            {'✖'}
          </PostRemove> */}
        </PostActionBar>
      </Post>
    )
  }

  const posts = postList.map(postEntry => {
    return renderPost(postEntry)
  })

  return (
    <PostListContainer $isHorizontal={isHorizontal}>
      <PostListTitle $isHorizontal={isHorizontal}>
        <strong>{'Sludinājumi'}</strong>
      </PostListTitle>
      <PostListContent $isHorizontal={isHorizontal}>
        {posts.length === 0 && (
          <div>
            <p>... Tukšums!</p>
          </div>
        )}
        {posts.length > 0 && posts}
      </PostListContent>
    </PostListContainer>
  )
}

export default PostList
