import { Coordinates } from '@shared/post.js'

export const parseCoordinatesField = (coordinatesField: HTMLElement): Coordinates | null => {
  const coordinatesClickScript = coordinatesField.getAttribute('onclick')
  let coordinates: string | null = null

  if (coordinatesClickScript) {
    // E.g. click script - mnu('map',1,1,'/lv/gmap/fTgTeF4QAzt4FD4eFFM=.html?mode=1&c=56.9483837, 24.1065339, 14');return false;
    const coordinatesExpression = 'c=(.+\..+\,.+\..+)\,'
    const coordinateMatch = coordinatesClickScript.match(coordinatesExpression)

    if (coordinateMatch && coordinateMatch[1]) {
      // First matching regex group
      coordinates = coordinateMatch[1]
    }
  }

  if (!coordinates) {
    return null
  }

  const lat = parseFloat(coordinates.split(', ')[0])
  const lng = parseFloat(coordinates.split(', ')[1])

  return {
    lat,
    lng,
  }
}
