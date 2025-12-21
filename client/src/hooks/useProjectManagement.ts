import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const PROJECT_STORAGE_KEY = 'projects'
const SELECTED_PROJECT_STORAGE_KEY = 'selectedProjectId'

const getPersistedProjects = () => {
  return JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || '[]')
}

const setPersistedProjects = (projects: string[]) => {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects))
}

const addPersistedProject = (project: { id: string, name: string }) => {
  const projects = getPersistedProjects()
  projects.push(project)
  setPersistedProjects(projects)
}

const getPersistedSelectedProjectId = () => {
  return JSON.parse(localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY) ?? 'null')
}

const setPersistedSelectedProjectId = (projectId: string | null) => {
  localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, JSON.stringify(projectId))
}

export const useProjectManagement = () => {
  // const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState<{ id: string, name: string }[]>(getPersistedProjects())
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const setSelectedProjectIdWithPersistence = useCallback((projectId: string | null) => {
    setSelectedProjectId(projectId)
    setPersistedSelectedProjectId(projectId)
  }, [setPersistedSelectedProjectId])

  useEffect(() => {
    setProjects(getPersistedProjects())
    const projectFromUrlPath = location.pathname.match(/^\/project\/([a-f0-9-]+)$/) ?? null
    if (projectFromUrlPath) {
      // Parses /project/:projectId to get the projectId
      setSelectedProjectIdWithPersistence(projectFromUrlPath[1])
    } else {
      // Fallback to use persisted selected project id
      setSelectedProjectIdWithPersistence(getPersistedSelectedProjectId() ?? null)
    }
  }, [])

  const createProject = useCallback((id: string, name: string) => {
    const project = { id, name }
      addPersistedProject(project)
      setSelectedProjectIdWithPersistence(project.id)
      setPersistedSelectedProjectId(project.id)
    },
    [addPersistedProject, setSelectedProjectIdWithPersistence, setPersistedSelectedProjectId]
  )

  return {
    projects,
    selectedProjectId,
    setSelectedProjectId: setSelectedProjectIdWithPersistence,
    createProject,
  }
}

export type ProjectManagement = ReturnType<typeof useProjectManagement>