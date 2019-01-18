const cms = require('./cms')

let pagesObj = {}

function append(sel, node) {
  document.querySelector(sel).appendChild(node)
}

function getTemplate(clazz) {
  return document.querySelector('#templates ' + clazz).cloneNode(true)
}

function showPage(page) {
  document.querySelector('#content').innerHTML = page.content
}

function handleNav(e) {
  showPage(pagesObj[this.id])
}

function addNavItem(page) {
  var node = getTemplate('.nav-item')
  node.setAttribute('id', page.id)
  node.querySelector('a').innerHTML = page.title
  node.addEventListener('click', handleNav)
  append('nav ul', node)
}

function handleError(err) {
  console.log('Error!!!! ' + err)
}

function handlePages(pages) {
  document.querySelector('nav ul').innerHTML = '' 
  pages.map(page => {
    pagesObj[page.id] = page
    showPage(pages[0])
    addNavItem(page)
  })
  window.removeEventListener('peer', getPages)
}

function getPages() {
  cms.getPages().then(handlePages).catch(handleError)
}

window.addEventListener('peer', getPages) 
 
cms.init()
  .then(getPages)
  .catch(handleError)

