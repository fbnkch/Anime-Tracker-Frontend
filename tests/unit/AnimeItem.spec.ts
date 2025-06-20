import { mount } from '@vue/test-utils'
import AnimeItem from '../../src/components/AnimeItem.vue'

describe('AnimeItem.vue', () => {
  it('zeigt Titel und Episoden korrekt an', () => {
    const anime = {
      title: 'Naruto',
      image: 'bild.jpg',
      total_episodes: 220,
      watched_episodes: 10,
      is_favorite: false
    }
    const wrapper = mount(AnimeItem, { props: { anime } })
    expect(wrapper.text()).toContain('Naruto')
    expect(wrapper.text()).toContain('10 / 220')
  })

  it('emittiert toggle-favorite beim Klick auf Stern', async () => {
    const anime = {
      title: 'Naruto',
      image: 'bild.jpg',
      total_episodes: 220,
      watched_episodes: 10,
      is_favorite: false
    }
    const wrapper = mount(AnimeItem, { props: { anime } })
    await wrapper.find('.favorite-button').trigger('click')
    expect(wrapper.emitted()['toggle-favorite']).toBeTruthy()
  })
})
