/*
 * Copyright (C) 2019 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {render, fireEvent, act, wait} from 'react-testing-library'
import userEvent from '@testing-library/user-event'
import UnsplashPanel from '../UnsplashPanel'

// Mock out the debounce to fire without debounce during tests.
jest.mock('lodash', () => ({debounce: jest.fn(fn => fn)}))

const getSampleUnsplashResults = () => ({
  total_results: 2321,
  total_pages: 194,
  results: [
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1532386236358-a33d8a9434e3?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1532386236358-a33d8a9434e3?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: '1l2waV8glIQ',
      alt_text: 'selective focus photography brown cat lying over black cat',
      user: {
        name: 'Raul Varzar',
        avatar:
          'https://images.unsplash.com/profile-1538941834664-a6d8eb80866b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1479065476818-424362c3a854?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1479065476818-424362c3a854?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'Y_pLBbSAhHI',
      alt_text: 'four brown tabby kittens',
      user: {
        name: "Q'AILA",
        avatar:
          'https://images.unsplash.com/profile-fb-1478804329-75cc0bd7b087.jpg?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1484733544471-3abf5846a4ff?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1484733544471-3abf5846a4ff?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'gAPXLS1LRVE',
      alt_text: 'two short-fur orange cats lying on gray surface',
      user: {
        name: 'Olya Kuzovkina',
        avatar:
          'https://images.unsplash.com/profile-1484733460542-9653d0439bd9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1555606396-79625d075363?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1555606396-79625d075363?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'jqhsi0NqdUI',
      alt_text: 'person holding cat',
      user: {
        name: 'Tran Mau Tri Tam',
        avatar:
          'https://images.unsplash.com/profile-1527595925338-3e074feb55ce?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1559235038-1b0fadf76f78?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1559235038-1b0fadf76f78?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'MNju0A6EeE0',
      alt_text: 'two silver tabby kittens',
      user: {
        name: 'Amy Baugess',
        avatar:
          'https://images.unsplash.com/profile-fb-1554227696-3afa4dab2fae.jpg?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1554181192-3ebfd857cc40?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1554181192-3ebfd857cc40?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: '4mA9_5vbZ_s',
      alt_text: 'three cats beside road',
      user: {
        name: 'Yuliya Kosolapova',
        avatar:
          'https://images.unsplash.com/profile-1542573282965-bd0ef4147e78?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1554530700-747e22bb4e56?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1554530700-747e22bb4e56?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'bhO_wSXegfI',
      alt_text: 'grey cat',
      user: {
        name: 'Sandy Millar',
        avatar:
          'https://images.unsplash.com/profile-1530245392659-56d20d09dfba?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1554146445-58ae3448247d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1554146445-58ae3448247d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'zgQXEtEnaxA',
      alt_text: 'long-fur brown cat sitting on white desk',
      user: {
        name: 'Rikki Austin',
        avatar:
          'https://images.unsplash.com/profile-1542043341496-520a51bf0ccb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1547239246-d2f052bdccf8?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1547239246-d2f052bdccf8?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'S10uzabOxr4',
      alt_text: 'selective focus photography of gray cat beside window',
      user: {
        name: 'Rikki Austin',
        avatar:
          'https://images.unsplash.com/profile-1542043341496-520a51bf0ccb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1550606873-e09a0d1a5a93?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1550606873-e09a0d1a5a93?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: '0vvwnuxvtnw',
      alt_text: 'selective focus photography of short-fur black cat',
      user: {
        name: 'Maria Teneva',
        avatar:
          'https://images.unsplash.com/profile-fb-1540063787-b5d9329fee86.jpg?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1549221987-25a490f65d34?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1549221987-25a490f65d34?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'KWu_pl00QEQ',
      alt_text: 'gray and brown cat near stairs',
      user: {
        name: 'Maria Teneva',
        avatar:
          'https://images.unsplash.com/profile-fb-1540063787-b5d9329fee86.jpg?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    },
    {
      urls: {
        link:
          'https://images.unsplash.com/photo-1557369560-a25f3fad22cf?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ',
        thumbnail:
          'https://images.unsplash.com/photo-1557369560-a25f3fad22cf?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ'
      },
      id: 'TszVNhi39a8',
      alt_text: null,
      user: {
        name: 'Karly Gomez',
        avatar:
          'https://images.unsplash.com/profile-1556908132245-1b888ce7e85d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32'
      }
    }
  ]
})

describe('UnsplashPanel', () => {
  it('fires off searches when the user types in the search box', () => {
    const fakeSource = {
      searchUnsplash: jest.fn().mockResolvedValue({})
    }
    const {getByLabelText} = render(<UnsplashPanel source={fakeSource} setUnsplashData={() => {}}/>)
    const selectBox = getByLabelText('Search Term')
    act(() => {
      userEvent.type(selectBox, 'kittens')
    })

    expect(fakeSource.searchUnsplash).toHaveBeenCalled()
  })

  it('displays results after searching', async () => {
    const fakeSource = {
      searchUnsplash: jest.fn().mockResolvedValue(getSampleUnsplashResults())
    }
    const {getByLabelText, getByTestId} = render(<UnsplashPanel source={fakeSource} setUnsplashData={() => {}}/>)
    const selectBox = getByLabelText('Search Term')
    act(() => {
      userEvent.type(selectBox, 'kittens')
    })
    let resultsContainer;
    await wait(() => {resultsContainer = getByTestId('UnsplashResultsContainer')})
    expect(resultsContainer.children).toHaveLength(12)
  })

  it(
    'shows pagination controls when there are more than one page of results', async () => {
    const fakeSource = {
      searchUnsplash: jest.fn().mockResolvedValue(getSampleUnsplashResults())
    }
    const {getByLabelText, getByText} = render(<UnsplashPanel source={fakeSource} setUnsplashData={() => {}}/>)
    const selectBox = getByLabelText('Search Term')
    act(() => {
      userEvent.type(selectBox, 'kittens')
    })
    let nextPage
    await wait(() => (nextPage = getByText('Next Page')))
    expect(nextPage).toBeVisible()

  }
  )

  it('does not show pagination when there is only one page of results', async () => {
    const fakeResults = getSampleUnsplashResults()
    fakeResults.total_pages = 1
    const fakeSource = {
      searchUnsplash: jest.fn().mockResolvedValue(fakeResults)
    }
    const {getByLabelText, queryByText} = render(<UnsplashPanel source={fakeSource} setUnsplashData={() => {}} />)
    const selectBox = getByLabelText('Search Term')
    act(() => {
      userEvent.type(selectBox, 'kittens')
    })
    let nextPage
    await wait(() => (nextPage = queryByText('Next Page')))
    expect(nextPage).toBeNull()
  })

  it('selects an image, calling setUnsplashData, when clicking an image', async () => {
    const fakeResults = getSampleUnsplashResults()
    const fakeSource = {
      searchUnsplash: jest.fn().mockResolvedValue(fakeResults)
    }
    const fakeSetUnsplashData = jest.fn()
    const {getByLabelText, getByAltText} = render(
      <UnsplashPanel source={fakeSource} setUnsplashData={fakeSetUnsplashData}/>
    )
    const selectBox = getByLabelText('Search Term')
    act(() => {
      userEvent.click(selectBox)
      userEvent.type(selectBox, 'kittens')
    })
    let image;
    await wait(() => image = getByAltText('selective focus photography brown cat lying over black cat'))
    act(() => {
      userEvent.click(image)
    })
    expect(fakeSetUnsplashData).toHaveBeenCalledWith({
      url: fakeResults.results[0].urls.link,
      id: fakeResults.results[0].id
    })
  })

  describe('Attribution', () => {
    it('shows attribution when an image has focus', async () => {
      const fakeResults = getSampleUnsplashResults()
      const fakeSource = {
        searchUnsplash: jest.fn().mockResolvedValue(fakeResults)
      }
      const {getByLabelText, getByAltText, getByText} = render(
        <UnsplashPanel source={fakeSource} setUnsplashData={() => {}} />
      )
      const selectBox = getByLabelText('Search Term')
      act(() => {
        userEvent.click(selectBox)
        userEvent.type(selectBox, 'kittens')
      })
      let image;
      await wait(() => image = getByAltText('selective focus photography brown cat lying over black cat'))
      act(() => {
        userEvent.click(image)
      })
      expect(getByText('Raul Varzar')).toBeInTheDocument();
    })
  })
})
