import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  isPending = false,
  requireText,
  onConfirm,
}) {
  const [typed, setTyped] = useState('')
  const canConfirm = requireText ? typed === requireText : true

  const handleClose = (nextOpen) => {
    if (!nextOpen) setTyped('')
    onOpenChange(nextOpen)
  }

  const handleConfirm = () => {
    onConfirm?.()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {requireText ? (
          <div className="space-y-2">
            <Label htmlFor="confirmText">Type "{requireText}" to confirm</Label>
            <Input id="confirmText" value={typed} onChange={(event) => setTyped(event.target.value)} />
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={confirmVariant} disabled={!canConfirm || isPending} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
