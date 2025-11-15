export const getPostPrice = (document: Document): string | null => {
    const priceSelector = '.ads_price';
    const priceNode = document.querySelector(priceSelector);

    if (!priceNode) {
        console.log('Couldn\'t find post price element');
        return null;
    }

    return priceNode.textContent?.trim();
}
