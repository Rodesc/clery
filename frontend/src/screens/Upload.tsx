import './Upload.css'
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import { Button } from '../components/Button'
import Loader from '../components/Loader'
import { useHistory } from 'react-router-dom'
import DocService from '../services/DocService'
import AnalysisService from '../services/AnalysisService'

const Upload = ({ createFlashMessage }: UploadProps) => {
	const [file, setFile] = useState<File>()
	const [docs, setDocs] = useState<Doc[]>([])
	const [loading, setLoading] = useState(false)
	const history = useHistory()

	useEffect(() => {
		// load docs
		DocService.getDocs()
			.then((docList) => {
				console.log('docList')
				console.log(docList)
				setDocs(docList)
			})
			.catch((err) => {
				console.log(err)
			})
	}, [])

	function handleFile(event: ChangeEvent) {
		const fileList = (event.target as HTMLInputElement).files
		if (!fileList) return
		if (fileList.length > 1)
			createFlashMessage('Only 1 file per analysis', 'warning')
		const file = fileList[0]
		setFile(file)
	}

	function displayDocs() {
		const documentElements = docs?.map((doc: Doc, index: number) => {
			const filetype = doc.metadata.originalname.split('.').pop()
			return (
				<FileElem
					key={doc._id}
					file_id={doc._id}
					type={filetype}
					filename={doc.metadata.originalname}
					fileSize={doc.chunkSize.toString()}
					date={doc.uploadDate}
					deleteFile={deleteFile}
				/>
			)
		})
		return <>{documentElements}</>
	}

	async function deleteFile(id: string) {
		// TODO await DocService.deleteFile(id)
		createFlashMessage('File deleted', 'success')
		setDocs(docs?.filter((e: Doc) => e._id !== id))
	}

	async function analyse(event: MouseEvent<HTMLButtonElement>) {
		try {
			setLoading(true)

			await DocService.uploadDoc(file).catch((err) => {
				createFlashMessage("File wasn't saved in the DB", 'warning')
				console.log(err)
			})

			await AnalysisService.analyse(file).catch((err) => {
				createFlashMessage("Couldn't analyse", 'warning')
				console.log(err)
			})

			setLoading(false)

			//check if analysis ok before changing page
			history.push({
				pathname: '/analysis',
				state: { file: file },
			})
		} catch (err) {
			createFlashMessage('An error occured', 'error')
			console.log(err)
		}
	}

	return (
		<div id="uploadPageContent">
			<div className="uploadSection">
				<h2>
					Importez un document et trouvez les références juridiques
					automatiquement.
				</h2>
				<p>Formats acceptés: .pdf, .docx, .txt</p>
				<div className="uploadWrapper">
					<label htmlFor="fileField" className="uploadBox">
						<div className="verticalCenter">
							<img
								src="img/upload.svg"
								className={file ? 'green' : ''}
								alt=""
							/>
							<br />
							<span>Importer un document</span>
						</div>
						<input
							type="file"
							id="fileField"
							onChange={handleFile}
						/>
					</label>

					<div className="uploadInfo">
						<div className="fileName">
							{file ? file.name : "En attente d'un document..."}
						</div>
						<div className="formatInfo">
							{file
								? 'Format: ' + file.type
								: 'Formats acceptés: .pdf, .docx, .txt'}
						</div>
						<div className="lastModif">
							{' '}
							<img src="img/time.svg" alt="" /> modifié le:{' '}
							{file ? file.lastModified : '...'}
						</div>
						<div className="fileSize">
							{' '}
							<img src="img/doc.svg" alt="" />{' '}
							{file ? file.size : '...'} b
						</div>
						{file ? (
							loading ? (
								<Loader />
							) : (
								<Button
									value="Analyser"
									customStyle={{
										width: '100%',
										height: '48px',
									}}
									action={analyse}
								/>
							)
						) : (
							<Button
								value="En attente d'un document..."
								inactive={true}
								customStyle={{ width: '100%', height: '48px' }}
							/>
						)}
					</div>
				</div>
			</div>
			<div className="historySection">
				<div className="historyWrapper">
					<h1>Derniers documents</h1>
					{docs.length != 0 ? (
						displayDocs()
					) : (
						<>Vous n&apos;avez pas encore importé de document</>
					)}
				</div>
			</div>
		</div>
	)
}

const FileElem = (props: {
	file_id: string
	type: string
	filename: string
	date: string
	fileSize: string
	deleteFile: Function
}) => {
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
		<div className="fileElem">
			<div className="fileType">
				{' '}
				<p>{props.type}</p>{' '}
			</div>
			<span className="fileName">{props.filename}</span>
			<span className="nbRefs">{props.date}</span>
			<Button value="Télécharger" action={downloadFile} />
			<img
				src="img/trashbin.svg"
				onClick={() => props.deleteFile(props.file_id)}
				style={{ padding: '32px 32px 32px 23px', height: '32px' }}
			/>
		</div>
	)
}

type UploadProps = {
	createFlashMessage: (text: string, type: string) => void
}
type Doc = {
	_id: string
	length: BigInteger
	chunkSize: BigInteger
	uploadDate: string
	filename: string
	md5: string
	contentType: string
	metadata: any
}

export default Upload
