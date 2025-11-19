import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('submit', () => {
  it('runs submit cmd', async () => {
    const {stdout} = await runCommand('submit')
    expect(stdout).to.contain('hello world')
  })

  it('runs submit --name oclif', async () => {
    const {stdout} = await runCommand('submit --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
