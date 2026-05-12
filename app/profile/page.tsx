'use client'

import { useEffect, useState, useRef } from 'react'
import NextImage from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { useProfile, useKeySecurity } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/lib/api'

const WHO_HAS_ACCESS = [
  { id: 'landlord', label: 'Landlord' },
  { id: 'buildingManagement', label: 'Building Management' },
  { id: 'superintendent', label: 'Superintendent' },
  { id: 'housekeeper', label: 'Housekeeper / Cleaner' },
  { id: 'neighbour', label: 'Neighbour' },
  { id: 'friend', label: 'Friend' },
  { id: 'family', label: 'Family' },
  { id: 'none', label: 'None' },
]

export default function ProfilePage() {
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading, mutate } = useProfile()
  const { data: keySecurity, mutate: mutateKey } = useKeySecurity(userId)

  // Profile fields state
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', email: '', cellPhoneNumber: '', homePhoneNumber: '',
    address: '', zipCode: '',
    emergencyContactFirstName: '', emergencyContactLastName: '',
    emergencyContactCellPhone: '', emergencyContactHomePhone: '',
    keyHandlingMethod: '', superintendentContact: '', friendNeighbourContact: '',
    parkingForSitter: '', garbageCollectionDay: '', fuseBoxLocation: '',
    videoSurveillance: '', outOfBoundAreas: '', cleaningSupplyLocation: '',
    broomDustpanLocation: '', mailPickUp: '', waterIndoorPlants: '', additionalHomeCareInfo: '',
  })

  // Key security fields
  const [keyForm, setKeyForm] = useState({
    lockboxCode: '', lockboxLocation: '',
    alarmCompanyName: '', alarmCompanyPhone: '', alarmCodeToEnter: '', alarmCodeToExit: '',
    additionalComments: '', homeAccessList: '',
    accessPermissions: {
      landlord: false, buildingManagement: false, superintendent: false,
      housekeeper: false, neighbour: false, friend: false, family: false, none: true,
    },
  })

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) { setUserId(decoded.userId); setRole(decoded.role) }
  }, [])

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        cellPhoneNumber: profile.cellPhoneNumber || '',
        homePhoneNumber: profile.homePhoneNumber || '',
        address: profile.address || '',
        zipCode: profile.zipCode || '',
        emergencyContactFirstName: profile.emergencyContactFirstName || '',
        emergencyContactLastName: profile.emergencyContactLastName || '',
        emergencyContactCellPhone: profile.emergencyContactCellPhone || '',
        emergencyContactHomePhone: profile.emergencyContactHomePhone || '',
        keyHandlingMethod: profile.keyHandlingMethod || '',
        superintendentContact: profile.superintendentContact || '',
        friendNeighbourContact: profile.friendNeighbourContact || '',
        parkingForSitter: profile.parkingForSitter || '',
        garbageCollectionDay: profile.garbageCollectionDay || '',
        fuseBoxLocation: profile.fuseBoxLocation || '',
        videoSurveillance: profile.videoSurveillance || '',
        outOfBoundAreas: profile.outOfBoundAreas || '',
        cleaningSupplyLocation: profile.cleaningSupplyLocation || '',
        broomDustpanLocation: profile.broomDustpanLocation || '',
        mailPickUp: profile.mailPickUp || '',
        waterIndoorPlants: profile.waterIndoorPlants || '',
        additionalHomeCareInfo: profile.additionalHomeCareInfo || '',
      })

      if (profile.profilePicture) {
        window.dispatchEvent(
          new CustomEvent('profile-picture-updated', {
            detail: { avatarUrl: profile.profilePicture },
          })
        )
      }
    }
  }, [profile])

  useEffect(() => {
    if (keySecurity) {
      setKeyForm({
        lockboxCode: keySecurity.lockboxCode || '',
        lockboxLocation: keySecurity.lockboxLocation || '',
        alarmCompanyName: keySecurity.alarmCompanyName || '',
        alarmCompanyPhone: keySecurity.alarmCompanyPhone || '',
        alarmCodeToEnter: keySecurity.alarmCodeToEnter || '',
        alarmCodeToExit: keySecurity.alarmCodeToExit || '',
        additionalComments: keySecurity.additionalComments || '',
        homeAccessList: keySecurity.homeAccessList || '',
        accessPermissions: keySecurity.accessPermissions || {
          landlord: false, buildingManagement: false, superintendent: false,
          housekeeper: false, neighbour: false, friend: false, family: false, none: true,
        },
      })
    }
  }, [keySecurity])

  const handleProfileSave = async () => {
    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'cellPhoneNumber', 'homePhoneNumber',
      'address', 'zipCode', 'emergencyContactFirstName', 'emergencyContactLastName',
      'emergencyContactCellPhone', 'keyHandlingMethod', 'parkingForSitter',
      'videoSurveillance', 'outOfBoundAreas', 'cleaningSupplyLocation', 'broomDustpanLocation'
    ]

    const missingFields = requiredFields.filter(field => !profileForm[field as keyof typeof profileForm]?.toString().trim())

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    setSaving(true)
    try {
      // Construct required backend fields
      const dataToSend = {
        ...profileForm,
        phoneNumber: profileForm.cellPhoneNumber, // Use cell phone as primary phone number
        emergencyContact: `${profileForm.emergencyContactFirstName} ${profileForm.emergencyContactLastName}`, // Combine names
      }
      
      await api.put('/users/profile', dataToSend)
      toast.success('Profile updated')
      mutate()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleKeySave = async () => {
    setSavingKey(true)
    try {
      await api.post(`/key-security/client/${userId}`, keyForm)
      toast.success('Key security updated')
      mutateKey()
    } catch {
      toast.error('Failed to update key security')
    } finally {
      setSavingKey(false)
    }
  }

  const handleProfilePictureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB.')
      return
    }

    setProfilePictureFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setProfilePicturePreview(e.target?.result as string)
      setShowPreviewModal(true)
    }
    reader.readAsDataURL(file)
  }

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile) return

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('profilePicture', profilePictureFile)

      const response = await api.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const avatarUrl = response.data.profilePicture as string | undefined
      window.dispatchEvent(
        new CustomEvent('profile-picture-updated', { detail: { avatarUrl } })
      )
      await mutate()
      setProfilePicturePreview(null)
      setProfilePictureFile(null)
      setShowPreviewModal(false)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Profile picture updated successfully.')
    } catch {
      toast.error('Failed to upload profile picture.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    try {
      await api.delete('/users/profile/picture')
      window.dispatchEvent(
        new CustomEvent('profile-picture-updated', { detail: { avatarUrl: undefined } })
      )
      await mutate()
      setProfilePicturePreview(null)
      setProfilePictureFile(null)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Profile picture removed successfully.')
    } catch {
      toast.error('Failed to remove profile picture.')
    }
  }

  const toggleAccess = (key: string) => {
    setKeyForm((prev) => ({
      ...prev,
      accessPermissions: {
        ...prev.accessPermissions,
        [key]: !(prev.accessPermissions as any)[key],
      },
    }))
  }

  const field = (name: keyof typeof profileForm) => ({
    value: profileForm[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfileForm((p) => ({ ...p, [name]: e.target.value })),
  })

  const keyField = (name: keyof Omit<typeof keyForm, 'accessPermissions'>) => ({
    value: keyForm[name] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setKeyForm((p) => ({ ...p, [name]: e.target.value })),
  })

  if (isLoading) return (
    <AppLayout>
      <PageShell title="Profile Settings" description="Manage your account information and preferences.">
        <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
      </PageShell>
    </AppLayout>
  )

  return (
    <AppLayout>
      <PageShell
        title="Profile Settings"
        description="Manage your account information and preferences."
        action={
          <Button onClick={handleProfileSave} disabled={saving}>
            {saving ? 'Saving...' : 'Edit Profile'}
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <p className="text-sm text-muted-foreground">Update your personal details and contact information</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profilePicturePreview || profile?.profilePicture} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {profileForm.firstName?.[0]}{profileForm.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                        Choose Picture
                      </Button>
                      {profile?.profilePicture && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30"
                          onClick={handleRemoveProfilePicture}
                        >
                          Remove Picture
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureSelect}
                  />
                </div>

                <Modal open={showPreviewModal} onOpenChange={setShowPreviewModal}>
                  <ModalContent className="max-w-lg">
                    <ModalHeader>
                      <ModalTitle>Preview Profile Picture</ModalTitle>
                      <ModalDescription>Review the image before uploading.</ModalDescription>
                    </ModalHeader>
                    <div className="flex justify-center px-2">
                      {profilePicturePreview && (
                        <NextImage
                          src={profilePicturePreview}
                          alt="Profile preview"
                          width={480}
                          height={480}
                          className="h-auto max-h-80 w-auto rounded-xl object-contain"
                        />
                      )}
                    </div>
                    <ModalFooter>
                      <Button onClick={handleProfilePictureUpload} disabled={isUploadingImage}>
                        {isUploadingImage ? 'Uploading...' : 'Upload Picture'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setProfilePictureFile(null)
                          setProfilePicturePreview(null)
                          setShowPreviewModal(false)
                          if (fileRef.current) fileRef.current.value = ''
                        }}
                      >
                        Cancel
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>First Name <span className="text-destructive">*</span></Label>
                  <Input {...field('firstName')} />
                </div>
                <div className="space-y-1">
                  <Label>Last Name <span className="text-destructive">*</span></Label>
                  <Input {...field('lastName')} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Email Address <span className="text-destructive">*</span></Label>
                  <Input {...field('email')} type="email" disabled />
                </div>
                <div className="space-y-1">
                  <Label>Cell Phone Number <span className="text-destructive">*</span></Label>
                  <Input {...field('cellPhoneNumber')} />
                </div>
                <div className="space-y-1">
                  <Label>Home Phone Number <span className="text-destructive">*</span></Label>
                  <Input {...field('homePhoneNumber')} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Address <span className="text-destructive">*</span></Label>
                  <Textarea {...field('address')} rows={2} />
                </div>
                <div className="space-y-1">
                  <Label>ZIP / Postal Code <span className="text-destructive">*</span></Label>
                  <Input {...field('zipCode')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact Information</CardTitle>
              <p className="text-sm text-muted-foreground">Provide emergency contact details in case we need to reach someone on your behalf</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>First Name <span className="text-destructive">*</span></Label>
                  <Input {...field('emergencyContactFirstName')} />
                </div>
                <div className="space-y-1">
                  <Label>Last Name <span className="text-destructive">*</span></Label>
                  <Input {...field('emergencyContactLastName')} />
                </div>
                <div className="space-y-1">
                  <Label>Cell Phone Number <span className="text-destructive">*</span></Label>
                  <Input {...field('emergencyContactCellPhone')} />
                </div>
                <div className="space-y-1">
                  <Label>Home Phone Number</Label>
                  <Input {...field('emergencyContactHomePhone')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Handling */}
          <Card>
            <CardHeader>
              <CardTitle>Key Handling</CardTitle>
              <p className="text-sm text-muted-foreground">Please select how you would like us to handle your keys</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Key Handling Method <span className="text-destructive">*</span></Label>
                <Select
                  value={profileForm.keyHandlingMethod}
                  onValueChange={(v) => setProfileForm((p) => ({ ...p, keyHandlingMethod: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concierge">Concierge</SelectItem>
                    <SelectItem value="Lockbox">Lockbox</SelectItem>
                    <SelectItem value="Keycafe">Keycafe</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Keys can be handled via &quot;Concierge&quot; with your keys with your Concierge in an envelope or the sitter to pick up. Keys can also be handled via &quot;Lockbox&quot; provided by us or yourself or you can. If you select the Lockbox option please ensure that your building allows for lockbox set up. Some buildings do not allow lockboxes. &quot;Keycafe&quot; you can rent one of your keys at your local Keycafe for the sitter to pick up (look up www.keycafe.com for more info).
                </p>
              </div>
              <div className="space-y-1">
                <Label>Contact for Superintendent / Building Management or Landlord</Label>
                <Textarea {...field('superintendentContact')} placeholder="Name and contact information" rows={2} />
              </div>
              <div className="space-y-1">
                <Label>Name and contact of Friend or Neighbour if they have access to your home</Label>
                <Textarea {...field('friendNeighbourContact')} placeholder="Name and contact information" rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* My Home Care Info */}
          <Card>
            <CardHeader>
              <CardTitle>My Home Care Info</CardTitle>
              <p className="text-sm text-muted-foreground">Provide detailed information about your home for pet sitters</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Parking for Sitter <span className="text-destructive">*</span></Label>
                  <Input {...field('parkingForSitter')} />
                </div>
                <div className="space-y-1">
                  <Label>Garbage Collection Day</Label>
                  <Input {...field('garbageCollectionDay')} placeholder="e.g., Thursday" />
                </div>
                <div className="space-y-1">
                  <Label>Location of Fuse Box/Circuit Breaker</Label>
                  <Input {...field('fuseBoxLocation')} placeholder="e.g., Basement family room" />
                </div>
                <div className="space-y-1">
                  <Label>Video Surveillance <span className="text-destructive">*</span></Label>
                  <Input {...field('videoSurveillance')} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Out of Bound Areas <span className="text-destructive">*</span></Label>
                  <Textarea {...field('outOfBoundAreas')} rows={2} />
                </div>
                <div className="space-y-1">
                  <Label>Cleaning Supply Location <span className="text-destructive">*</span></Label>
                  <Input {...field('cleaningSupplyLocation')} />
                </div>
                <div className="space-y-1">
                  <Label>Broom Dustpan Location <span className="text-destructive">*</span></Label>
                  <Input {...field('broomDustpanLocation')} />
                </div>
                <div className="space-y-1">
                  <Label>Mail Pick Up</Label>
                  <Input {...field('mailPickUp')} placeholder="e.g., No or Yes" />
                </div>
                <div className="space-y-1">
                  <Label>Water Indoor Plants</Label>
                  <Input {...field('waterIndoorPlants')} placeholder="e.g., No or Yes" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Any Additional Info</Label>
                  <Textarea {...field('additionalHomeCareInfo')} placeholder="Any other important information for pet sitters (alarm codes, special instructions, etc.)" rows={3} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleProfileSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>

          {/* Key Security */}
          <Card>
            <CardHeader>
              <CardTitle>Key Security</CardTitle>
              <p className="text-sm text-muted-foreground">Manage access and security information for your home</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 col-span-2">
                  <Label>Lockbox Code <span className="text-destructive">*</span></Label>
                  <Input {...keyField('lockboxCode')} />
                  <p className="text-xs text-muted-foreground">
                    If key is with concierge enter: &quot;Key with concierge in envelope C/O Pet Sitter Management&quot; plus sitter name.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>Lockbox Location</Label>
                  <Input {...keyField('lockboxLocation')} placeholder="Describe lockbox location" />
                </div>
                <div className="space-y-1">
                  <Label>Alarm Company Name</Label>
                  <Input {...keyField('alarmCompanyName')} placeholder="Enter alarm company name" />
                </div>
                <div className="space-y-1">
                  <Label>Alarm Company Phone</Label>
                  <Input {...keyField('alarmCompanyPhone')} placeholder="Enter phone number" />
                </div>
                <div className="space-y-1">
                  <Label>Alarm Code to Enter</Label>
                  <Input {...keyField('alarmCodeToEnter')} placeholder="Enter alarm code" />
                </div>
                <div className="space-y-1">
                  <Label>Alarm Code to Exit</Label>
                  <Input {...keyField('alarmCodeToExit')} placeholder="Enter exit code" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Additional Comments</Label>
                  <Textarea {...keyField('additionalComments')} placeholder="Any extra key, concierge or alarm info" rows={3} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Who Else Has Access <span className="text-destructive">*</span></Label>
                <div className="space-y-2">
                  {WHO_HAS_ACCESS.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        id={item.id}
                        checked={(keyForm.accessPermissions as any)[item.id] ?? false}
                        onCheckedChange={() => toggleAccess(item.id)}
                      />
                      <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Names &amp; Phones of Those With Access</Label>
                <Textarea
                  {...keyField('homeAccessList')}
                  placeholder="Eg. Rhoda Smith - 416-123-4567"
                  rows={2}
                />
              </div>

              <Button onClick={handleKeySave} disabled={savingKey} className="w-full sm:w-auto">
                {savingKey ? 'Saving...' : 'Save Key Security'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Information (read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <p className="text-sm text-muted-foreground">Read-only account details</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Account Type</Label>
                  <Input value={profile?.role || role} disabled />
                </div>
                <div className="space-y-1">
                  <Label>User ID</Label>
                  <Input value={userId} disabled className="font-mono text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </AppLayout>
  )
}
