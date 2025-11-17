import { useWidgetStore } from '@/features/widget/store/widget-store'

describe('widget store', () => {
  it('defaults to closed and home tab', () => {
    const s = useWidgetStore.getState()
    expect(s.open).toBe(false)
    expect(s.tab).toBe('home')
  })
  it('updates tab', () => {
    useWidgetStore.getState().setTab('messages')
    expect(useWidgetStore.getState().tab).toBe('messages')
  })
  it('updates open', () => {
    useWidgetStore.getState().setOpen(true)
    expect(useWidgetStore.getState().open).toBe(true)
  })
})