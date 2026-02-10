import Link from 'next/link'
import { ThemeDemo } from '@/components/demo/ThemeDemo'

export default function Home() {
   return (
      <div className="theme-bg-primary min-h-screen">
         <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
               <h1 className="theme-text-primary mb-4 text-4xl font-bold">
                  projectname - projectname System
               </h1>
               <p className="theme-text-secondary mb-8 text-lg">
                  Professional projectname with beautiful theme system
               </p>

               <div className="flex justify-center gap-4">
                  <Link
                     href="/login"
                     className="theme-interactive-primary rounded-lg px-6 py-3 font-medium text-white transition-all duration-200 hover:shadow-lg"
                  >
                     View Login Page
                  </Link>
                  <Link
                     href="#theme-demo"
                     className="theme-interactive-secondary rounded-lg px-6 py-3 font-medium text-white transition-all duration-200 hover:shadow-lg"
                  >
                     Theme Demo
                  </Link>
               </div>
            </div>

            <div id="theme-demo">
               <ThemeDemo />
            </div>
         </div>
      </div>
   )
}
