import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Coordinates, ParsedPostWithUrl } from '@shared/post'
import { ProjectPostFeeling } from '@shared/projectPostFeeling'
import { ThingManagement } from '@src/hooks/useThingManagement'
import { HEADER_HEIGHT } from '../Header/Header'
import { theme } from '@src/styling/theme'

// Fix for default marker icon in Leaflet with Webpack
const markerIcon2x = require('leaflet/dist/images/marker-icon-2x.png').default
const markerIcon = require('leaflet/dist/images/marker-icon.png').default
const markerShadow = require('leaflet/dist/images/marker-shadow.png').default

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

interface PostMapProps {
  thingManagement: ThingManagement
  isSidebarOpen: boolean
  isHorizontal?: boolean
}

const GoogleMapsWrapper = styled.div`
  height: 100%;
  width: calc(100% - ${theme.layout.sidebarWidth});
  flex-grow: 1;
`

const MapWrapper = styled.div<{ $isHorizontal?: boolean }>`
  height: calc(100vh - ${HEADER_HEIGHT}) !important;
  width: 100%;

  .leaflet-container {
    height: 100% !important;
    width: 100%;
    z-index: 1;
  }
`

const InfoBox = styled.div`
  min-width: 200px;
`

const InfoBoxTitle = styled.p`
  text-align: center;
  line-height: 22px;
  max-height: 46px;
  overflow: hidden;
  max-width: 200px;
`

const InfoBoxAttribute = styled.strong`
  display: inline-block;
  width: 50%;
  min-width: 50px;
`

const InfoBoxValue = styled.span`
  display: inline-block;
  width: 50%;
  min-width: 50px;
`

const InfoBoxActionBar = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const InfoBoxPostLink = styled.a`
  margin-top: 10px;
`

const InfoBoxLinkText = styled.span`
  margin-right: 10px;
`

const FakeLink = styled.span`
  cursor: pointer;
  text-decoration: underline;
`

const Star = styled.span<{ isSelected?: boolean }>`
  cursor: pointer;
  color: ${props => props.isSelected ? 'yellow!' : 'gray'} !important;

  background: #0000002e;
  border-radius: 100%;
  padding: 0 3px;
  color: yellow;
  margin: 0 4px 0 0;
`

const PostMap = ({
  thingManagement,
  isSidebarOpen,
  isHorizontal = false,
}: PostMapProps) => {
  const { focusedPost, mapZoom: defaultZoom, mapCenterCoordinates, postRatings, ratePost, projectWithContent } = thingManagement
  const postList = projectWithContent?.posts ?? []
  const defaultCenter = mapCenterCoordinates

  const mapRef = useRef<L.Map | null>(null)

  // Update map center when focusedPost changes
  useEffect(() => {
    if (mapRef.current && focusedPost?.data.addressInfo?.coordinates?.lat && focusedPost?.data.addressInfo?.coordinates?.lng) {
      mapRef.current.setView(
        [focusedPost.data.addressInfo.coordinates.lat, focusedPost.data.addressInfo.coordinates.lng],
        defaultZoom
      )
    }
  }, [focusedPost, defaultZoom, isHorizontal])

  // If sidebar is toggled, update map to avoid gray spots on the sides
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize()
    }
  }, [isSidebarOpen])

  const renderAttribute = (attribute: string, value: string | React.ReactNode) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} key={attribute}>
        <InfoBoxAttribute>{attribute}:</InfoBoxAttribute>
        <InfoBoxValue>{value}</InfoBoxValue>
      </div>
    )
  }

  const renderPostInfo = (post: ParsedPostWithUrl) => {
    const postRating = postRatings[post.url] ?? {}
    const stars = postRating.stars ?? 0
    const isSeen = postRating.isSeen ?? false
    const postInfos = Object.entries(post.data.genericInfo ? post.data.genericInfo : {}).map(
      ([attribute, value]) => renderAttribute(attribute, String(value))
    )
    const handleMarkAsSeen = (e: React.MouseEvent) => {
      e.stopPropagation()
      ratePost(post, { stars: stars, isSeen: true })
    }
    const handleStarClick = (index: number, e: React.MouseEvent) => {
      e.stopPropagation()
      ratePost(post, { stars: index + 1, isSeen: true })
    }

    return (
      <InfoBox>
        <InfoBoxTitle>{post.data.title}</InfoBoxTitle>
        <div>{postInfos}</div>
        {renderAttribute('Vērtējums', Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} onClick={(e) => handleStarClick(index, e)} isSelected={index < stars}>{index < stars ? '★' : '☆'}</Star>
        )))}
        {!isSeen && renderAttribute('Neapskatīts', <FakeLink onClick={(e) => handleMarkAsSeen(e)}>Marķēt kā apskatītu</FakeLink>)}
        <InfoBoxActionBar>
          <strong>{post.data.price}</strong>
          <InfoBoxPostLink
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <InfoBoxLinkText>
              {'Apskatīt'}
            </InfoBoxLinkText>
          </InfoBoxPostLink>
        </InfoBoxActionBar>
      </InfoBox>
    )
  }

  const renderPostMarker = (post: ParsedPostWithUrl) => {
    const coordinates = post.data.addressInfo && post.data.addressInfo.coordinates
    if (!coordinates || !post.url || !coordinates.lat || !coordinates.lng) {
      return null
    }

    return (
      <Marker key={post.url} position={[coordinates.lat, coordinates.lng]}>
        <Popup closeButton={true}>{renderPostInfo(post)}</Popup>
      </Marker>
    )
  }

  const renderPostMarkers = () => {
    return Object.values(postList).map(postEntry => {
      return renderPostMarker(postEntry)
    })
  }

  const mapCenter =
    focusedPost && focusedPost.data.addressInfo && focusedPost.data.addressInfo.coordinates && focusedPost.data.addressInfo.coordinates.lat && focusedPost.data.addressInfo.coordinates.lng
      ? { lat: focusedPost.data.addressInfo.coordinates.lat, lng: focusedPost.data.addressInfo.coordinates.lng }
      : defaultCenter

  return (
    <GoogleMapsWrapper>
      <MapWrapper $isHorizontal={isHorizontal}>
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={defaultZoom}
          zoomControl={true}
          scrollWheelZoom={true}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {renderPostMarkers()}
        </MapContainer>
      </MapWrapper>
    </GoogleMapsWrapper>
  )
}

export default PostMap
