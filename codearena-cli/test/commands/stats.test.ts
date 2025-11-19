import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('stats', () => {
  it('runs stats cmd', async () => {
    const {stdout} = await runCommand('stats')
    expect(stdout).to.contain('hello world')
  })

  it('runs stats --name oclif', async () => {
    const {stdout} = await runCommand('stats --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
