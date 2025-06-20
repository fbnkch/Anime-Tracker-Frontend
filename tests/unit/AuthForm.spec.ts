import { mount } from '@vue/test-utils'
import AuthForm from '../../src/components/AuthForm.vue'

describe('AuthForm.vue', () => {
  it('zeigt Login und Registrieren Modus korrekt an', async () => {
    const wrapper = mount(AuthForm, {
      props: { onLogin: jest.fn(), onRegister: jest.fn() }
    })
    expect(wrapper.text()).toContain('Anmelden')
    await wrapper.find('.secondary-button').trigger('click')
    expect(wrapper.text()).toContain('Registrieren')
  })

  it('zeigt Fehlermeldung bei leerem Benutzernamen', async () => {
    const wrapper = mount(AuthForm, {
      props: { onLogin: jest.fn(), onRegister: jest.fn() }
    })
    await wrapper.find('.primary-button').trigger('click')
    expect(wrapper.text()).toContain('Bitte gib einen Benutzernamen ein.')
  })
})
