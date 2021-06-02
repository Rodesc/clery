import { relative } from 'node:path'
import { CSSProperties, useEffect, useState } from 'react'
import AnalysisService from '../services/AnalysisService'
import './Analysis.css'

/**
 * Analysis page
 */
const Analysis = ({ file, analysis }: AnalysisProps) => {
	const SPP = 10 // sources per page
	const [sentences, setSentences] = useState<Sentence[]>()
	const [keywords, setKeywords] = useState<Keyword[]>([])
	const [sources, setSources] = useState<Source[]>([])
	const [pagenum, setPagenum] = useState(0)
	const [dateDesc, setDateDesc] = useState(true)
	const [totalSources, setTotalSources] = useState(0)
	const [docType, setDocType] = useState('')
	const [types, setTypes] = useState<string[]>([])

	// set file content on page load
	useEffect(() => {
		setSentences(analysis?.sentences)
	}, [analysis])

	// collect types for sources
	useEffect(() => {
		const typeList: string[] = []
		sources.forEach((s: Source) => {
			if (typeList.indexOf(s.fields.FinFisconetDocumentType_FR) === -1) {
				typeList.push(s.fields.FinFisconetDocumentType_FR)
			}
		})

		setTypes(typeList.filter((x) => x))
	}, [sources])

	// sort based on date
	useEffect(() => {
		setPagenum(0)
		setSources(
			sources.slice(0).sort((a: Source, b: Source) => {
				const dateA = new Date(
					a.fields.FinFisconetDocumentDate
				).getTime()
				const dateB = new Date(
					b.fields.FinFisconetDocumentDate
				).getTime()
				return !dateDesc ? dateA - dateB : dateB - dateA
			})
		)
	}, [dateDesc])

	const title = file.name.split('.').slice(0, -1).join('.')
	const extension = file.name.split('.').pop()

	// display all sentences
	function displayContent() {
		const sentenceElem = sentences?.map((s: Sentence, id: number) => {
			const content = s.sentence

			return (
				<div
					onClick={() => {
						setTotalSources(s.sources?.length)
						setSources(s.sources)
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

	const deleteRef = (index: number) => {
		setTotalSources(totalSources - 1)
		setSources(sources.slice(0).filter((e) => sources.indexOf(e) !== index))
	}

	function displayRefs() {
		let counter = 0
		let visibleSources = [...sources].filter((s: Source) =>
			docType == ''
				? true
				: s.fields.FinFisconetDocumentType_FR == docType
		)
		const totalVisible = visibleSources.length
		visibleSources = visibleSources.slice(
			pagenum * SPP,
			pagenum * SPP + SPP
		)

		const sourceElems = visibleSources?.map((s: Source, id: number) => {
			const title = s?.fields.Title
			const summary = s?.fields.FinFisconetDispSummary
			const type = s?.fields.FinFisconetDocumentType_FR
			const date = s?.fields.FinFisconetDocumentDate
			counter += 1
			return (
				<RefComponent
					nb={counter + pagenum * SPP}
					title={title}
					key={id}
					type={type}
					date={date}
					_id={s?._id}
					summary={summary}
					deleteRef={deleteRef}
				/>
			)
		})
		console.log(sourceElems)
		const handleType = (event: React.FormEvent<HTMLSelectElement>) => {
			setDocType(event.currentTarget.value)
		}

		const typeOptions = types.map((s: string, id: number) => {
			return (
				<option value={s} key={s}>
					{s}
				</option>
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
					<span className="nbRefs">{totalVisible} références</span>
				</div>
				<div
					id="filtering"
					style={sources.length != 0 ? {} : { display: 'none' }}
				>
					<div>
						<img
							src="img/right-arrow.svg"
							className="reverse"
							onClick={() => setPagenum(Math.max(pagenum - 1, 0))}
							alt=""
						/>
						page {pagenum + 1}
						<img
							src="img/right-arrow.svg"
							onClick={() =>
								setPagenum(
									Math.min(
										pagenum + 1,
										Math.floor(totalVisible / SPP)
									)
								)
							}
							alt=""
						/>
					</div>
					<select id="type" name="type" onChange={handleType}>
						<option value="">Tous types</option>
						{typeOptions}
					</select>
					<div onClick={() => setDateDesc(!dateDesc)}>
						Date
						<img
							src="img/right-arrow.svg"
							className={dateDesc ? 'down' : 'up'}
							alt=""
						/>
					</div>
				</div>
				<div style={{ margin: '8px' }}>
					Cliquez sur le texte pour voir les références associées
				</div>
				{sourceElems}
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

/**
 * Reference component
 */
const RefComponent = ({
	nb,
	title,
	summary,
	type,
	date,
	_id,
	deleteRef,
}: any) => {
	const DATE = new Date(date)
	const months = [
		'Janvier',
		'Février',
		'Mars',
		'Avril',
		'Mai',
		'Juin',
		'Juillet',
		'Août',
		'Septembre',
		'Octobre',
		'Novembre',
		'Décembre',
	]
	const formatDate = months[DATE.getMonth()] + ' ' + DATE.getFullYear()

	/**
	 * Open reference in new tab
	 */
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
		position: 'relative',
		margin: '8px',
		padding: '16px',

		backgroundColor: '#2F3142',
		boxShadow: '0px 0px 10px 0px #212330',

		overflow: 'hidden',
		cursor: 'pointer',
		borderRadius: '8px',
	}

	const refTitle: CSSProperties = {
		width: '95%',
		marginBottom: '8px',
		fontWeight: 'bold',

		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		backgroundImage: 'linear-gradient(to right, #fff 95%, rgba(0,0,0,0))',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',

		display: 'flex',
		flexDirection: 'row',
	}
	const dateStyle: CSSProperties = {
		position: 'relative',
		right: '0px',
	}

	const refExtract = {}

	return (
		<div style={refComponent}>
			<div>
				<div style={refTitle} className="refTitle">
					{nb}. <div>{title}</div>
				</div>
				<img
					src="img/trashbin.svg"
					onClick={() => deleteRef(nb - 1)}
					style={{ position: 'absolute', right: '8px', top: '8px' }}
				/>
			</div>
			<span style={refExtract} onClick={() => displayRefHTML(_id)}>
				{summary}
			</span>
			<div>Type: {type}</div> <div style={dateStyle}>{formatDate}</div>
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
		Title: string
	}
}

type AnalysisProps = {
	file: File
	analysis: AnalysisType
}

export default Analysis
