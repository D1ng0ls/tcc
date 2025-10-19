interface Props {
    title: string;
    description: string;
}

export default function Headline({ title, description } : Props) {
    return (
        <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-md text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}