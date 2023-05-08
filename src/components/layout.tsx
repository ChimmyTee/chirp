import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
    return (
        <main className="flex h-screen justify-center">
            {/* note that, we generally want overflow-y-scroll on like blogs, but in this case, we disable it
            , we just want a clean looking, no scroll bar scrolling experience. We did this in global css */}
            <div className="h-full border-x overflow-y-auto border-slate-400 w-full md:max-w-2xl">
                {props.children}
            </div>
        </main>
    )
}