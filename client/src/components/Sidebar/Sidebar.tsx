import { theme } from "@src/styling/theme"
import styled from "styled-components"
import { HEADER_HEIGHT } from "../Header/Header"

interface SidebarProps {
  isLandscape: boolean
  isOpen: boolean
  children: React.ReactNode
}

const SidebarContainer = styled.div<{ isLandscape: boolean, isOpen: boolean }>`
  ${props => props.isLandscape ? `
    width: ${theme.layout.sidebarWidth};
    ${!props.isOpen && `
      display: none;
    `}
  ` : `
    position: absolute;
    background: white;
    z-index: 50;
    width: 100%;
    top: ${HEADER_HEIGHT};
    ${props.isOpen ? `
      left: 0;
    ` : `
      left: -200vw;
    `}
  `}
  height: calc(100% - ${HEADER_HEIGHT});
  max-height: calc(100% - ${HEADER_HEIGHT});
  overflow-y: scroll;
  border-right: 1px solid ${theme.colors.mercury};
`

export const Sidebar = ({ 
  isLandscape,
  isOpen,
  children,
}: SidebarProps) => {
  return (
    <SidebarContainer isLandscape={isLandscape} isOpen={isOpen}>
      {children}
    </SidebarContainer>
  )
}