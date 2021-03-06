import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import DashboardIcon from '@material-ui/icons/Dashboard'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import grey from '@material-ui/core/colors/grey'
import { currencyFormatter, dateFormatter } from '../../util/stringFormatter'
import InstitutionIcon from '../../common/InstitutionIcon'

const styles = theme => ({
  balancePaper: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
    paddingLeft: 150,
    position: 'relative'
  },
  balanceAmount: {
    fontWeight: 200
  },
  balancePaperIcon: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: -10,
    left: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(60deg, #66bb6a, #43a047)'
  },
  balanceIcon: {
    color: 'white'
  },
  summaryPaper: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2
  },
  noAccounts: {
    background: grey[100],
    margin: '0 20px 20px 25px',
    padding: theme.spacing.unit
  },
  institutionWrapper: {
    display: 'flex'
  },
  institutionIcon: {
    marginRight: 16
  },
  accountName: {
    paddingLeft: 20
  }
})

const mapStateToProps = state => ({
  settings: state.settings,
  accounts: state.accounts,
  formatCurrency: currencyFormatter(state.settings.locale, state.settings.currency),
  formatDate: dateFormatter(state.settings.locale),
  totalBalance: Object.values(state.accounts.byInstitution).reduce(
    (balance, institution) => balance + institution.balance,
    0
  )
})

export const DashboardComponent = ({
  classes,
  settings,
  accounts,
  formatCurrency,
  formatDate,
  totalBalance
}) => (
  <Grid container>
    <Grid container justify="flex-end" className={classes.root}>
      <Paper className={classes.balancePaper}>
        <Typography
          variant="body1"
          color="textSecondary"
          align="right"
        >
          Balance
        </Typography>
        <Typography
          variant="h5"
          align="right"
          className={classes.balanceAmount}
        >
          {formatCurrency(totalBalance)}
        </Typography>
        <Paper className={classes.balancePaperIcon}>
          <DashboardIcon className={classes.balanceIcon} />
        </Paper>
      </Paper>
    </Grid>
    <Grid container>
      <Paper className={classes.summaryPaper}>
        {Object.keys(accounts.byId).length === 0 &&
          <Typography variant="caption" className={classes.noAccounts}>
            You don&apos;t have any accounts yet
          </Typography>
        }
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="right">Last updated</TableCell>
              <TableCell align="right">{settings.currency}</TableCell>
            </TableRow>
          </TableHead>
          {Object.keys(accounts.byInstitution).map(institution => (
            <TableBody key={institution}>
              <TableRow>
                <TableCell>
                  <span className={classes.institutionWrapper}>
                    <InstitutionIcon institution={institution} size="small" className={classes.institutionIcon} />
                    <Typography variant="subtitle2">{institution}</Typography>
                  </span>
                </TableCell>
                <TableCell />
                <TableCell align="right">
                  <Typography variant="subtitle2">
                    {formatCurrency(accounts.byInstitution[institution].balance)}
                  </Typography>
                </TableCell>
              </TableRow>
              {accounts.byInstitution[institution].accountIds.map((accountId) => {
                const account = accounts.byId[accountId]
                return (
                  <TableRow key={accountId}>
                    <TableCell>
                      <Typography className={classes.accountName}>{account.name}</Typography>
                    </TableCell>
                    <TableCell align="right">{formatDate(Date.now())}</TableCell>
                    <TableCell align="right">{formatCurrency(account.currentBalance)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          ))}
        </Table>
      </Paper>
    </Grid>
  </Grid>
)

DashboardComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  totalBalance: PropTypes.number.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(DashboardComponent)
