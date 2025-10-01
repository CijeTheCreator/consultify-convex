"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendUSDAToProtocol, withdrawUSDAFromProtocol, stakeUSDA, unstakeUSDA } from "@/lib/usda-service"
import { Loader2, X } from "lucide-react"

interface USDAModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  modalType: 'send' | 'withdraw' | 'stake' | 'unstake'
  maxAmount?: string
}

export function USDAModal({ isOpen, onClose, onSuccess, modalType, maxAmount }: USDAModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens/closes or modal type changes
  useEffect(() => {
    if (!isOpen) {
      setAmount('')
      setError('')
      setLoading(false)
    }
  }, [isOpen, modalType])

  const handleClose = () => {
    if (!loading) {
      setAmount('')
      setError('')
      setLoading(false)
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result

      switch (modalType) {
        case 'send':
          if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount')
            setLoading(false)
            return
          }
          result = await sendUSDAToProtocol(amount)
          break
        case 'withdraw':
          result = await withdrawUSDAFromProtocol()
          break
        case 'stake':
          if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount')
            setLoading(false)
            return
          }
          result = await stakeUSDA(amount)
          break
        case 'unstake':
          if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount')
            setLoading(false)
            return
          }
          result = await unstakeUSDA(amount)
          break
        default:
          throw new Error('Invalid modal type')
      }

      if (result.success) {
        onSuccess()
        handleClose()
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Transaction error:', error)
      setError('Transaction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getModalTitle = () => {
    switch (modalType) {
      case 'send': return 'Send USDA to Protocol'
      case 'withdraw': return 'Withdraw USDA from Protocol'
      case 'stake': return 'Stake USDA'
      case 'unstake': return 'Unstake USDA'
      default: return 'USDA Transaction'
    }
  }

  const getModalDescription = () => {
    switch (modalType) {
      case 'send': return 'Enter the amount of USDA to send to the protocol.'
      case 'withdraw': return 'Withdraw all your USDA from the protocol to your wallet.'
      case 'stake': return 'Enter the amount of USDA to stake in the protocol.'
      case 'unstake': return 'Enter the amount of USDA to unstake from the protocol.'
      default: return 'Complete your USDA transaction.'
    }
  }

  const needsAmountInput = modalType === 'send' || modalType === 'stake' || modalType === 'unstake'

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={() => !loading && handleClose()}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        {/* Close Button */}
        <button
          onClick={() => !loading && handleClose()}
          disabled={loading}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-forest-green">{getModalTitle()}</h2>
          <p className="text-sm text-sage-green mt-1">
            {getModalDescription()}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-6">
            {needsAmountInput && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right text-forest-green">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={maxAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3 border-sage-green/30 focus:border-olive-green"
                  placeholder="0.00"
                  required
                />
              </div>
            )}
            {maxAmount && needsAmountInput && (
              <div className="text-sm text-sage-green text-center">
                Max available: {maxAmount} USDA
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 text-center">
                {error}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-sage-green/30 text-sage-green hover:bg-sage-green/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-forest-green hover:bg-forest-green/90 text-cream mb-2 sm:mb-0"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}