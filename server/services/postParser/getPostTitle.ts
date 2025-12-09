export const getPostTitle = (document: Document): string | null => {
  const titleSelector = '#msg_div_msg'
  const titleSize = 250
  const titleNode = document.querySelector(titleSelector)

  if (!titleNode) {
    console.log("Couldn't find post title element")
    return null
  }

  return (
    titleNode.textContent
      ?.trim() // Remove start, end spaces
      .replace(/(\r\n|\n|\r)/gm, ' ') // Remove line breaks
      .replace(/[ ]{2,}/gm, ' ') // Remove multi-whitespace between words
      .slice(0, titleSize) || null
  ) // Limit title size
}
