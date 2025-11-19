import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('register', () => {
  it('runs register cmd', async () => {
    const {stdout} = await runCommand('register')
    expect(stdout).to.contain('hello world')
  })

  it('runs register --name oclif', async () => {
    const {stdout} = await runCommand('register --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
