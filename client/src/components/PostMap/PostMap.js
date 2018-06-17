// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'
import { GoogleMap, Marker, InfoWindow, withGoogleMap, withScriptjs } from 'react-google-maps'
import { compose, withStateHandlers } from 'recompose'
import './PostMap.scss'

// This component required GoogleMap setup/credential props
export default class PostMap extends Component {
    renderPostInfo(post) {
        const postInfos = Object
            .entries(post.genericInfo)
            .map(([attribute, value]) => {
                return (
                    <div key={attribute} className={this.getSkinnedElementClass('maps-info-box', 'entry')}>
                        <strong className={this.getSkinnedElementClass('maps-info-box', 'attribute')}>{attribute}:</strong>
                        <span className={this.getSkinnedElementClass('maps-info-box', 'value')}>{value}</span>
                    </div>
                )
            })

        return (
            <div className={this.getSkinnedBlockClass('maps-info-box')}>
                <p href="#" className={this.getSkinnedElementClass('maps-info-box', 'title')}>{post.title}</p>
                <div className={this.getSkinnedElementClass('maps-info-box', 'info-entries')}>
                    {postInfos}
                </div>
                <div className={this.getSkinnedElementClass('maps-info-box', 'action-bar')}>
                    <strong href="#" className={this.getSkinnedElementClass('maps-info-box', 'price')}>{post.price}</strong>
                    <a href={post.url} target="_blank" className={this.getSkinnedElementClass('maps-info-box', 'post-link')}>
                        <span className={this.getSkinnedElementClass('maps-info-box', 'link-text')}>
                            {"Apskatīt"}
                        </span>
                    </a>
                </div>
            </div>
        )
    }

    extendedPostClickHandler(props, post) {
        return (event = {}) => {
            event.post = post
            props.postToggleHandler(event)
        }
    }

    renderPostMarker(props, post) {
        const coordinates = post.addressInfo.coordinates
        if (!coordinates) {
            return null;
        }

        const isOpen = post.url in props ? props[post.url] : props.isOpen
        return (
            <Marker className={this.getSkinnedBlockClass('maps-marker')}
                key={post.url}
                onClick={this.extendedPostClickHandler(props, post)}
                position={coordinates}>
                { isOpen &&
                    <InfoWindow onCloseClick={this.extendedPostClickHandler(props, post)}>
                        {this.renderPostInfo(post)}
                    </InfoWindow>
                }
            </Marker>
        )
    }

    renderPostMarkers(props) {
        return Object.values(this.props.postList).map((postEntry) => {
            return this.renderPostMarker(props, postEntry)
        })
    }

    renderPostMap() {
        let initialState = {
            isOpen: false
        }

        const focusedPost = this.props.focusedPost
        if (focusedPost) {
            initialState = {
                ...initialState,
                [focusedPost.url]: true
            }
        }
        
        const composition = compose(
            withStateHandlers(
                () => (initialState),
                {
                    postToggleHandler: (state) => (event) => {
                        const post = event.post
                        const currentPostState = post.url in state ? state[post.url] : state.isOpen

                        return {
                            ...state,
                            [post.url]: !currentPostState
                        }
                    }
                }
            ),
            withScriptjs,
            withGoogleMap
        )

        return composition(props => {
            const focusedPost = this.props.focusedPost
            const mapCenter = focusedPost ? focusedPost.addressInfo.coordinates : this.props.defaultCenter

            return (
                <GoogleMap defaultCenter={mapCenter}
                defaultZoom={this.props.defaultZoom}>
                    {this.renderPostMarkers(props)}
                </GoogleMap>
            )
        })
    }

    shouldComponentUpdate(nextProps) {
        // Probably very inefficient
        const focusedPostChanged = JSON.stringify(this.props.focusedPost) !== JSON.stringify(nextProps.focusedPost)
        const postsChanged = JSON.stringify(this.props.postList) !== JSON.stringify(nextProps.postList)
        const mapCenterChanged = JSON.stringify(nextProps.defaultCenter) !== JSON.stringify(this.props.defaultCenter)

        return postsChanged || mapCenterChanged || focusedPostChanged
    }
    
	render() {
        const PostMap = this.renderPostMap()

        const Loading = <div style={{ height: `100%`, textAlign: "center"}}>{"Karte veras vaļā!"}</div>
        const Container = <div className={this.getSkinnedElementClass('google-maps', 'wrapper')}/>
        const Map = <div className={this.getSkinnedBlockClass('google-maps')} />

        const googleApiKey = this.props.googleApiKey
        const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&v=3.exp&libraries=geometry,drawing,places`

		return <PostMap googleMapURL={googleMapsUrl}
                    loadingElement={Loading}
                    containerElement={Container}
                    mapElement={Map}/>
	}
}
