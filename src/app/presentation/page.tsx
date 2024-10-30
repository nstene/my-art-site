// `app/presentation/page.tsx is the UI for the `/dashboard` url
import Navigation from "../components/navigation/navbar"
import MovingBanner from "../components/MovingBanner/MovingBanner"

export default function Page() {
    return ( 
        <>
            <Navigation />
            <h1>
                Hello, this is my presentation page!
            </h1>
            <MovingBanner />
        </>
    )
}