'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
   Upload,
   Download,
   FileText,
   AlertTriangle,
   CheckCircle,
   Eye,
   FileCheck,
   Database,
   ArrowRight,
   AlertCircle,
   Users,
   CheckCircle2,
   XCircle,
   Loader2,
   ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'

import { LeadAPI } from '@/services/apis/lead.api'
import { BulkLeadData, ValidationError } from '@/types/lead'
import {
   extractApiErrorMessage,
   showErrorToast,
   showSuccessToast,
} from '@/utils/error'
import { useTheme, useColors, useIsDark } from '@/contexts/ThemeContext'

type ImportStep = 'upload' | 'validate' | 'preview' | 'import' | 'complete'

const BulkLeadImportPage: React.FC = () => {
   const router = useRouter()
   const isDark = useIsDark()
   const colors = useColors()

   // State management
   const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [file, setFile] = useState<File | null>(null)
   const [leadData, setLeadData] = useState<BulkLeadData[]>([])
   const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
      []
   )
   const [validRecords, setValidRecords] = useState(0)
   const [invalidRecords, setInvalidRecords] = useState(0)
   const [importResults, setImportResults] = useState<{
      totalLeads: number
      successfullyCreated: number
      skipped: number
      validationErrors?: number
      insertErrors?: number
   } | null>(null)

   const fileInputRef = useRef<HTMLInputElement>(null)

   const handleBack = () => {
      if (!loading && currentStep !== 'complete') {
         const confirmLeave = window.confirm(
            'Are you sure you want to leave? Your progress will be lost.'
         )
         if (confirmLeave) {
            router.push('/lead-management')
         }
      } else {
         router.push('/lead-management')
      }
   }

   const handleDownloadTemplate = async () => {
      try {
         await LeadAPI.downloadTemplateFile()
      } catch (err) {
         const errorMessage = extractApiErrorMessage(err)
         showErrorToast(errorMessage)
      }
   }

   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0]
      if (selectedFile) {
         if (
            selectedFile.type !== 'text/csv' &&
            !selectedFile.name.endsWith('.csv')
         ) {
            setError('Please select a CSV file')
            return
         }
         setFile(selectedFile)
         setError(null)
      }
   }

   const handleFileUpload = async () => {
      if (!file) {
         setError('Please select a file first')
         return
      }

      try {
         setLoading(true)
         setError(null)

         const text = await file.text()
         console.log('Raw CSV content:', text.substring(0, 500))
         
         const parsedData = LeadAPI.parseCSV(text)
         console.log('Parsed data count:', parsedData.length)

         if (parsedData.length === 0) {
            setError('No valid data found in the CSV file. Please check the format and required fields.')
            return
         }

         setLeadData(parsedData)
         setCurrentStep('validate')
         
         // Call the backend API to validate the data
         await handleValidation(parsedData)
      } catch (err) {
         console.error('File upload error:', err)
         const errorMessage = extractApiErrorMessage(err)
         setError(errorMessage)
         showErrorToast(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   const handleValidation = async (dataToValidate = leadData) => {
      try {
         setLoading(true)
         setError(null)

         console.log('Validating data:', dataToValidate)
         
         // Call the backend validation API
         const response = await LeadAPI.validateBulkData(dataToValidate)
         
         console.log('Validation response:', response)
         
         setValidRecords(response.data.validRecords)
         setInvalidRecords(response.data.invalidRecords)
         setValidationErrors(response.data.errors)
         setCurrentStep('preview')
         
         if (response.data.validRecords > 0) {
            showSuccessToast(`${response.data.validRecords} records are valid and ready for import`)
         }
         
         if (response.data.invalidRecords > 0) {
            showErrorToast(`${response.data.invalidRecords} records have validation errors`)
         }
      } catch (err) {
         console.error('Validation error:', err)
         const errorMessage = extractApiErrorMessage(err)
         setError(errorMessage)
         showErrorToast(errorMessage)
         setCurrentStep('upload') // Go back to upload step on error
      } finally {
         setLoading(false)
      }
   }

   const handleImport = async () => {
      try {
         setLoading(true)
         setError(null)
         setCurrentStep('import')

         console.log('Starting import with data:', leadData)

         // Only import valid leads - filter out any that failed validation
         const validLeadsForImport = leadData.filter((lead, index) => {
            const hasErrors = validationErrors.some(error => error.row === index + 2) // +2 because CSV has header row and is 1-indexed
            return !hasErrors
         })

         console.log('Valid leads for import:', validLeadsForImport)

         const response = await LeadAPI.bulkImportLeads(validLeadsForImport)
         console.log('Import response:', response)
         
         setImportResults(response.data)
         setCurrentStep('complete')
         showSuccessToast(
            `Successfully imported ${response.data.successfullyCreated} leads!`
         )
      } catch (err) {
         console.error('Import error:', err)
         const errorMessage = extractApiErrorMessage(err)
         setError(errorMessage)
         showErrorToast(errorMessage)
         setCurrentStep('preview') // Go back to preview step to allow fixing errors
      } finally {
         setLoading(false)
      }
   }

   const getStepClassName = (isCompleted: boolean, isActive: boolean) => {
      if (isCompleted) 
         return `bg-[${colors.primary[600]}] border-[${colors.primary[600]}] text-white`
      if (isActive) 
         return `bg-[${colors.primary[100]}] border-[${colors.primary[600]}] text-[${colors.primary[600]}]`
      return `bg-[${colors.neutral[100]}] border-[${colors.neutral[300]}] text-[${colors.neutral[400]}]`
   }

   const renderStepIndicator = () => {
      const steps = [
         { key: 'upload', label: 'Upload', icon: Upload },
         { key: 'validate', label: 'Validate', icon: FileCheck },
         { key: 'preview', label: 'Preview', icon: Eye },
         { key: 'import', label: 'Import', icon: Database },
         { key: 'complete', label: 'Complete', icon: CheckCircle },
      ]

      return (
         <div className="mb-8 flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
               const isActive = step.key === currentStep
               const isCompleted =
                  steps.findIndex((s) => s.key === currentStep) > index
               const Icon = step.icon

               return (
                  <React.Fragment key={step.key}>
                     <div className="flex min-w-0 flex-shrink-0 flex-col items-center">
                        <div
                           className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 sm:h-12 sm:w-12 ${
                              isCompleted
                                 ? 'theme-interactive-primary border-[var(--interactive-primary)] text-white'
                                 : isActive
                                   ? 'bg-[var(--bg-secondary)] border-[var(--interactive-primary)] text-[var(--interactive-primary)]'
                                   : 'bg-[var(--bg-tertiary)] border-[var(--border-default)] text-[var(--fg-muted)]'
                           }`}
                        >
                           {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6" />
                           ) : (
                              <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                           )}
                        </div>
                        <span
                           className={`mt-1 text-center text-xs font-medium sm:mt-2 sm:text-sm ${
                              isActive || isCompleted 
                                 ? 'text-[var(--interactive-primary)]' 
                                 : 'text-[var(--fg-muted)]'
                           }`}
                        >
                           {step.label}
                        </span>
                     </div>
                     {index < steps.length - 1 && (
                        <div
                           className={`mx-2 h-0.5 flex-1 transition-all duration-200 sm:mx-4 ${
                              isCompleted 
                                 ? 'bg-[var(--interactive-primary)]' 
                                 : 'bg-[var(--border-default)]'
                           }`}
                        />
                     )}
                  </React.Fragment>
               )
            })}
         </div>
      )
   }

   const renderUploadStep = () => (
      <div className="space-y-6">
         <Card className="border-[var(--border-default)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
            <CardHeader>
               <CardTitle className="theme-text-primary flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Template
               </CardTitle>
               <CardDescription className="theme-text-secondary">
                  First, download our CSV template with the required format and
                  column headers.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="theme-border w-full hover:bg-[var(--bg-secondary)]"
               >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV Template
               </Button>
            </CardContent>
         </Card>

         <Card className="border-[var(--border-default)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
            <CardHeader>
               <CardTitle className="theme-text-primary flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your File
               </CardTitle>
               <CardDescription className="theme-text-secondary">
                  Upload your completed CSV file with lead data. Make sure all
                  required fields are filled.
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
               />

               <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="theme-border hover:theme-bg-secondary focus:ring-[var(--interactive-primary)] w-full cursor-pointer rounded-lg border-2 border-dashed bg-transparent p-6 text-center transition-colors focus:ring-2 focus:outline-none sm:p-8"
               >
                  <FileText className="theme-text-secondary mx-auto mb-4 h-8 w-8 sm:h-12 sm:w-12" />
                  <p className="theme-text-primary mb-2 text-base font-medium sm:text-lg">
                     {file ? file.name : 'Click to select CSV file'}
                  </p>
                  <p className="theme-text-secondary text-xs sm:text-sm">
                     Or drag and drop your CSV file here
                  </p>
               </button>

               {file && (
                  <div className="theme-bg-secondary theme-border flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                     <div className="flex items-center gap-3">
                        <FileText className="theme-text-secondary h-6 w-6 sm:h-8 sm:w-8" />
                        <div>
                           <p className="theme-text-primary text-sm font-medium sm:text-base">
                              {file.name}
                           </p>
                           <p className="theme-text-secondary text-xs sm:text-sm">
                              {(file.size / 1024).toFixed(1)} KB
                           </p>
                        </div>
                     </div>
                     <Button
                        onClick={handleFileUpload}
                        disabled={loading || !file}
                        className="theme-interactive-secondary w-full sm:w-auto"
                     >
                        {loading ? (
                           <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                           </>
                        ) : (
                           <>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Process File
                           </>
                        )}
                     </Button>
                  </div>
               )}
            </CardContent>
         </Card>

         <Alert className="theme-border theme-bg-secondary">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="theme-text-primary">
               <strong>CSV Format Requirements:</strong>
               <ul className="mt-2 space-y-1 text-sm">
                  <li>• Required fields: name, phone, type, status</li>
                  <li>• Business leads must include businessName</li>
                  <li>• Email addresses must be valid format</li>
                  <li>• Phone numbers should be 10-15 digits</li>
               </ul>
            </AlertDescription>
         </Alert>
      </div>
   )

   const renderPreviewStep = () => (
      <div className="space-y-6">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-[var(--interactive-primary)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
               <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-[var(--interactive-primary)] text-xs font-medium sm:text-sm">
                           Total Records
                        </p>
                        <p className="theme-text-primary text-2xl font-bold sm:text-3xl">
                           {leadData.length}
                        </p>
                     </div>
                     <Users className="text-[var(--interactive-primary)] h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
               </CardContent>
            </Card>

            <Card className="border-[var(--success-600)] bg-gradient-to-br from-[var(--success-50)] to-green-100">
               <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-xs font-medium text-[var(--success-600)] sm:text-sm">
                           Valid Records
                        </p>
                        <p className="text-2xl font-bold text-[var(--success-600)] sm:text-3xl">
                           {validRecords}
                        </p>
                     </div>
                     <CheckCircle2 className="h-6 w-6 text-[var(--success-600)] sm:h-8 sm:w-8" />
                  </div>
               </CardContent>
            </Card>

            <Card className="border-[var(--error-600)] bg-gradient-to-br from-[var(--error-50)] to-red-100 sm:col-span-2 lg:col-span-1">
               <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-xs font-medium text-[var(--error-600)] sm:text-sm">
                           Invalid Records
                        </p>
                        <p className="text-2xl font-bold text-[var(--error-600)] sm:text-3xl">
                           {invalidRecords}
                        </p>
                     </div>
                     <XCircle className="h-6 w-6 text-[var(--error-600)] sm:h-8 sm:w-8" />
                  </div>
               </CardContent>
            </Card>
         </div>

         {invalidRecords > 0 && (
            <Card className="border-[var(--error-600)] bg-[var(--error-50)]">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--error-600)]">
                     <AlertTriangle className="h-5 w-5" />
                     Validation Errors
                  </CardTitle>
                  <CardDescription className="text-[var(--error-600)]">
                     The following records have validation errors and will be
                     skipped during import.
                  </CardDescription>
               </CardHeader>
               <CardContent className="max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                     {(() => {
                        // Group errors by row
                        const errorsByRow = validationErrors.reduce(
                           (acc, error) => {
                              if (!acc[error.row]) {
                                 acc[error.row] = []
                              }
                              acc[error.row].push(error)
                              return acc
                           },
                           {} as Record<number, ValidationError[]>
                        )

                        return Object.entries(errorsByRow).map(
                           ([row, errors]) => (
                              <div
                                 key={`error-row-${row}`}
                                 className="rounded-lg border border-[var(--error-600)] bg-red-100 p-3"
                              >
                                 <p className="font-medium text-[var(--error-600)]">
                                    Row {row}
                                 </p>
                                 <ul className="mt-1 text-sm text-[var(--error-600)]">
                                    {errors.map((error, errIndex) => (
                                       <li
                                          key={`error-${row}-${errIndex}-${error.field || 'unknown'}`}
                                       >
                                          • <strong>{error.field}:</strong> {error.message}
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           )
                        )
                     })()}
                  </div>
               </CardContent>
            </Card>
         )}

         {validRecords > 0 && (
            <Card className="border-[var(--success-600)] bg-[var(--success-50)]">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--success-600)]">
                     <CheckCircle className="h-5 w-5" />
                     Ready for Import
                  </CardTitle>
                  <CardDescription className="text-[var(--success-600)]">
                     {validRecords}{' '}
                     {validRecords === 1 ? 'record is' : 'records are'} ready to
                     be imported.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <Button
                     onClick={handleImport}
                     disabled={loading || validRecords === 0}
                     className="w-full bg-gradient-to-r from-[var(--success-600)] to-[var(--success-700)] hover:from-[var(--success-700)] hover:to-[var(--success-800)] text-white"
                  >
                     {loading ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Starting Import...
                        </>
                     ) : (
                        <>
                           <Database className="mr-2 h-4 w-4" />
                           Import {validRecords}{' '}
                           {validRecords === 1 ? 'Lead' : 'Leads'}
                        </>
                     )}
                  </Button>
               </CardContent>
            </Card>
         )}
      </div>
   )

   const renderImportStep = () => (
      <div className="space-y-6">
         <Card className="border-[var(--interactive-primary)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
            <CardContent className="p-6 text-center sm:p-8">
               <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin">
                     <Loader2 className="text-[var(--interactive-primary)] h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                  <div>
                     <h3 className="theme-text-primary text-lg font-semibold sm:text-xl">
                        Importing Leads...
                     </h3>
                     <p className="theme-text-secondary text-sm sm:text-base">
                        Please wait while we process your data.
                     </p>
                  </div>
                  <div className="h-2 w-full max-w-md rounded-full bg-[var(--bg-tertiary)]">
                     <div
                        className="bg-[var(--interactive-primary)] h-2 rounded-full transition-all duration-300"
                        style={{ width: '66%' }}
                     ></div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   )

   const renderCompleteStep = () => (
      <div className="space-y-6">
         <Card className="border-[var(--success-600)] bg-gradient-to-r from-[var(--success-50)] to-green-100">
            <CardContent className="p-6 text-center sm:p-8">
               <div className="flex flex-col items-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-600)] sm:h-16 sm:w-16">
                     <CheckCircle className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-[var(--success-600)] sm:text-xl">
                        Import Successful!
                     </h3>
                     <p className="text-sm text-[var(--success-600)] sm:text-base">
                        Your leads have been successfully imported.
                     </p>
                  </div>
               </div>
            </CardContent>
         </Card>

         {importResults && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
               <Card className="border-[var(--interactive-primary)]">
                  <CardContent className="p-4 text-center sm:p-6">
                     <p className="theme-text-primary text-xl font-bold sm:text-2xl">
                        {importResults.totalLeads}
                     </p>
                     <p className="theme-text-secondary text-xs sm:text-sm">Total Processed</p>
                  </CardContent>
               </Card>
               <Card className="border-[var(--success-600)]">
                  <CardContent className="p-4 text-center sm:p-6">
                     <p className="text-xl font-bold text-[var(--success-600)] sm:text-2xl">
                        {importResults.successfullyCreated}
                     </p>
                     <p className="text-xs text-[var(--success-600)] sm:text-sm">
                        Successfully Created
                     </p>
                  </CardContent>
               </Card>
               <Card className="border-[var(--warning-600)] sm:col-span-2 lg:col-span-1">
                  <CardContent className="p-4 text-center sm:p-6">
                     <p className="text-xl font-bold text-[var(--warning-600)] sm:text-2xl">
                        {importResults.skipped}
                     </p>
                     <p className="text-xs text-[var(--warning-600)] sm:text-sm">Skipped</p>
                  </CardContent>
               </Card>
            </div>
         )}

         <div className="flex justify-center gap-4">
            <Button
               onClick={() => router.push('/lead-management')}
               className="theme-interactive-primary"
            >
               <CheckCircle className="mr-2 h-4 w-4" />
               View All Leads
            </Button>
         </div>
      </div>
   )

   const renderCurrentStep = () => {
      switch (currentStep) {
         case 'upload':
            return renderUploadStep()
         case 'validate':
            return (
               <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                     <Loader2 className="text-[var(--interactive-primary)] mx-auto mb-4 h-8 w-8 animate-spin sm:h-12 sm:w-12" />
                     <p className="theme-text-primary text-base font-medium sm:text-lg">
                        Validating Data...
                     </p>
                     <p className="theme-text-secondary text-sm sm:text-base">
                        Please wait while we check your data.
                     </p>
                  </div>
               </div>
            )
         case 'preview':
            return renderPreviewStep()
         case 'import':
            return renderImportStep()
         case 'complete':
            return renderCompleteStep()
         default:
            return renderUploadStep()
      }
   }

   return (
      <div className="theme-bg-primary min-h-screen">
         <div className="container mx-auto px-4 py-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
               <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading && currentStep !== 'complete'}
                  className="theme-border self-start hover:theme-bg-secondary sm:self-auto"
               >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Leads
               </Button>
               <div className="text-center sm:flex-1">
                  <h1 className="theme-text-primary text-xl font-bold sm:text-2xl lg:text-3xl">
                     Bulk Import Leads
                  </h1>
                  <p className="theme-text-secondary text-sm sm:text-base">
                     Import multiple leads from a CSV file
                  </p>
               </div>
               <div className="hidden w-32 sm:block"></div>{' '}
               {/* Spacer for balance */}
            </div>

            <Card className="theme-bg-primary theme-border mx-auto max-w-5xl">
               <CardContent className="p-4 sm:p-6 lg:p-8">
                  {error && (
                     <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                     </Alert>
                  )}

                  {renderStepIndicator()}
                  {renderCurrentStep()}
               </CardContent>
            </Card>
         </div>
      </div>
   )
}

export default BulkLeadImportPage
