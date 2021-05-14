import { CSSProperties, useEffect, useState } from 'react'
import AnalysisService from '../services/AnalysisService'
import './Analysis.css'

const Analysis = ({ file, analysis }: AnalysisProps) => {
	const [sentences, setSentences] = useState<Sentence[]>()
	const [keywords, setKeywords] = useState<Keyword[]>([])
	const [sources, setSources] = useState<Source[]>([])
	const [sliceSource, setSliceSource] = useState({ start: 0, end: 20 })
	const [totalSources, setTotalSources] = useState(0)

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
				<div
					onClick={() => {
						setTotalSources(s.sources.length)
						setSources(s.sources.slice(0, 20))
					}}
					key={id}
				>
					<span> {id + 1} &nbsp;&nbsp;&nbsp;&nbsp; </span>
					<span
						className={
							s.sources.length != 0
								? 'sentence hoverSentence'
								: 'sentence'
						}
					>
						{content}
					</span>
				</div>
			)
		})
		return <>{sentenceElem}</>
	}

	function displayRefs() {
		let counter = 0
		const sentenceElems = sources?.map((s: Source, id: number) => {
			const content = s?._id
			const summary = s?.fields.FinFisconetDispSummary
			counter += 1
			return (
				<RefComponent
					nb={counter}
					title={content}
					key={s?._id}
					_id={s?._id}
					summary={summary}
				/>
			)
		})
		return (
			<>
				<div id="fileInfo">
					<div className="fileType">
						{' '}
						<p>PDF</p>{' '}
					</div>
					<span className="fileName">filename</span>
					<span className="nbRefs">
						{sources.length}/{totalSources} références affichées
					</span>
					<span className="nbRefs">X MB</span>
				</div>
				<div style={{ margin: '8px' }}>
					Cliquez sur le texte pour voir les références associées
				</div>
				{sentenceElems}
			</>
		)
	}

	return (
		<div id="analysisPageContent">
			<div id="docTitle">
				{title}
				<div id="docExtension">{'.' + extension}</div>
			</div>

			<div id="textRefWrapper">
				<div id="fileContent">{displayContent()}</div>
				<div id="referenceContainer">{displayRefs()}</div>
			</div>
		</div>
	)
}

const RefComponent = ({ nb, title, summary, _id }: any) => {
	const displayRefHTML = async (id: string) => {
		console.log(id)
		const rx = /.* - (\d{6})/g
		const idNum = id.slice(id.length - 6, id.length)
		console.log(idNum)
		await AnalysisService.getSource(idNum).then((data) => {
			console.log(data.htmlFile)
			const dataURI =
				'data:text/html;base64,' +
				btoa(unescape(encodeURIComponent(data.htmlFile)))
			const win = window.open()
			win?.document.write(
				'<iframe src="' +
					dataURI +
					'" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
			)
		})
	}

	const refComponent: CSSProperties = {
		margin: '8px',
		padding: '16px',

		backgroundColor: '#2F3142',
		boxShadow: '0px 0px 10px 0px #212330',

		cursor: 'pointer',
		borderRadius: '8px',
	}
	const refTitle = {}
	const refExtract = {}

	return (
		<div style={refComponent} onClick={() => displayRefHTML(_id)}>
			<div style={refTitle}>
				{nb}. {title}
			</div>
			<span style={refExtract}>{summary}</span>
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
	sources: Source[]
}

type Keyword = {
	keyword: string
	keywordEN: string
	language: string
	score: Number
}

type Source = {
	_id: string
	title: string
	fields: { FinFisconetDispSummary: string }
}

type AnalysisProps = {
	file: File
	analysis: AnalysisType
}

export default Analysis
