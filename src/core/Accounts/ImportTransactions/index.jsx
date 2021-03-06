import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import InstitutionIcon from '../../../common/InstitutionIcon'
import { addTransactions } from '../../../store/transactions/actions'
import CsvImportForm from './CsvImportForm'
import ImportResults from './ImportResults'

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
    width: '80%'
  },
  importAreaHeader: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

const mapStateToProps = ({ accounts }, props) => ({
  account: accounts.byId[props.match.params.accountId]
})

const mapDispatchToProps = dispatch => ({
  saveTransactions: (account, transactions) => dispatch(addTransactions(account, transactions))
})

const initialState = {
  showTransactions: false,
  transactions: [],
  errors: {}
}

export class ImportTransactionsComponent extends React.Component {
  state = initialState

  handleSave = () => {
    const { saveTransactions, account, history } = this.props
    saveTransactions(account, this.state.transactions)
    history.push(`/accounts/${account.id}/transactions`)
  }

  handleCancel = () => {
    this.props.history.push(`/accounts/${this.props.account.id}/transactions`)
  }

  handleParsedData = (transactions, errors) => {
    return this.setState({
      showTransactions: true,
      transactions,
      errors
    })
  }

  render() {
    const {
      showTransactions,
      transactions,
      errors
    } = this.state
    const {
      classes,
      account,
      match
    } = this.props
    const { importType } = match.params

    return (
      <Grid container direction="row" justify="center">
        <Paper className={classes.root}>
          <div className={classes.importAreaHeader}>
            <Typography variant="h6" align="center">
              Import transactions from {importType}
            </Typography>
            <Typography>
              <InstitutionIcon institution={account.institution} size="small" />
            </Typography>
          </div>
          <Divider />
          {!showTransactions && importType === 'CSV' &&
            <CsvImportForm
              account={account}
              handleParsedData={this.handleParsedData}
              onCancel={this.handleCancel}
            />
          }
          {showTransactions &&
            <ImportResults
              transactions={transactions}
              errors={errors}
              onSave={this.handleSave}
              onCancel={this.handleCancel}
            />
          }
        </Paper>
      </Grid>
    )
  }
}

ImportTransactionsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  saveTransactions: PropTypes.func.isRequired
}

export default withRouter(compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(ImportTransactionsComponent))
