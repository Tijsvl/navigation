import { useState, useEffect } from 'react'
import { TNavItems } from './navItems'

// TODO: Optimize code, 'cause holy fugg...!

interface IProps {
  navItems: TNavItems[]
}

const Navigation = ({ navItems }: IProps): JSX.Element => {
  if (!navItems.length) {
    return <></>
  }

  const [isMobile, isMobileSet] = useState(false)

  // Sort by order
  const sortByKeyValue = (array: any[], key: string) => [...array].sort((a, b) => a[key] - b[key])

  // Add slug to each item
  navItems.forEach((item) => {
    if (!item.slug) {
      item.slug = item.title.trim().toLowerCase().replaceAll(' ', '-')
    }

    if (item.children) {
      item.children.forEach((childItem) => {
        if (!childItem.slug) {
          childItem.slug = childItem.title.trim().toLowerCase().replaceAll(' ', '-')
        }
      })
    }
  })

  const closeAll = () => {
    document.querySelectorAll('li[data-identifier]').forEach((nav) => close(nav))
    const backdrop = document.querySelector('#menu__backdrop')
    backdrop?.classList.remove('menu__backdrop--open')

    if (isMobile && document.querySelector('.menu--open')) {
      document.querySelector('.menu--open')?.classList.remove('menu--open')
    }
  }

  const close = (nav: Element) => {
    const btn = nav.querySelector('button')
    const container = nav.querySelector('ul')
    const urls = nav.querySelectorAll('a')
    btn?.setAttribute('aria-expanded', 'false')
    btn?.setAttribute('aria-label', `Open sub navigation ${btn.dataset.title}`)
    container?.classList.add('subnav--closed')
    container?.setAttribute('aria-hidden', 'true')
    urls.forEach((url) => url.setAttribute('tabindex', '-1'))
  }

  const open = (nav: HTMLElement) => {
    const btn = nav.querySelector('button')
    const container = nav.querySelector('ul')
    const urls = nav.querySelectorAll('a')
    const backdrop = document.querySelector('#menu__backdrop')
    btn?.setAttribute('aria-expanded', 'true')
    btn?.setAttribute('aria-label', `Close sub navigation ${btn.dataset.title}`)
    container?.classList.remove('subnav--closed')
    container?.setAttribute('aria-hidden', 'false')
    urls.forEach((url) => url.removeAttribute('tabindex'))
    backdrop?.classList.add('menu__backdrop--open')
  }

  const subnavHandler = (event: React.MouseEvent<HTMLElement>) => {
    if (!(event.target instanceof Element)) return

    const target: Element = event.target!

    if (event.target.tagName === 'A') {
      closeAll()
      return
    }

    event.preventDefault()

    const nav: HTMLElement = target.closest('[data-identifier]')!
    const identifier = nav?.getAttribute('data-identifier')
    const otherNavs = nav
      ?.closest('ul')
      ?.querySelectorAll(`li[data-identifier]:not([data-identifier='${identifier}']`)

    const shouldOpen = nav?.querySelector('ul')?.matches('.subnav--closed')

    if (shouldOpen) {
      open(nav)
      otherNavs?.forEach((otherNav) => close(otherNav))
      return
    }

    !isMobile ? closeAll() : close(nav)
  }

  useEffect(() => {
    const mediaquery = window.matchMedia('(width < 800px)')
    const urls = document.querySelectorAll('nav ul.menu > li > a, nav ul.menu > li > button')
    const menu = document.querySelector('.menu')

    if (mediaquery.matches) {
      isMobileSet(mediaquery.matches)
      menu && menu.setAttribute('aria-hidden', 'true')
      urls.forEach((url) => url.setAttribute('tabindex', '-1'))
    }

    mediaquery.addEventListener('change', (e) => {
      closeAll()
      isMobileSet(e.matches)

      if (mediaquery.matches) {
        urls.forEach((url) => url.setAttribute('tabindex', '-1'))
        menu?.setAttribute('aria-hidden', String(mediaquery.matches))
      } else {
        urls.forEach((url) => url.removeAttribute('tabindex'))
        menu?.removeAttribute('aria-hidden')
      }
    })

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const menu = document.querySelector('.menu--mobile')
        const btn = document.querySelector('.menu__hamburger')
        const backdrop = document.querySelector('#menu__backdrop')
        const urls = document.querySelectorAll('nav ul.menu > li > a, nav ul.menu > li > button')

        menu?.classList.remove('menu--open')
        menu?.setAttribute('aria-hidden', 'true')
        btn?.setAttribute('aria-expanded', 'false')
        btn?.setAttribute('aria-label', 'Open navigation')
        backdrop?.classList.remove('menu__backdrop--open')
        urls.forEach((url) => url.setAttribute('tabindex', '-1'))

        closeAll()
      }
    })
  }, [])

  window.addEventListener('click', (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return
    !event.target!.closest('nav') && closeAll()
  })

  const navHandler = (event: React.MouseEvent<HTMLElement>) => {
    console.log(event.target)
    if (!(event.target instanceof Element)) return
    const menu = event!.target!.closest('nav')!.querySelector('.menu--mobile')
    const btn = document.querySelector('.menu__hamburger')
    const shouldOpen = !menu?.matches('.menu--open')
    const backdrop = document.querySelector('#menu__backdrop')
    const urls = document.querySelectorAll('nav ul.menu > li > a, nav ul.menu > li > button')

    shouldOpen ? menu?.classList.add('menu--open') : menu?.classList.remove('menu--open')

    shouldOpen
      ? backdrop?.classList.add('menu__backdrop--open')
      : backdrop?.classList.remove('menu__backdrop--open')

    btn?.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false')
    menu?.setAttribute('aria-hidden', !shouldOpen ? 'true' : 'false')

    !shouldOpen && closeAll()

    if (shouldOpen) {
      urls.forEach((url) => url.removeAttribute('tabindex'))
      btn?.setAttribute('aria-label', 'Close navigation')
    } else {
      urls.forEach((url) => url.setAttribute('tabindex', '-1'))
      btn?.setAttribute('aria-label', 'Open navigation')
    }
  }

  return (
    <>
      <div className='menu__backdrop' id='menu__backdrop'></div>
      <nav>
        {isMobile && (
          <button
            aria-label='Open navigation'
            aria-controls='menu'
            aria-expanded='false'
            onClick={navHandler}
            className='menu__hamburger'
          >
            ☰
          </button>
        )}
        <ul className={`menu ${isMobile ? 'menu--mobile' : 'menu--desktop'}`} id='menu'>
          {sortByKeyValue(navItems, 'order').map(({ title, children, slug }) => (
            <li
              key={slug}
              {...(children && { 'data-identifier': slug })}
              className={children && 'subnav-container'}
            >
              {!children ? (
                <a href={`#/${slug}`} onClick={closeAll}>
                  {title}
                </a>
              ) : (
                <button
                  aria-label={`Open subnavigation ${title}`}
                  aria-controls={slug}
                  aria-expanded='false'
                  data-title={title}
                  onClick={subnavHandler}
                >
                  {title}
                </button>
              )}
              {children && (
                <ul className='subnav subnav--closed' id={slug} aria-hidden='true'>
                  {sortByKeyValue(children, 'order').map(({ title: childTitle, slug: childSlug }) => (
                    <li key={`#/${childSlug}`} title={childSlug}>
                      <a href={`#/{childSlug}`} onClick={subnavHandler}>
                        {childTitle}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default Navigation
