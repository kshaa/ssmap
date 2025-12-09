import React from 'react'
import { useBemClassName } from 's/hooks/useBemClassName'
import './Body.scss'

interface BodyProps {
  children?: React.ReactNode
  skin?: any
  className?: string
}

const Body = ({ children, skin = {} }: BodyProps) => {
  const { getSkinnedBlockClass } = useBemClassName(skin)

  return <div className={getSkinnedBlockClass('body', { height: 'full' })}>{children}</div>
}

export default Body
