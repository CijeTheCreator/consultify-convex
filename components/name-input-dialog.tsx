"use client"

import { useState } from "react"

interface NameInputDialogProps {
  isOpen: boolean
  onSubmit: (name: string) => void
  userType: "doctor" | "patient"
}

export default function NameInputDialog({ isOpen, onSubmit, userType }: NameInputDialogProps) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Welcome back!
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            We found your {userType} account on the AO network, but we need your display name to continue.
          </p>
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> Names are not stored on AOS for privacy reasons. Please enter the name you'd like to use.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder={`Enter your ${userType === 'doctor' ? 'professional' : ''} name`}
              required
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150"
            disabled={!name.trim()}
          >
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}