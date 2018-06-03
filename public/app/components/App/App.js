import React, {
	Component
} from 'react';
import Body from '../Body/Body';
import Form from '../Form/Form';
import Field from '../Field/Field';

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
