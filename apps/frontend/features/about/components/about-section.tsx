import { ReactNode } from "react";

type AboutSectionProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function AboutSection({ title, description, children }: AboutSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-3">{title}</h2>
          {description ? (
            <p className="text-gray-600 max-w-xl mx-auto">{description}</p>
          ) : null}
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    </section>
  );
}