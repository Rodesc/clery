import { CSSProperties, useEffect, useState } from 'react'
import './Analysis.css'

type AnalysisProps = {
	file: File
}

const Analysis = ({ file }: AnalysisProps) => {
	const [fileContent, setFileContent] = useState<string>()

	useEffect(() => {
		file.text().then((text) => setFileContent(text))
	}, [file])

	const title = file.name.split('.').slice(0, -1).join('.')
	const extension = file.name.split('.').pop()

	return (
		<div id="analysisPageContent">
			<div id="docTitle">
				{title}
				<div id="docExtension">{'.' + extension}</div>
			</div>

			<div id="textRefWrapper">
				<div id="fileContent">{fileContent}</div>
				<div id="referenceContainer">
					<div id="fileInfo">
						<div className="fileType">
							{' '}
							<p>PDF</p>{' '}
						</div>
						<span className="fileName">filename</span>
						<span className="nbRefs">X references</span>
						<span className="nbRefs">X MB</span>
					</div>
					<RefComponent />
					Ref2 ...
				</div>
			</div>
		</div>
	)
}

const RefComponent = () => {
	const refComponent: CSSProperties = {
		margin: '8px',
		padding: '16px',

		backgroundColor: '#2F3142',
		boxShadow: '0px 0px 10px 0px #212330',

		borderRadius: '8px',
	}
	const refTitle = {}
	const refExtract = {}

	return (
		<div style={refComponent}>
			<div style={refTitle}> Title </div>
			<span style={refExtract}> ... lorem ipsum dolor sit amet ... </span>
		</div>
	)
}
export default Analysis
