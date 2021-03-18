import { useHistory } from 'react-router-dom';
import './Button.css';

type buttonProps = {
	value: string,
	style?: any,
	linkTo?: string
}

const Button = ({value, style}: buttonProps) => {
	return (
		<button style={style} >{value}</button>
	)
}

const LinkButton = ({value, style, linkTo}: buttonProps) => {
	let goTo:string;
	linkTo? goTo = linkTo : goTo = '';
	console.log(goTo)
	const history = useHistory()

	return (
		<button style={style} onClick={ () => history.push(goTo)}>{value}</button>
	)
}

export {
    Button,
    LinkButton
}