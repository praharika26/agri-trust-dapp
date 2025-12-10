"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

interface PinataUploaderProps {
  onUploadComplete: (ipfsHash: string, ipfsUrl: string) => void
  maxSize?: number
}

export default function PinataUploader({ onUploadComplete, maxSize = 10 * 1024 * 1024 }: PinataUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`)
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/pinata/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      const ipfsHash = data.ipfsHash
      const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`

      setSuccess(`Uploaded successfully! Hash: ${ipfsHash.slice(0, 10)}...`)
      onUploadComplete(ipfsHash, ipfsUrl)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="flex-1"
        />
        <Button disabled={uploading} className="bg-emerald-600 hover:bg-emerald-700">
          {uploading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}
    </div>
  )
}
