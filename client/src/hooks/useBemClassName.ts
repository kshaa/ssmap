import block from 'bem-cn';

interface Skin {
    [key: string]: boolean | string;
}

block.setup({
    el: '__',
    mod: '--',
    modValue: '-'
});

export function useBemClassName(componentSkin: Skin = {}) {
    const getBemClassName = (
        blockName: string, 
        elementName: string | null = null, 
        baseSkin: Skin = {}, 
        states: { [key: string]: boolean } = {}
    ): string => {
        const skin = Object.assign({default: true}, baseSkin, componentSkin);

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

        return classes;
    };

    const getSkinnedBlockClass = (blockName: string, baseSkin: Skin = {}, states: { [key: string]: boolean } = {}): string => {
        return getBemClassName(blockName, null, baseSkin, states);
    };

    const getSkinnedElementClass = (blockName: string, elementName: string, baseSkin: Skin = {}, states: { [key: string]: boolean } = {}): string => {
        return getBemClassName(blockName, elementName, baseSkin, states);
    };

    return {
        getSkinnedBlockClass,
        getSkinnedElementClass
    };
}

