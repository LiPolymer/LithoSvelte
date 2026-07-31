import type { Action } from 'svelte/action'

export type PortalTarget = HTMLElement | string | false | null | undefined

function resolvePortalTarget(target: PortalTarget) {
  if (target === false) return null
  if (target instanceof HTMLElement) return target
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target)
  }
  return document.body
}

export const portal: Action<HTMLElement, PortalTarget> = (node, target) => {
  const placeholder = document.createComment('lds-portal')
  node.before(placeholder)

  function move(nextTarget: PortalTarget) {
    const destination = resolvePortalTarget(nextTarget)

    if (destination) {
      destination.append(node)
    } else if (placeholder.parentNode) {
      placeholder.parentNode.insertBefore(node, placeholder.nextSibling)
    }
  }

  move(target)

  return {
    update: move,
    destroy() {
      placeholder.remove()
    },
  }
}
