import './Loader.css'

/**
 * Simple loader component to display animation when something is loading
 */
function Loader() {
	return (
		<div className="lds-ring">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	)
}

export default Loader
