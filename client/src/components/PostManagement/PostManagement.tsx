import styled from 'styled-components'
import PostForm from '@src/components/PostForm/PostForm'
import PostList from '@src/components/PostList/PostList'
import { ThingManagement } from '@src/hooks/useThingManagement'

interface PostManagementProps {
  isLandscape: boolean
  selectedProjectId: string
  thingManagement: ThingManagement
  addErrorMessage: (message: string) => void
}

const InfoWrapper = styled.div<{ $isHorizontal?: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

export const PostManagement = ({ 
  isLandscape, 
  selectedProjectId,
  addErrorMessage, 
  thingManagement,
}: PostManagementProps) => {
  const { projectWithContent, postRatings, appendPosts, focusPost, ratePost } = thingManagement

  return (
    <InfoWrapper $isHorizontal={isLandscape}>
      <PostForm projectId={selectedProjectId} addErrorMessage={addErrorMessage} appendPosts={appendPosts} />
      <PostList
        postList={projectWithContent?.posts ?? []}
        postRatings={postRatings}
        ratePost={ratePost}
        isHorizontal={isLandscape}
        focusPost={focusPost}
      />
    </InfoWrapper>
  )
}