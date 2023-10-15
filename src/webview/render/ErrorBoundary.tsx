import { Component, ErrorInfo, ReactNode } from "react";

export class ErrorBoundary extends Component<
	{
		children?: ReactNode;
		fallback?: ReactNode;
		handle: (error: Error, errorInfo: ErrorInfo) => void;
	},
	{ threw: boolean }
> {
	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		this.setState({ threw: true });
		this.props.handle(error, errorInfo);
	}

	render() {
		return <>{!this.state.threw ? this.props.fallback : this.props.children}</>;
	}
}
