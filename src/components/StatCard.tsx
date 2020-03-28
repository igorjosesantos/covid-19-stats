import React, { FC } from 'react'

interface Props {
    title: string,
    value: number | undefined,
    className?: string
}

const StatCard: FC<Props> = ({ title, value, className }) => {
    return (
        <div className={`StatCard neumorph shadow-neumorph-inset p-4 flex-1 hover:shadow-neumorph-outset ${className}`}>
            <h1 className="text-md sm:text-xl md:text-2xl font-bold">{value?.toLocaleString() || '--' }</h1>
            <h2 className="sm:text-sm text-xs text-accent font-bold uppercase break-normal">{ title }</h2>
        </div>
    )
}

export default StatCard
