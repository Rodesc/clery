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
		setSentences(analysis?.sentences)
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
						setTotalSources(s.sources?.length)
						setSources(
							s.sources?.slice(sliceSource.start, sliceSource.end)
						)
					}}
					key={id}
				>
					<span> {id + 1} &nbsp;&nbsp;&nbsp;&nbsp; </span>
					<span
						className={
							s.sources?.length != 0
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
			const type = s?.fields.FinFisconetDocumentType_FR
			const date = s?.fields.FinFisconetDocumentDate
			counter += 1
			return (
				<RefComponent
					nb={counter}
					title={content}
					key={s?._id}
					type={type}
					date={date}
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
						{sources?.length}/{totalSources} références affichées
					</span>
				</div>
				<div id="filtering">
					<div>page 1</div>
					<div>Type</div>
					<div>Date</div>
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

const RefComponent = ({ nb, title, summary, type, date, _id }: any) => {
	const displayRefHTML = async (id: string) => {
		const idNum = id.slice(id.length - 6, id.length)
		console.log(idNum)
		await AnalysisService.getSource(idNum).then((data) => {
			const dataURI =
				'data:text/html;charset=utf-8,' +
				encodeURIComponent(data.htmlFile)
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

		overflow: 'hidden',
		cursor: 'pointer',
		borderRadius: '8px',
	}
	const refTitle: CSSProperties = {
		whiteSpace: 'nowrap',

		display: 'flex',
		flexDirection: 'row',
	}
	const dateStyle: CSSProperties = {
		position: 'absolute',
		right: '8px',
	}

	const refExtract = {}

	return (
		<div style={refComponent} onClick={() => displayRefHTML(_id)}>
			<div style={refTitle}>
				{nb}. <div>{title}</div> <div>{date}</div>
			</div>
			<span style={refExtract}>{summary}</span>
			<div>Type: {type}</div>
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
	fields: {
		FinFisconetDispSummary: string
		FinFisconetDocumentDate: string
		FinFisconetDocumentType_FR: string
	}
}

type AnalysisProps = {
	file: File
	analysis: AnalysisType
}

export default Analysis
