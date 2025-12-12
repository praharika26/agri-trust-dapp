"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAgriTrustNFT } from '@/lib/hooks/useAgriTrustNFT'
import { ethers } from 'ethers'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function GanacheDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [testing, setTesting] = useState(false)
  const { testConnection } = useAgriTrustNFT()

  const runDiagnostics = async () => {
    setTesting(true)
    const diagnosticResults: DiagnosticResult[] = []

    // Test 1: Environment Variables
    console.log('🔍 Testing environment variables...')
    const envVars = {
      NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
      GANACHE_RPC_URL: process.env.GANACHE_RPC_URL,
      NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT: process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT
    }
    
    diagnosticResults.push({
      test: 'Environment Variables',
      status: envVars.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT ? 'success' : 'warning',
      message: envVars.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT 
        ? 'All required environment variables are set'
        : 'NFT contract address not set',
      details: envVars
    })

    // Test 2: Ganache Connection
    console.log('🔍 Testing Ganache connection...')
    try {
      const connectionResult = await testConnection()
      diagnosticResults.push({
        test: 'Ganache Connection',
        status: connectionResult.success ? 'success' : 'error',
        message: connectionResult.success 
          ? `Connected to Ganache (Chain ID: ${connectionResult.chainId}, Block: ${connectionResult.blockNumber})`
          : `Failed to connect: ${connectionResult.error}`,
        details: connectionResult
      })
    } catch (error: any) {
      diagnosticResults.push({
        test: 'Ganache Connection',
        status: 'error',
        message: `Connection test failed: ${error.message}`,
        details: { error: error.message }
      })
    }

    // Test 3: Direct RPC Test
    console.log('🔍 Testing direct RPC connection...')
    try {
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545')
      const network = await provider.getNetwork()
      const blockNumber = await provider.getBlockNumber()
      const accounts = await provider.listAccounts()
      
      diagnosticResults.push({
        test: 'Direct RPC Connection',
        status: 'success',
        message: `Direct RPC connection successful (Chain ID: ${network.chainId}, Block: ${blockNumber})`,
        details: {
          chainId: network.chainId.toString(),
          blockNumber,
          accountCount: accounts.length
        }
      })
    } catch (error: any) {
      diagnosticResults.push({
        test: 'Direct RPC Connection',
        status: 'error',
        message: `Direct RPC failed: ${error.message}`,
        details: { error: error.message }
      })
    }

    // Test 4: Contract Existence
    if (process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT) {
      console.log('🔍 Testing contract existence...')
      try {
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545')
        const contractAddress = process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT
        const code = await provider.getCode(contractAddress)
        
        diagnosticResults.push({
          test: 'Contract Existence',
          status: code !== '0x' ? 'success' : 'error',
          message: code !== '0x' 
            ? `Contract found at ${contractAddress}`
            : `No contract found at ${contractAddress}`,
          details: {
            address: contractAddress,
            codeLength: code.length,
            hasCode: code !== '0x'
          }
        })
      } catch (error: any) {
        diagnosticResults.push({
          test: 'Contract Existence',
          status: 'error',
          message: `Contract check failed: ${error.message}`,
          details: { error: error.message }
        })
      }
    }

    // Test 5: Network Connectivity
    console.log('🔍 Testing network connectivity...')
    try {
      const response = await fetch('http://127.0.0.1:7545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        diagnosticResults.push({
          test: 'Network Connectivity',
          status: 'success',
          message: `HTTP connection to Ganache successful`,
          details: { response: data }
        })
      } else {
        diagnosticResults.push({
          test: 'Network Connectivity',
          status: 'error',
          message: `HTTP request failed with status: ${response.status}`,
          details: { status: response.status, statusText: response.statusText }
        })
      }
    } catch (error: any) {
      diagnosticResults.push({
        test: 'Network Connectivity',
        status: 'error',
        message: `Network request failed: ${error.message}`,
        details: { error: error.message }
      })
    }

    setResults(diagnosticResults)
    setTesting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Ganache Connection Diagnostics
        </CardTitle>
        <CardDescription>
          Test your Ganache blockchain connection and NFT contract setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Diagnostic Results</h3>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      Show Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Troubleshooting Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Make sure Ganache is running on port 7545</li>
            <li>Check that Chain ID is set to 1337</li>
            <li>Verify the NFT contract is deployed to the current Ganache instance</li>
            <li>Ensure MetaMask is connected to the Ganache network</li>
            <li>Check that the contract address in .env.local matches the deployed contract</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}