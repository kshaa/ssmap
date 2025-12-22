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
import Header, { HEADER_HEIGHT } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'
import { PostManagement } from '../PostManagement/PostManagement'
import { useEffect, useState } from 'react'

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
  z-index: 3;
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

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  max-height: calc(100vh - ${HEADER_HEIGHT});
`

const ProjectPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 350px;
  margin: 0 auto;
`

const ProjectSelection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  width: 100%;
  max-width: 350px;
  padding: 10px;
`

const ProjectSelectionItem = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 10px;
  margin: 10px;
  border: 1px solid ${theme.colors.mercury};
`

const ProjectPicker = styled.div`
  cursor: pointer;
  text-decoration: underline;
`

const App = () => {
  const isLandscape = useOrientation()
  const { errorList, addErrorMessage } = useErrorNotifications()
  const projectManagement = useProjectManagement()
  const thingManagement = useThingManagement(projectManagement)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(isLandscape)

  useEffect(() => {
    setIsSidebarOpen(isLandscape)
  }, [isLandscape])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleProjectPicker = () => {
    projectManagement.setSelectedProjectId(null)
  }

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
                <ProjectPage>
                  <Header isBig={true}>
                    <CreateProjectForm projectManagement={projectManagement} addErrorMessage={addErrorMessage} />
                  </Header>
                  <ProjectSelection>
                    {projectManagement.projects.map((project) => (
                      <ProjectSelectionItem onClick={() => projectManagement.setSelectedProjectId(project.id)} key={project.id}>
                        {project.name}
                      </ProjectSelectionItem>
                    ))}
                  </ProjectSelection>
                </ProjectPage>
              ) : (
                <Navigate to={`/project/${projectManagement.selectedProjectId}${window.location.search ?? ''}`} replace />
              )
            } />
            <Route path="/project/:projectId" element={
              !projectManagement.selectedProjectId ? (<Navigate to={`/${window.location.search ?? ''}`} replace />) : 
              <>
                <Header>
                  <button onClick={toggleSidebar}>☰</button>
                  <h4>{projectManagement.selectedProject?.name}</h4>
                  <ProjectPicker onClick={handleProjectPicker}>Mainīt projektu</ProjectPicker>
                </Header>
                <ContentContainer>
                  <Sidebar isLandscape={isLandscape} isOpen={isSidebarOpen}>
                    <PostManagement thingManagement={thingManagement} isLandscape={isLandscape} selectedProjectId={projectManagement.selectedProjectId} addErrorMessage={addErrorMessage} />
                  </Sidebar>
                  <PostMap
                    thingManagement={thingManagement}
                    isHorizontal={isLandscape}
                    isSidebarOpen={isSidebarOpen}
                  />
                </ContentContainer>  
              </>
            } />
          </Routes>
        </StyledBody>
      </AppContainer>
    </>
  )
}

export default App
