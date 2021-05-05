import { CSSProperties, MouseEventHandler } from 'react'

type FlashMessagesComponent = {
	messages?: flashMessage[]
	deleteFlashMessage: (index: number) => void
}
const FlashMessages = ({
	messages,
	deleteFlashMessage,
}: FlashMessagesComponent) => {
	const Alerts = messages?.map((message: flashMessage, index: number) => {
		return (
			<Alert
				key={index}
				deleteFlashMessage={() => deleteFlashMessage(index)}
				message={message}
			/>
		)
	})

	return <div style={alertWrapperStyle}>{Alerts}</div>
}

type alertComponent = {
	message: flashMessage
	deleteFlashMessage: MouseEventHandler<HTMLImageElement>
}
const Alert = ({ message, deleteFlashMessage }: alertComponent) => {
	return (
		<div style={alertStyle} role="alert">
			<img
				src="img/trashbin.svg"
				onClick={deleteFlashMessage}
				style={{ position: 'absolute', right: '8px' }}
			/>
			{message.text}
		</div>
	)
}

const alertStyle: CSSProperties = {
	margin: '8px auto',
	padding: '16px',

	backgroundColor: '#656880',
	boxShadow: '0px 0px 10px 0px #212330',

	borderRadius: '8px',
}
const alertWrapperStyle: CSSProperties = {
	position: 'fixed',
	margin: '8px auto',
	top: '0',
	left: '50%',
	transform: 'translateX(-50%)',
	width: '400px',
}

export type flashMessage = {
	text: string
	type: string
}

export default FlashMessages
