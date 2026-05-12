'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import api from '@/lib/api'

const petSchema = z.object({
  name: z.string().min(1, 'Required'),
  type: z.string().min(1, 'Required'),
  breed: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  colouring: z.string().optional(),
  weight: z.string().optional(),
  microchipNumber: z.string().optional(),
  rabiesTagNumber: z.string().optional(),
  spayedNeutered: z.string().optional(),
  vaccinations: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  vetName: z.string().optional(),
  vetPhone: z.string().optional(),
  vetAddress: z.string().optional(),
  currentOnVaccines: z.boolean().optional(),
  careInstructions: z.string().min(1, 'Required'),
  behaviorNotes: z.string().optional(),
  feedingSchedule: z.string().optional(),
  exerciseRequirements: z.string().optional(),
})

type PetFormData = z.infer<typeof petSchema>

export type ExistingPet = {
  _id: string
  name?: string
  type?: string
  breed?: string
  gender?: string
  dateOfBirth?: string
  colouring?: string
  weight?: string
  microchipNumber?: string
  rabiesTagNumber?: string
  spayedNeutered?: string
  vaccinations?: string
  medications?: string
  allergies?: string
  dietaryRestrictions?: string
  vetName?: string
  vetPhone?: string
  vetAddress?: string
  currentOnVaccines?: boolean
  careInstructions?: string
  behaviorNotes?: string
  feedingSchedule?: string
  exerciseRequirements?: string
}

type PetFormProps = {
  pet?: ExistingPet | null
  userId: string
  onSuccess: () => void
}

const PET_TYPES = ['Cat', 'Dog', 'Rabbit', 'Bird', 'Guinea pig', 'Ferret', 'Other']

export function PetForm({ pet, userId, onSuccess }: PetFormProps) {
  const isEdit = !!pet
  const [petImageFile, setPetImageFile] = useState<File | null>(null)
  const [petImagePreview, setPetImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      type: '',
      breed: '',
      gender: '',
      dateOfBirth: '',
      colouring: '',
      weight: '',
      microchipNumber: '',
      rabiesTagNumber: '',
      spayedNeutered: '',
      vaccinations: '',
      medications: '',
      allergies: '',
      dietaryRestrictions: '',
      vetName: '',
      vetPhone: '',
      vetAddress: '',
      currentOnVaccines: false,
      careInstructions: '',
      behaviorNotes: '',
      feedingSchedule: '',
      exerciseRequirements: '',
    },
  })

  useEffect(() => {
    if (pet) {
      form.reset({
        name: pet.name || '',
        type: pet.type || '',
        breed: pet.breed || '',
        gender: pet.gender || '',
        dateOfBirth: pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : '',
        colouring: pet.colouring || '',
        weight: pet.weight || '',
        microchipNumber: pet.microchipNumber || '',
        rabiesTagNumber: pet.rabiesTagNumber || '',
        spayedNeutered: pet.spayedNeutered || '',
        vaccinations: pet.vaccinations || '',
        medications: pet.medications || '',
        allergies: pet.allergies || '',
        dietaryRestrictions: pet.dietaryRestrictions || '',
        vetName: pet.vetName || '',
        vetPhone: pet.vetPhone || '',
        vetAddress: pet.vetAddress || '',
        currentOnVaccines: pet.currentOnVaccines || false,
        careInstructions: pet.careInstructions || '',
        behaviorNotes: pet.behaviorNotes || '',
        feedingSchedule: pet.feedingSchedule || '',
        exerciseRequirements: pet.exerciseRequirements || '',
      })
    }
  }, [pet, form])

  const onSubmit = async (data: PetFormData) => {
    try {
      if (isEdit) {
        await api.put(`/pets/${pet?._id}`, data)
        // Upload image if selected
        if (petImageFile) {
          const formData = new FormData()
          formData.append('petImage', petImageFile)
          await api.post(`/pets/${pet?._id}/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }
        toast.success('Pet updated')
      } else {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value != null) formData.append(key, value.toString())
        })
        if (userId) formData.append('userId', userId)
        if (petImageFile) formData.append('petImage', petImageFile)
        
        await api.post('/pets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Pet added')
      }
      setPetImageFile(null)
      setPetImagePreview('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      onSuccess()
    } catch {
      toast.error(isEdit ? 'Failed to update pet' : 'Failed to add pet')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB.')
      return
    }

    setPetImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPetImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] w-full pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8 min-w-full">
          {/* Pet Image Upload */}
          <div>
            <h3 className="text-sm font-semibold">Pet Photo</h3>
            <Separator className="my-2" />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
              {petImagePreview ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <img 
                      src={petImagePreview} 
                      alt="Pet preview" 
                      className="w-24 h-24 object-cover rounded-lg shadow-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 text-center">Photo selected</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPetImageFile(null)
                        setPetImagePreview('')
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="text-xs text-red-600 hover:text-red-800 underline block mx-auto"
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div>
                    <label htmlFor="petImage" className="cursor-pointer">
                      <span className="text-sm text-primary hover:text-primary/80 font-medium">Upload photo</span>
                      <span className="text-xs text-gray-600"> or drag and drop</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="petImage"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold">Basic Info</h3>
            <Separator className="my-2" />
            <div className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PET_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="breed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
          </div>

          {/* Health */}
          <div>
            <h3 className="text-sm font-semibold">Health</h3>
            <Separator className="my-2" />
            <div className="space-y-4">
              <FormField control={form.control} name="vaccinations" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccinations</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="medications" render={({ field }) => (
                <FormItem>
                  <FormLabel>Medications</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="allergies" render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="currentOnVaccines" render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Current on vaccines</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>

          {/* Care */}
          <div>
            <h3 className="text-sm font-semibold">Care</h3>
            <Separator className="my-2" />
            <div className="space-y-4">
              <FormField control={form.control} name="careInstructions" render={({ field }) => (
                <FormItem>
                  <FormLabel>Care Instructions *</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="feedingSchedule" render={({ field }) => (
                <FormItem>
                  <FormLabel>Feeding Schedule</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="behaviorNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Behavior Notes</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Update Pet' : 'Add Pet'}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  )
}
