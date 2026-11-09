// Deliberately wrong: every line breaks a token rule. lint:tokens must reject it.
export function Bad() {
  return (
    <div className="text-[13px] bg-[#ff6600] z-50 -mt-2" style={{ padding: '12px' }}>
      Bad
    </div>
  )
}
