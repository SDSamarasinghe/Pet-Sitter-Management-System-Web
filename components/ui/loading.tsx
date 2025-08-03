import { Spinner } from "./spinner"

interface LoadingProps {
  message?: string
  className?: string
}

export function Loading({ message = "Loading...", className }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] space-y-4 ${className || ""}`}>
      <Spinner size="lg" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  )
}
