import React, { Component } from 'react'
import MatchForm from './MatchForm'
import MatchesAccountHeader from './MatchesAccountHeader'
import Account from '../models/Account'

const latestSeason = 11

class MatchFormPage extends Component {
  constructor(props) {
    super(props)
    this.state = { totalMatches: 0 }
  }

  componentDidMount() {
    const { dbAccounts, accountID } = this.props
    Account.find(dbAccounts, accountID).then(account => {
      this.setState(prevState => ({ account }))
    })
  }

  onMatchCreation = () => {
    this.setState(prevState => ({ totalMatches: prevState.totalMatches + 1 }))
    this.props.onPageChange('matches')
  }

  render() {
    const { dbMatches, accountID, latestRank, isPlacement,
            isLastPlacement } = this.props
    const { account } = this.state

    return (
      <div className="container layout-children-container">
        <MatchesAccountHeader
          account={account}
          season={latestSeason}
          isPlacement={isPlacement}
          activePage="log-match"
        />
        <MatchForm
          season={latestSeason}
          accountID={accountID}
          db={dbMatches}
          isPlacement={isPlacement}
          isLastPlacement={isLastPlacement}
          latestRank={latestRank}
          onCreate={this.onMatchCreation}
        />
      </div>
    )
  }
}

export default MatchFormPage
