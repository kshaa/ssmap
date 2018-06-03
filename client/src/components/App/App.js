// eslint-disable-next-line
import React from 'react'
import Component from 's/components/Component/Component'
import Body from 's/components/Body/Body'
import Form from 's/components/Form/Form'
import Field from 's/components/Field/Field'

export default class App extends Component {
	render() {
		return (
			<div className={this.getSkinnedBlockClass('app')}>
				<Body>
					<Form formAction="/ss_parser" formMethod="get" skin={{centered: true, margin: true, padding: true}}>
						<Field fieldType="text"></Field>
					</Form>
				</Body>
			</div>
		);
	}
}
