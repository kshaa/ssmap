import { theme } from '@src/styling/theme'
import React from 'react'
import styled from 'styled-components'

interface HeaderProps {
  children?: React.ReactNode
  isBig?: boolean
}

export const HEADER_HEIGHT = '65px'

const HeaderContainer = styled.div<{ isBig?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  ${props => props.isBig ? `
    padding: 13px 13px;
  ` : `
    height: ${HEADER_HEIGHT};
    padding: 0 13px;
    border-bottom: 1px solid ${theme.colors.mercury};
  `}
  align-items: center;
  width: 100%;
  max-width: 100%;
`

const Header = ({ children, isBig = false }: HeaderProps) => {
  return (
    <HeaderContainer isBig={isBig}>
      {children}
    </HeaderContainer>
  )
}

export default Header
