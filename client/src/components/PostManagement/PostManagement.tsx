import styled from 'styled-components'
import PostForm from '@src/components/PostForm/PostForm'
import PostList from '@src/components/PostList/PostList'
import { ThingManagement } from '@src/hooks/useThingManagement'
import { theme } from '@src/styling/theme'
import { useState } from 'react'

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

const PostFilter = styled.div`
  width: 100%;
  max-width: ${theme.layout.pageWidthMax};
  padding: 0 20px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Star = styled.span<{ isSelected?: boolean }>`
  cursor: pointer;
  color: ${props => props.isSelected ? 'yellow' : 'gray'} !important;

  background: #0000002e;
  border-radius: 100%;
  padding: 0 4px;
  color: yellow;
  margin: 0 4px 0 0;
`

const NoStar = styled.span<{ isSelected?: boolean }>`
  color: ${props => props.isSelected ? 'red' : 'gray'} !important;
  cursor: pointer;
  background: #0000002e;
  border-radius: 100%;

  padding: 0 7px;
  margin: 0 4px 0 0;
`

const SingleFilter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`

const ColoredInput = styled.input<{ isValid?: boolean }>`
  background-color: ${props => props.isValid ? 'white' : 'red'};
`

export const PostManagement = ({ 
  isLandscape, 
  selectedProjectId,
  addErrorMessage, 
  thingManagement,
}: PostManagementProps) => {
  const [minPriceText, setMinPriceText] = useState<string>('')
  const [maxPriceText, setMaxPriceText] = useState<string>('')
  const { projectWithContent, filterSettings, postList, postRatings, appendPosts, focusPost, ratePost } = thingManagement
  const { showSeenFilter, showUnseenFilter, starFilter, minPrice, maxPrice } = filterSettings

  const handleMinPriceChange = (minPriceInput: string) => {
    setMinPriceText(minPriceInput)
    const numerical = minPriceInput.trim() === '' ? null : parseInt(minPriceInput)
    if (numerical !== null && isNaN(numerical)) return
    thingManagement.adjustMinPrice(numerical)
  }

  const handleMaxPriceChange = (maxPriceInput: string) => {
    setMaxPriceText(maxPriceInput)
    const numerical = maxPriceInput.trim() === '' ? null : parseInt(maxPriceInput)
    if (numerical !== null && isNaN(numerical)) return
    thingManagement.adjustMaxPrice(numerical)
  }

  const handleStarFilterChange = (stars: number) => {
    thingManagement.adjustStarFilter(stars)
  }

  const handleShowSeenFilterChange = () => {
    thingManagement.adjustShowSeenFilter(!showSeenFilter)
  }

  const handleShowUnseenFilterChange = () => {
    thingManagement.adjustShowUnseenFilter(!showUnseenFilter)
  }

  const handleRefreshProjectWithContent = () => {
    thingManagement.refreshProjectWithContent().catch((e) => {
      addErrorMessage(typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string' ? e.message : 'Unknown error')
    })
  }

  return (
    <InfoWrapper $isHorizontal={isLandscape}>
      <PostForm projectId={selectedProjectId} addErrorMessage={addErrorMessage} appendPosts={appendPosts} />
      {(projectWithContent?.posts.length ?? 0) > 0 && (
        <PostFilter>
          <SingleFilter>
            <span>Vērtējums</span>
            <div>
              <NoStar isSelected={starFilter >= 0} onClick={() => handleStarFilterChange(0)}>X</NoStar>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} onClick={() => handleStarFilterChange(index + 1)} isSelected={starFilter >= index + 1}>{starFilter >= (index + 1) ? '★' : '☆'}</Star>
              ))}
            </div>
          </SingleFilter>
          <SingleFilter>
            <span>Apskatītie</span>
            <input checked={showSeenFilter} onClick={handleShowSeenFilterChange} type="checkbox" />
          </SingleFilter>
          <SingleFilter>
            <span>Neapskatītie (atjaunotie)</span>
            <input checked={showUnseenFilter} onClick={handleShowUnseenFilterChange} type="checkbox" />
          </SingleFilter>
          <SingleFilter>
            <span>Min. cena</span>
            <ColoredInput type="text" value={minPriceText} onChange={(e) => handleMinPriceChange(e.target.value)} isValid={minPriceText === '' || !isNaN(parseInt(minPriceText))} />
          </SingleFilter>
          <SingleFilter>
            <span>Max. cena</span>
            <ColoredInput type="text" value={maxPriceText} onChange={(e) => handleMaxPriceChange(e.target.value)} isValid={maxPriceText === '' || !isNaN(parseInt(maxPriceText))} />
          </SingleFilter>
          <SingleFilter>
            <button onClick={handleRefreshProjectWithContent}>Atjaunot sludinājumus</button>
          </SingleFilter>
        </PostFilter>
      )}
      <PostList
        postList={postList}
        postRatings={postRatings}
        ratePost={ratePost}
        isHorizontal={isLandscape}
        focusPost={focusPost}
      />
    </InfoWrapper>
  )
}