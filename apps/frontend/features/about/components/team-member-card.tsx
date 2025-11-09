import Image from "next/image";

type TeamMemberCardProps = {
  name: string;
  role: string;
  avatarUrl?: string;
};

export function TeamMemberCard({ name, role, avatarUrl }: TeamMemberCardProps) {
  return (
    <div className="p-4 rounded-lg hover:bg-gray-50 transition-all will-change-transform hover:translate-y-[-2px]">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} width={48} height={48} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              {name[0]}
            </div>
          )}
        </div>
        <div>
          <p className="text-base font-medium text-gray-900 leading-none">{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}