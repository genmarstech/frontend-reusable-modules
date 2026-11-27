import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router";
import { WiltedArt } from "./Illustrations";
import { LogoMark } from "./Brand";

type Props = { children: ReactNode; resetKey?: string };
type State = { error: Error | null };

/** After a new release, old page files are gone and lazy pages fail to load. A reload fixes it. */
function isStaleBuild(error: Error) {
    return /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|Loading chunk/i.test(
        error.message
    );
}

/**
 * Catches a crash anywhere below it and shows a calm, branded message instead of a blank page.
 * Moving to another page (a new resetKey) clears it.
 */
class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Velora hit an error", error, info.componentStack);
    }

    componentDidUpdate(previous: Props) {
        if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null });
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        const stale = isStaleBuild(error);
        return (
            <main className="v-status-page" role="alert">
                <a href="/" className="v-status-brand" aria-label="Velora home">
                    <LogoMark />
                    velora<span>.</span>
                </a>
                <div className="v-status-art">
                    <WiltedArt />
                </div>
                <h1>{stale ? "Velora has been updated" : "Something went wrong"}</h1>
                <p>
                    {stale
                        ? "A newer version is ready. Reload the page to carry on where you left off."
                        : "Sorry, this page did not load properly. Reloading usually fixes it. If it keeps happening, let us know."}
                </p>
                <div className="v-status-actions">
                    <button type="button" className="v-btn" onClick={() => window.location.reload()}>
                        Reload page
                    </button>
                    <a href="/" className="v-btn v-btn-ghost">
                        Go to the home page
                    </a>
                </div>
            </main>
        );
    }
}

/** A crash on one page clears itself once you move to another. */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
    const { pathname } = useLocation();
    return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}

export default ErrorBoundary;
