/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useEffect, useCallback } from 'react'
import { TNavItems } from './navItems'
import './navigation.scss'

// TODO: Optimize code, 'cause holy fugg...!

interface IProps {
  navItems: TNavItems[]
}

const Navigation = ({ navItems }: IProps): JSX.Element => {
  const [isMobile, isMobileSet] = useState(false)

  // Sort by order
  const sortByKeyValue = (array: TNavItems[]) => [...array].sort((a, b) => a.order - b.order)

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

  const closeAll = useCallback(() => {
    document.querySelectorAll('li[data-identifier]').forEach((nav) => close(nav))
    const backdrop = document.querySelector('#navigation__backdrop')
    backdrop?.classList.remove('navigation__backdrop--open')

    if (isMobile && document.querySelector('.navigation__menu--open')) {
      document.querySelector('.navigation__menu--open')?.classList.remove('navigation__menu--open')
    }
  }, [isMobile])

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
    const backdrop = document.querySelector('#navigation__backdrop')
    btn?.setAttribute('aria-expanded', 'true')
    btn?.setAttribute('aria-label', `Close sub navigation ${btn.dataset.title}`)
    container?.classList.remove('subnav--closed')
    container?.setAttribute('aria-hidden', 'false')
    urls.forEach((url) => url.removeAttribute('tabindex'))
    backdrop?.classList.add('navigation__backdrop--open')
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
    const otherNavs = nav?.closest('ul')?.querySelectorAll(`li[data-identifier]:not([data-identifier='${identifier}']`)

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
    const urls = document.querySelectorAll('.navigation__menu > li > a, .navigation__menu > li > button')
    const menu = document.querySelector('.navigation__menu')

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
        const menu = document.querySelector('.navigation__menu--mobile')
        const btn = document.querySelector('.navigation__menu__hamburger')
        const backdrop = document.querySelector('#navigation__backdrop')
        const urls = document.querySelectorAll('.navigation__menu > li > a, .navigation__menu > li > button')
        const subNavUrls = document.querySelectorAll('.navigation__menu > li > ul > li > a, .navigation__menu > li > ul > li > button')

        menu?.classList.remove('navigation__menu--open')
        menu?.setAttribute('aria-hidden', 'true')
        btn?.setAttribute('aria-expanded', 'false')
        btn?.setAttribute('aria-label', 'Open navigation')
        backdrop?.classList.remove('navigation__backdrop--open')

        if (isMobile) {
          urls.forEach((url) => url.setAttribute('tabindex', '-1'))
          subNavUrls.forEach((url) => url.setAttribute('tabindex', '-1'))
        } else {
          subNavUrls.forEach((url) => url.setAttribute('tabindex', '-1'))
        }

        closeAll()
      }
    })
  }, [closeAll, isMobile])

  window.addEventListener('click', (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return
    !event.target!.closest('nav') && closeAll()
  })

  const navHandler = (event: React.MouseEvent<HTMLElement>) => {
    if (!(event.target instanceof Element)) return
    const menu = event!.target!.closest('nav')!.querySelector('.navigation__menu--mobile')
    const btn = document.querySelector('.navigation__menu__hamburger')
    const shouldOpen = !menu?.matches('.navigation__menu--open')
    const backdrop = document.querySelector('#navigation__backdrop')
    const urls = document.querySelectorAll('.navigation__menu > li > a, .navigation__menu > li > button')

    shouldOpen ? menu?.classList.add('navigation__menu--open') : menu?.classList.remove('navigation__menu--open')

    shouldOpen ? backdrop?.classList.add('navigation__backdrop--open') : backdrop?.classList.remove('navigation__backdrop--open')

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
      <div className="navigation__backdrop" id="navigation__backdrop"></div>
      <nav className="navigation">
        {isMobile && (
          <button aria-label="Open navigation" aria-controls="menu" aria-expanded="false" onClick={navHandler} className="navigation__hamburger">
            ☰
          </button>
        )}
        <ul className={`navigation__menu ${isMobile ? 'navigation__menu--mobile' : 'navigation__menu--desktop'}`} id="menu">
          {sortByKeyValue(navItems).map(({ title, children, slug }) => (
            <li key={slug} {...(children && { 'data-identifier': slug })} className={children && 'subnav-container'}>
              {!children ? (
                <a href={`#${slug}`} onClick={closeAll}>
                  {title}
                </a>
              ) : (
                <button aria-label={`Open subnavigation ${title}`} aria-controls={slug} aria-expanded="false" data-title={title} onClick={subnavHandler}>
                  {title}
                </button>
              )}
              {children && (
                <ul className="subnav subnav--closed" id={slug} aria-hidden="true">
                  {sortByKeyValue(children).map(({ title: childTitle, slug: childSlug }) => (
                    <li key={`#${slug}/${childSlug}`}>
                      <a href={`#${slug}/${childSlug}`} onClick={subnavHandler}>
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
