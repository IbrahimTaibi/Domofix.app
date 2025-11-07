'use client'

import { User } from '@darigo/shared-types'
import ProfileInfo from './profile-info'
import AccountSettings from './account-settings'

type ProfileTabsProps = {
  user: User
}

export default function ProfileTabs({ user }: ProfileTabsProps) {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-2 sm:px-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <TabButton id="overview" active>Aperçu</TabButton>
          <TabButton id="activity">Activité</TabButton>
          <TabButton id="settings">Paramètres</TabButton>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* For now, show Overview and Settings stacked; future: real tabs */}
        <div className="space-y-4">
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="sr-only">Aperçu</h2>
            <ProfileInfo user={user} />
          </section>

          <section aria-labelledby="settings-heading">
            <h2 id="settings-heading" className="sr-only">Paramètres</h2>
            <AccountSettings user={user} />
          </section>
        </div>
      </div>
    </div>
  )
}

function TabButton({ id, active, children }: { id: string; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-controls={`${id}-panel`}
      aria-selected={active}
      className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md border ${
        active ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}