export type TNavItems = {
  title: string
  slug?: string
  order: number
  children?: TNavItems[]
}

const navItems: TNavItems[] = [
  {
    title: 'About',
    order: 1
  },
  {
    title: 'All Mockups',
    order: 3
  },
  {
    title: 'Destinations',
    order: 2,
    children: [
      {
        title: 'Bulgaria',
        order: 1
      },
      {
        title: 'Costa Rica',
        order: 2
      },
      {
        title: 'Hong Kong',
        order: 3
      },
      {
        title: 'Morocco',
        order: 4
      },
      {
        title: 'The Netherlands',
        order: 5
      },
      {
        title: 'Nicaragua',
        order: 6
      },
      {
        title: 'Spain',
        order: 7
      },
      {
        title: 'Thailand',
        order: 8
      },
      {
        title: 'United Kingdom',
        order: 9
      }
    ]
  },
  {
    title: 'Freebies',
    order: 4
  }
]

export default navItems
