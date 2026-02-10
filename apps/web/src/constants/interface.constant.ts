export interface FormFieldWrapperProps {
   name: string
   label: string
   placeholder?: string
   required?: boolean
   fieldType: 'input' | 'textarea' | 'select'
   type?: string
   rows?: number
   options?: Array<{ value: string; label: string }>
}
