import { Component } from 'react'
import block from 'bem-cn'

interface Skin {
  [key: string]: boolean | string
}

interface BaseComponentProps {
  skin?: Skin
}

interface BaseComponentState {}

export default class BaseComponent<
  P extends BaseComponentProps = BaseComponentProps,
  S extends BaseComponentState = BaseComponentState,
> extends Component<P, S> {
  internalSkin?: Skin

  getBlockSkin(): Skin {
    return this.internalSkin || this.props.skin || {}
  }

  setBlockSkin(skin: string, value: boolean | string) {
    let skins = this.getBlockSkin() || {}
    this.internalSkin = {
      ...skins,
      [skin]: value,
    }
  }

  getBemClassName(
    blockName: string,
    elementName: string | null = null,
    baseSkin: Skin = {},
    states: { [key: string]: boolean } = {}
  ): string {
    const additionalSkin = this.getBlockSkin() || {}
    const skin = Object.assign({ default: true }, baseSkin, additionalSkin)

    block.setup({
      el: '__',
      mod: '--',
      modValue: '-',
    })

    let classes = ''
    if (elementName) {
      classes = block(blockName)(elementName, skin)()
    } else {
      classes = block(blockName)(skin)()
    }

    for (let [state, active] of Object.entries(states)) {
      if (active) {
        classes += ' is-' + state
      }
    }

    return classes
  }

  getSkinnedBlockClass(
    blockName: string,
    baseSkin: Skin = {},
    states: { [key: string]: boolean } = {}
  ): string {
    return this.getBemClassName(blockName, null, baseSkin, states)
  }

  getSkinnedElementClass(
    blockName: string,
    elementName: string,
    baseSkin: Skin = {},
    states: { [key: string]: boolean } = {}
  ): string {
    return this.getBemClassName(blockName, elementName, baseSkin, states)
  }
}
