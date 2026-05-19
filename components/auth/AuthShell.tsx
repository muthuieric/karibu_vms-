import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  children: ReactNode;
  wide?: boolean;
};

export function AuthShell({ children, wide = false }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Small Header for Home link */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
     
        <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          Back to Home
        </Link>
      </div>

      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 mt-12 sm:mt-0">
        <div className={`w-full max-w-[1000px] bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col lg:flex-row ${wide ? 'lg:max-w-[1100px]' : 'max-w-md'}`}>
          
          <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>

          {wide && (
            <div className="hidden lg:flex flex-1 bg-blue-50 border-l border-blue-100 p-16 flex-col justify-center relative overflow-hidden">
               {/* Soft background shape instead of blur orbs */}
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full opacity-60 mix-blend-soft-light -translate-y-1/2 translate-x-1/4"></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100 rounded-full opacity-50 mix-blend-multiply translate-y-1/3 -translate-x-1/4"></div>
               
               <div className="relative z-10">
               
               
                 
                 <h3 className="text-3xl font-bold text-zinc-900 mb-8 tracking-tight leading-tight">A cleaner way to manage every visit.</h3>
                 <ul className="space-y-5">
                   {[
                     { text: "Digital visitor history", color: "bg-blue-500" },
                     { text: "Clear guard workflow", color: "bg-green-500" },
                     { text: "Host & department organization", color: "bg-orange-500" },
                     { text: "Better control over restricted visitors", color: "bg-blue-600" }
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-4 text-zinc-700 font-medium" itemProp="name">
                       <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`}></span>
                       {item.text}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
