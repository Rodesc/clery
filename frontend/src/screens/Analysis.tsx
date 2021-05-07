import { CSSProperties, useEffect, useState } from 'react'
import './Analysis.css'

const Analysis = ({ file, analysis }: AnalysisProps) => {
	const [fileContent, setFileContent] = useState<string>()
	const [sentences, setSentences] = useState<Sentence[]>()
	const [keywords, setKeywords] = useState<Keyword[]>([])

	useEffect(() => {
		file.text().then((text) => setFileContent(text))
	}, [file])

	useEffect(() => {
		setSentences(analysis.sentences)
	}, [analysis])

	useEffect(() => {
		console.log(keywords)
	}, [keywords])

	const title = file.name.split('.').slice(0, -1).join('.')
	const extension = file.name.split('.').pop()

	function displayContent() {
		const sentenceElem = sentences?.map((s: Sentence, id: number) => {
			const content = s.sentence
			return (
				<div onClick={() => setKeywords(s.keywords)} key={id}>
					{content}
				</div>
			)
		})
		return <>{sentenceElem}</>
	}

	function displayRefs() {
		const sentenceElem = keywords?.map((k: Keyword, id: number) => {
			const content = k?.keyword
			return <RefComponent title={content} key={id} />
		})
		return <>{sentenceElem}</>
	}

	return (
		<div id="analysisPageContent">
			<div id="docTitle">
				{title}
				<div id="docExtension">{'.' + extension}</div>
			</div>

			<div id="textRefWrapper">
				<div id="fileContent">{displayContent()}</div>
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
					{displayRefs()}
					Ref2 ...
				</div>
			</div>
		</div>
	)
}

const RefComponent = ({ title }: any) => {
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
			<div style={refTitle}> {title} </div>
			<span style={refExtract}> ... lorem ipsum dolor sit amet ... </span>
		</div>
	)
}

type AnalysisType = {
	fileContent: string
	sentences: Sentence[]
}

type Sentence = {
	sentence: string
	keywords: Keyword[]
}

type Keyword = {
	keyword: string
	keywordEN: string
	language: string
	score: Number
}

type AnalysisProps = {
	file: File
	analysis: AnalysisType
}

export default Analysis
