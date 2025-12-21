import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Coordinates, ParsedPostWithUrl } from '@shared/post'

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
  postList: ParsedPostWithUrl[]
  defaultCenter: Coordinates
  defaultZoom: number
  focusedPost: ParsedPostWithUrl | null
  isHorizontal?: boolean
}

const GoogleMapsWrapper = styled.div`
  height: 100%;
  width: 100%;
`

const MapWrapper = styled.div<{ $isHorizontal?: boolean }>`
  height: 400px !important;
  width: 100%;

  ${props => props.$isHorizontal && `
    height: calc(100vh - 150px) !important;
  `}

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

const PostMap = ({
  postList,
  defaultCenter,
  defaultZoom,
  focusedPost,
  isHorizontal = false,
}: PostMapProps) => {
  const mapRef = useRef<L.Map | null>(null)

  // Update map center when focusedPost changes
  useEffect(() => {
    if (mapRef.current && focusedPost?.data.addressInfo?.coordinates?.lat && focusedPost?.data.addressInfo?.coordinates?.lng) {
      mapRef.current.setView(
        [focusedPost.data.addressInfo.coordinates.lat, focusedPost.data.addressInfo.coordinates.lng],
        defaultZoom
      )
    }
  }, [focusedPost, defaultZoom])

  const renderPostInfo = (post: ParsedPostWithUrl) => {
    const postInfos = Object.entries(post.data.genericInfo ? post.data.genericInfo : {}).map(
      ([attribute, value]) => {
        return (
          <div key={attribute}>
            <InfoBoxAttribute>
              {attribute}:
            </InfoBoxAttribute>
            <InfoBoxValue>
              {String(value)}
            </InfoBoxValue>
          </div>
        )
      }
    )

    return (
      <InfoBox>
        <InfoBoxTitle>{post.data.title}</InfoBoxTitle>
        <div>{postInfos}</div>
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
