import './Upload.css'
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import { Button } from '../components/Button'
import Loader from '../components/Loader'
import FileElem from '../components/FileElem'
import { useHistory } from 'react-router-dom'
import DocService from '../services/DocService'
import AnalysisService from '../services/AnalysisService'

/**
 * Upload page
 */
const Upload = ({ createFlashMessage }: UploadProps) => {
	const [file, setFile] = useState<File>()
	const [docs, setDocs] = useState<Doc[]>([])
	const [loading, setLoading] = useState(false)
	const history = useHistory()

	// load the file upload history from the user on page load
	useEffect(() => {
		console.log('getting docs..')
		DocService.getDocs()
			.then((docList) => {
				setDocs(docList)
			})
			.catch((err) => {
				console.log(err)
			})
	}, [])

	// Handler function for file upload
	function handleFile(event: ChangeEvent) {
		const fileList = (event.target as HTMLInputElement).files
		if (!fileList) return
		if (fileList.length > 1)
			createFlashMessage('Un fichier par analyse', 'warning')
		const file = fileList[0]
		// Check file extension
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

	// display all the files from the user's history
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

	// delete file from the database and thus the history
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

	// Start the analysis of the file
	async function analyse(event: MouseEvent<HTMLButtonElement>) {
		try {
			setLoading(true)

			DocService.uploadDoc(file)
				.then((data) => {
					console.log(data)
					createFlashMessage(
						'Fichier importé sur le serveur, analyse en cours ...',
						'success'
					)
				})
				.catch((err) => {
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

			// TODO check if analysis ok before changing page
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

type UploadProps = {
	createFlashMessage: (text: string, type: string) => void
}
export type Doc = {
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
