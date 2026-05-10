'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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

type PetFormProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pet?: any
  userId: string
  onSuccess: () => void
}

const PET_TYPES = ['Cat', 'Dog', 'Rabbit', 'Bird', 'Guinea pig', 'Ferret', 'Other']

export function PetForm({ pet, userId, onSuccess }: PetFormProps) {
  const isEdit = !!pet

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
        await api.put(`/pets/${pet._id}`, data)
        toast.success('Pet updated')
      } else {
        await api.post('/pets', { ...data, userId })
        toast.success('Pet added')
      }
      onSuccess()
    } catch {
      toast.error(isEdit ? 'Failed to update pet' : 'Failed to add pet')
    }
  }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8">
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
