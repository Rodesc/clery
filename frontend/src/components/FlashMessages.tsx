import { CSSProperties, MouseEventHandler } from 'react'

/**
 * FlashMessages component
 * This component is the wrapper for the different Alert components that are displayed
 */
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

/**
 * Alert component: single flashmessage
 */
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

type FlashMessagesComponent = {
	messages?: flashMessage[]
	deleteFlashMessage: (index: number) => void
}

type alertComponent = {
	message: flashMessage
	deleteFlashMessage: MouseEventHandler<HTMLImageElement>
}

export type flashMessage = {
	text: string
	type: string
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

export default FlashMessages
