import { CSSProperties, FunctionComponent, MouseEventHandler } from 'react';
import { useHistory } from 'react-router-dom';
import './Button.css';

type buttonProps = {
	value: string,
	style?: CSSProperties,
	linkTo?: string,
	inactive?:boolean,
	action?:MouseEventHandler
}

const Button = ({value, style, inactive}: buttonProps) => {
	return (
		<button style={style} >{value}</button>
	)
}

// const Button = ({value, style, inactive}: buttonProps) => {
// 	return (
// 		<button style={style} >{value}</button>
// 	)
// }

const LinkButton = ({value, style, linkTo, inactive}: buttonProps) => {
	let goTo:string;
	linkTo? goTo = linkTo : goTo = '';
	console.log(goTo)
	const history = useHistory()

	return (
		<button style={style} onClick={ () => history.push(goTo)}>{value}</button>
	)
}

const ActionButton = ({value, style, inactive, action}: buttonProps) => {
	return (
		<button onClick={action} style={style} >{value}</button>
	)
}

export {
    Button,
    LinkButton,
	ActionButton
}