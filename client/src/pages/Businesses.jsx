import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  addBusinessApi,
  deleteBusinessApi,
  refreshBusinessApi,
  updateBusinessApi,
} from '@/api/businessApi'
import { useBusinesses } from '@/hooks/business/useBusinesses'
import AppShell from '@/components/layout/AppShell'
import BusinessCard from '@/components/business/BusinessCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import AddBusinessModal from '@/components/forms/AddBusinessModal'
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

const formatRelativeTime = (value) => {
  if (!value) return 'Never'
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const initialForm = { businessName: '', placeInput: '' }

export default function Businesses() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: businesses = [], isLoading } = useBusinesses()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState(null)
  const [formValues, setFormValues] = useState(initialForm)
  const [editName, setEditName] = useState('')

  const refreshQueryKeys = () => {
    queryClient.invalidateQueries({ queryKey: ['businesses'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['reviews'] })
  }

  const { mutate: addBusiness, isPending: isAdding } = useMutation({
    mutationFn: addBusinessApi,
    onSuccess: () => {
      toast.success('Business added')
      setIsAddOpen(false)
      setFormValues(initialForm)
      refreshQueryKeys()
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to add business'),
  })

  const { mutate: refreshBusiness } = useMutation({
    mutationFn: refreshBusinessApi,
    onSuccess: () => {
      toast.success('Business refreshed')
      refreshQueryKeys()
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to refresh business'),
  })

  const { mutate: updateBusiness, isPending: isUpdating } = useMutation({
    mutationFn: updateBusinessApi,
    onSuccess: () => {
      toast.success('Business name updated')
      setIsEditOpen(false)
      setEditingBusiness(null)
      setEditName('')
      refreshQueryKeys()
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to update business'),
  })

  const { mutate: deleteBusiness } = useMutation({
    mutationFn: deleteBusinessApi,
    onSuccess: () => {
      toast.success('Business deleted')
      refreshQueryKeys()
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to delete business'),
  })

  const submitAddBusiness = (event) => {
    event.preventDefault()
    addBusiness(formValues)
  }

  const submitEditBusiness = (event) => {
    event.preventDefault()
    if (!editingBusiness) return
    updateBusiness({ businessId: editingBusiness._id, businessName: editName })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <AppShell
      title="Your Businesses"
      topbarActions={
        <Button onClick={() => setIsAddOpen(true)}>
          <Building2 className="size-4" />
          Add Business
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {businesses.map((business) => (
          <BusinessCard
            key={business._id}
            business={business}
            updatedText={formatRelativeTime(business.lastFetched || business.updatedAt)}
            onView={() => navigate(`/dashboard?businessId=${business._id}`)}
            onEdit={() => {
              setEditingBusiness(business)
              setEditName(business.businessName)
              setIsEditOpen(true)
            }}
            onRefresh={() => refreshBusiness({ businessId: business._id, force: true })}
            onDelete={() => {
              if (window.confirm(`Delete ${business.businessName}? This cannot be undone.`)) {
                deleteBusiness(business._id)
              }
            }}
          />
        ))}

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 p-6 text-center ui-transition hover:bg-surface-hover"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Building2 className="size-6" />
          </div>
          <p className="mt-4 text-lg font-semibold text-text-primary">Add New Business</p>
          <p className="mt-2 text-sm text-text-secondary">Track more locations</p>
        </button>
      </div>

      <AddBusinessModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        formValues={formValues}
        onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
        onSubmit={submitAddBusiness}
        isPending={isAdding}
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Business Name</DialogTitle>
            <DialogDescription>Update the display name for this business.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitEditBusiness}>
            <div className="space-y-2">
              <Label htmlFor="editBusinessName">Business Name *</Label>
              <Input
                id="editBusinessName"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
