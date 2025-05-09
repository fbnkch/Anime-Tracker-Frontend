import { shallowMount } from '@vue/test-utils'
import AnimeItem from '@/components/AnimeItem.vue'

describe('AnimeItem.vue', () => {
  it('renders anime title correctly', () => {
    const anime = {
      id: 1,
      title: 'Test Anime',
      image: 'test-image.jpg',
      total_episodes: 12,
      watched_episodes: 5
    }

    const wrapper = shallowMount(AnimeItem, {
      props: { anime }
    })

    expect(wrapper.text()).toContain('Test Anime')
    expect(wrapper.text()).toContain('5 / 12')
  })
})
