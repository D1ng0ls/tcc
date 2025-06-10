import { Infinity, FileText } from 'lucide-react';

export default function ScoreBar({ plan, title, progress, max, current, isUnlimited }: { plan: string; title: string; progress: number; max: number | null; current: number; isUnlimited: boolean }) {
    return (
        <div className="border rounded-xl p-6 shadow-sm w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{plan}</h3>
                        <p className="text-sm text-gray-600">{title} feitos este mês</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">
                        {current}<span className="text-lg text-gray-500">/{!isUnlimited ? max : <Infinity className='inline text-3xl' />}</span>
                    </div>
                    {!isUnlimited && <div className="text-sm text-gray-500"> {Math.round(progress)}% usado</div>}
                </div>
            </div>
            <div>
                {!isUnlimited ? (
                    <div className="w-full bg-gray-300 rounded-full h-3 relative overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progress > 80 ? 'bg-gradient-to-r from-red-500 to-red-500' :
                                progress > 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                    'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                                }`}
                            style={{ width: `${progress}%` }}
                        >
                            {/* <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div> */}
                        </div>
                    </div>

                ) : (
                    <div className="w-full bg-gray-300 rounded-full h-3 relative overflow-hidden">
                        <div
                            className={`h-full w-full rounded-full transition-all duration-1500 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse`}
                        >
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}