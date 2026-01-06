import styled from 'styled-components'
import { theme, darken, lighten, transparentify } from '@src/styling/theme'
import { ParsedPostWithUrl } from '@shared/post'
import { ProjectPostFeeling } from '@shared/projectPostFeeling'

interface PostListProps {
  postList: ParsedPostWithUrl[]
  focusPost: (post: ParsedPostWithUrl) => () => void
  // removePost: (post: ParsedPostWithUrl) => () => void
  postRatings: Record<string, Omit<ProjectPostFeeling, 'projectId' | 'postUrl'>>
  ratePost: (post: ParsedPostWithUrl, rating: Omit<ProjectPostFeeling, 'projectId' | 'postUrl'>) => void
  isHorizontal?: boolean
}

const PostListContainer = styled.div<{ $isHorizontal?: boolean }>`
  ${props => props.$isHorizontal ? `
    height: calc(100vh - 150px);
  ` : `
    display: block;
    margin-right: auto;
    margin-left: auto;
    width: 100%;
    max-width: ${theme.layout.pageWidthMax};
  `}
`

// const PostListTitle = styled.div<{ $isHorizontal?: boolean }>`
//   ${props => props.$isHorizontal ? `
//     display: inline-block;
//     padding: ${theme.spacing.m};
//     border-width: 1px 0 1px;
//     border-color: ${theme.colors.mercury};
//     border-style: solid;
//     min-width: 100%;
//   ` : `
//     display: none;
//   `}
// `

const PostListContent = styled.div<{ $isHorizontal?: boolean }>`
  padding: ${theme.spacing.m};
  display: block;
  width: 100%;
`

const Post = styled.div<{ $isSeen?: boolean, $isFaulty?: boolean }>`
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
  ${props => !props.$isFaulty && !props.$isSeen && `
    background-color: ${transparentify(lighten(theme.colors.yellow, theme.contrast.light), 0.5)};
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  margin-top: 10px;
  padding: 25px 0 15px;
  border-top: 1px solid ${theme.colors.mercury};
`

const Star = styled.span<{ isSelected?: boolean }>`
  cursor: pointer;
  color: ${props => props.isSelected ? 'yellow!' : 'gray'} !important;

  background: #0000002e;
  border-radius: 100%;
  padding: 0 4px;
  color: yellow;
  margin: 0 5px 0 0;
`

const FakeLink = styled.span`
  cursor: pointer;
  text-decoration: underline;
`

// const PostRemove = styled.button`
//   position: absolute;
//   right: 5px;
//   bottom: 13px;
//   max-height: 26px;
//   border: 0;
//   background: transparent;
//   color: ${theme.colors.monza};
//   transform: scale(1.5);
//   transition: ${theme.transitions.fast};
//   outline: 0;
//   cursor: pointer;

//   &:hover {
//     transform: scale(1.8);
//   }

//   &:active {
//     transform: scale(2);
//   }
// `

const PostList = ({ postList, postRatings, ratePost, focusPost, isHorizontal = false }: PostListProps) => {
  const renderPost = (post: ParsedPostWithUrl) => {
    const isFaulty = !post.data.addressInfo?.coordinates || !post.data.addressInfo?.coordinates.lat || !post.data.addressInfo?.coordinates.lng
    const postRating = postRatings[post.url] ?? {}
    const stars = postRating.stars ?? 0
    const isSeen = postRating.isSeen ?? false
    const handleStarClick = (index: number, e: React.MouseEvent) => {
      e.stopPropagation()
      ratePost(post, { stars: index + 1, isSeen: true })
    }

    const handleMarkAsSeen = (e: React.MouseEvent) => {
      e.stopPropagation()
      ratePost(post, { stars: stars, isSeen: true })
    }

    return (
      <Post $isSeen={isSeen} $isFaulty={isFaulty} key={post.url} onClick={focusPost(post)}>
        <PostTitle>{post.data.title}</PostTitle>
        <PostActionBar>
          <div>
            <strong>Cena: </strong>
            <span>{post.data.price}</span>
          </div>
          <div>
            <strong>Platība: </strong>
            <span>{post.data.genericInfo['Platība']}</span>
          </div>
          <div>
            <strong>Saite: </strong>
            <a href={post.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Apskatīt</a>
          </div>
          {/* <PostRemove onClick={removePost(post)}>
            {'✖'}
          </PostRemove> */}
          <div>
            <strong>Vērtējums: </strong>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} onClick={(e) => handleStarClick(index, e)} isSelected={index < stars}>{index < stars ? '★' : '☆'}</Star>
            ))}
          </div>
          {!isSeen && <div>
            <strong>Neapskatīts: </strong>
              <FakeLink onClick={(e) => handleMarkAsSeen(e)}>Marķēt kā apskatītu</FakeLink>
            </div>
          }
        </PostActionBar>
      </Post>
    )
  }

  const posts = postList.map(postEntry => {
    return renderPost(postEntry)
  })

  return (
    <PostListContainer $isHorizontal={isHorizontal}>
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
