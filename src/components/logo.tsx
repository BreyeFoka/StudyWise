import { BookOpen } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
      <BookOpen className="h-7 w-7 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" {...props} />
      <span className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">StudyWise</span>
    </div>
  );
}
