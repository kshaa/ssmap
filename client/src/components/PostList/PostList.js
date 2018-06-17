// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'
import './PostList.scss'

export default class PostList extends Component {
    renderPost(post) {
        return (
            <div className={this.getSkinnedBlockClass('post')} key={post.url} onClick={this.props.focusPost(post)}>
                <div className={this.getSkinnedElementClass('post', 'title')}>
                    {post.title}
                </div>
                <div className={this.getSkinnedElementClass('post', 'action-bar')}>
                    <div className={this.getSkinnedElementClass('post', 'price')}>
                        <strong>Cena: </strong>
                        <span>{post.price}</span>
                    </div>
                    <button className={this.getSkinnedElementClass('post', 'remove')} onClick={this.props.removePost(post)}>
                        {"✖"}
                    </button>
                </div>
            </div>
        )
    }
    
	render() {
        const posts = Object.values(this.props.postList).map((postEntry) => {
            return this.renderPost(postEntry)
        })
        const postListSkin = {
            centered: true,
            margin: true,
            padding: true
        }

		return (
			<div className={this.getSkinnedBlockClass('post-list', postListSkin)}>
                <div className={this.getSkinnedElementClass('post-list', 'title')}>
                    <strong>{"Sludinājumi"}</strong>
                </div>
                <div className={this.getSkinnedElementClass('post-list', 'content')}>
                    {posts.length === 0 &&
                        <div>
                            <p>... Tukšums!</p>
                        </div>
                    }
                    {posts.length > 0 && posts}
                </div>
			</div>
		);
	}
}
