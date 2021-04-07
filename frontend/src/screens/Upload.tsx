import './Upload.css'
import { ChangeEvent, MouseEvent, useState } from 'react'
import { Button } from '../components/Button';
import { useHistory } from 'react-router-dom';

const Upload = ({ createFlashMessage }: UploadProps) => {
	const [file, setFile] = useState<File>()
	const history = useHistory()

	function handleFile(event: ChangeEvent) {
		let fileList = (event.target as HTMLInputElement).files;
		if (!fileList) return;
		if (fileList.length > 1) createFlashMessage('Only 1 file per analysis', 'warning');
		let file = fileList[0]
		setFile(file)
	}
	
	function analyse(event: MouseEvent<HTMLButtonElement>){
		history.push({
			pathname: '/analysis',
			state: {file: file}
		})
	}
	

	return (
		<div id='uploadPageContent'>
			<div className='uploadSection'>
				<h2>Importez un document et trouvez les références juridiques automatiquement.</h2>
				<p>Formats acceptés: .pdf, .docx, .txt</p>
				<div className='uploadWrapper'>
					<label htmlFor="fileField" className='uploadBox'>
						<div className='verticalCenter'>
							<img src='img/upload.svg' className={file?'green':''} alt=''/><br/>
							<span>Importer un document</span>
						</div>
						<input 
							type="file" 
							id="fileField"
							onChange={handleFile}/>
					</label>
					
					
					<div className='uploadInfo'>
						<div className='fileName'>{file?file.name:'En attente d\'un document...'}</div>
						<div className='formatInfo'>{file?'Format: '+file.type:'Formats acceptés: .pdf, .docx, .txt'}</div>
						<div className='lastModif'> <img src='img/time.svg' alt=''/> modifié le: {file?file.lastModified:'...'}</div>
						<div className='fileSize'> <img src='img/doc.svg' alt=''/> {file?file.size:'...'} b</div>
						{file?
							<Button value='Analyser' customStyle={{width:'100%',height:'48px'}} action={analyse}/>
							:<Button value="En attente d'un document..." inactive={true} customStyle={{width:'100%',height:'48px'}} />
						}
					</div>
				</div>
			</div>
			<div className='historySection'>
				<div className='historyWrapper'> 	
					<h1>Derniers documents</h1> 
					<FileElem />
					<FileElem />
					<FileElem />
					<FileElem />
				</div>

			</div>
		</div>
	)
}

const FileElem = () => {
	return (
		<div className='fileElem'>
			<div className='fileType'> <p>PDF</p> </div>
			<span className='fileName'>filename</span>
			<span className='nbRefs'>X references</span>
			<span className='nbRefs' >X MB</span>
			<div>ToolPallette</div>
		</div>
	)
}

type UploadProps = {
	createFlashMessage: (text: string, type: string) => void
}



export default Upload
