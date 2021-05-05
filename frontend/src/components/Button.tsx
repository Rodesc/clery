import {
	CSSProperties,
	FunctionComponent,
	MouseEventHandler,
	MouseEvent,
} from 'react'
import { useHistory } from 'react-router-dom'

const Button = ({ value, customStyle, inactive, action }: buttonProps) => {
	const style = {
		...baseBtnStyle,
		...customStyle,
	}
	return (
		<button style={style} type="button" onClick={action}>
			{value}
		</button>
	)
}

const LinkButton = ({ value, customStyle, linkTo, inactive }: buttonProps) => {
	let goTo: string
	linkTo ? (goTo = linkTo) : (goTo = '')
	const style = {
		...baseBtnStyle,
		...customStyle,
	}
	const history = useHistory()

	return (
		<button style={style} type="button" onClick={() => history.push(goTo)}>
			{value}
		</button>
	)
}

type buttonProps = {
	value: string
	customStyle?: CSSProperties
	linkTo?: string
	inactive?: boolean
	action?: MouseEventHandler<HTMLButtonElement>
}

const baseBtnStyle: CSSProperties = {
	margin: 'auto 0',
	cursor: 'pointer',

	/*shape*/
	width: '128px',
	height: '80%',
	borderRadius: ' 8px',
	border: 'none',

	/*decoration*/
	background: 'linear-gradient(#6667FF, #2698EA)',
	color: 'white',
	fontSize: 'inherit',
}

export { Button, LinkButton }
