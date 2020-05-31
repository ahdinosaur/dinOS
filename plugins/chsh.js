// https://docs.saltstack.com/en/develop/ref/states/all/salt.states.git.html

const waterfall = require('run-waterfall')
const getUser = require('../lib/getUser')
const Log = require('pino')
const defaultFs = require('fs')
const { join } = require('path')

const exec = require('./exec')

module.exports = chSh

function chSh (options) {
  const {
    shell,
    log = Log(),
    fs = defaultFs,
    env = process.env,
    username = env.USER
  } = options

  var steps = [
    cb => {
      log.info(`getUser ${username}`)
      getUser(fs, username, cb)
    },
    (user, cb) => {
      log.info(user)
      if (user.shell === shell) return cb(null)
      exec({
        command: `chsh -s "${shell}" "${username}"`,
        sudo: true
      })(cb)
    }
  ]

  return cb => waterfall(steps, cb)
}
