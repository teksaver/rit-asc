import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'

// jsdom does not implement <dialog> behavior (showModal/close just don't
// exist on the prototype): https://github.com/jsdom/jsdom/issues/3294
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open')
  }
}
