import React from 'react'
import { render } from 'react-dom'
import 'normalize.css'
import App from 's/components/App/App'
import registerServiceWorker from './registerServiceWorker'

render(
	<App/>,
	document.getElementById('root')
);
registerServiceWorker();
