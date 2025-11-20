'use client'

import { User } from '@domofix/shared-types'
import ProfileInfo from './profile-info'
import AccountSettings from './account-settings'

type ProfileTabsProps = {
  user: User
}

export default function ProfileTabs({ user }: ProfileTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-2 sm:px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            <TabButton id="overview" active>Aperçu</TabButton>
            <TabButton id="activity">Activité</TabButton>
            <TabButton id="settings">Paramètres</TabButton>
          </div>
        </div>
      </div>

      <div className="p-4">
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
      className={`px-3 py-1.5 text-xs sm:text-sm rounded-md border ${
        active ? 'bg-white border-primary-300 text-primary-700 shadow' : 'bg-transparent border-transparent text-gray-700 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}