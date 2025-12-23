import { Project } from "@shared/project"
import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const PROJECT_STORAGE_KEY = 'projects'
const SELECTED_PROJECT_STORAGE_KEY = 'selectedProjectId'

const getPersistedProjects = (): Project[] => {
  return JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || '[]')
}

const setPersistedProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects))
}

const addPersistedProject = (project: Project): void => {
  const projects = getPersistedProjects()
  projects.push(project)
  setPersistedProjects(projects)
}

const getPersistedSelectedProjectId = (): string | null => {
  return JSON.parse(localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY) ?? 'null')
}

const setPersistedSelectedProjectId = (projectId: string | null): void => {
  localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, JSON.stringify(projectId))
}

export const useProjectManagement = () => {
  // const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState<{ id: string, name: string }[]>(getPersistedProjects())
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const setSelectedProjectIdWithPersistence = useCallback((projectId: string | null, isDiscovered: boolean) => {
    setSelectedProjectId(projectId)
    if (!isDiscovered) setSelectedProject(projects.find(project => project.id === projectId) ?? null)
    setPersistedSelectedProjectId(projectId)
  }, [projects])

  useEffect(() => {
    console.log('Persisted projects', projects)
    const projectFromUrlPath = location.pathname.match(/^\/project\/([a-f0-9-]+)$/) ?? null
    if (projectFromUrlPath) {
      // Parses /project/:projectId to get the projectId
      setSelectedProjectIdWithPersistence(projectFromUrlPath[1], false)
    } else {
      // Fallback to use persisted selected project id
      setSelectedProjectIdWithPersistence(getPersistedSelectedProjectId() ?? null, false)
    }
  }, [])

  const createProject = useCallback((id: string, name: string) => {
    const project = { id, name }
      if (projects.find(p => p.id === project.id)) {
        return
      }
      setProjects([...projects, project])
      setSelectedProject(project)
      addPersistedProject(project)
      setSelectedProjectIdWithPersistence(project.id, true)
    },
    [projects, addPersistedProject, setSelectedProjectIdWithPersistence, setPersistedSelectedProjectId]
  )

  return {
    projects,
    selectedProjectId,
    selectedProject,
    setSelectedProjectId: setSelectedProjectIdWithPersistence,
    createProject,
  }
}

export type ProjectManagement = ReturnType<typeof useProjectManagement>