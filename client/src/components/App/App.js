// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'
import Body from 's/components/Body/Body'
import PostForm from 's/components/PostForm/PostForm'
import PostList from 's/components/PostList/PostList'
import PostMap from 's/components/PostMap/PostMap'
import './App.scss'

export default class App extends Component {
	constructor(props) {
		super(props);

		const latviaZoom = 7
		const latviaCoordinates = {lat: 56.8796, lng: 24.6032}

		this.state = {
			postList: {},
			errorList: [],
			mapCenterCoordinates: latviaCoordinates,
			mapZoom: latviaZoom,
			focusedPost: null,
			isLandscape: true
		}

		this.handlePostResponse = this.handlePostResponse.bind(this)
		this.recheckLandscape = this.recheckLandscape.bind(this)
		this.focusPost = this.focusPost.bind(this)
		this.removePost = this.removePost.bind(this)
	}

	componentDidMount() {
		this.recheckLandscape()
		window.addEventListener('resize', this.recheckLandscape)
	}
	
	componentWillUnmount() {
		window.removeEventListener('resize', this.recheckLandscape)
	}

	recheckLandscape() {
		let isLandscape = false
		if (window.innerWidth > window.innerHeight) {
			isLandscape = true
		}

		let landscapeStatus = this.state.isLandscape
		if (landscapeStatus !== isLandscape) {
			this.setState({
				isLandscape
			})
		}
	}

	preparePost(postJson) {
		return {
			...postJson,
			isOpen: true
		}
	}

	removeError(removableErrorMessage) {
		const errorMessages = this.state.errorList;
		const newErrorMessages = errorMessages.filter((errorMessage) => {
			errorMessage !== removableErrorMessage
		})

		if (JSON.stringify(errorMessages) !== JSON.stringify(newErrorMessages)) {
			this.setState({
				errorList: newErrorMessages
			})
		}
	}

	addErrorMessage(errorMessage) {
		this.setState({
			errorList: [
				...this.state.errorList,
				errorMessage
			]
		})

		setTimeout(() => {
			this.removeError(errorMessage)
		}, 4000)
	}

	handlePostResponse(postJson) {
		if (!postJson ||
			(postJson && !postJson.status) ||
			(postJson.status && postJson.status === 'fail')) {
			const errorMessage = postJson && postJson.message || "Nu ir ziepes, kaut kas pavisam neizdevās. Atvaino!"
			this.addErrorMessage(errorMessage)

			return;
		}

		if (!postJson.addressInfo ||
			(!postJson.addressInfo.coordinates)) {
			const errorMessage = "Izskatās, ka šim sludinājumam nav adreses :("
			this.addErrorMessage(errorMessage)
	
			return;
		}

		const fondledPost = this.preparePost(postJson)
		this.setState({
			postList: {
				...this.state.postList,
				[postJson.url]: fondledPost,
			},
			focusedPost: fondledPost,
			mapZoom: 13
		})
	}

	removePost(removablePost) {
		return () => {
			const postList = this.state.postList
			const newPostList = {...postList} // ES6 clone (not sure this actually works)
			delete newPostList[removablePost.url]
	
			if (JSON.stringify(postList) !== JSON.stringify(newPostList)) {
				this.setState({
					postList: newPostList,
					focusedPost: null,
					mapZoom: 8
				})
			}	
		}
	}

	focusPost(post) {
		return () => {
			const focusedPost = {
				...post,
				// timestamp: +new Date() // Uncomment this to re-focus every click
			}
			
			this.setState({
				focusedPost,
				mapZoom: 13
			})
		}
	}

	render() {
		const googleApiKey = "AIzaSyAiGjOJdfqh3Wd2Se5RcTBiEM3UIgOvNK8"
		const landscapeClass = this.state.isLandscape ? 'horizontal' : 'vertical'

		return (
			<div className={this.getSkinnedBlockClass('app', null, {[landscapeClass]: true})}>
				<div className={this.getSkinnedElementClass('error', 'container')}>
					{this.state.errorList.length > 0 && this.state.errorList.map((errorMessage, index) => (
						<div key={index} className={this.getSkinnedBlockClass('error')}>
							<p className={this.getSkinnedElementClass('error', 'text')}>
								<span className={this.getSkinnedElementClass('error', 'icon')}>
									{'⚠'}
								</span>
								{errorMessage}
							</p>
						</div>
					))}
				</div>
				<Body className={this.getSkinnedBlockClass('body')}>
					<PostForm handlePostResponse={this.handlePostResponse} />
					<div className={this.getSkinnedBlockClass('info-wrapper', {[landscapeClass]: true})}>
						<PostList postList={this.state.postList}
							skin={{[landscapeClass]: true}}
							focusPost={this.focusPost}
							removePost={this.removePost}/>
						<PostMap postList={this.state.postList}
							googleApiKey={googleApiKey}
							defaultCenter={this.state.mapCenterCoordinates}
							defaultZoom={this.state.mapZoom}
							focusedPost={this.state.focusedPost}
							skin={{[landscapeClass]: true}}/>
					</div>
				</Body>
			</div>
		);
	}
}
