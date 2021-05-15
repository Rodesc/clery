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
		console.log('getting docs..')
		DocService.getDocs()
			.then((docList) => {
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
		if (
			['pdf', 'doc', 'docx', 'txt'].includes(
				file?.name.split('.').pop() || ''
			)
		) {
			if (file.name.split('.').pop() == 'pdf') {
				createFlashMessage(
					'Les fichiers au format pdf ne sont pas toujours bien déchifrés',
					'warning'
				)
			}
			setFile(file)
			return
		}
		createFlashMessage('Type de fichier non supporté', 'warning')
	}

	function displayDocs() {
		const documentElements = docs
			?.slice(0)
			.reverse()
			.map((doc: Doc) => {
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
		const isDel = await DocService.deleteDoc(id)

		if (!isDel) {
			console.log('Problème lors de la suppression du fichier')
			createFlashMessage(
				'Problème lors de la suppression du fichier',
				'success'
			)
			return
		}
		createFlashMessage('Document supprimé', 'success')
		setDocs(docs?.filter((e: Doc) => e._id !== id))
	}

	async function analyse(event: MouseEvent<HTMLButtonElement>) {
		try {
			setLoading(true)

			DocService.uploadDoc(file).catch((err) => {
				createFlashMessage(
					"Le document n'est pas sauvegardé dans la base de donnée",
					'error'
				)
				console.log(err)
			})

			const analysisResponse = await AnalysisService.analyse(file).catch(
				(err) => {
					createFlashMessage(
						"une erreur est survenue lors de l'analyse",
						'error'
					)
					console.log(err)
				}
			)

			setLoading(false)

			//check if analysis ok before changing page
			history.push({
				pathname: '/analysis',
				state: { file: file, analysis: analysisResponse },
			})
		} catch (err) {
			createFlashMessage('Une erreur est survenue', 'error')
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
				<p>Formats acceptés: .pdf, .doc, .docx, .txt</p>
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
								? 'Format: ' + file.name.split('.').pop()
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
		<div className="fileElem">
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
