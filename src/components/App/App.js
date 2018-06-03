import React, {
	Component
} from 'react';
import Body from 's/components/Body/Body';
import Form from 's/components/Form/Form';
import Field from 's/components/Field/Field';

export default class App extends Component {
	render() {
		return (
			// Add your component markup and other subcomponent references here.
			<Body>
				<Form formAction="/ss_parser" formMethod="get">
					<Field fieldType="text"></Field>
				</Form>
			</Body>
		);
	}
}
