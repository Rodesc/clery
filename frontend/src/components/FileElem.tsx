import { CSSProperties } from 'react'
import DocService from '../services/DocService'

const FileElem = (props: {
	file_id: string
	type: string
	filename: string
	date: string
	fileSize: string
	deleteFile: Function
	customStyle?: CSSProperties
}) => {
	const date = new Date(props.date)
	async function downloadFile() {
		await DocService.download(props.file_id).then((dataURI) => {
			const win = window.open()
			win?.document.write(
				'<iframe src="' +
					dataURI +
					'" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
			)
		})
	}
	return (
		<div className="fileElem" style={props.customStyle}>
			<div className="fileType">
				{' '}
				<p>{props.type}</p>{' '}
			</div>
			<span className="fileName">{props.filename}</span>
			<span className="nbRefs">
				{`
				${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
				${date.getHours()}h${date.getMinutes()}
				`}
			</span>
			<img
				src="img/download.svg"
				onClick={() => downloadFile()}
				style={{
					padding: '36px 16px 36px 16px',
					height: '24px',
					cursor: 'pointer',
				}}
			/>
			<img
				src="img/trashbin.svg"
				onClick={() => props.deleteFile(props.file_id)}
				style={{
					padding: '32px 24px 32px 16px',
					height: '32px',
					cursor: 'pointer',
				}}
			/>
		</div>
	)
}

export default FileElem
