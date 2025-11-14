import React, { useState, useEffect } from 'react';
import { useBemClassName } from 's/hooks/useBemClassName';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import './PostMap.scss';
import { PostList as PostListType, PostWithUI, Coordinates } from '@shared/types';

interface PostMapProps {
    postList: PostListType;
    googleApiKey: string;
    defaultCenter: Coordinates;
    defaultZoom: number;
    focusedPost: PostWithUI | null;
    skin?: any;
}

const PostMap = ({ 
    postList, 
    googleApiKey, 
    defaultCenter, 
    defaultZoom, 
    focusedPost,
    skin = {}
}: PostMapProps) => {
    const [openMarkers, setOpenMarkers] = useState<{ [key: string]: boolean }>({});
    const { getSkinnedBlockClass, getSkinnedElementClass } = useBemClassName(skin);

    useEffect(() => {
        if (focusedPost && focusedPost.url) {
            setOpenMarkers(prev => ({
                ...prev,
                [focusedPost.url!]: true
            }));
        }
    }, [focusedPost]);

    const toggleMarker = (url: string) => {
        setOpenMarkers(prev => ({
            ...prev,
            [url]: !prev[url]
        }));
    };

    const renderPostInfo = (post: PostWithUI) => {
        const postInfos = Object
            .entries(post.genericInfo ? post.genericInfo : {})
            .map(([attribute, value]) => {
                return (
                    <div key={attribute} className={getSkinnedElementClass('maps-info-box', 'entry')}>
                        <strong className={getSkinnedElementClass('maps-info-box', 'attribute')}>{attribute}:</strong>
                        <span className={getSkinnedElementClass('maps-info-box', 'value')}>{value}</span>
                    </div>
                );
            });

        return (
            <div className={getSkinnedBlockClass('maps-info-box')}>
                <p className={getSkinnedElementClass('maps-info-box', 'title')}>{post.title}</p>
                <div className={getSkinnedElementClass('maps-info-box', 'info-entries')}>
                    {postInfos}
                </div>
                <div className={getSkinnedElementClass('maps-info-box', 'action-bar')}>
                    <strong className={getSkinnedElementClass('maps-info-box', 'price')}>{post.price}</strong>
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className={getSkinnedElementClass('maps-info-box', 'post-link')}>
                        <span className={getSkinnedElementClass('maps-info-box', 'link-text')}>
                            {"Apskatīt"}
                        </span>
                    </a>
                </div>
            </div>
        );
    };

    const renderPostMarker = (post: PostWithUI) => {
        const coordinates = post.addressInfo && post.addressInfo.coordinates;
        if (!coordinates || !post.url) {
            return null;
        }

        const isOpen = openMarkers[post.url] || false;

        return (
            <Marker
                key={post.url}
                position={coordinates}
                onClick={() => toggleMarker(post.url!)}
            >
                {isOpen && (
                    <InfoWindow onCloseClick={() => toggleMarker(post.url!)}>
                        <>{renderPostInfo(post)}</>
                    </InfoWindow>
                )}
            </Marker>
        );
    };

    const renderPostMarkers = () => {
        return Object.values(postList).map((postEntry) => {
            return renderPostMarker(postEntry);
        });
    };

    const mapCenter = (focusedPost && focusedPost.addressInfo && focusedPost.addressInfo.coordinates) 
        ? focusedPost.addressInfo.coordinates 
        : defaultCenter;

    return (
        <div className={getSkinnedBlockClass('google-maps')}>
            <LoadScriptWrapper apiKey={googleApiKey}>
                <GoogleMap
                    mapContainerClassName={getSkinnedElementClass('google-maps', 'wrapper')}
                    center={mapCenter}
                    zoom={defaultZoom}
                    options={{
                        zoomControl: true,
                        mapTypeControl: false,
                        scaleControl: false,
                        streetViewControl: false,
                        rotateControl: false,
                        fullscreenControl: true
                    }}
                >
                    {renderPostMarkers()}
                </GoogleMap>
            </LoadScriptWrapper>
        </div>
    );
};

export default PostMap;

// Helper component to load Google Maps script
const LoadScriptWrapper = ({ apiKey, children }: { apiKey: string, children: React.ReactNode }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey,
        libraries: ['geometry', 'drawing', 'places'] as any
    });

    if (loadError) {
        return <div style={{ height: '100%', textAlign: 'center' }}>Kļūda ielādējot karti</div>;
    }

    if (!isLoaded) {
        return <div style={{ height: '100%', textAlign: 'center' }}>Karte veras vaļā!</div>;
    }

    return <>{children}</>;
};
