import { loadFixture } from './loadFixture'

export const loadDocumentWithUrlFixture = async (name: string): Promise<{ url: string, text: string }> => {
  const postText = await loadFixture(name)
  // Split off first line and the rest of the text
  const [firstLine, ...rest] = postText.split('\n')
  const text = rest.join('\n')
  return {
    url: firstLine,
    text,
  }
}
