import styled from 'styled-components'
import { Routes, Route, Navigate } from 'react-router-dom'
import { theme, darken } from '@src/styling/theme'
import { GlobalStyles } from '@src/styling/GlobalStyles'
import PostForm from '@src/components/PostForm/PostForm'
import PostList from '@src/components/PostList/PostList'
import PostMap from '@src/components/PostMap/PostMap'
import { useOrientation } from '@src/hooks/useOrientation'
import { useErrorNotifications } from '@src/hooks/useErrorNotifications'
import { useThingManagement } from '@src/hooks/useThingManagement'
import { useProjectManagement } from '@src/hooks/useProjectManagement'
import CreateProjectForm from '../ProjectForm/ProjectForm'

const AppContainer = styled.div<{ $isHorizontal?: boolean }>`
  ${props => props.$isHorizontal && `
    /* Horizontal layout specific styles can go here if needed */
  `}
`

const ErrorContainer = styled.div`
  margin: 20px auto;
  position: absolute;
  right: 0;
  left: 0;
  width: 100%;
  max-width: ${theme.layout.pageWidthMin};
  z-index: 2;
`

const Error = styled.div`
  margin-top: ${theme.spacing.m};
  opacity: 0.9;
  background: ${theme.colors.pink};
  border-color: ${darken(theme.colors.pink, theme.contrast.hard)};
  border-width: 1px;
  border-radius: 3px;
  border-style: solid;
`

const ErrorText = styled.p`
  margin: 20px 10px;
  color: ${theme.colors.monza};
`

const ErrorIcon = styled.span`
  display: inline-block;
  margin: 0 25px 0 15px;
  font-size: 22px;
  color: ${theme.colors.monza};
  transform: scale(2);
`

const InfoWrapper = styled.div<{ $isHorizontal?: boolean }>`
  ${props => props.$isHorizontal && `
    display: flex;
    justify-content: row;
    flex-grow: 1;
  `}
`

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-height: 100vh;
`

const App = () => {
  const isLandscape = useOrientation()
  const { errorList, addErrorMessage } = useErrorNotifications()
  const projectManagement = useProjectManagement()
  const {
    projectWithContent,
    mapCenterCoordinates,
    mapZoom,
    focusedPost,
    appendPosts,
    focusPost,
  } = useThingManagement(projectManagement)

  return (
    <>
      <GlobalStyles />
      <AppContainer $isHorizontal={isLandscape}>
        <ErrorContainer>
          {errorList.length > 0 &&
            errorList.map((errorMessage, index) => (
              <Error key={index}>
                <ErrorText>
                  <ErrorIcon>{'⚠'}</ErrorIcon>
                  {errorMessage}
                </ErrorText>
              </Error>
            ))}
        </ErrorContainer>
        <StyledBody>
          <Routes>
            <Route path="/" element={
              !projectManagement.selectedProjectId ? (
                <CreateProjectForm projectManagement={projectManagement} addErrorMessage={addErrorMessage} />
              ) : (
                <Navigate to={`/project/${projectManagement.selectedProjectId}`} replace />
              )
            } />
            <Route path="/project/:projectId" element={
              !projectManagement.selectedProjectId ? (<Navigate to="/" replace />) : 
              <>
                {projectManagement.selectedProjectId && (
                  <PostForm projectId={projectManagement.selectedProjectId} addErrorMessage={addErrorMessage} appendPosts={appendPosts} />
                )}
                <InfoWrapper $isHorizontal={isLandscape}>
                  <PostList
                    postList={projectWithContent?.posts ?? []}
                    isHorizontal={isLandscape}
                    focusPost={focusPost}
                  />
                  <PostMap
                    postList={projectWithContent?.posts ?? []}
                    defaultCenter={mapCenterCoordinates}
                    defaultZoom={mapZoom}
                    focusedPost={focusedPost}
                    isHorizontal={isLandscape}
                  />
                </InfoWrapper>
              </>
            } />
          </Routes>
        </StyledBody>
      </AppContainer>
    </>
  )
}

export default App
