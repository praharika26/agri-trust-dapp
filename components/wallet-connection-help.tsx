"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle, Smartphone, Monitor, Mail, QrCode } from "lucide-react"

export default function WalletConnectionHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
          <HelpCircle className="w-4 h-4 mr-2" />
          Need Help Connecting?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose the method that works best for you
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 mt-4">
          {/* Desktop MetaMask */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="w-5 h-5" />
                Desktop Browser (Recommended)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Install MetaMask browser extension</li>
                <li>Click "Connect Wallet" button</li>
                <li>Select "MetaMask" from the options</li>
                <li>Approve the connection in MetaMask popup</li>
              </ol>
            </CardContent>
          </Card>

          {/* Mobile QR Code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="w-5 h-5" />
                Mobile Wallet (QR Code)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Open MetaMask mobile app on your phone</li>
                <li>Tap the scanner/QR icon in the app</li>
                <li>Point camera at the QR code on this screen</li>
                <li>Approve the connection in your mobile wallet</li>
              </ol>
            </CardContent>
          </Card>

          {/* Email Backup */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5" />
                Email Login (Backup)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Connect Wallet" button</li>
                <li>Select "Email" option</li>
                <li>Enter your email address</li>
                <li>Check your email for verification code</li>
              </ol>
              <p className="text-xs text-gray-500 mt-2">
                This creates a secure embedded wallet for you
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure your wallet app is updated to the latest version</li>
            <li>• Try refreshing the page if connection fails</li>
            <li>• Disable ad blockers that might interfere with wallet connections</li>
            <li>• Use Chrome or Firefox for best compatibility</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}