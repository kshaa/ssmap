import React from 'react';
import {
	render
} from 'react-dom';
import App from './components/App/App';
import 'normalize.css';

render(
	<App skin={{ isRoot: true }}/>,
	document.getElementById('root')
);
