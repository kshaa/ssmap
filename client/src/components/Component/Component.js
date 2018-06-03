import { Component } from 'react'
import block from 'bem-cn'

export default class BaseComponent extends Component {
    getSkinnedBlockClass(blockName) {
		let {skin = {}} = this.props;

		block.setup({
            el: '__',
            mod: '--',
            modValue: '-'
        })

        return block(blockName)(skin)()
    }

    getSkinnedElementClass(blockName, elementName) {
        let {skin = {}} = this.props;

		block.setup({
            el: '__',
            mod: '--',
            modValue: '-'
        })

        return block(blockName)(elementName, skin)() 
    }
}
