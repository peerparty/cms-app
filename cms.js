const hyperdb = require('hyperdb'),
//  hyperdiscovery = require('hyperdiscovery'),
  idb = require('random-access-idb'),
  webrtc = require('webrtc-swarm'),
  signalhub = require('signalhub'),
//  hyperdrive = require('hyperdrive'),
  pump = require('pump')

const key = 'c15684126b5592f0cda413a2dd14f88ec675240a4f60088a546a06673257f719'
const DEFAULT_SIGNALHUBS = 'https://signalhub.p2ee.org'
//const DEFAULT_SIGNALHUBS = 'http://localhost/signalhub'
//var DEFAULT_SIGNALHUBS = 'https://signalhub-jccqtwhdwc.now.sh'

const db = hyperdb(filename => {
  return idb('cms')(filename)
}, key, { valueEncoding: 'utf-8' })

exports.init = function() {
  return new Promise(resolve => {
    db.on('ready', function () {
      const key = db.key.toString('hex')
      const disckey = db.discoveryKey.toString('hex')
 
      //console.log('KEY: ' + key) 
      //console.log('DISC KEY: ' + disckey)
      //console.log('LOCAL KEY: ' + db.local.key.toString('hex'))

      const swarm = webrtc(signalhub(disckey, DEFAULT_SIGNALHUBS))
    
      swarm.on('peer', function (conn) {
        const peer = db.replicate({
          live: true,
          upload: false,
          download: true
        })
        pump(conn, peer, conn)
        window.dispatchEvent(new Event('peer'))
      })
      resolve()
    })
  })
}

function get(key) {
  return new Promise((resolve, reject) => {
    db.get(key, (err, nodes) => {
      if(err) reject(err)
      try {
        if(nodes.length > 0) {
          const obj = JSON.parse(nodes[0].value)
          resolve(obj)
        }
        else resolve(undefined)
      } catch(e) {
        reject(e)
      }
    })
  })
}

function getPage(pageId) {
  return new Promise((resolve, reject) => {
    get(pageId).then(page => {
      page.id = pageId
      resolve(page)
    }).catch(reject)
  })
}

exports.getPages = function() {
  return new Promise((resolve, reject) => {
    get('pages').then(pages => {
      resolve(Promise.all(pages.map(getPage)))
    }).catch(reject)
  })
}

