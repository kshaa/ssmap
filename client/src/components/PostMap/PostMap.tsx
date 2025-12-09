import React, { useState, useEffect, useRef } from 'react'
import { useBemClassName } from '@src/hooks/useBemClassName'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './PostMap.scss'
import { PostList as PostListType, PostWithUI, Coordinates } from '@shared/post'

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
  postList: PostListType
  defaultCenter: Coordinates
  defaultZoom: number
  focusedPost: PostWithUI | null
  skin?: any
}

const PostMap = ({
  postList,
  defaultCenter,
  defaultZoom,
  focusedPost,
  skin = {},
}: PostMapProps) => {
  const { getSkinnedBlockClass, getSkinnedElementClass } = useBemClassName(skin)
  const mapRef = useRef<L.Map | null>(null)

  // Update map center when focusedPost changes
  useEffect(() => {
    if (mapRef.current && focusedPost?.addressInfo?.coordinates) {
      mapRef.current.setView(
        [focusedPost.addressInfo.coordinates.lat, focusedPost.addressInfo.coordinates.lng],
        defaultZoom
      )
    }
  }, [focusedPost, defaultZoom])

  const renderPostInfo = (post: PostWithUI) => {
    const postInfos = Object.entries(post.genericInfo ? post.genericInfo : {}).map(
      ([attribute, value]) => {
        return (
          <div key={attribute} className={getSkinnedElementClass('maps-info-box', 'entry')}>
            <strong className={getSkinnedElementClass('maps-info-box', 'attribute')}>
              {attribute}:
            </strong>
            <span className={getSkinnedElementClass('maps-info-box', 'value')}>
              {String(value)}
            </span>
          </div>
        )
      }
    )

    return (
      <div className={getSkinnedBlockClass('maps-info-box')}>
        <p className={getSkinnedElementClass('maps-info-box', 'title')}>{post.title}</p>
        <div className={getSkinnedElementClass('maps-info-box', 'info-entries')}>{postInfos}</div>
        <div className={getSkinnedElementClass('maps-info-box', 'action-bar')}>
          <strong className={getSkinnedElementClass('maps-info-box', 'price')}>{post.price}</strong>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className={getSkinnedElementClass('maps-info-box', 'post-link')}
          >
            <span className={getSkinnedElementClass('maps-info-box', 'link-text')}>
              {'Apskatīt'}
            </span>
          </a>
        </div>
      </div>
    )
  }

  const renderPostMarker = (post: PostWithUI) => {
    const coordinates = post.addressInfo && post.addressInfo.coordinates
    if (!coordinates || !post.url) {
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
    focusedPost && focusedPost.addressInfo && focusedPost.addressInfo.coordinates
      ? focusedPost.addressInfo.coordinates
      : defaultCenter

  return (
    <div className={getSkinnedBlockClass('google-maps')}>
      <MapContainer
        className={getSkinnedElementClass('google-maps', 'wrapper')}
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
    </div>
  )
}

export default PostMap
