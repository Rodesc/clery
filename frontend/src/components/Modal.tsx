import { CSSProperties } from 'react'

const Modal = ({ handleClose, show, children }: any) => {
	const disp = show ? { display: 'block' } : { display: 'none' }

	return (
		<div style={{ ...modalContainer, ...disp }} onClick={handleClose}>
			<div style={modal} onClick={(e) => e.stopPropagation()}>
				<img
					src="img/trashbin.svg"
					onClick={handleClose}
					style={{
						position: 'absolute',
						right: '12px',
						top: '16px',
					}}
				/>
				{children}
			</div>
		</div>
	)
}

const modalContainer: CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	height: '100vh',
	width: '100vw',
	zIndex: 2,
	background: 'rgba(120, 130, 150, 0.7)',
	display: 'flex',
	justifyContent: 'center',
}
const modal: CSSProperties = {
	zIndex: 3,
	position: 'relative',
	minWidth: '30vw',
	width: 'min-content',
	background: 'rgb(31, 29, 43)',
	margin: '0 auto',
	top: '45%',
	transform: 'translate(0, -50%)',
	padding: ' 32px',
	boxShadow: '0px 0px 10px 0px #212330',

	borderRadius: '8px',
}

export default Modal
