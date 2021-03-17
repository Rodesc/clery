import './Button.css';

type buttonProps = {
	value: any,
	style?: any
}


function Button({value, style}: buttonProps) {
	return (
		<button style={style}>{value}</button>
	)
}


export default Button
