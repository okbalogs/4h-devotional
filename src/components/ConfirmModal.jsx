'use client'
import { useEffect } from 'react'

export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, danger = true }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      <div className="confirm-backdrop" onClick={onCancel} />
      <div className="confirm-modal">
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button className={`confirm-btn ${danger ? 'confirm-btn--danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </>
  )
}
