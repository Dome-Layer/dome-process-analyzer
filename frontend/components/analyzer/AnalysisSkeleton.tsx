export function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-up" aria-busy="true" aria-label="Loading analysis">
      {/* Summary skeleton */}
      <div className="bg-dome-bg-secondary border border-dome-border rounded-dome p-6">
        <div className="skeleton h-3 w-24 mb-4" />
        <div className="skeleton h-7 w-64 mb-3" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-5/6 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dome-bg-tertiary rounded-dome p-4">
              <div className="skeleton h-3 w-16 mb-2" />
              <div className="skeleton h-6 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Process steps skeleton */}
      <div className="bg-dome-bg-secondary border border-dome-border rounded-dome p-6">
        <div className="skeleton h-3 w-28 mb-4" />
        <div className="skeleton h-5 w-40 mb-5" />
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-4 w-40 mb-2" />
                <div className="skeleton h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Systems skeleton */}
      <div className="bg-dome-bg-secondary border border-dome-border rounded-dome p-6">
        <div className="skeleton h-3 w-24 mb-4" />
        <div className="skeleton h-5 w-36 mb-5" />
        <div className="grid sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dome-bg-tertiary rounded-dome p-4">
              <div className="skeleton h-4 w-28 mb-2" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Governance skeleton */}
      <div className="bg-dome-bg-secondary border border-dome-border rounded-dome p-6">
        <div className="skeleton h-3 w-32 mb-4" />
        <div className="skeleton h-5 w-44 mb-5" />
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border border-dome-border rounded-dome p-4">
              <div className="flex gap-2 mb-2">
                <div className="skeleton h-5 w-16" />
                <div className="skeleton h-5 w-24" />
              </div>
              <div className="skeleton h-4 w-full mb-1.5" />
              <div className="skeleton h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
