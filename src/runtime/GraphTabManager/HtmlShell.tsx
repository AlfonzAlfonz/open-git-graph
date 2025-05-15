import { renderToStaticMarkup } from "react-dom/server";

interface Props {
	scriptUri: string;
	styleUri: string;
}

export const renderHtmlShell = (props: Props) =>
	renderToStaticMarkup(<Shell {...props} />);

const Shell = ({ scriptUri, styleUri }: Props) => (
	<html lang="en">
		<head>
			<meta charSet="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Graph</title>
			<link href={styleUri} rel="stylesheet" />
		</head>

		<body>
			<div id="root"></div>
			<script src={scriptUri.toString()}></script>
		</body>
	</html>
);
