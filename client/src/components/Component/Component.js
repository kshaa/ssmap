import { Component } from 'react'
import block from 'bem-cn'

export default class BaseComponent extends Component {
    getBlockSkin() {
        return this.internalSkin || this.props.skin || {}
    }

    setBlockSkin(skin, value) {
        let skins = this.getBlockSkin() || {}
        this.internalSkin = {
            ...skins,
            [skin]: value
        }
    }

    getBemClassName(blockName, elementName = null, baseSkin = {}, states = {}) {
        const additionalSkin = this.getBlockSkin() || {};
        const skin = Object.assign({default: true}, baseSkin, additionalSkin);

		block.setup({
            el: '__',
            mod: '--',
            modValue: '-'
        })

        let classes = '';
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

    getSkinnedBlockClass(blockName, baseSkin = {}, states = {}) {
        return this.getBemClassName(blockName, null, baseSkin, states)
    }

    getSkinnedElementClass(blockName, elementName, baseSkin = {}, states = {}) {
        return this.getBemClassName(blockName, elementName, baseSkin, states)
    }
}
