/** A track's route as arrow-linked pills; the last stop (the final) glows red. */
export function PathSteps({ steps, className = '' }: { steps: readonly string[]; className?: string }) {
  return (
    <ol className={`flex flex-wrap items-center gap-2 ${className}`}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className="rounded-full border px-3 py-1.5 text-[12.5px]"
              style={
                last
                  ? {
                      borderColor: 'rgb(227 31 45 / 0.55)',
                      background: 'rgb(227 31 45 / 0.12)',
                      boxShadow: '0 0 18px rgb(227 31 45 / 0.25)',
                      color: '#fff',
                    }
                  : { borderColor: 'var(--color-hairline-strong)', color: 'var(--color-text-muted)' }
              }
            >
              {step}
            </span>
            {!last && (
              <span aria-hidden="true" className="text-text-faint">
                &rarr;
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
