// Consistent panel chrome: titled header strip + scrollable body.
export default function Panel({ title, tag, tools, children, bodyStyle, flush }) {
  return (
    <div className="panel">
      {(title || tag || tools) && (
        <div className="panel-head">
          {tag && <span className="tag">{tag}</span>}
          {title && <span>{title}</span>}
          {tools && <span className="panel-tools">{tools}</span>}
        </div>
      )}
      <div className="panel-body thin-scroll" style={{ ...(flush ? {} : {}), ...bodyStyle }}>{children}</div>
    </div>
  )
}
