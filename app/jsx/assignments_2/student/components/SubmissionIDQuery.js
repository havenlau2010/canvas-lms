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

import errorShipUrl from '../SVG/ErrorShip.svg'
import GenericErrorPage from '../../../shared/components/GenericErrorPage/index'
import I18n from 'i18n!assignments_2_initial_query'
import LoadingIndicator from '../../shared/LoadingIndicator'
import {Query} from 'react-apollo'
import React from 'react'
import {string} from 'prop-types'
import StudentViewQUery from './StudentViewQuery'
import {SUBMISSION_ID_QUERY} from '../assignmentData'

const SubmissionIDQuery = props => (
  <Query query={SUBMISSION_ID_QUERY} variables={{assignmentLid: props.assignmentLid}}>
    {({loading, error, data}) => {
      if (loading) return <LoadingIndicator />
      if (error) {
        return (
          <GenericErrorPage
            imageUrl={errorShipUrl}
            errorSubject={I18n.t('Assignments 2 Student initial query error')}
            errorCategory={I18n.t('Assignments 2 Student Error Page')}
          />
        )
      }

      return (
        <StudentViewQUery
          assignmentLid={props.assignmentLid}
          submissionID={data.assignment.submissionsConnection.nodes[0].id}
        />
      )
    }}
  </Query>
)

SubmissionIDQuery.propTypes = {
  assignmentLid: string.isRequired
}

export default SubmissionIDQuery
