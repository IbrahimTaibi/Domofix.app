import { ReactNode } from "react";

type ValueItemProps = {
  icon?: ReactNode;
  title: string;
  description: string;
};

export function ValueItem({ icon, title, description }: ValueItemProps) {
  return (
    <div className="p-6 rounded-lg hover:bg-gray-50 transition-all group will-change-transform hover:translate-y-[-2px]">
      <div className="flex items-start space-x-4">
        {icon ? <div className="mt-1 text-[#0D77FF]">{icon}</div> : null}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}